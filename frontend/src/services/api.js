import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Her istekte localStorage'dan JWT token'ı header'a ekle
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem("tokens");
  if (tokens) {
    const { access } = JSON.parse(tokens);
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  return config;
});

// 401 gelirse login sayfasına yönlendir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("tokens");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Simülasyon: backend hazır olunca aşağıdaki 2 satırı sil ──
import { installMockGroupApi } from "./mockGroupApi.js";
installMockGroupApi(api);

