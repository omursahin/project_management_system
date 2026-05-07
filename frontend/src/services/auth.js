import api from './api';

export const authApi = {
  login: (payload) =>
    api.post('/api/account/login/', payload).then((res) => res.data),

  register: (payload) =>
    api.post('/api/account/register/', payload).then((res) => res.data),

  logout: (refreshToken) =>
    api.post('/api/account/logout/', { refresh: refreshToken }).then((res) => res.data),

  refreshToken: (refreshToken) =>
    api.post('/api/v1/token/refresh/', { refresh: refreshToken }).then((res) => res.data),
};

export function saveAuth(data) {
  if (data.tokens) {
    localStorage.setItem('tokens', JSON.stringify(data.tokens));
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}

export function clearAuth() {
  localStorage.removeItem('tokens');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function getStoredTokens() {
  const raw = localStorage.getItem('tokens');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!getStoredTokens()?.access;
}
