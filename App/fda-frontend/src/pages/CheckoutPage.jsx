import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuCheck,
  LuCreditCard,
  LuMapPin,
  LuPackageCheck,
  LuPhone,
  LuShoppingBag,
  LuStore,
  LuUser,
  LuWallet,
} from "react-icons/lu";
import { useCart } from "../context/CartContext";
import { getPrimaryAddress } from "../utils/addressApi.js";
import { getWalletBalance, getGcashNumber } from "../utils/walletApi.js";
import { getSavedCards } from "../utils/cardApi.js";
import { supabase } from "../utils/supabase.js";

const API_BASE = "http://localhost:3000/api";

const DELIVERY_OPTIONS = [
  {
    id: "regular",
    title: "Regular Delivery",
    subtitle: "Arrives in 20–30 minutes",
    fee: 30,
  },
  {
    id: "priority",
    title: "Priority Delivery",
    subtitle: "Faster delivery for urgent orders",
    fee: 49,
  },
];

const PAYMENT_OPTIONS = [
  {
    id: "cod",
    title: "Cash on Delivery",
    subtitle: "Pay when your order arrives",
    icon: LuWallet,
  },
  {
    id: "gcash",
    title: "GCash",
    subtitle: "Pay using your mobile wallet",
    icon: LuPhone,
  },
  {
    id: "card",
    title: "Card",
    subtitle: "Credit or debit card",
    icon: LuCreditCard,
  },
  {
    id: "wallet",
    title: "Wallet",
    subtitle: "Pay using your Grubero wallet",
    icon: LuWallet,
  },
];

const TIP_OPTIONS = [0, 5, 20, 30];

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (!token) {
    throw new Error("You must be logged in to place an order.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function formatMoney(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

function formatAddress(address) {
  if (!address) return "";

  if (address.address_line) return address.address_line;
  if (address.formatted) return address.formatted;

  return [
    address.house_no,
    address.street,
    address.barangay,
    address.city,
    address.province,
    address.postal_code,
  ]
    .filter(Boolean)
    .join(", ");
}

function getCartItemId(item) {
  return item.item_id || item.itemId || item.id;
}

function getCartItemQty(item) {
  return Number(item.qty || item.quantity || 1);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedStoreId = searchParams.get("storeId");

  const { cart, clearStore } = useCart();

  const [deliveryType, setDeliveryType] = useState("regular");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [walletBalance, setWalletBalance] = useState(null);
  const [gcashNumber, setGcashNumber] = useState(null);
  const [tip, setTip] = useState(0);
  const [address, setAddress] = useState(null);
  const [profile, setProfile] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [savedCards, setSavedCards] = useState([]);
  const [mainCardId, setMainCardId] = useState(null);

  const selectedStore = useMemo(() => {
    if (!selectedStoreId) {
      return cart.length === 1 ? cart[0] : null;
    }

    return cart.find(
      (store) => String(store.storeId) === String(selectedStoreId)
    );
  }, [cart, selectedStoreId]);

  const items = useMemo(() => {
    if (!selectedStore) return [];

    return selectedStore.items.map((item) => ({
      ...item,
      storeId: selectedStore.storeId,
      storeName: selectedStore.storeName,
    }));
  }, [selectedStore]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * getCartItemQty(item);
    }, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + getCartItemQty(item), 0);
  }, [items]);

  const selectedDelivery = DELIVERY_OPTIONS.find(
    (option) => option.id === deliveryType
  );

  const deliveryFee = selectedDelivery?.fee || 0;
  const total = subtotal + deliveryFee + Number(tip || 0);

  useEffect(() => {
    const loadCheckoutInfo = async () => {
      try {
        const currentAddress = await getPrimaryAddress();
        setAddress(currentAddress || null);
      } catch (err) {
        console.error("Failed to load checkout address:", err.message);
      }

      try {
        const [walletData, gcashData] = await Promise.all([
          getWalletBalance(),
          getGcashNumber(),
        ]);

        setWalletBalance(walletData || null);
        setGcashNumber(gcashData || null);
      } catch (err) {
        console.error("Failed to load wallet or GCash info:", err.message);
      }

      try {
        const cardsData = await getSavedCards();
        setSavedCards(cardsData || []);
        setMainCardId(localStorage.getItem("grubero_main_card"));
      } catch (err) {
        console.error("Failed to load saved cards:", err.message);
      }

      try {
        const { data } = await supabase.auth.getUser();

        if (!data?.user) return;

        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle();

        setProfile({
          email: data.user.email,
          ...(profileData || {}),
        });
      } catch (err) {
        console.error("Failed to load profile:", err.message);
      }
    };

    loadCheckoutInfo();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedStore || items.length === 0) return;

    try {
      setPlacingOrder(true);
      setOrderError("");

      const headers = await getAuthHeaders();

      const orderItems = items.map((item) => ({
        item_id: getCartItemId(item),
        quantity: getCartItemQty(item),
      }));

      const invalidItem = orderItems.find((item) => !item.item_id);

      if (invalidItem) {
        throw new Error("One or more cart items are missing an item ID.");
      }

      const res = await fetch(`${API_BASE}/payments/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          restaurant_id: selectedStore.storeId,
          items: orderItems,
          delivery_fee: deliveryFee,
          tip,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to place order.");
      }

      clearStore(selectedStore.storeId);

      alert(`Order placed for ${selectedStore.storeName || "this store"}!`);
      navigate("/orders");
    } catch (err) {
      setOrderError(err.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!selectedStore && cart.length > 1) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
          >
            <LuArrowLeft size={18} />
            Back
          </button>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Choose a store to checkout
            </h1>

            <p className="text-gray-500 mt-1">
              Orders from different restaurants need to be checked out
              separately.
            </p>

            <div className="mt-6 space-y-4">
              {cart.map((store) => {
                const storeSubtotal = store.items.reduce((sum, item) => {
                  return sum + Number(item.price || 0) * getCartItemQty(item);
                }, 0);

                return (
                  <button
                    key={store.storeId}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/checkout?storeId=${encodeURIComponent(
                          store.storeId
                        )}`
                      )
                    }
                    className="w-full rounded-2xl border border-gray-200 p-4 text-left hover:bg-gray-50 transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <LuStore size={20} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-bold text-gray-900 truncate">
                          {store.storeName || `Store #${store.storeId}`}
                        </h2>

                        <p className="text-sm text-gray-500">
                          {store.items.length}{" "}
                          {store.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">
                        {formatMoney(storeSubtotal)}
                      </p>
                      <p className="text-sm text-red-600 font-semibold">
                        Checkout
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedStore || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <LuShoppingBag size={28} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Nothing to checkout
          </h1>

          <p className="text-gray-500 mt-2">
            Your selected store cart is empty or no longer available.
          </p>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-6 rounded-2xl bg-red-600 px-6 py-3 text-white font-bold hover:bg-red-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
        >
          <LuArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

            <p className="text-gray-500 mt-1">
              Ordering from{" "}
              <span className="font-semibold text-gray-900">
                {selectedStore.storeName || `Store #${selectedStore.storeId}`}
              </span>
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm text-gray-500">
            <LuShoppingBag className="text-red-500" />
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <LuPackageCheck size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Option
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose how fast you want your food delivered.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DELIVERY_OPTIONS.map((option) => {
                  const active = deliveryType === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDeliveryType(option.id)}
                      className={`text-left rounded-2xl border p-4 transition ${
                        active
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {option.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {option.subtitle}
                          </p>
                        </div>

                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                            active
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-gray-300 text-transparent"
                          }`}
                        >
                          <LuCheck size={14} />
                        </div>
                      </div>

                      <p className="mt-4 font-bold text-gray-900">
                        {formatMoney(option.fee)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <LuMapPin size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Address
                  </h2>
                  <p className="text-sm text-gray-500">
                    Using your default saved address.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Default Address</p>

                <p className="font-semibold text-gray-900">
                  {formatAddress(address) || "No saved address selected"}
                </p>

                {!address && (
                  <button
                    type="button"
                    onClick={() => navigate("/settings")}
                    className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Add an address in Settings
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <LuUser size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Personal Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    We will use this information for delivery updates.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {profile?.first_name
                      ? `${profile.first_name} ${profile.last_name || ""}`
                      : "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900 mt-1 truncate">
                    {profile?.email || "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {profile?.contact_number || profile?.contact || "Not set"}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <LuCreditCard size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                  <p className="text-sm text-gray-500">
                    Select your preferred payment method.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = paymentMethod === option.id;
                  const isCardDisabled = option.id === "card" && savedCards.length === 0;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => !isCardDisabled && setPaymentMethod(option.id)}
                      disabled={isCardDisabled}
                      className={`text-left rounded-2xl border p-4 transition ${
                        active ? "border-red-500 bg-red-50"
                        : isCardDisabled ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:bg-gray-50"   
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-red-600">
                          <Icon size={20} />
                        </div>

                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                            active
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-gray-300 text-transparent"
                          }`}
                        >
                          <LuCheck size={14} />
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900">
                        {option.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {option.subtitle}
                      </p>

                      {isCardDisabled && (
                        <p className="text-xs text-gray-400 mt-1">Add a card in Settings first</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ← INSERT HERE */}
              {paymentMethod === "wallet" && (
                <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  {walletBalance !== null ? (
                    <>
                      Available balance:{" "}
                      <span className={`font-bold ${Number(walletBalance) < total ? "text-red-600" : "text-green-600"}`}>
                        ₱{Number(walletBalance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                      {Number(walletBalance) < total && (
                        <span className="block text-red-500 mt-1">Insufficient balance for this order.</span>
                      )}
                    </>
                  ) : (
                    "Loading balance..."
                  )}
                </div>
              )}

              {paymentMethod === "gcash" && (
                <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  {gcashNumber ? (
                    <>Paying via GCash: <span className="font-bold">{gcashNumber}</span></>
                  ) : (
                    <span className="text-red-500">No GCash number linked. Go to Settings → Wallet &amp; Payments to link one.</span>
                  )}
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
                  {(() => {
                    const main = savedCards.find(c => c.card_id === mainCardId) || savedCards[0];
                    return main
                      ? <>Paying with card ending in <span className="font-bold">•••• {main.last_four}</span> ({main.cardholder_name})</>
                      : <span className="text-red-500">No card selected. Go to Settings → My Cards.</span>;
                  })()}
                </div>
              )}

            </section>

            <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Tip your rider
              </h2>

              <div className="flex flex-wrap gap-3">
                {TIP_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTip(amount)}
                    className={`rounded-xl px-5 py-3 font-semibold transition ${
                      tip === amount
                        ? "bg-red-600 text-white"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {amount === 0 ? "No tip" : formatMoney(amount)}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="xl:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold text-gray-900">Your Order</h2>

              <p className="text-sm text-gray-500 mt-1">
                {selectedStore.storeName || `Store #${selectedStore.storeId}`}
              </p>

              <div className="mt-5 space-y-4">
                {items.map((item) => {
                  const qty = getCartItemQty(item);
                  const lineTotal = Number(item.price || 0) * qty;

                  return (
                    <div
                      key={`${item.storeId}-${getCartItemId(item)}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {qty}x {item.name}
                        </p>

                        <p className="text-xs text-gray-400 truncate">
                          {formatMoney(item.price)} each
                        </p>
                      </div>

                      <span className="font-semibold text-gray-900">
                        {formatMoney(lineTotal)}
                      </span>
                    </div>
                  );
                })}

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>{formatMoney(deliveryFee)}</span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>Tip</span>
                    <span>{formatMoney(tip)}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-gray-900">
                      {formatMoney(total)}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {orderError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || items.length === 0}
                  className="w-full rounded-2xl bg-red-600 py-4 text-white font-bold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {placingOrder ? "Placing order..." : "Place Order"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}