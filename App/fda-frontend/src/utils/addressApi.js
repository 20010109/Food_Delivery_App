import { supabase } from "./supabase.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session?.access_token) {
    throw new Error("No active session found. Please log in again.");
  }

  return session.access_token;
}

async function apiRequest(path, options = {}) {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export async function getMyAddresses() {
  return apiRequest("/api/addresses", {
    method: "GET",
  });
}

export async function createMyAddress(addressLine, latitude = null, longitude = null) {
  return apiRequest("/api/addresses", {
    method: "POST",
    body: JSON.stringify({
      address_line: addressLine,
      latitude,
      longitude,
    }),
  });
}

export async function updateMyAddress(addressId, addressLine, latitude = null, longitude = null) {
  return apiRequest(`/api/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify({
      address_line: addressLine,
      latitude,
      longitude,
    }),
  });
}

export async function deleteMyAddress(addressId) {
  return apiRequest(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
}

// Simple helper for your current setup:
// if user has no address yet -> create one
// if user already has one -> update the first one
export async function savePrimaryAddress(addressLine) {
  const addresses = await getMyAddresses();

  if (!Array.isArray(addresses) || addresses.length === 0) {
    return createMyAddress(addressLine);
  }

  const current = addresses[0];
  return updateMyAddress(current.id, addressLine, current.latitude ?? null, current.longitude ?? null);
}

export async function getPrimaryAddress() {
  const addresses = await getMyAddresses();

  if (!Array.isArray(addresses) || addresses.length === 0) {
    return null;
  }

  return addresses[0];
}