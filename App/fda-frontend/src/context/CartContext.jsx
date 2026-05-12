import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabase.js";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transform flat cartItems into grouped structure by restaurant
  const cart = useMemo(() => {
    const grouped = {};

    cartItems.forEach((item) => {
      const restaurantId = item.restaurant_id;
      if (!grouped[restaurantId]) {
        grouped[restaurantId] = {
          storeId: restaurantId,
          storeName: item.restaurants?.name || `Store #${restaurantId}`,
          items: [],
        };
      }

      grouped[restaurantId].items.push({
        id: item.item_id,
        name: item.menu_items?.name || "Unknown Item",
        price: item.menu_items?.price || 0,
        qty: item.quantity,
        cart_item_id: item.cart_item_id,
        item_image: item.menu_items?.item_image,
      });
    });

    return Object.values(grouped);
  }, [cartItems]);

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCartId(data.cart_id);
      setCartItems(data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ADD ITEM TO CART
   */
  const addToCart = async (item) => {
    try {
      setError(null);
      const token = await getAuthToken();
      
      if (!token) throw new Error("Not authenticated");

      const payload = {
        item_id: item.id || item.item_id,
        restaurant_id: item.storeId || item.restaurant_id,
        quantity: item.qty || 1,
      };

      const res = await fetch("http://localhost:3000/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add item to cart");

      // Refresh cart
      await fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.message);
    }
  };

  /**
   * INTERNAL: Update quantity in backend
   */
  const updateQtyBackend = async (cartItemId, qty) => {
    if (qty < 1) return removeItemBackend(cartItemId);

    setError(null);
    const token = await getAuthToken();

    if (!token) throw new Error("Not authenticated");

    const res = await fetch(
      `http://localhost:3000/api/cart/items/${cartItemId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: qty }),
      }
    );

    if (!res.ok) throw new Error("Failed to update quantity");

    // Optimistically update local state
    setCartItems((prev) =>
      prev.map((item) =>
        item.cart_item_id === cartItemId ? { ...item, quantity: qty } : item
      )
    );
  };

  /**
   * INTERNAL: Remove item in backend
   */
  const removeItemBackend = async (cartItemId) => {
    setError(null);
    const token = await getAuthToken();

    if (!token) throw new Error("Not authenticated");

    const res = await fetch(
      `http://localhost:3000/api/cart/items/${cartItemId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Failed to remove item");

    // Optimistically update local state
    setCartItems((prev) =>
      prev.filter((item) => item.cart_item_id !== cartItemId)
    );
  };

  /**
   * UPDATE CART ITEM QUANTITY (wrapper for old API)
   * Maps old signature: updateQty(storeId, itemId, qty) to new: updateQty(cartItemId, qty)
   */
  const updateQtyWrapper = async (storeId, itemId, qty) => {
    try {
      // Find the cart item with matching item_id
      const cartItem = cartItems.find(
        (item) => String(item.item_id) === String(itemId)
      );

      if (!cartItem) throw new Error("Item not found in cart");

      await updateQtyBackend(cartItem.cart_item_id, qty);
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err.message);
      await fetchCart();
    }
  };

  /**
   * REMOVE ITEM FROM CART (wrapper for old API)
   * Maps old signature: removeItem(storeId, itemId) to new: removeItem(cartItemId)
   */
  const removeItemWrapper = async (storeId, itemId) => {
    try {
      // Find the cart item with matching item_id
      const cartItem = cartItems.find(
        (item) => String(item.item_id) === String(itemId)
      );

      if (!cartItem) throw new Error("Item not found in cart");

      await removeItemBackend(cartItem.cart_item_id);
    } catch (err) {
      console.error("Error removing item:", err);
      setError(err.message);
      await fetchCart();
    }
  };

  /**
   * CLEAR ENTIRE CART
   */
  const clearCart = async () => {
    try {
      setError(null);
      const token = await getAuthToken();

      if (!token) throw new Error("Not authenticated");

      const res = await fetch("http://localhost:3000/api/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to clear cart");

      setCartItems([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err.message);
    }
  };

  /**
   * CLEAR CART BY RESTAURANT
   */
  const clearRestaurantCart = async (restaurantId) => {
    try {
      setError(null);
      const token = await getAuthToken();

      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `http://localhost:3000/api/cart/restaurant/${restaurantId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to clear restaurant cart");

      // Remove items from this restaurant
      setCartItems((prev) =>
        prev.filter((item) => item.restaurant_id !== restaurantId)
      );
    } catch (err) {
      console.error("Error clearing restaurant cart:", err);
      setError(err.message);
    }
  };

  /**
   * CLEAR CART BY RESTAURANT (alias for old API)
   */
  const clearStore = async (restaurantId) => {
    return clearRestaurantCart(restaurantId);
  };

  /**
   * FETCH CART WHEN USER LOGS IN
   */
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        fetchCart();
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          fetchCart();
        } else {
          setCartItems([]);
          setCartId(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartId,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQty: updateQtyWrapper,
        removeItem: removeItemWrapper,
        clearCart,
        clearStore,
        clearRestaurantCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
