import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { LuPhone, LuMinus, LuPlus, LuTrash2, LuStar } from "react-icons/lu";

import Navbar from "./components/Navbar.jsx";
import AddToCartModal from "./components/AddToCartModal.jsx";
import "./styles/tailwind.css";

import { useCart } from "../context/CartContext";
import { supabase } from "../utils/supabase.js";

const LS_FAV_STORES_KEY = "favStores";
const LS_FAV_DISHES_KEY = "favDishes";

function readLSArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLSArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const storeId = id;

  const [store, setStore] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, updateQty, removeItem } = useCart();

  const storeCart =
    cart.find((s) => String(s.storeId) === String(storeId))?.items || [];

  const subtotal = storeCart.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
    0
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isFavStore, setIsFavStore] = useState(false);
  const [, forceRerender] = useState(0);

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:3000/api/restaurants/${storeId}`
        );

        if (!res.ok) throw new Error("Store fetch failed");

        const storeData = await res.json();
        setStore(storeData);

        const menuRes = await fetch(
          `http://localhost:3000/api/menu/public/${storeId}`
        );

        if (!menuRes.ok) throw new Error("Menu fetch failed");

        const menuData = await menuRes.json();
        setMenu(menuData || []);

        // Fetch reviews
        try {
          const reviewsRes = await fetch(
            `http://localhost:3000/api/reviews/${storeId}`
          );
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            console.log(reviewsData);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          } else {
            console.error("Reviews fetch failed with status:", reviewsRes.status);
            const errorData = await reviewsRes.json().catch(() => ({}));
            console.error("Reviews error:", errorData);
            setReviews([]);
          }
        } catch (err) {
          console.error("Failed to fetch reviews:", err.message);
          setReviews([]);
        }
      } catch (err) {
        console.error(err.message);
        setStore(null);
        setMenu([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  useEffect(() => {
    const favStores = readLSArray(LS_FAV_STORES_KEY);
    setIsFavStore(favStores.includes(storeId));
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading store...
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Store not found
      </div>
    );
  }

  const toggleStoreFav = () => {
    const favs = readLSArray(LS_FAV_STORES_KEY);

    if (favs.includes(storeId)) {
      writeLSArray(
        LS_FAV_STORES_KEY,
        favs.filter((x) => x !== storeId)
      );
      setIsFavStore(false);
    } else {
      writeLSArray(LS_FAV_STORES_KEY, [...favs, storeId]);
      setIsFavStore(true);
    }
  };

  const isDishFav = (itemId) =>
    readLSArray(LS_FAV_DISHES_KEY).includes(String(itemId));

  const toggleDishFav = (itemId) => {
    const favs = readLSArray(LS_FAV_DISHES_KEY);
    const key = String(itemId);

    const updated = favs.includes(key)
      ? favs.filter((x) => x !== key)
      : [...favs, key];

    writeLSArray(LS_FAV_DISHES_KEY, updated);
    forceRerender((n) => n + 1);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!userRating || !userComment.trim()) {
      alert("Please provide a rating and comment");
      return;
    }

    setSubmittingReview(true);
    try {
      // Get auth token
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        alert("Please log in to submit a review");
        setSubmittingReview(false);
        return;
      }

      const res = await fetch(
        `http://localhost:3000/api/reviews/${storeId}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: userRating,
            comment: userComment,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit review");
      }

      const newReview = await res.json();
      
      // Add the new review to the list
      setReviews([newReview, ...reviews]);
      
      // Reset form
      setUserRating(0);
      setUserComment("");
      
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(err.message);
      alert("Failed to submit review. " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <LuStar
            key={star}
            size={16}
            className={star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">

      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="relative">
            <img
              src={store.background_image || store.profile_image}
              className="w-full h-64 object-cover"
              alt={store.name}
            />

            <img
              src={store.profile_image}
              alt={store.name}
              className="absolute left-6 bottom-[-35px] w-28 h-28 rounded-2xl border-4 border-white bg-white object-contain shadow-lg p-2"
            />
          </div>

          <div className="p-6 pt-12 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {store.name}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-gray-500">
                <LuPhone className="text-red-500" />
                <span>{store.contact_info || "No contact number"}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                <span>Cuisine: {store.cuisine || "Not specified"}</span>
                <span>•</span>
                <span>
                  Price Range: {store.price_range || "Not specified"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {renderStarRating(store.rating || 0)}
                </span>
                <span>•</span>
                <span>
                  Delivery Time: {store.delivery_time || "20-30 mins"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleStoreFav}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              {isFavStore ? (
                <>
                  <IoHeart className="text-red-500 text-lg" />
                  <span>Favourited</span>
                </>
              ) : (
                <>
                  <IoHeartOutline className="text-gray-400 text-lg" />
                  <span>Add to favourites</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 grid grid-cols-12 gap-6">
          {/* MENU */}
          <div className="col-span-8 grid grid-cols-2 gap-5">
            {menu.map((item) => (
              <div
                key={item.item_id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={item.item_image}
                  className="h-44 w-full object-cover rounded-xl"
                  alt={item.name}
                />

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDishFav(item.item_id)}
                    className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center"
                  >
                    {isDishFav(item.item_id) ? (
                      <IoHeart className="text-red-500" />
                    ) : (
                      <IoHeartOutline className="text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-2xl text-green-600">
                    ₱{item.price}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setModalOpen(true);
                    }}
                    className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center"
                  >
                    <LuPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CART */}
          <div className="col-span-4 bg-white p-5 rounded-2xl border border-gray-200 sticky top-6 h-fit shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Your Items</h2>

            <p className="text-sm text-gray-400 mt-1">
              {storeCart.length}{" "}
              {storeCart.length === 1 ? "item" : "items"} from {store.name}
            </p>

            {storeCart.length === 0 ? (
              <p className="text-gray-400 mt-6">Cart is empty</p>
            ) : (
              <div className="mt-5 space-y-4">
                {storeCart.map((ci) => (
                  <div
                    key={ci.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {ci.name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          ₱{ci.price} x {ci.qty}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(storeId, ci.id)}
                        className="h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition"
                        title="Remove item"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            ci.qty <= 1
                              ? removeItem(storeId, ci.id)
                              : updateQty(storeId, ci.id, ci.qty - 1)
                          }
                          className="h-9 w-9 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        >
                          <LuMinus size={16} />
                        </button>

                        <span className="w-10 text-center text-sm font-semibold">
                          {ci.qty}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQty(storeId, ci.id, ci.qty + 1)
                          }
                          className="h-9 w-9 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        >
                          <LuPlus size={16} />
                        </button>
                      </div>

                      <span className="font-bold text-gray-900">
                        ₱{Number(ci.price || 0) * Number(ci.qty || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-gray-100 pt-5 flex items-center justify-between">
              <span className="font-bold text-xl text-gray-900">
                Subtotal
              </span>

              <span className="font-bold text-xl text-gray-900">
                ₱{subtotal}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`/checkout?storeId=${encodeURIComponent(storeId)}`)
              }
              disabled={storeCart.length === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl mt-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-12 gap-6">
            {/* REVIEWS LIST */}
            <div className="col-span-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="text-gray-400 py-6">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {renderStarRating(review.rating)}
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {review.user_profiles?.first_name || "Anonymous"} {review.user_profiles?.last_name || ""}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LEAVE REVIEW FORM */}
            <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-5 sticky top-6 h-fit shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Leave a Review
              </h3>

              <form onSubmit={submitReview} className="space-y-4">
                {/* STAR RATING INPUT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="transition"
                      >
                        <LuStar
                          size={32}
                          className={
                            star <= userRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {userRating} {userRating === 1 ? "star" : "stars"}
                    </p>
                  )}
                </div>

                {/* COMMENT INPUT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Comment *
                  </label>
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Share your experience with this restaurant..."
                    rows="4"
                    maxLength="500"
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {userComment.length}/500 characters
                  </p>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submittingReview || !userRating || !userComment.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* MODAL */}
        <AddToCartModal
          open={modalOpen}
          item={selectedItem}
          onClose={() => setModalOpen(false)}
          onConfirm={({ qty }) => {
            if (!selectedItem) return;

            addToCart({
              storeId,
              storeName: store.name,
              id: selectedItem.item_id,
              name: selectedItem.name,
              price: selectedItem.price,
              item_image: selectedItem.item_image,
              qty,
            });

            setModalOpen(false);
            setSelectedItem(null);
          }}
        />
      </main>
    </div>
  );
}