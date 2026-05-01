import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuArrowRight,
  LuMinus,
  LuPlus,
  LuShoppingBag,
  LuStore,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import { useCart } from "../../context/CartContext";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80?text=Food";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeItem, updateQty } = useCart();
  const navigate = useNavigate();

  const total = useMemo(() => {
    return cart.reduce((sum, store) => {
      return (
        sum +
        store.items.reduce((itemSum, item) => {
          return itemSum + Number(item.price || 0) * Number(item.qty || 0);
        }, 0)
      );
    }, 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((sum, store) => {
      return (
        sum +
        store.items.reduce((itemSum, item) => {
          return itemSum + Number(item.qty || 0);
        }, 0)
      );
    }, 0);
  }, [cart]);

  if (!open) return null;

  const getStoreSubtotal = (store) => {
    return store.items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.qty || 0);
    }, 0);
  };

  const handleStoreCheckout = (storeId) => {
    onClose();
    navigate(`/checkout?storeId=${encodeURIComponent(storeId)}`);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-50 shadow-2xl flex flex-col">
        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <p className="text-sm text-gray-500 mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"} selected
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 flex items-center justify-center transition"
            aria-label="Close cart"
          >
            <LuX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <LuShoppingBag className="text-red-500" size={34} />
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                Your cart is empty
              </h3>

              <p className="text-sm text-gray-500 mt-2 max-w-xs">
                Add meals from your favourite restaurants and they will appear
                here.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/explore");
                }}
                className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
              >
                Explore restaurants
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.map((store) => {
                const storeSubtotal = getStoreSubtotal(store);

                return (
                  <section
                    key={store.storeId}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <LuStore size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 truncate">
                          {store.storeName || `Store #${store.storeId}`}
                        </h3>

                        <p className="text-xs text-gray-400">
                          {store.items.length}{" "}
                          {store.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>

                      <span className="font-bold text-gray-900">
                        ₱{storeSubtotal}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {store.items.map((item) => {
                        const itemImage =
                          item.item_image ||
                          item.image_url ||
                          PLACEHOLDER_IMAGE;

                        return (
                          <div
                            key={item.id}
                            className="flex gap-3 rounded-xl border border-gray-100 p-3"
                          >
                            <img
                              src={itemImage}
                              alt={item.name}
                              className="h-20 w-20 rounded-xl object-cover bg-gray-100 shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {item.name}
                                  </h4>

                                  <p className="text-sm text-gray-500 mt-1">
                                    ₱{item.price} each
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem(store.storeId, item.id)
                                  }
                                  className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition"
                                  aria-label="Remove item"
                                >
                                  <LuTrash2 size={16} />
                                </button>
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQty(
                                        store.storeId,
                                        item.id,
                                        item.qty - 1
                                      )
                                    }
                                    className="h-9 w-9 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                  >
                                    <LuMinus size={15} />
                                  </button>

                                  <span className="w-10 text-center text-sm font-bold text-gray-900">
                                    {item.qty}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQty(
                                        store.storeId,
                                        item.id,
                                        item.qty + 1
                                      )
                                    }
                                    className="h-9 w-9 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                  >
                                    <LuPlus size={15} />
                                  </button>
                                </div>

                                <span className="font-bold text-gray-900">
                                  ₱
                                  {Number(item.price || 0) *
                                    Number(item.qty || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStoreCheckout(store.storeId)}
                      className="mt-4 w-full rounded-2xl bg-red-600 py-3 text-white font-bold hover:bg-red-700 flex items-center justify-center gap-2 transition"
                    >
                      Checkout
                      <LuArrowRight size={18} />
                    </button>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border-t border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Cart Total</span>
            <span className="text-2xl font-bold text-gray-900">₱{total}</span>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Checkout is separated by restaurant.
          </p>
        </div>
      </aside>
    </div>
  );
}