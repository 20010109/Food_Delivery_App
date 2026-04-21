import React from "react";
import { useNavigate } from "react-router-dom";
import { LuFlame, LuX, LuArrowRight } from "react-icons/lu";

function SidebarPromoCard({ onClose }) {
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-3xl bg-white text-gray-900 p-4 shadow-md">
      <div className="relative mb-3">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
            <LuFlame className="text-red-500 text-lg" />
          </div>
        </div>

        <button
          type="button"
          className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
          aria-label="Close promo"
          onClick={onClose}
        >
          <LuX className="text-lg" />
        </button>
      </div>

      <h3 className="text-lg font-bold leading-tight text-center mb-2">
  Free delivery on
  <br />
  all orders over <span className="text-red-500">₱499</span>
</h3>

<p className="text-sm text-gray-500 leading-6 text-center mb-4">
  Limited-time promo for selected stores near you.
</p>

      <button
        type="button"
        onClick={() => navigate("/explore")}
        className="w-full rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold py-3 flex items-center justify-center gap-2 transition"
      >
        Order now
        <LuArrowRight className="text-lg" />
      </button>
    </div>
  );
}

export default SidebarPromoCard;