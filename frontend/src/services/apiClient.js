const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details || {};
  }
}

const getCookie = (name) => {
  const hit = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.split("=")[1]) : null;
};

async function request(method, path, body, signal) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const csrf = getCookie("csrf_access_token"); // double-submit CSRF token set by the API at login
    if (csrf) headers["X-CSRF-TOKEN"] = csrf;
  }
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, credentials: "include", signal, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new ApiError("Can't reach the server. Check your connection and try again.", "NETWORK_ERROR", 0);
  }
  let payload = null;
  try { payload = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok || !payload?.success) {
    throw new ApiError(payload?.error?.message || "Something went wrong. Please try again.", payload?.error?.code || "UNKNOWN_ERROR", res.status, payload?.error?.details);
  }
  return payload.data;
}

export const api = {
  get: (path, signal) => request("GET", path, undefined, signal),
  post: (path, body) => request("POST", path, body ?? {}),
  delete: (path) => request("DELETE", path),
};
