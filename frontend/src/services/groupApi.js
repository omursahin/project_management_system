import api from "./api.js";

export const groupApi = {
  list: (termLessonId) => {
    const params = termLessonId ? { term_lesson: termLessonId } : {};
    return api.get("/api/group/", { params }).then((r) => r.data);
  },

  detail: (id) => api.get(`/api/group/${id}/`).then((r) => r.data),

  create: (data) => api.post("/api/group/", data).then((r) => r.data),

  update: (id, data) => api.patch(`/api/group/${id}/`, data).then((r) => r.data),

  remove: (id) => api.delete(`/api/group/${id}/`),

  join: (invitationCode) =>
    api.post("/api/group/join/", { invitation_code: invitationCode }).then((r) => r.data),
};

export const groupMemberApi = {
  accept: (id) => api.patch(`/api/group-member/${id}/accept/`).then((r) => r.data),

  reject: (id) => api.patch(`/api/group-member/${id}/reject/`).then((r) => r.data),

  remove: (id) => api.delete(`/api/group-member/${id}/`),
};

export const termLessonApi = {
  list: () => api.get("/api/term-lesson/").then((r) => r.data),
};
