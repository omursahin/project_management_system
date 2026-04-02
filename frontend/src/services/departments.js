import api from "./api.js";

export async function fetchDepartments() {
  const { data } = await api.get("/department/");
  return data;
}
