import { useEffect, useState } from "react";
import {
  LuX,
  LuWallet,
  LuPhone,
  LuArrowLeft,
  LuPlus,
  LuArrowRightLeft,
} from "react-icons/lu";
import {
  getWalletBalance,
  topUpWallet,
  deductFromWallet,
  getGcashNumber,
  linkGcash,
  unlinkGcash,
} from "../../utils/walletApi.js";

export default function WalletModal({ open, onClose }) {
  const [view, setView] = useState("home");
  const [balance, setBalance] = useState(null);
  const [gcashNumber, setGcashNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [amount, setAmount] = useState("");
  const [gcashInput, setGcashInput] = useState("");

  const formatMoney = (val) =>
    `₱${Number(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [walletData, gcashData] = await Promise.all([
        getWalletBalance(),
        getGcashNumber(),
      ]);
      setBalance(walletData);
      setGcashNumber(gcashData || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setView("home");
      setError("");
      setSuccess("");
      setAmount("");
      setGcashInput("");
      loadData();
    }
  }, [open]);

  const handleTopUp = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const newBalance = await topUpWallet(Number(amount));
      setBalance(newBalance);
      setSuccess(`Successfully topped up ${formatMoney(amount)}.`);
      setAmount("");
      setView("home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!gcashNumber) {
      setError("Link a GCash number first.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const newBalance = await deductFromWallet(Number(amount));
      setBalance(newBalance);
      setSuccess(`Transferred ${formatMoney(amount)} to GCash ${gcashNumber}.`);
      setAmount("");
      setView("home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGcash = async () => {
    if (!gcashInput || gcashInput.length < 10) {
      setError("Enter a valid GCash number.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await linkGcash(gcashInput);
      setGcashNumber(gcashInput);
      setGcashInput("");
      setSuccess("GCash number linked.");
      setView("home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkGcash = async () => {
    try {
      setLoading(true);
      setError("");
      await unlinkGcash();
      setGcashNumber(null);
      setSuccess("GCash number unlinked.");
      setView("home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {view !== "home" && (
              <button
                type="button"
                onClick={() => { setView("home"); setError(""); setSuccess(""); }}
                className="text-gray-500 hover:text-gray-800 mr-1"
              >
                <LuArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {view === "home" && "Payments"}
              {view === "wallet" && "My Wallet"}
              {view === "wallet-topup" && "Top Up Wallet"}
              {view === "wallet-transfer" && "Transfer to GCash"}
              {view === "gcash-link" && "Link GCash"}
              {view === "gcash-linked" && "GCash"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <LuX size={20} />
          </button>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
            {success}
          </div>
        )}

        {/* ── HOME ── */}
        {view === "home" && (
          <div className="space-y-3">
            {/* Wallet tile */}
            <button
              type="button"
              onClick={() => { setSuccess(""); setView("wallet"); }}
              className="w-full flex items-center justify-between rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <LuWallet size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Wallet</p>
                  <p className="text-sm text-gray-500">
                    {loading ? "Loading..." : formatMoney(balance)}
                  </p>
                </div>
              </div>
              <span className="text-sm text-red-600 font-semibold">Manage</span>
            </button>

            {/* GCash tile */}
            <button
              type="button"
              onClick={() => { setSuccess(""); setView(gcashNumber ? "gcash-linked" : "gcash-link"); }}
              className="w-full flex items-center justify-between rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LuPhone size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">GCash</p>
                  <p className="text-sm text-gray-500">
                    {loading ? "Loading..." : gcashNumber ? gcashNumber : "Not linked"}
                  </p>
                </div>
              </div>
              <span className="text-sm text-red-600 font-semibold">
                {gcashNumber ? "Manage" : "Link"}
              </span>
            </button>
          </div>
        )}

        {/* ── WALLET ── */}
        {view === "wallet" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Current Balance</p>
              <p className="text-4xl font-bold text-gray-900">{formatMoney(balance)}</p>
            </div>
            <button
              type="button"
              onClick={() => { setError(""); setAmount(""); setView("wallet-topup"); }}
              className="w-full flex items-center gap-3 rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <LuPlus size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Top Up</p>
                <p className="text-sm text-gray-500">Add funds to your wallet</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setError(""); setAmount(""); setView("wallet-transfer"); }}
              className="w-full flex items-center gap-3 rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <LuArrowRightLeft size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Transfer to GCash</p>
                <p className="text-sm text-gray-500">
                  {gcashNumber ? `Send to ${gcashNumber}` : "Link GCash first"}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ── TOP UP ── */}
        {view === "wallet-topup" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(balance)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <button
              type="button"
              onClick={handleTopUp}
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 py-3 text-white font-bold hover:bg-red-700 disabled:opacity-60 transition"
            >
              {loading ? "Processing..." : "Confirm Top Up"}
            </button>
          </div>
        )}

        {/* ── TRANSFER ── */}
        {view === "wallet-transfer" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(balance)}</p>
            </div>
            {gcashNumber ? (
              <>
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                  Transferring to: <span className="font-semibold">{gcashNumber}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTransfer}
                  disabled={loading}
                  className="w-full rounded-2xl bg-red-600 py-3 text-white font-bold hover:bg-red-700 disabled:opacity-60 transition"
                >
                  {loading ? "Processing..." : "Confirm Transfer"}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">You need to link a GCash number first.</p>
                <button
                  type="button"
                  onClick={() => setView("gcash-link")}
                  className="rounded-2xl bg-red-600 px-6 py-3 text-white font-bold hover:bg-red-700 transition"
                >
                  Link GCash
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── GCASH LINK ── */}
        {view === "gcash-link" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Enter your GCash mobile number to link it to your account.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GCash Number</label>
              <input
                type="tel"
                value={gcashInput}
                onChange={(e) => setGcashInput(e.target.value)}
                placeholder="e.g. 09123456789"
                maxLength={11}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <button
              type="button"
              onClick={handleLinkGcash}
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 py-3 text-white font-bold hover:bg-red-700 disabled:opacity-60 transition"
            >
              {loading ? "Linking..." : "Link GCash"}
            </button>
          </div>
        )}

        {/* ── GCASH LINKED ── */}
        {view === "gcash-linked" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 text-center">
              <LuPhone className="mx-auto text-blue-500 mb-2" size={28} />
              <p className="text-sm text-gray-500 mb-1">Linked GCash Number</p>
              <p className="text-2xl font-bold text-gray-900">{gcashNumber}</p>
            </div>
            <button
              type="button"
              onClick={handleUnlinkGcash}
              disabled={loading}
              className="w-full rounded-2xl border border-red-200 py-3 text-red-600 font-bold hover:bg-red-50 disabled:opacity-60 transition"
            >
              {loading ? "Unlinking..." : "Unlink GCash"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}