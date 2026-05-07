import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api.js";

/**
 * REST API kaynaklari icin React Query hook factory'si.
 *
 * Kullanim:
 *   export const universities = createResource("universities", "/api/universities/");
 *   const { data } = universities.useList();
 *   const create = universities.useCreate();
 *   create.mutate({ name: "Foo" });
 *
 * Veri donusumu (server <-> client field isimleri farkliysa):
 *   createResource("universities", "/api/universities/", {
 *     toClient: (s) => ({ id: s.id, name: s.title }),
 *     toServer: (c) => ({ title: c.name }),
 *   });
 *
 * @param {string} key  - React Query cache key (ornegin "universities")
 * @param {string} path - Backend endpoint path (sonunda "/" olmali, ornegin "/api/universities/")
 * @param {object} opts
 * @param {(server: any) => any} [opts.toClient] - Server -> client donusum
 * @param {(client: any) => any} [opts.toServer] - Client -> server donusum
 * @param {(data: any) => any[]} [opts.selectList] - Liste yanitindan array cikarir (default: data.results || data)
 */
export function createResource(key, path, opts = {}) {
  const {
    toClient = (x) => x,
    toServer = (x) => x,
    selectList = (data) => data?.results || data || [],
  } = opts;

  const listKey = [key, "list"];
  const detailKey = (id) => [key, "detail", id];

  function useList(params) {
    return useQuery({
      queryKey: params ? [...listKey, params] : listKey,
      queryFn: async () => {
        const res = await api.get(path, { params });
        return selectList(res.data).map(toClient);
      },
    });
  }

  function useDetail(id, queryOpts = {}) {
    return useQuery({
      queryKey: detailKey(id),
      queryFn: async () => {
        const res = await api.get(`${path}${id}/`);
        return toClient(res.data);
      },
      enabled: id != null && (queryOpts.enabled ?? true),
      ...queryOpts,
    });
  }

  function useCreate(mutationOpts = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (data) => {
        const res = await api.post(path, toServer(data));
        return toClient(res.data);
      },
      onSuccess: (data, variables, ctx) => {
        qc.invalidateQueries({ queryKey: [key] });
        mutationOpts.onSuccess?.(data, variables, ctx);
      },
      ...mutationOpts,
    });
  }

  function useUpdate(mutationOpts = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, ...data }) => {
        const res = await api.put(`${path}${id}/`, toServer(data));
        return toClient(res.data);
      },
      onSuccess: (data, variables, ctx) => {
        qc.invalidateQueries({ queryKey: [key] });
        mutationOpts.onSuccess?.(data, variables, ctx);
      },
      ...mutationOpts,
    });
  }

  function usePatch(mutationOpts = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, ...data }) => {
        const res = await api.patch(`${path}${id}/`, toServer(data));
        return toClient(res.data);
      },
      onSuccess: (data, variables, ctx) => {
        qc.invalidateQueries({ queryKey: [key] });
        mutationOpts.onSuccess?.(data, variables, ctx);
      },
      ...mutationOpts,
    });
  }

  function useDelete(mutationOpts = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id) => api.delete(`${path}${id}/`),
      onSuccess: (data, variables, ctx) => {
        qc.invalidateQueries({ queryKey: [key] });
        mutationOpts.onSuccess?.(data, variables, ctx);
      },
      ...mutationOpts,
    });
  }

  /**
   * Custom action - kaynaktaki ozel endpoint'ler icin (ornek: /api/group/123/leave/).
   *   const leave = group.useAction("leave");
   *   leave.mutate({ id: 5 });
   */
  function useAction(actionPath, { method = "post", invalidate = true, ...mutationOpts } = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, ...data } = {}) => {
        const url = id != null ? `${path}${id}/${actionPath}/` : `${path}${actionPath}/`;
        const res = await api[method](url, data);
        return res.data;
      },
      onSuccess: (data, variables, ctx) => {
        if (invalidate) qc.invalidateQueries({ queryKey: [key] });
        mutationOpts.onSuccess?.(data, variables, ctx);
      },
      ...mutationOpts,
    });
  }

  return {
    key,
    path,
    listKey,
    detailKey,
    useList,
    useDetail,
    useCreate,
    useUpdate,
    usePatch,
    useDelete,
    useAction,
  };
}
