import { useSyncExternalStore } from "react";
import api from "./api";

const AUTH_CHANGE_EVENT = "auth-change";
const userCache = { raw: undefined, parsed: null };
const tokenCache = { raw: undefined, parsed: null };

function readJsonStorage(key, cache) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(key);
  if (raw === cache.raw) {
    return cache.parsed;
  }

  cache.raw = raw;
  cache.parsed = raw ? JSON.parse(raw) : null;
  return cache.parsed;
}

export const authApi = {
  login: (payload) =>
    api.post("/api/account/login/", payload).then((res) => res.data),

  register: (payload) =>
    api.post("/api/account/register/", payload).then((res) => res.data),

  logout: (refreshToken) =>
    api.post("/api/account/logout/", { refresh: refreshToken }).then((res) => res.data),

  refreshToken: (refreshToken) =>
    api.post("/api/v1/token/refresh/", { refresh: refreshToken }).then((res) => res.data),
};

function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function saveAuth(data) {
  if (data.tokens) {
    localStorage.setItem("tokens", JSON.stringify(data.tokens));
  }
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  emitAuthChange();
}

export function clearAuth() {
  localStorage.removeItem("tokens");
  localStorage.removeItem("user");
  emitAuthChange();
}

export function updateStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  emitAuthChange();
}

export function getStoredUser() {
  return readJsonStorage("user", userCache);
}

export function getStoredTokens() {
  return readJsonStorage("tokens", tokenCache);
}

export function isAuthenticated() {
  return !!getStoredTokens()?.access;
}

function subscribeAuthChange(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAuthUser() {
  return useSyncExternalStore(subscribeAuthChange, getStoredUser, () => null);
}
