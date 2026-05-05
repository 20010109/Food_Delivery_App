import React, { useEffect, useState } from "react";
import { LuClock, LuLogOut } from "react-icons/lu";

const SessionTimeoutWarning = ({ isOpen, timeoutType, onExtend, onLogout }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(60);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-yellow-50 border-b-2 border-yellow-200 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <LuClock className="text-yellow-600" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Session Expiring Soon
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {timeoutType === "inactivity"
                  ? "You've been inactive"
                  : "Your session time is running out"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Your session will expire in{" "}
              <span className="font-bold text-red-600">{secondsRemaining}</span>{" "}
              second{secondsRemaining !== 1 ? "s" : ""}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Click "Continue Session" to stay logged in, or you'll be logged out
            automatically.
          </p>

          {/* Countdown Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-1000"
              style={{ width: `${(secondsRemaining / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <LuLogOut size={18} />
            Logout
          </button>
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
