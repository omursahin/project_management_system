import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api.js";

/* ============================================================================
 * Transport Layer
 * ----------------------------------------------------------------------------
 * Bu nesneler sadece HTTP cagrilarini saran ince transport fonksiyonlaridir.
 * Component'lerde DOGRUDAN cagrilmazlar; asagidaki react-query hook'lari
 * tarafindan kullanilirlar. (__tests__/Groups.test.jsx bu transport'u
 * mock'ladigi icin bu API surfacesi korunmustur.)
 * ========================================================================== */

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
    api.post("/api/group/join/", { invite_code: invitationCode }).then((r) => r.data),

  leave: (id) => api.post(`/api/group/${id}/leave/`).then((r) => r.data),
};

export const groupMemberApi = {
  accept: (id) => api.patch(`/api/group-member/${id}/accept/`).then((r) => r.data),
  reject: (id) => api.patch(`/api/group-member/${id}/reject/`).then((r) => r.data),
  remove: (id) => api.delete(`/api/group-member/${id}/`),
};

export const termLessonApi = {
  list: () => api.get("/api/term-lesson/").then((r) => r.data),
};

/* ============================================================================
 * React Query Hooks (Component'lerde KULLANILACAK API)
 * ----------------------------------------------------------------------------
 * Component'ler artik axios/api'yi DOGRUDAN cagirmaz; bunun yerine asagidaki
 * hook'lari kullanir. Bu sayede:
 *   - Otomatik cache yonetimi
 *   - isLoading / isPending / error state'leri
 *   - Mutation sonrasi otomatik invalidation
 *   - Tekrar kullanilabilirlik
 * ========================================================================== */

const GROUPS_KEY = ["groups"];
const groupDetailKey = (id) => ["groups", "detail", id];
const TERM_LESSONS_KEY = ["termLessons"];

/* ---------- Queries ---------- */

export function useGroups(termLessonId) {
  return useQuery({
    queryKey: termLessonId ? [...GROUPS_KEY, { termLessonId }] : GROUPS_KEY,
    queryFn: () => groupApi.list(termLessonId),
  });
}

export function useGroupDetail(id, options = {}) {
  const { enabled = true, ...rest } = options;
  return useQuery({
    queryKey: groupDetailKey(id),
    queryFn: () => groupApi.detail(id),
    enabled: id != null && enabled,
    ...rest,
  });
}

export function useTermLessons() {
  return useQuery({
    queryKey: TERM_LESSONS_KEY,
    queryFn: () => termLessonApi.list(),
  });
}

/* ---------- Group mutations ---------- */

export function useCreateGroup(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => groupApi.create(data),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}

export function useUpdateGroup(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => groupApi.update(id, data),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      qc.invalidateQueries({ queryKey: groupDetailKey(variables.id) });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}

export function useDeleteGroup(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupApi.remove(id),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}

export function useJoinGroup(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationCode) => groupApi.join(invitationCode),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}

export function useLeaveGroup(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupApi.leave(id),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}

/* ---------- Group member mutations ---------- */

export function useGroupMemberAccept(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupMemberApi.accept(id),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}

export function useGroupMemberReject(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupMemberApi.reject(id),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}

export function useGroupMemberRemove(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupMemberApi.remove(id),
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
}