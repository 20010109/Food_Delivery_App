import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LuMessageSquare,
  LuSearch,
  LuSend,
  LuPhone,
  LuMapPin,
  LuClock3,
} from "react-icons/lu";
import Navbar from "./components/navbar.jsx";
import { supabase } from "../utils/supabase.js";
import "./styles/tailwind.css";
import { MOCK_CONVERSATIONS } from "./dummyData/messagesData.js";

function formatUserName(userProfile) {
  if (!userProfile) return "Customer";

  const fullName = [userProfile.first_name, userProfile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || userProfile.email || "Customer";
}

function getLastMessagePreview(conversation) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  return lastMessage ? lastMessage.text : "No messages yet";
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState(
    MOCK_CONVERSATIONS[0]?.id ?? null
  );
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Failed to load current user:", error.message);
          return;
        }

        const authUser = data?.user;
        if (!authUser) return;

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error("Failed to load user profile:", profileError.message);
        }

        setCurrentUser({
          ...authUser,
          ...(profile || {}),
        });
      } catch (err) {
        console.error("Unexpected error loading user:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return conversations;

    return conversations.filter((conversation) => {
      return (
        conversation.rider.name.toLowerCase().includes(term) ||
        conversation.orderId.toLowerCase().includes(term) ||
        conversation.storeName.toLowerCase().includes(term)
      );
    });
  }, [conversations, search]);

  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === activeConversationId
    ) ||
    filteredConversations[0] ||
    null;

  useEffect(() => {
    if (!activeConversation && filteredConversations.length > 0) {
      setActiveConversationId(filteredConversations[0].id);
    }
  }, [activeConversation, filteredConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversationId, conversations]);

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const body = draft.trim();
    if (!body || !activeConversation) return;

    const newMessage = {
      id: `local-${Date.now()}`,
      sender: "customer",
      text: body,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            }
          : conversation
      )
    );

    setDraft("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Navbar />

      <main className="flex-1 min-w-0 min-h-0 overflow-hidden bg-gray-100 p-6">
        <div className="h-full rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid h-full grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="border-r border-gray-200 bg-gray-50/70">
              <div className="border-b border-gray-200 px-6 pt-7 pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mt-4 text-sm font-medium text-red-600">Messages</p>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Chat with your rider
                    </h1>
                  </div>

                  <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    Customer
                  </div>
                </div>

                <div className="mt-4 relative">
                  <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search rider, order, or store"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-red-500"
                  />
                </div>
              </div>

              <div className="h-[calc(100%-132px)] overflow-y-auto p-4 space-y-4">
                {filteredConversations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <LuMessageSquare size={22} />
                    </div>
                    <p className="font-semibold text-gray-900">
                      No conversations found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Active rider chats will appear here.
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversation?.id;
                    const lastMessage =
                      conversation.messages[conversation.messages.length - 1];

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? "border-red-200 bg-red-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={conversation.rider.avatar}
                            alt={conversation.rider.name}
                            className="mt-5 h-12 w-12 rounded-2xl object-cover"
                          />

                          <div className="min-w-0 flex-1 pt-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-semibold leading-tight text-gray-900">
                                  {conversation.rider.name}
                                </p>
                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {conversation.storeName} • {conversation.orderId}
                                </p>
                              </div>

                              <div className="self-start text-right pt-0.5">
                                <p className="text-xs text-gray-400">
                                  {lastMessage?.timestamp || ""}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                              {getLastMessagePreview(conversation)}
                            </p>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                                {conversation.status}
                              </span>
                              <span className="text-xs font-medium text-red-600">
                                ETA {conversation.eta}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="flex h-full min-h-0 flex-col">
              {activeConversation ? (
                <>
                  <header className="shrink-0 border-b border-gray-200 px-8 pt-14 pb-5 flex flex-col justify-end">
                    <div className="flex flex-row items-end justify-between gap-4">
                      <div className="flex items-end gap-4">
                        <img
                          src={activeConversation.rider.avatar}
                          alt={activeConversation.rider.name}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />

                        <div>
                          <h2 className="text-xl font-bold leading-tight text-gray-900">
                            {activeConversation.rider.name}
                          </h2>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {activeConversation.rider.vehicle}
                          </p>

                          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                              {activeConversation.status}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <LuClock3 size={14} />
                              ETA {activeConversation.eta}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <LuMapPin size={14} />
                              {activeConversation.storeName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                          Order
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {activeConversation.orderId}
                        </p>
                      </div>
                    </div>
                  </header>

                  <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(254,226,226,0.55),_transparent_35%),linear-gradient(to_bottom,_#ffffff,_#f9fafb)] px-8 py-8">
                    <div className="mx-auto w-full max-w-4xl space-y-5">
                      <div className="rounded-2xl border border-red-100 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-sm">
                        You are chatting directly with your assigned rider for
                        this delivery.
                      </div>

                      {activeConversation.messages.map((message) => {
                        const isOwnMessage = message.sender === "customer";

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-3xl px-4 py-3 shadow-sm ${
                                isOwnMessage
                                  ? "rounded-br-md bg-red-600 text-white"
                                  : "rounded-bl-md border border-gray-200 bg-white text-gray-900"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.text}
                              </p>
                              <p
                                className={`mt-2 text-[11px] ${
                                  isOwnMessage
                                    ? "text-red-100"
                                    : "text-gray-400"
                                }`}
                              >
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <footer className="border-t border-gray-200 bg-white px-10 py-4">
                    <div className="flex w-full items-center gap-3">
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                        aria-label="Call rider"
                      >
                        <LuPhone size={18} />
                      </button>

                      <form onSubmit={handleSendMessage} className="flex-1">
                        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-red-500">
                          <input
                            type="text"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder="Type a message for your rider..."
                            className="h-10 flex-1 bg-transparent px-4 text-sm text-gray-900 outline-none"
                          />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                          >
                            <LuSend size={16} />
                            Send
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="mt-6 w-full text-center text-xs text-gray-400">
                      Logged in as{" "}
                      {loadingUser ? "loading..." : formatUserName(currentUser)}
                    </div>
                  </footer>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
                  <div className="max-w-md text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                      <LuMessageSquare size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      No active rider chat
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Once an order is assigned to a rider, the conversation
                      will show up here.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}