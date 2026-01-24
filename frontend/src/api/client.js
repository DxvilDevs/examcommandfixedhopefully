// frontend/src/api/client.js

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Token helpers
 */
export function getToken() {
  return (
    localStorage.getItem("ecc_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}

export function setToken(token) {
  if (!token) return;
  localStorage.setItem("ecc_token", token);
}

export function clearToken() {
  localStorage.removeItem("ecc_token");
}

/**
 * Core API helper
 */
export async function api(path, { method = "GET", body } = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not set (check GitHub Actions variables)");
  }

  const headers = {
    "Content-Type": "application/json"
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  // Network-level failure (API unreachable, CORS, DNS, etc.)
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("Network error: cannot reach API server");
  }

  // Safely read response
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  // HTTP error from API
  if (!response.ok) {
    throw new Error(
      data?.error ||
      `HTTP ${response.status}: ${text?.slice(0, 200) || "Request failed"}`
    );
  }

  return data;
}
