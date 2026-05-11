import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const INTERVAL_MS = 4000;

export default function CategoryCarousel() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/restaurants")
      .then((r) => r.json())
      .then((data) => setRestaurants(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {});
  }, []);

  const count = restaurants.length;

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, INTERVAL_MS);
  };

  useEffect(() => {
    if (count === 0) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [count]);

  const goTo = (index) => {
    setCurrent((index + count) % count);
    startTimer();
  };

  if (count === 0) return null;

  const r = restaurants[current];

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900">Featured Restaurants</h2>

      <div className="relative overflow-hidden rounded-2xl h-72 bg-gray-900 shadow-md select-none">

        {/* Slides */}
        {restaurants.map((item, i) => (
          <div
            key={item.restaurant_id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Full-bleed background image */}
            <img
              src={item.background_image || item.profile_image || "https://placehold.co/1400x500/1f2937/white?text=No+Image"}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Dark gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col justify-center px-10 gap-3 z-10 w-1/2">
              <span className="text-xs font-semibold tracking-widest text-red-400 uppercase">
                Featured
              </span>
              <h3 className="text-3xl font-bold text-white leading-tight">
                {item.name}
              </h3>
              {item.address_line && (
                <p className="text-sm text-gray-300 truncate">{item.address_line}</p>
              )}
              <button
                onClick={() => navigate(`/store/${item.restaurant_id}`)}
                className="mt-1 self-start bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
              >
                Order Now
              </button>
            </div>
          </div>
        ))}

        {/* Prev arrow */}
        <button
          onClick={() => goTo(current - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition"
        >
          <LuChevronLeft size={22} />
        </button>

        {/* Next arrow */}
        <button
          onClick={() => goTo(current + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition"
        >
          <LuChevronRight size={22} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {restaurants.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
