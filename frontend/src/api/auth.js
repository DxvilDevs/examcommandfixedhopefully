import { api, setToken } from "./client";

export async function login(email, password) {
  const r = await api("/auth/login", { method: "POST", body: { email, password } });
  setToken(r.token);
  return r.user;
}

export async function signup(payload) {
  const r = await api("/auth/signup", { method: "POST", body: payload });
  setToken(r.token);
  return r.user;
}
