import axios from 'axios';

// API URL oncelik sirasi:
// 1. Runtime config (public/config.js'deki window.APP_CONFIG.API_URL) - build sonrasi degistirilebilir
// 2. Build-time env (.env'deki VITE_API_URL) - npm run build oncesi belirlenir
// 3. window.location.origin - frontend ile backend ayni sunucudaysa
function resolveApiUrl() {
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_URL) {
    return window.APP_CONFIG.API_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
}

const api = axios.create({
  baseURL: resolveApiUrl(),
});

// Her istekte localStorage'dan JWT token'i header'a ekle
api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem("tokens") || "null");
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 401 gelirse refresh token ile yenile, yine başarısızsa login'e yönlendir
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 ve henüz retry yapılmadıysa refresh dene
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Login/register isteklerinde refresh deneme
      if (originalRequest.url?.includes('/account/login') ||
          originalRequest.url?.includes('/account/register')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = JSON.parse(localStorage.getItem("tokens") || "null");
      if (!tokens?.refresh) {
        isRefreshing = false;
        forceLogout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/api/v1/token/refresh/`,
          { refresh: tokens.refresh }
        );

        const newTokens = { ...tokens, access: data.access };
        // Refresh rotate edildiyse yeni refresh'i de kaydet
        if (data.refresh) {
          newTokens.refresh = data.refresh;
        }
        localStorage.setItem("tokens", JSON.stringify(newTokens));

        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function forceLogout() {
  localStorage.removeItem("tokens");
  localStorage.removeItem("user");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export default api;
