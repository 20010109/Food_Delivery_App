import { useCart } from "../../context/CartContext";
import { LuTrash2 } from "react-icons/lu";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeItem, updateQty } = useCart();

  if (!open) return null;

  const total = cart.reduce((sum, store) => {
    return (
      sum +
      store.items.reduce(
        (s, item) => s + item.price * item.qty,
        0
      )
    );
  }, 0);

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* drawer */}
      <div className="absolute right-0 top-0 h-full w-[380px] bg-white shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              Your cart is empty
            </p>
          ) : (
            cart.map((store) => (
              <div key={store.storeId} className="space-y-3">

                {/* STORE NAME */}
                <div className="font-bold text-gray-700 border-b pb-1">
                  {store.storeName || `Store #${store.storeId}`}
                </div>

                {/* ITEMS */}
                {store.items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 flex justify-between items-center"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {item.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        ₱{item.price}
                      </div>

                      {/* QTY */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="px-2 border rounded"
                          onClick={() =>
                            updateQty(
                              store.storeId,
                              item.id,
                              item.qty - 1
                            )
                          }
                        >
                          -
                        </button>

                        <span>{item.qty}</span>

                        <button
                          className="px-2 border rounded"
                          onClick={() =>
                            updateQty(
                              store.storeId,
                              item.id,
                              item.qty + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* REMOVE */}
                    <button
                      className="text-red-500 ml-2 hover:text-red-700"
                      onClick={() =>
                       removeItem(store.storeId, item.id)
                      }
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₱{total}</span>
          </div>

          <button
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
            disabled={cart.length === 0}
          >
            Checkout
          </button>
        </div>

      </div>
    </div>
  );
}