import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, Heart, LogOut, Search } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import EmptyState from "../components/EmptyState";
import Img from "../components/Img";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { reservationService } from "../services";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDateTime, formatLongDate, formatPrice, initials, plural } from "../utils/formatters";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { user, logout } = useAuth();
  const { items: saved, loading: savedLoading } = useWishlist();
  const toast = useToast();
  const nav = useNavigate();
  const [res, setRes] = useState({ items: [], loading: true });

  useEffect(() => {
    reservationService.list().then((d) => setRes({ items: d.items, loading: false })).catch(() => { setRes({ items: [], loading: false }); toast("Couldn't load reservations.", "error"); });
  }, []); // eslint-disable-line

  const cancel = async (id) => {
    try { const d = await reservationService.cancel(id); setRes((s) => ({ ...s, items: s.items.map((r) => (r.id === id ? d.reservation : r)) })); toast("Reservation cancelled."); }
    catch (e) { toast(e.message, "error"); }
  };
  const doLogout = async () => { await logout(); toast("You've been logged out."); nav("/"); };

  const activity = useMemo(() => [
    ...saved.map((p) => ({ at: p.saved_at, text: `Saved ${p.title}`, icon: Heart })),
    ...res.items.map((r) => ({ at: r.created_at, text: `${r.status === "cancelled" ? "Cancelled" : "Reserved"} ${r.property.title}`, icon: CalendarCheck })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6), [saved, res.items]);

  return (
    <div className="container container--narrow dash">
      <div className="dash__hero">
        <div><h1>Welcome back, {user.name.split(" ")[0]} 👋</h1><p className="muted">Here's what's happening with your trips.</p></div>
        <div className="dash__actions">
          <Link to="/" className="btn btn--outline btn--sm"><Search size={16} /> Search stays</Link>
          <button className="btn btn--dark btn--sm" onClick={doLogout}><LogOut size={16} /> Log out</button>
        </div>
      </div>

      <div className="dash__top">
        <section className="dcard profile">
          <span className="profile__avatar">{initials(user.name)}</span>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <div className="profile__stats">
            <div><strong>{saved.length}</strong><span>Saved</span></div>
            <div><strong>{res.items.filter((r) => r.status === "confirmed").length}</strong><span>Upcoming</span></div>
            <div><strong>{formatDateTime(user.created_at).split(" ").slice(-2).join(" ")}</strong><span>Joined</span></div>
          </div>
        </section>
        <section className="dcard">
          <h2>Recent activity</h2>
          {activity.length === 0 ? <p className="muted" style={{ marginTop: 12 }}>Nothing yet. Save a stay or make a reservation and it will show up here.</p> : (
            <ul className="activity">{activity.map((a, i) => <li key={i}><span className="activity__icon"><a.icon size={16} /></span><span>{a.text}<small>{formatDateTime(a.at)}</small></span></li>)}</ul>
          )}
        </section>
      </div>

      <section className="dsec2" id="saved">
        <h2>Saved stays</h2>
        {savedLoading ? <div className="skeleton" style={{ height: 240 }} /> : saved.length === 0 ? (
          <EmptyState icon={Heart} title="No saved stays yet" text="Tap the heart on any stay to save it here." action={<Link to="/" className="btn btn--dark">Explore stays</Link>} />
        ) : <div className="grid grid--dash">{saved.map((p) => <PropertyCard key={p.id} property={p} />)}</div>}
      </section>

      <section className="dsec2" id="reservations">
        <h2>Your reservations</h2>
        {res.loading ? <div className="skeleton" style={{ height: 120 }} /> : res.items.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No reservations yet" text="When you reserve a stay it will appear here." />
        ) : (
          <ul className="resv">
            {res.items.map((r) => (
              <li key={r.id} className={r.status === "cancelled" ? "is-cancelled" : ""}>
                <Link to={`/properties/${r.property_id}`} className="resv__img"><Img src={r.property.image_url} seed={`r-${r.id}`} alt="" /></Link>
                <div className="resv__info">
                  <strong>{r.property.title}</strong>
                  <span className="muted">{r.property.region_label.replace(", India", "")}</span>
                  <span>{formatLongDate(r.check_in)} → {formatLongDate(r.check_out)} · {plural(r.guests, "guest")}</span>
                  <span><b>{formatPrice(r.total_price)}</b> total</span>
                </div>
                <div className="resv__side">
                  <span className={`badge badge--${r.status}`}>{r.status}</span>
                  {r.status === "confirmed" && <button className="link" onClick={() => cancel(r.id)}>Cancel</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
