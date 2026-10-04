const BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const csrf = () => document.cookie.split("; ").find((r) => r.startsWith("csrf_access_token="))?.split("=")[1];
export async function api(path, method = "GET", body) {
  const headers = { "Content-Type": "application/json" };
  if (method !== "GET" && csrf()) headers["X-CSRF-TOKEN"] = csrf();
  let r;
  try { r = await fetch(BASE + path, { method, credentials: "include", headers, body: body ? JSON.stringify(body) : undefined }); }
  catch { throw new Error("Can't reach the server. Try again."); }
  const j = await r.json().catch(() => ({}));
  if (!j.success) throw new Error(j.error?.message || "Something went wrong.");
  return j.data;
}
