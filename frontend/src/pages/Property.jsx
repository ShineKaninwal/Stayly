import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { Heart, inr } from "../Card";
import { useApp } from "../Auth";
export default function Property() {
  const { id } = useParams(), [p, setP] = useState(null), [err, setErr] = useState(""), { user } = useApp(), nav = useNavigate(), [done, setDone] = useState(false);
  useEffect(() => { api("/properties/" + id).then(setP).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <div className="wrap empty"><h3>Stay not found</h3><p>{err}</p></div>;
  if (!p) return <div className="wrap"><div className="skel" style={{ height: 380 }} /></div>;
  return (
    <main className="wrap detail">
      <div className="d-head"><h1>{p.title}</h1><Heart id={p.id} className="heart inline" /></div>
      <div className="muted">★ {p.rating.toFixed(2)} · {p.reviews_count} reviews · {p.location}, India</div>
      <div className="gallery"><img src={p.image_url} alt={p.title} />{p.images.map((s, i) => <img key={i} src={s} alt={`${p.title} ${i + 2}`} loading="lazy" />)}</div>
      <div className="d-cols"><div>
        <h2>{p.property_type} in {p.location}, hosted by {p.host_name}</h2>
        <div className="muted">{p.guests} guests · {p.bedrooms} bedrooms · {p.beds} beds · {p.bathrooms} bathrooms</div><hr />
        <p>{p.description}</p><hr /><h3>What this place offers</h3>
        <ul className="amen">{p.amenities.map((a) => <li key={a}>✓ {a}</li>)}</ul></div>
        <aside className="reserve"><div><b className="big">{inr(p.price_per_night)}</b> night</div>
          <button className="btn full" onClick={() => (user ? setDone(true) : nav("/login", { state: { msg: "Log in to reserve." } }))}>Reserve</button>
          {done && <p className="muted" role="status">Reservations open soon. Save this stay for now.</p>}</aside></div>
    </main>
  );
}
