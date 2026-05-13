import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Boşluk ve Bearer formatından emin oluyoruz
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 hatası gelirse hemen yönlendirme yapmasın, önce hatayı görelim
    if (error.response && error.response.status === 401) {
      console.error("Yetki Hatası! Token geçersiz olabilir.");
      
      // Eğer zaten login sayfasındaysak temizlik yapma ki döngüye girmesin
      if (window.location.pathname !== "/login") {
        
      }
    }
    return Promise.reject(error);
  }
);

export default api;