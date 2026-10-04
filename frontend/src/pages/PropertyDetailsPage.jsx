import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Check, Grid2x2, Star, WifiOff } from "lucide-react";
import Img from "../components/Img";
import Modal from "../components/Modal";
import WishlistButton from "../components/WishlistButton";
import EmptyState from "../components/EmptyState";
import { propertyService, reservationService } from "../services";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatPrice, formatRating, initials, nightsBetween, plural, todayISO } from "../utils/formatters";

function ReserveCard({ p }) {
  const { user } = useAuth();
  const { toggle } = useWishlist();
  const toast = useToast();
  const nav = useNavigate();
  const [ci, setCi] = useState(""); const [co, setCo] = useState(""); const [guests, setGuests] = useState(1);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const nights = nightsBetween(ci, co);

  const reserve = async () => {
    setErr("");
    if (!user) { toggle({ id: -1 }); return; } // opens the login prompt
    if (!ci || !co) return setErr("Choose your check-in and check-out dates.");
    if (nights <= 0) return setErr("Check-out must be after check-in.");
    setBusy(true);
    try {
      await reservationService.create({ property_id: p.id, check_in: ci, check_out: co, guests });
      toast("Reservation confirmed! Find it in your dashboard.");
      nav("/dashboard#reservations");
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <aside className="reserve">
      <div className="reserve__price"><strong>{formatPrice(p.price_per_night)}</strong> night</div>
      <div className="reserve__box">
        <label className="reserve__cell"><span>Check-in</span><input type="date" min={todayISO()} value={ci} onChange={(e) => { setCi(e.target.value); if (co && e.target.value >= co) setCo(""); }} /></label>
        <label className="reserve__cell"><span>Checkout</span><input type="date" min={ci || todayISO()} value={co} onChange={(e) => setCo(e.target.value)} /></label>
        <label className="reserve__cell reserve__cell--full"><span>Guests</span>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: p.guests }, (_, i) => <option key={i} value={i + 1}>{plural(i + 1, "guest")}</option>)}
          </select>
        </label>
      </div>
      {err && <div className="alert" role="alert" style={{ marginBottom: 12 }}><AlertCircle size={18} />{err}</div>}
      <button className="btn btn--primary btn--block" onClick={reserve} disabled={busy}>{busy ? <span className="spinner" /> : user ? "Reserve" : "Log in to reserve"}</button>
      <p className="reserve__note">You won't be charged yet</p>
      {nights > 0 && (
        <div className="reserve__sum">
          <div><span>{formatPrice(p.price_per_night)} × {plural(nights, "night")}</span><span>{formatPrice(p.price_per_night * nights)}</span></div>
          <div className="reserve__total"><span>Total</span><span>{formatPrice(p.price_per_night * nights)}</span></div>
        </div>
      )}
    </aside>
  );
}

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [state, setState] = useState({ p: null, loading: true, error: null, status: 0 });
  const [gallery, setGallery] = useState(false);
  usePageTitle(state.p?.title);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ p: null, loading: true, error: null, status: 0 });
    propertyService.get(id, ctrl.signal).then((d) => setState({ p: d.property, loading: false, error: null, status: 200 }))
      .catch((e) => e.name !== "AbortError" && setState({ p: null, loading: false, error: e.message, status: e.status }));
    return () => ctrl.abort();
  }, [id]);

  if (state.loading) return (
    <div className="container container--narrow detail">
      <div className="skeleton" style={{ height: 32, width: "50%", marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
    </div>
  );
  if (state.error) return <EmptyState icon={state.status === 404 ? AlertCircle : WifiOff} title={state.status === 404 ? "Stay not found" : "Couldn't load this stay"} text={state.error} action={<Link to="/" className="btn btn--dark">Browse stays</Link>} />;

  const p = state.p;
  const imgs = p.images?.length ? p.images : [p.image_url];
  return (
    <div className="container container--narrow detail">
      <h1 className="detail__title">{p.title}</h1>
      <div className="detail__meta">
        <span><Star size={14} fill="currentColor" /> <strong>{formatRating(p.rating)}</strong> · <u>{plural(p.reviews_count, "review")}</u> · {p.region_label}</span>
        <WishlistButton property={p} variant="inline" />
      </div>

      <div className="gallery">
        {imgs.slice(0, 5).map((src, i) => <button key={i} className="gallery__item" onClick={() => setGallery(true)} aria-label={`Open photo ${i + 1}`}><Img src={src} seed={`${p.id}-${i}`} alt={i === 0 ? p.title : ""} loading={i === 0 ? "eager" : "lazy"} /></button>)}
        <button className="gallery__all" onClick={() => setGallery(true)}><Grid2x2 size={16} /> Show all photos</button>
      </div>
      <Modal open={gallery} onClose={() => setGallery(false)} title={`${p.title} · ${imgs.length} photos`} wide>
        <div className="lightbox">{imgs.map((src, i) => <Img key={i} src={src} seed={`${p.id}-${i}`} alt={`${p.title} photo ${i + 1}`} />)}</div>
      </Modal>

      <div className="detail__layout">
        <div>
          <section className="dsec dsec--first">
            <h2>{p.category} stay in {p.region_label.replace(", India", "")}</h2>
            <p className="muted">{plural(p.guests, "guest")} · {plural(p.bedrooms, "bedroom")} · {plural(p.beds, "bed")} · {plural(p.bathrooms, "bathroom")}</p>
          </section>
          <section className="dsec host">
            <span className="host__avatar">{initials(p.host_name)}</span>
            <div><strong>Hosted by {p.host_name}</strong><p className="muted">Hosting since {p.host_since_year} · {p.distance_km} km to city centre</p></div>
          </section>
          <section className="dsec"><h2 className="sr-only">About</h2><p className="detail__desc">{p.description}</p></section>
          <section className="dsec">
            <h2>What this place offers</h2>
            <ul className="amenities">{p.amenities.map((a) => <li key={a}><Check size={20} />{a}</li>)}</ul>
          </section>
          <section className="dsec">
            <h2>The details</h2>
            <div className="facts">
              {[["Guests", p.guests], ["Bedrooms", p.bedrooms], ["Beds", p.beds], ["Bathrooms", p.bathrooms]].map(([k, v]) => <div key={k}><strong>{v}</strong><span>{k}</span></div>)}
            </div>
          </section>
        </div>
        <ReserveCard p={p} />
      </div>
    </div>
  );
}
