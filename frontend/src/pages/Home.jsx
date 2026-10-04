import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import Card from "../Card";
const CATS = [["", "All", "🏠"], ["Beach", "Beach", "🏖️"], ["Amazing views", "Amazing views", "🌄"], ["Mountain", "Mountains", "⛰️"], ["Countryside", "Countryside", "🌾"],
  ["Pools", "Pools", "🏊"], ["Luxury", "Luxury", "💎"], ["Trending", "Trending", "🔥"], ["Nature", "Nature", "🌿"], ["City", "Cities", "🏙️"]];
const DEST = [["Goa", "Sun, sand and slow evenings"], ["Manali", "Pine forests and snow peaks"], ["Udaipur", "Lakes and royal palaces"],
  ["Kerala", "Backwaters and tea hills"], ["Jaipur", "Forts, bazaars and havelis"], ["Ooty", "Misty hills and tea estates"]];
const EMPTY = { location: "", max_price: "", guests: "", min_rating: "" };
const fromSp = (sp) => Object.fromEntries(Object.keys(EMPTY).map((k) => [k, sp.get(k) || ""]));
export default function Home() {
  const [sp, setSp] = useSearchParams(), [data, setData] = useState(null), [error, setError] = useState("");
  const [f, setF] = useState(fromSp(sp)), qs = sp.toString(), cat = sp.get("category") || "";
  useEffect(() => { setF(fromSp(sp)); setData(null); setError(""); api(`/properties?${qs}${qs ? "&" : ""}limit=48`).then(setData).catch((e) => setError(e.message)); }, [qs]);
  const apply = (extra = {}) => { const n = new URLSearchParams(), all = { ...f, category: cat, ...extra }; Object.entries(all).forEach(([k, v]) => v && n.set(k, v)); setSp(n); };
  const field = (k, label, props) => <label><span>{label}</span><input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...props} /></label>;
  return (<>
    <section className="hero"><h1>Find your perfect stay.</h1><p>Villas, homestays and hidden retreats across India, hosted by locals.</p>
      <div className="search-wrap"><form className="search" onSubmit={(e) => { e.preventDefault(); apply(); }}>
        {field("location", "Where", { placeholder: "Search destinations" })}
        {field("max_price", "Max price", { type: "number", min: 0, placeholder: "₹ per night" })}
        {field("guests", "Guests", { type: "number", min: 1, placeholder: "Add guests" })}
        <label><span>Rating</span><select value={f.min_rating} onChange={(e) => setF({ ...f, min_rating: e.target.value })}><option value="">Any</option><option value="4.5">4.5+</option><option value="4.8">4.8+</option></select></label>
        <button className="go" aria-label="Search stays">⌕</button></form></div></section>
    <div className="cats" role="tablist">{CATS.map(([v, l, i]) => <button key={l} role="tab" aria-selected={cat === v} className={cat === v ? "on" : ""} onClick={() => apply({ category: v })}><span>{i}</span>{l}</button>)}</div>
    <main className="wrap">
      {error && <div className="empty"><h3>Couldn't load stays</h3><p>{error}</p><button className="btn" onClick={() => setSp(new URLSearchParams(qs))}>Try again</button></div>}
      {data && data.total > 0 && <p className="result-count">{data.total} {data.total === 1 ? "stay" : "stays"}{cat && ` in ${CATS.find((c) => c[0] === cat)?.[1] || cat}`}</p>}
      <div className="grid">{!data && !error && Array.from({ length: 8 }, (_, i) => <div key={i} className="skel"><div /><i /><i /></div>)}{data?.items.map((p) => <Card key={p.id} p={p} />)}</div>
      {data?.total === 0 && <div className="empty"><h3>No stays match</h3><p>Try a higher budget, fewer guests or a different category.</p><button className="btn" onClick={() => setSp({})}>Clear filters</button></div>}
      <h2 className="h2">Popular destinations</h2>
      <div className="dcards">{DEST.map(([d, s]) => <button key={d} className="dcard" onClick={() => { setSp({ location: d }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <img src={`https://picsum.photos/seed/dest-${d.toLowerCase()}/600/750`} alt="" loading="lazy" /><div><b>{d}</b><span>{s}</span></div></button>)}</div>
      <section className="cta2"><img src="https://picsum.photos/seed/stayly-host/900/700" alt="" loading="lazy" />
        <div><h2>Turn your space into an opportunity.</h2><p>Share your place with travelers and start earning with Stayly.</p><a className="btn" href="/signup">Become a host</a></div></section>
    </main></>);
}
