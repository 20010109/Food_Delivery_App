import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const storeIndex = prev.findIndex(
        (s) => s.storeId === item.storeId
      );

      // NEW STORE
      if (storeIndex === -1) {
        return [
          ...prev,
          {
            storeId: item.storeId,
            storeName: item.storeName,
            items: [{ ...item }],
          },
        ];
      }

      // COPY STATE PROPERLY (IMPORTANT FIX)
      const updated = prev.map((store) => ({ ...store }));

      const store = updated[storeIndex];

      const itemIndex = store.items.findIndex(
       (i) => i.id === item.id
      );

      if (itemIndex !== -1) {
        store.items = store.items.map((i) =>
          i.id === item.id
            ? { ...i, qty: i.qty + item.qty } // merge correctly
            : i
        );
      } else {
        store.items = [...store.items, { ...item }];
      }

      return updated;
    });
  };

  const updateQty = (storeId, itemId, qty) => {
    if (qty < 1) return removeItem(storeId, itemId);

    setCart((prev) =>
      prev.map((store) => {
        if (store.storeId !== storeId) return store;

        return {
          ...store,
          items: store.items.map((i) =>
            i.id === itemId
              ? { ...i, qty }
              : i
          ),
        };
      })
    );
  };  

  const removeItem = (storeId, itemId) => {
    setCart((prev) =>
      prev
        .map((store) => {
          if (store.storeId !== storeId) return store;

          return {
            ...store,
            items: store.items.filter((i) => i.id !== itemId),
          };
        })
        .filter((store) => store.items.length > 0) // ✅ IMPORTANT FIX
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);