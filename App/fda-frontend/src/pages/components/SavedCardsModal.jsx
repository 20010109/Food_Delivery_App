import { useEffect, useState } from "react";
import { LuX, LuCreditCard, LuPlus, LuArrowLeft, LuTrash2, LuStar } from "react-icons/lu";
import { getSavedCards, addCard, deleteCard } from "../../utils/cardApi.js";

const LS_MAIN_CARD_KEY = "grubero_main_card";

export default function SavedCardsModal({ open, onClose }) {
  const [view, setView] = useState("home");
  const [cards, setCards] = useState([]);
  const [mainCardId, setMainCardId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add card form fields
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");

  const loadCards = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSavedCards();
      setCards(data || []);
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
      setMainCardId(localStorage.getItem(LS_MAIN_CARD_KEY));
      loadCards();
    }
  }, [open]);

  const handleSetMain = (card_id) => {
    setMainCardId(card_id);
    localStorage.setItem(LS_MAIN_CARD_KEY, card_id);
    setSuccess("Main card updated.");
  };

  const handleDelete = async (card_id) => {
    try {
      setLoading(true);
      setError("");
      await deleteCard(card_id);
      if (mainCardId === card_id) {
        setMainCardId(null);
        localStorage.removeItem(LS_MAIN_CARD_KEY);
      }
      await loadCards();
      setSuccess("Card removed.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear) {
      setError("All fields are required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await addCard({ cardholder_name: cardholderName, card_number: cardNumber, expiry_month: expiryMonth, expiry_year: expiryYear });
      setCardholderName(""); setCardNumber(""); setExpiryMonth(""); setExpiryYear("");
      await loadCards();
      setSuccess("Card added.");
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {view === "add" && (
              <button type="button" onClick={() => { setView("home"); setError(""); setSuccess(""); }} className="text-gray-500 hover:text-gray-800 mr-1">
                <LuArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {view === "home" ? "My Cards" : "Add a Card"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700"><LuX size={20} /></button>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">{error}</div>}
        {success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">{success}</div>}

        {/* Home view — list cards */}
        {view === "home" && (
          <div className="space-y-3">
            {loading && <p className="text-sm text-gray-400">Loading...</p>}
            {!loading && cards.length === 0 && (
              <p className="text-sm text-gray-500">No saved cards yet.</p>
            )}
            {cards.map((card) => (
              <div key={card.card_id} className={`flex items-center justify-between rounded-2xl border p-4 ${mainCardId === card.card_id ? "border-yellow-400 bg-yellow-50" : "border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <LuCreditCard size={20} className="text-gray-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{card.cardholder_name}</p>
                    <p className="text-sm text-gray-500">•••• {card.last_four} · {card.expiry_month}/{card.expiry_year}</p>
                    {mainCardId === card.card_id && <p className="text-xs text-yellow-600 font-semibold mt-0.5">Main card</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleSetMain(card.card_id)} title="Set as main" className={`text-yellow-400 hover:text-yellow-500 ${mainCardId === card.card_id ? "opacity-100" : "opacity-40"}`}>
                    <LuStar size={18} />
                  </button>
                  <button type="button" onClick={() => handleDelete(card.card_id)} title="Remove" className="text-red-400 hover:text-red-600">
                    <LuTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={() => { setError(""); setSuccess(""); setView("add"); }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
              <LuPlus size={16} /> Add a card
            </button>
          </div>
        )}

        {/* Add card view */}
        {view === "add" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Juan Dela Cruz" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="1234 5678 9012 3456" maxLength={19}
                value={cardNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
                }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="MM" maxLength={2} value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="YY" maxLength={2} value={expiryYear} onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, ""))} />
              </div>
            </div>
            <button type="button" onClick={handleAddCard} disabled={loading}
              className="w-full rounded-2xl bg-red-600 py-3 text-white font-bold hover:bg-red-700 disabled:opacity-50 transition">
              {loading ? "Saving..." : "Add Card"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}