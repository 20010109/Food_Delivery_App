import React, { useState } from "react";

export default function FilterModal({
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-lg font-bold mb-4">Filters</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cuisine
            </label>
            <select
              value={filters.cuisine || ""}
              onChange={(e) => handleChange("cuisine", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">All</option>
              <option value="Burgers">Burgers</option>
              <option value="Pizza">Pizza</option>
              <option value="Fried Chicken">Fried Chicken</option>
              <option value="Filipino">Filipino</option>
              <option value="Chinese">Chinese</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price Range
            </label>
            <select
              value={filters.priceRange || ""}
              onChange={(e) => handleChange("priceRange", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">All</option>
              <option value="₱">₱</option>
              <option value="₱₱">₱₱</option>
              <option value="₱₱₱">₱₱₱</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Time
            </label>
            <select
              value={filters.deliveryTime || ""}
              onChange={(e) => handleChange("deliveryTime", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">All</option>
              <option value="15-25 min">15-25 min</option>
              <option value="20-30 min">20-30 min</option>
              <option value="25-40 min">25-40 min</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}