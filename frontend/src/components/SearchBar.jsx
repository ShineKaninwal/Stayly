import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Minus, Plus, Search, X } from "lucide-react";
import { useLocations } from "../hooks/useProperties";
import { formatShortDate, nightsBetween, plural, todayISO } from "../utils/formatters";

function useSummary() {
  const [sp] = useSearchParams();
  const loc = sp.get("location"), g = sp.get("guests"), ci = sp.get("check_in"), co = sp.get("check_out");
  return {
    where: loc || "Anywhere",
    when: ci && co ? `${formatShortDate(ci)} – ${formatShortDate(co)}` : "Any week",
    who: g ? plural(Number(g), "guest") : "Add guests",
    any: !!(loc || g || ci),
  };
}

export function SearchPill({ onOpen }) {
  const s = useSummary();
  return (
    <>
      <div className="pill" role="search">
        <button className="pill__seg pill__seg--strong" onClick={() => onOpen("where")}>{s.where}</button>
        <span className="pill__div" />
        <button className="pill__seg pill__seg--strong" onClick={() => onOpen("in")}>{s.when}</button>
        <span className="pill__div" />
        <button className="pill__seg pill__seg--muted" onClick={() => onOpen("who")}>{s.who}</button>
        <button className="pill__go" onClick={() => onOpen("where")} aria-label="Search"><Search size={14} strokeWidth={3} /></button>
      </div>
      <button className="pill-m" onClick={() => onOpen("where")}>
        <Search size={18} strokeWidth={2.5} />
        <span><strong>{s.any ? s.where : "Where to?"}</strong><small>{s.where === "Anywhere" ? "Anywhere" : ""}{s.where === "Anywhere" ? " · " : ""}{s.when} · {s.who}</small></span>
      </button>
    </>
  );
}

export function SearchPanel({ initial, onClose }) {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const locations = useLocations();
  const [active, setActive] = useState(initial);
  const [where, setWhere] = useState(sp.get("location") || "");
  const [ci, setCi] = useState(sp.get("check_in") || "");
  const [co, setCo] = useState(sp.get("check_out") || "");
  const [guests, setGuests] = useState(Number(sp.get("guests")) || 0);
  const [err, setErr] = useState("");
  const whereRef = useRef(null);
  useEffect(() => { if (initial === "where") whereRef.current?.focus(); }, [initial]);

  const matches = locations.filter((l) => l.location.toLowerCase().includes(where.trim().toLowerCase()));
  const submit = (e) => {
    e.preventDefault();
    if (ci && co && nightsBetween(ci, co) <= 0) { setErr("Check-out must be after check-in."); return; }
    const p = new URLSearchParams();
    if (where.trim()) p.set("location", where.trim());
    if (ci) p.set("check_in", ci);
    if (co) p.set("check_out", co);
    if (guests) p.set("guests", guests);
    nav(`/?${p.toString()}`);
    onClose();
  };

  return (
    <div className="sbp" role="dialog" aria-label="Search stays" onMouseDown={(e) => !e.target.closest(".sbp__field") && setActive(null)}>
      <div className="sbp__top"><button className="sbp__close" onClick={onClose} aria-label="Close search"><X size={16} /></button><span>Find a stay</span></div>
      <form className="sbp__bar" onSubmit={submit}>
        <div className={`sbp__field ${active === "where" ? "is-active" : ""}`} onClick={() => whereRef.current?.focus()}>
          <label htmlFor="sb-where">Where</label>
          <input id="sb-where" ref={whereRef} value={where} onChange={(e) => setWhere(e.target.value)} onFocus={() => setActive("where")} placeholder="Search destinations" autoComplete="off" />
          {active === "where" && (
            <ul className="sbp__pop sbp__pop--where">
              {matches.length === 0 && <li className="sbp__none">No destinations match “{where}”.</li>}
              {matches.map((l) => (
                <li key={l.location}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setWhere(l.location); setActive("in"); }}>
                    <span className="sbp__pin"><Search size={16} /></span>
                    <span><strong>{l.location}</strong><small>{plural(l.count, "stay")}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={`sbp__field ${active === "in" ? "is-active" : ""}`}>
          <label htmlFor="sb-in">Check in</label>
          <input id="sb-in" type="date" min={todayISO()} value={ci} onChange={(e) => { setCi(e.target.value); setErr(""); if (co && e.target.value >= co) setCo(""); }} onFocus={() => setActive("in")} />
        </div>
        <div className={`sbp__field ${active === "out" ? "is-active" : ""}`}>
          <label htmlFor="sb-out">Check out</label>
          <input id="sb-out" type="date" min={ci || todayISO()} value={co} onChange={(e) => { setCo(e.target.value); setErr(""); }} onFocus={() => setActive("out")} />
        </div>
        <div className={`sbp__field sbp__field--who ${active === "who" ? "is-active" : ""}`}>
          <label>Who</label>
          <button type="button" className="sbp__whobtn" onClick={() => setActive(active === "who" ? null : "who")}>{guests ? plural(guests, "guest") : "Add guests"}</button>
          {active === "who" && (
            <div className="sbp__pop sbp__pop--who">
              <div className="stepper-row">
                <div><strong>Guests</strong><small>Total people staying</small></div>
                <div className="stepper">
                  <button type="button" onClick={() => setGuests(Math.max(0, guests - 1))} disabled={guests === 0} aria-label="Fewer guests"><Minus size={14} /></button>
                  <span>{guests}</span>
                  <button type="button" onClick={() => setGuests(Math.min(16, guests + 1))} disabled={guests === 16} aria-label="More guests"><Plus size={14} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="sbp__go" type="submit"><Search size={18} strokeWidth={2.5} /><span>Search</span></button>
        {err && <p className="sbp__err">{err}</p>}
      </form>
    </div>
  );
}
