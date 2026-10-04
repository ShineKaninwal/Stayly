import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
const Ctx = createContext();
export const useApp = () => useContext(Ctx);
export function AppProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false), [saved, setSaved] = useState([]);
  const loadSaved = () => api("/wishlist").then((d) => setSaved(d.map((p) => p.id))).catch(() => setSaved([]));
  useEffect(() => { api("/auth/me").then((u) => { setUser(u); loadSaved(); }).catch(() => {}).finally(() => setReady(true)); }, []);
  const signIn = async (u) => { setUser(u); await loadSaved(); };
  const signOut = async () => { await api("/auth/logout", "POST").catch(() => {}); setUser(null); setSaved([]); };
  const toggle = async (id) => {
    if (!user) return false;
    const has = saved.includes(id);
    setSaved((s) => (has ? s.filter((x) => x !== id) : [...s, id]));
    try { has ? await api("/wishlist/" + id, "DELETE") : await api("/wishlist", "POST", { property_id: id }); }
    catch { setSaved((s) => (has ? [...s, id] : s.filter((x) => x !== id))); }
    return true;
  };
  return <Ctx.Provider value={{ user, ready, saved, signIn, signOut, toggle }}>{children}</Ctx.Provider>;
}
