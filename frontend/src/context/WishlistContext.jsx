import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { wishlistService } from "../services";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import Modal from "../components/Modal";

const Ctx = createContext(null);
export const useWishlist = () => useContext(Ctx);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    wishlistService.list().then((d) => setItems(d.items)).catch(() => toast("Couldn't load your saved stays.", "error")).finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const ids = useMemo(() => new Set(items.map((p) => p.id)), [items]);

  // Ref mirrors state so rapid clicks never act on stale data.
  const itemsRef = useRef(items);
  const apply = useCallback((fn) => setItems((prev) => { const next = fn(prev); itemsRef.current = next; return next; }), []);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const toggle = useCallback(async (property) => {
    if (!user) { setPromptOpen(true); return; }
    const saved = itemsRef.current.some((p) => p.id === property.id);
    // optimistic update, rolled back if the API call fails
    apply((prev) => (saved ? prev.filter((p) => p.id !== property.id) : [{ ...property, saved_at: new Date().toISOString() }, ...prev]));
    try {
      if (saved) { await wishlistService.remove(property.id); toast("Removed from your saved stays."); }
      else { await wishlistService.add(property.id); toast("Saved to your wishlist."); }
    } catch (e) {
      if (e.code === "ALREADY_SAVED" || (saved && e.status === 404)) return;
      apply((prev) => (saved ? [{ ...property, saved_at: new Date().toISOString() }, ...prev] : prev.filter((p) => p.id !== property.id)));
      toast(e.message, "error");
    }
  }, [user, apply, toast]);

  const value = useMemo(() => ({ items, ids, loading, toggle }), [items, ids, loading, toggle]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <Modal open={promptOpen} onClose={() => setPromptOpen(false)} title="Log in to save stays">
        <div style={{ textAlign: "center" }}>
          <div className="empty__icon"><Heart size={28} color="#ff385c" /></div>
          <h3 style={{ fontSize: 22, marginBottom: 8 }}>Save the stays you love</h3>
          <p style={{ color: "var(--c-muted)", marginBottom: 24 }}>Create a free account or log in to build your wishlist. It'll be waiting for you next time.</p>
          <div style={{ display: "grid", gap: 12 }}>
            <Link to="/login" state={{ from: location.pathname + location.search }} className="btn btn--primary" onClick={() => setPromptOpen(false)}>Log in</Link>
            <Link to="/signup" state={{ from: location.pathname + location.search }} className="btn btn--outline" onClick={() => setPromptOpen(false)}>Sign up</Link>
          </div>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}
