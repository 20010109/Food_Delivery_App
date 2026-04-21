import React, { useState } from "react";
import {
  LuChevronRight,
  LuCircleUserRound,
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

export default function SettingsPage() {
  const [query, setQuery] = useState("");

  const [addressOpen, setAddressOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);

  const settingsGroups = [
    {
      title: "General",
      items: [
        {
          label: "Saved Addresses",
          icon: <LuMapPinned className="text-gray-600" />,
          onClick: () => setAddressOpen(true),
        },
        {
          label: "Marketing Preferences",
          icon: <LuBadgePercent className="text-gray-600" />,
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
          onClick: () => alert("Payment methods not connected yet"),
        },
        {
          label: "My Cards",
          icon: <LuWallet className="text-gray-600" />,
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
          onClick: () => alert("Support page not connected yet"),
        },
        {
          label: "Discounts",
          icon: <LuTags className="text-gray-600" />,
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

          <div className="w-full max-w-8xl">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

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
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="text-gray-800 font-medium">
                            {item.label}
                          </span>
                        </div>

                        <LuChevronRight className="text-gray-400" />
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
            onSaved={() => {
              // later we can trigger a shared refresh here
            }}
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