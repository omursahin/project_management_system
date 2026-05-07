/**
 * HTTP istemcisi.
 *
 * Axios bagimliligi kaldirildi; bu modul fetch uzerine kurulu, axios benzeri
 * bir API saglar (get/post/put/patch/delete + { data, status } cevap formati,
 * error.response = { status, data } hata formati). Boylece bu dosyayi
 * kullanan diger modullerin (services/groupApi.js, services/resources.js,
 * services/auth.js, hooks/useApiResource.js, ...) imza degisimine ugramasi
 * gerekmedi.
 *
 * Component'ler bu modulu DOGRUDAN kullanmamalidir; sadece react-query
 * hook'lari (useQuery / useMutation) altindaki transport olarak hizmet eder.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    // axios uyumlulugu: error.response.status / error.response.data pattern'i
    this.response = { status, data };
  }
}

/* ---------- Auth header ---------- */
function getAuthHeaders() {
  const tokens = localStorage.getItem("tokens");
  if (!tokens) return {};
  try {
    const { access } = JSON.parse(tokens);
    return access ? { Authorization: `Bearer ${access}` } : {};
  } catch {
    return {};
  }
}

/* ---------- 401 sonrasi redirect ---------- */
function handleUnauthorized() {
  localStorage.removeItem("tokens");
  localStorage.removeItem("user");
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

/* ---------- URL + query params ---------- */
function buildUrl(path, params) {
  let url = `${BASE_URL}${path}`;
  if (params && typeof params === "object") {
    const cleaned = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    if (cleaned.length) {
      const search = new URLSearchParams(cleaned).toString();
      url += `?${search}`;
    }
  }
  return url;
}

/* ---------- Response body parser ---------- */
async function parseBody(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

/* ---------- Cekirdek istek fonksiyonu ---------- */
async function request(method, path, { params, data, headers = {} } = {}) {
  const url = buildUrl(path, params);

  const init = {
    method,
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
      ...headers,
    },
  };

  if (data !== undefined && data !== null) {
    if (data instanceof FormData) {
      // FormData'nin Content-Type'i (multipart boundary ile) tarayici tarafindan otomatik set edilir
      init.body = data;
    } else {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, init);
  const body = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      body
    );
  }

  return { data: body, status: response.status };
}

/* ---------- Disari acilan API ---------- */
const api = {
  get: (path, config = {}) => request("GET", path, config),
  post: (path, data, config = {}) => request("POST", path, { ...config, data }),
  put: (path, data, config = {}) => request("PUT", path, { ...config, data }),
  patch: (path, data, config = {}) => request("PATCH", path, { ...config, data }),
  delete: (path, config = {}) => request("DELETE", path, config),
};

export default api;
export { ApiError };
