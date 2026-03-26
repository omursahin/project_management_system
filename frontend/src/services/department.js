import api from "./api.js";

export const getDepartments = async () => {
  const response = await api.get("/department/");
  return response.data;
};
