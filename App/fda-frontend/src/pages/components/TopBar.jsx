import React from "react";
import {
  LuMapPin,
  LuSearch,
  LuSlidersHorizontal,
  LuShoppingCart,
  LuWallet
} from "react-icons/lu";

export default function TopBar({
  query,
  onQueryChange,
  onOpenFilters,
  onOpenCart,
  showAddressButton = true,
  onOpenAddress,
  addressLabel = "Set address",
  walletBalance = null,
}) {
  return (
    <div className="flex items-center gap-4">
      {/* LEFT SLOT (fixed width so layout won't shift between pages) */}
      <div className="w-[240px]">
        {showAddressButton && (
          <button
            type="button"
            className="w-full h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 px-4 text-sm text-gray-700"
            onClick={onOpenAddress}
            title="Change address"
          >
            <LuMapPin className="text-gray-500 shrink-0" />
            <span className="truncate font-medium">{addressLabel || "Set address"}</span>
          </button>
        )}
      </div>

      {walletBalance!== null && (
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          <LuWallet className="text-red-500" size={16} />
          ₱{Number(walletBalance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </div>
      )}

      {/* RIGHT SLOT (always aligned) */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="relative w-full max-w-xl">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            placeholder="Search for anything..."
          />
        </div>

        <button
          type="button"
          className="h-10 w-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
          onClick={onOpenFilters}
          title="Filters"
        >
          <LuSlidersHorizontal />
        </button>

        <button
          type="button"
          className="h-10 w-10 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
          onClick={onOpenCart}
          title="Cart"
        >
          <LuShoppingCart />
        </button>
      </div>
    </div>
  );
}