import { supabase } from "./supabase.js";

const API_BASE = "http://localhost:3000/api/users";

async function getAuthToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function getWalletBalance() {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch wallet balance");
    }
    return res.json();
}

export async function topUpWallet(amount) {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/wallet/add`, {
        method: "PATCH",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
        throw new Error("Failed to top up wallet");
    }
    return res.json();
}

export async function deductFromWallet(amount) {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/wallet/deduct`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to deduct from wallet");
    }
    return res.json();
}

export async function getGcashNumber() {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/gcash`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if(!res.ok) {
        throw new Error("Failed to fetch Gcash number");
    }
    return res.json();
}

export async function linkGcash(gcash_number) {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/gcash/link`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ gcash_number }),
    });
    if(!res.ok) {
        throw new Error("Failed to link Gcash number");
    }
    return res.json();
}

export async function unlinkGcash() {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/gcash/unlink`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    if(!res.ok) {
        throw new Error("Failed to unlink Gcash number");
    }
    return res.json();
}
