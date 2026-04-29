import React, { useEffect, useState } from "react";
import {
  LuChevronRight,
  LuMapPinned,
  LuBadgePercent,
  LuCreditCard,
  LuWallet,
  LuLifeBuoy,
  LuTags,
} from "react-icons/lu";

import Navbar from "./components/Navbar.jsx";
import TopBar from "./components/TopBar.jsx";
import SavedAddressModal from "./components/SavedAddressModal.jsx";
import MarketingPreferencesModal from "./components/MarketingPreferencesModal.jsx";

const LS_SELECTED_ADDRESS_KEY = "grubero_selected_address";

export default function SettingsPage() {
  const [query, setQuery] = useState("");

  const [addressOpen, setAddressOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_SELECTED_ADDRESS_KEY);
    if (saved) {
      setSelectedAddressId(saved);
    }
  }, []);

  const handleAddressChange = (address) => {
    if (!address) return;
  
    const id = address.address_id;
  
    setSelectedAddressId(id);
    localStorage.setItem(LS_SELECTED_ADDRESS_KEY, id);
  
    setAddressOpen(false);
  };

  const settingsGroups = [
    {
      title: "General",
      items: [
        {
          label: "Saved Addresses",
          icon: <LuMapPinned className="text-gray-600" />,
          description:
            selectedAddressId
              ? "Tap to change saved address"
              : "Manage your saved addresses",
          onClick: () => setAddressOpen(true),
        },
        {
          label: "Marketing Preferences",
          icon: <LuBadgePercent className="text-gray-600" />,
          description: "Email updates, promos, and notifications",
          onClick: () => setMarketingOpen(true),
        },
      ],
    },
    {
      title: "Payments",
      items: [
        {
          label: "Payment Methods",
          icon: <LuCreditCard className="text-gray-600" />,
          description: "Manage your payment options",
          onClick: () => alert("Payment methods not connected yet"),
        },
        {
          label: "My Cards",
          icon: <LuWallet className="text-gray-600" />,
          description: "View saved cards",
          onClick: () => alert("Cards not connected yet"),
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          label: "Support",
          icon: <LuLifeBuoy className="text-gray-600" />,
          description: "Get help and contact support",
          onClick: () => alert("Support page not connected yet"),
        },
        {
          label: "Discounts",
          icon: <LuTags className="text-gray-600" />,
          description: "View your available deals",
          onClick: () => alert("Discounts page not connected yet"),
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 overflow-auto">
        <section className="p-6 space-y-8">
          <TopBar
            query={query}
            onQueryChange={setQuery}
            onOpenFilters={() => alert("Filters not implemented yet")}
            onOpenCart={() => alert("Cart not connected from settings yet")}
            showAddressButton={false}
          />

          <div className="w-full max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="space-y-8">
              {settingsGroups.map((group) => (
                <div key={group.title}>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {group.title}
                  </h2>

                  <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {group.items.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{item.icon}</div>

                          <div>
                            <span className="block text-gray-800 font-medium">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="block text-sm text-gray-500 mt-1">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <LuChevronRight className="text-gray-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SavedAddressModal
            open={addressOpen}
            onClose={() => setAddressOpen(false)}
            onAddressChange={handleAddressChange}
          />

          <MarketingPreferencesModal
            open={marketingOpen}
            onClose={() => setMarketingOpen(false)}
          />
        </section>
      </main>
    </div>
  );
}