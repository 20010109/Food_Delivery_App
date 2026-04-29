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

export async function createUserAddress({
  house_no,
  street,
  barangay,
  city,
  province,
  postal_code,
  country = "Philippines",
  is_default = false,
}) {
  const token = await getAuthToken();

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      house_no,
      street,
      barangay,
      city,
      province,
      postal_code,
      country,
      is_default,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create address");
  }

  return res.json();
}

export async function updateUserAddress(
  addressId,
  {
    house_no,
    street,
    barangay,
    city,
    province,
    postal_code,
    country,
    is_default,
  }
) {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      house_no,
      street,
      barangay,
      city,
      province,
      postal_code,
      country,
      is_default,
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
    } catch {}

    throw new Error(message);
  }

  return true;
}

export async function getPrimaryAddress() {
  const addresses = await getAddresses();

  return (
    addresses.find((addr) => addr.is_default === true) ||
    addresses?.[0] ||
    null
  );
}

export const setDefaultAddress = async (addressId) => {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}/${addressId}/default`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to set default address");
  }

  return data;
};