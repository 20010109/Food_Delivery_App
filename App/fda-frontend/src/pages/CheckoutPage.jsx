import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();
  const items = cart.flatMap((store) => store.items);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const [addressType, setAddressType] = useState("home");
  const [deliveryType, setDeliveryType] = useState("regular");
  const [tip, setTip] = useState(0);

  // 🚚 Delivery Fee Logic
  const baseDeliveryFee = {
    home: 30,
    work: 20,
    other: 40,
  }[addressType];

  const priorityFee = deliveryType === "priority" ? 19 : 0;

  const deliveryFee = baseDeliveryFee + priorityFee;

  const total = subtotal + deliveryFee + tip;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-8 space-y-6">

          <h1 className="text-2xl font-bold text-center">
            Checkout
          </h1>

          {/* DELIVERY OPTION */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-bold mb-3">Delivery Option</h2>

            <label className="block border p-3 rounded mb-2">
              <input
                type="radio"
                name="delivery"
                checked={deliveryType === "regular"}
                onChange={() => setDeliveryType("regular")}
              />
              <span className="ml-2">Regular 5–20 mins</span>
            </label>

            <label className="block border p-3 rounded">
              <input
                type="radio"
                name="delivery"
                checked={deliveryType === "priority"}
                onChange={() => setDeliveryType("priority")}
              />
              <span className="ml-2">
                Priority Delivery (+₱19)
              </span>
            </label>
          </div>

          {/* DELIVERY ADDRESS */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-bold mb-3">Delivery Address</h2>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setAddressType("home")}
                className={`px-3 py-1 border rounded ${
                  addressType === "home" ? "bg-red-500 text-white" : ""
                }`}
              >
                Home
              </button>

              <button
                onClick={() => setAddressType("work")}
                className={`px-3 py-1 border rounded ${
                  addressType === "work" ? "bg-red-500 text-white" : ""
                }`}
              >
                Work
              </button>

              <button
                onClick={() => setAddressType("other")}
                className={`px-3 py-1 border rounded ${
                  addressType === "other" ? "bg-red-500 text-white" : ""
                }`}
              >
                Other
              </button>
            </div>

            <input
              className="w-full border p-2 rounded"
              placeholder="Address details..."
            />
          </div>

          {/* PERSONAL DETAILS */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-bold mb-3">Personal Details</h2>

            <p className="text-gray-600">Jessica Codilla</p>
            <p className="text-gray-600">jessica@email.com</p>
            <p className="text-gray-600">09123456789</p>
          </div>

          {/* PAYMENT */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-bold mb-3">Payment</h2>

            <label className="block border p-3 rounded mb-2">
              <input type="radio" name="payment" defaultChecked />
              Cash on Delivery
            </label>

            <label className="block border p-3 rounded mb-2">
              <input type="radio" name="payment" />
              GCash
            </label>

            <label className="block border p-3 rounded">
              <input type="radio" name="payment" />
              Card
            </label>
          </div>

          {/* TIP */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="font-bold mb-3">Tip your rider</h2>

            <div className="flex gap-2">
              {[0, 5, 20, 30].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTip(amount)}
                  className={`border px-3 py-1 rounded ${
                    tip === amount ? "bg-red-500 text-white" : ""
                  }`}
                >
                  {amount === 0 ? "No" : `₱${amount}`}
                </button>
              ))}
            </div>
          </div>

          {/* PLACE ORDER */}
          <button className="w-full bg-red-600 text-white py-3 rounded-full font-bold">
            Place Order
          </button>
        </div>

        {/* RIGHT SIDE - ORDER SUMMARY */}
        <div className="col-span-4">
          <div className="bg-white p-5 rounded-2xl shadow sticky top-6">
            <h2 className="font-bold mb-3">Your Order</h2>

            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm mb-2">
                <span>
                  {item.qty}x {item.name}
                </span>
                <span>₱{item.price * item.qty}</span>
              </div>
            ))}

            <hr className="my-3" />

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{subtotal}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery</span>
              <span>₱{deliveryFee}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Tip</span>
              <span>₱{tip}</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₱{total}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}