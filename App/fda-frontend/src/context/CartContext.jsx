import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const storeIndex = prev.findIndex(
        (s) => String(s.storeId) === String(item.storeId)
      );

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

      const updated = prev.map((store) => ({ ...store }));
      const store = updated[storeIndex];

      const itemIndex = store.items.findIndex(
        (i) => String(i.id) === String(item.id)
      );

      if (itemIndex !== -1) {
        store.items = store.items.map((i) =>
          String(i.id) === String(item.id)
            ? { ...i, qty: Number(i.qty || 0) + Number(item.qty || 0) }
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
        if (String(store.storeId) !== String(storeId)) return store;

        return {
          ...store,
          items: store.items.map((i) =>
            String(i.id) === String(itemId) ? { ...i, qty } : i
          ),
        };
      })
    );
  };

  const removeItem = (storeId, itemId) => {
    setCart((prev) =>
      prev
        .map((store) => {
          if (String(store.storeId) !== String(storeId)) return store;

          return {
            ...store,
            items: store.items.filter(
              (i) => String(i.id) !== String(itemId)
            ),
          };
        })
        .filter((store) => store.items.length > 0)
    );
  };

  const clearStore = (storeId) => {
    setCart((prev) =>
      prev.filter((store) => String(store.storeId) !== String(storeId))
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
        clearStore,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);