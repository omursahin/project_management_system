import api from './api';

export const universityService = {
  // Tüm üniversiteleri listeler
  getAll: () => api.get('/university/'), 

  // Yeni bir üniversite ekler
  create: (data) => api.post('/university/', data),

  // Mevcut bir üniversiteyi günceller (ID bazlı)
  update: (id, data) => api.put(`/university/${id}/`, data),

  // Bir üniversiteyi siler (ID bazlı)
  delete: (id) => api.delete(`/university/${id}/`)
};