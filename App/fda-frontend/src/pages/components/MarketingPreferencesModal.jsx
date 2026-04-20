import React, { useState } from "react";
import { LuX } from "react-icons/lu";

export default function MarketingPreferencesModal({ open, onClose }) {
  const [preferences, setPreferences] = useState({
    promotionalEmails: false,
    weeklyNewsletter: true,
    smsUpdates: false,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    alert("Marketing preferences backend not connected yet");
    onClose();

    // TODO (backend/settings): save marketing preferences to DB
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Marketing Preferences</h3>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={preferences.promotionalEmails}
              onChange={() => handleToggle("promotionalEmails")}
            />
            Promotional emails
          </label>

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={preferences.weeklyNewsletter}
              onChange={() => handleToggle("weeklyNewsletter")}
            />
            Weekly newsletter
          </label>

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={preferences.smsUpdates}
              onChange={() => handleToggle("smsUpdates")}
            />
            SMS updates
          </label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full mt-5 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition"
        >
          Update Preferences
        </button>
      </div>
    </div>
  );
}