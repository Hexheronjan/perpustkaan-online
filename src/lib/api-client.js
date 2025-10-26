"use client";

import { getToken } from "./client-auth";

export async function apiFetch(path, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`); // ← Ubah ke backtick

  const res = await fetch(`${baseUrl}${path}`, { // ← Ubah ke backtick
    ...options,
    headers,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message = data?.message || `Request failed: ${res.status}`; // ← Ubah ke backtick
    throw new Error(message);
  }
  return data;
}