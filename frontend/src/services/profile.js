import api from "./api";

function extractProfile(data) {
  return data?.user ?? data;
}

export const profileApi = {
  getProfile: () =>
    api.get("/api/account/profile/").then((res) => extractProfile(res.data)),

  updateProfile: async (payload) => {
    try {
      const res = await api.patch("/api/account/profile/", payload);
      return extractProfile(res.data);
    } catch (error) {
      if (error.response?.status === 405) {
        const res = await api.put("/api/account/profile/", payload);
        return extractProfile(res.data);
      }
      throw error;
    }
  },

  changePassword: (payload) =>
    api.post("/api/account/change-password/", payload).then((res) => res.data),
};
