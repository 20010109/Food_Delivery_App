import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuChevronRight, LuChevronRight as LuViewMore } from "react-icons/lu";

export default function CategoryCarousel() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const categories = useMemo(
    () => [
      { key: "Filipino", emoji: "🍛", label: "Filipino" },
      { key: "Burgers", emoji: "🍔", label: "Burgers" },
      { key: "Pizza", emoji: "🍕", label: "Pizza" },
      { key: "Chicken", emoji: "🍗", label: "Chicken" },
      { key: "Tacos", emoji: "🌮", label: "Tacos" },
      { key: "Noodles", emoji: "🍜", label: "Noodles" },
      { key: "Salads", emoji: "🥗", label: "Salads" },
      { key: "Desserts", emoji: "🍦", label: "Desserts" },
      { key: "Coffee", emoji: "☕", label: "Coffee" },
      { key: "Milk Tea", emoji: "🧋", label: "Milk Tea" },
      { key: "Donut", emoji: "🍩", label: "Donut" },
      { key: "Ice Cream", emoji: "🍨", label: "Ice Cream" },
    ],
    []
  );

  const updateArrowVisibility = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isAtStart = el.scrollLeft <= 5;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  };

  useEffect(() => {
    updateArrowVisibility();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateArrowVisibility);
    window.addEventListener("resize", updateArrowVisibility);

    return () => {
      el.removeEventListener("scroll", updateArrowVisibility);
      window.removeEventListener("resize", updateArrowVisibility);
    };
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const handleCategoryClick = (categoryLabel) => {
    navigate(`/explore?q=${encodeURIComponent(categoryLabel)}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Explore Categories</h2>

      <div className="relative">
        {showLeftArrow && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 flex items-center justify-center"
          >
            <LuChevronLeft className="text-2xl" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="ml-0 mr-14 flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => handleCategoryClick(category.label)}
              className="shrink-0 flex flex-col items-center gap-2 p-4 w-24 rounded-2xl border border-gray-100 bg-gray-50 hover:border-red-300 hover:bg-red-50 transition group"
            >
              <span className="text-3xl">{category.emoji}</span>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-red-600 transition text-center">
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {showRightArrow && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 flex items-center justify-center"
          >
            <LuChevronRight className="text-2xl" />
          </button>
        )}
      </div>

    </div>
  );
}