import { api } from "./apiClient";

const qs = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const authService = {
  signup: (b) => api.post("/auth/signup", b),
  login: (b) => api.post("/auth/login", b),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};
export const propertyService = {
  list: (params, signal) => api.get(`/properties${qs(params)}`, signal),
  get: (id, signal) => api.get(`/properties/${id}`, signal),
  locations: (signal) => api.get("/properties/locations", signal),
};
export const wishlistService = {
  list: () => api.get("/wishlist"),
  add: (id) => api.post("/wishlist", { property_id: id }),
  remove: (id) => api.delete(`/wishlist/${id}`),
};
export const reservationService = {
  list: () => api.get("/reservations"),
  create: (b) => api.post("/reservations", b),
  cancel: (id) => api.delete(`/reservations/${id}`),
};
