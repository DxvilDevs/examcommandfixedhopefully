const API_URL = import.meta.env.VITE_API_URL;

export function getToken() {
  return localStorage.getItem("ecc_token");
}
export function setToken(t) {
  localStorage.setItem("ecc_token", t);
}
export function clearToken() {
  localStorage.removeItem("ecc_token");
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
