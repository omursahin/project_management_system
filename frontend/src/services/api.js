import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export const loginUser = async (payload) => {
  const response = await api.post("/account/login/", payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post("/account/register/", payload);
  return response.data;
};

export const fetchDepartments = async () => {
  const response = await api.get("/department/");
  return response.data;
};

export default api;
