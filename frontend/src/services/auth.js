import api, { AUTH_STORAGE_KEYS } from "./api.js";

export const login = async (credentials) => {
  const response = await api.post("/account/login/", credentials);
  return response.data;
};

export const register = async (payload) => {
  const response = await api.post("/account/register/", payload);
  return response.data;
};

export const persistAuthSession = (payload) => {
  const accessToken = payload?.tokens?.access ?? payload?.token;
  const refreshToken = payload?.tokens?.refresh;

  if (accessToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  }

  if (payload?.user) {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(payload.user));
  }
};
