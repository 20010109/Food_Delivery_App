import React, { useState } from "react";
import { LuX } from "react-icons/lu";

const CUISINES = ["Burgers", "Pizza", "Fried Chicken", "Filipino", "Chinese", "Japanese", "Korean"];
const PRICE_RANGES = ["₱", "₱₱", "₱₱₱"];
const DELIVERY_TIMES = ["15-25 min", "20-30 min", "25-40 min"];
const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
];

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const val = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? opt.label : opt;
        const active = value === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(active ? "" : val)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              active
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function SearchFiltersModal({
  open,
  onClose,
  onApplyFilters,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {};
    setFilters(cleared);
    onApplyFilters(cleared);
    onClose();
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Filters {activeCount > 0 && <span className="ml-2 text-xs bg-red-600 text-white rounded-full px-2 py-0.5">{activeCount}</span>}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LuX size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Sort */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sort By</p>
            <PillGroup options={SORT_OPTIONS} value={filters.sortBy || ""} onChange={(v) => handleChange("sortBy", v)} />
          </div>

          {/* Cuisine */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cuisine</p>
            <PillGroup options={CUISINES} value={filters.cuisine || ""} onChange={(v) => handleChange("cuisine", v)} />
          </div>

          {/* Price Range */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Price Range</p>
            <PillGroup options={PRICE_RANGES} value={filters.priceRange || ""} onChange={(v) => handleChange("priceRange", v)} />
          </div>

          {/* Delivery Time */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Delivery Time</p>
            <PillGroup options={DELIVERY_TIMES} value={filters.deliveryTime || ""} onChange={(v) => handleChange("deliveryTime", v)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleClear}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}