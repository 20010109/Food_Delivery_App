import { supabase } from "./supabase.js";

const API_BASE = "http://localhost:3000/api/addresses";

async function getAuthToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token;
}

export async function getAddresses() {
  const token = await getAuthToken();

  const res = await fetch(API_BASE, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch addresses");
  }

  return res.json();
}

export async function createUserAddress(addressLine, latitude = null, longitude = null) {
  const token = await getAuthToken();

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      address_line: addressLine,
      latitude,
      longitude,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create address");
  }

  return res.json();
}

export async function updateUserAddress(addressId, addressLine, latitude = null, longitude = null) {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      address_line: addressLine,
      latitude,
      longitude,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update address");
  }

  return res.json();
}

export async function deleteUserAddress(addressId) {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}/${addressId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let message = "Failed to delete address";

    try {
      const errorData = await res.json();
      message = errorData?.error || message;
    } catch {
      // ignore if no json body
    }

    throw new Error(message);
  }

  // DELETE returns 204 No Content, so do not call res.json()
  return true;
}

export async function getPrimaryAddress() {
  const addresses = await getAddresses();
  return addresses?.[0] || null;
}