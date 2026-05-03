import { supabase } from "./supabase.js";

const API_BASE = "http://localhost:3000/api/users";

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function getSavedCards() {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/cards`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch saved cards");
  return res.json();
}

export async function addCard({ cardholder_name, card_number, expiry_month, expiry_year }) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ cardholder_name, card_number, expiry_month, expiry_year }),
  });
  if (!res.ok) throw new Error("Failed to add card");
  return res.json();
}

export async function deleteCard(card_id) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/cards/${card_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete card");
  return res.json();
}