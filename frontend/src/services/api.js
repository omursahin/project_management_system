import axios from "axios";

export const AUTH_STORAGE_KEYS = {
  accessToken: "token",
  refreshToken: "refreshToken",
  user: "user",
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiErrorData = (error) => error?.response?.data ?? null;

export default api;
