import React, { useEffect, useMemo, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function CategoryCarousel() {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const categories = useMemo(
    () => [
      {
        key: "Pizza",
        label: "Pizza",
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop",
      },
      {
        key: "Chicken",
        label: "Chicken",
        image:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop",
      },
      {
        key: "Cakes",
        label: "Cakes",
        image:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop",
      },
      {
        key: "Milk Tea",
        label: "Milk Tea",
        image:
          "https://images.unsplash.com/photo-1558857563-b371033873b8?w=300&h=300&fit=crop",
      },
      {
        key: "Coffee",
        label: "Coffee",
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
      },
      {
        key: "Halo-Halo",
        label: "Halo-Halo",
        image:
          "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=300&h=300&fit=crop",
      },
      {
        key: "Burgers",
        label: "Burgers",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
      },
      {
        key: "Filipino",
        label: "Filipino",
        image:
          "https://images.unsplash.com/photo-1559847844-5315695dadae?w=300&h=300&fit=crop",
      },
      {
        key: "Shawarma",
        label: "Shawarma",
        image:
          "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=300&fit=crop",
      },
      {
        key: "Donut",
        label: "Donut",
        image:
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=300&fit=crop",
      },
      {
        key: "Ice Cream",
        label: "Ice Cream",
        image:
          "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=300&h=300&fit=crop",
      },
      {
        key: "Fried Chicken",
        label: "Fried Chicken",
        image:
          "https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=300&fit=crop",
      },
      {
        key: "Takoyaki",
        label: "Takoyaki",
        image:
          "https://images.unsplash.com/photo-1617196039897-1f1f7b5dcb60?w=300&h=300&fit=crop",
      },
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

  const handleCategoryClick = (category) => {
    alert(`Category clicked: ${category}`);
    // TODO: later connect this to Explore page filtering
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Explore Categories</h2>

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
          className="mx-14 flex gap-8 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => handleCategoryClick(category.label)}
              className="shrink-0 flex flex-col items-center gap-3"
            >
              <div className="h-24 w-24 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={category.image}
                  alt={category.label}
                  className="h-full w-full object-cover"
                />
              </div>

              <span className="text-red-500 text-lg font-medium">
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