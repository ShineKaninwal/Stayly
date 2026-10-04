import { Link, useNavigate } from "react-router-dom";
import { useApp } from "./Auth";
export const inr = (n) => "₹" + n.toLocaleString("en-IN");
export function Heart({ id, className = "heart" }) {
  const { saved, toggle } = useApp(), nav = useNavigate(), on = saved.includes(id);
  return (
    <button className={className} aria-label={on ? "Remove from saved" : "Save stay"} aria-pressed={on}
      onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if (!(await toggle(id))) nav("/login", { state: { msg: "Log in to save stays." } }); }}>
      <svg viewBox="0 0 32 32" width="24" height="24"><path d="M16 28C7 22 2 16 2 10.5 2 6.4 5 4 8.5 4c3 0 5.5 1.7 7.5 4.7C18 5.700 20.500 4 23.500 4 27 4 30 6.400 30 10.500 30 16 25 22 16 28z"
        fill={on ? "#ff385c" : "rgba(0,0,0,.5)"} stroke="#fff" strokeWidth="2.200" /></svg>
    </button>
  );
}
export default function Card({ p }) {
  return (
    <Link to={`/stays/${p.id}`} className="card">
      <div className="card-img"><img src={p.image_url} alt={p.title} loading="lazy" /><Heart id={p.id} /></div>
      <div className="card-row"><b>{p.title}</b><span>★ {p.rating.toFixed(1)} ({p.reviews_count})</span></div>
      <div className="muted">{p.property_type} · {p.location}, India</div>
      <p className="clamp muted">{p.description}</p>
      <div className="meta"><span><b>{inr(p.price_per_night)}</b> night</span><span className="muted">Up to {p.guests} guests</span></div>
    </Link>
  );
}
