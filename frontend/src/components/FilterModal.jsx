import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import Modal from "./Modal";
import { useLocations } from "../hooks/useProperties";
import { SORT_OPTIONS } from "../utils/constants";
import { formatPrice } from "../utils/formatters";

const PRICE_CHIPS = [3000, 5000, 8000, 12000];
const RATINGS = [{ v: "", l: "Any" }, { v: "4", l: "4.0+" }, { v: "4.5", l: "4.5+" }, { v: "4.8", l: "4.8+" }];

export default function FilterModal({ open, onClose, params, onApply }) {
  const locations = useLocations();
  const [f, setF] = useState({});
  useEffect(() => { if (open) setF({ location: params.location || "", max_price: params.max_price || "", guests: params.guests || "", min_rating: params.min_rating || "", sort: params.sort || "" }); }, [open]); // eslint-disable-line
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const g = Number(f.guests) || 0;
  return (
    <Modal open={open} onClose={onClose} title="Filters"
      footer={<>
        <button className="link" onClick={() => setF({ location: "", max_price: "", guests: "", min_rating: "", sort: "" })}>Clear all</button>
        <button className="btn btn--dark" onClick={() => { onApply(f); onClose(); }}>Show stays</button>
      </>}>
      <div className="fgroup">
        <h4>Location</h4>
        <div className="field"><select id="f-loc" value={f.location || ""} onChange={(e) => set("location", e.target.value)} style={{ paddingTop: 20 }}>
          <option value="">All destinations</option>
          {locations.map((l) => <option key={l.location} value={l.location}>{l.location}</option>)}
        </select></div>
      </div>
      <div className="fgroup">
        <h4>Maximum price per night</h4>
        <div className="chips">
          <button className={`chip ${!f.max_price ? "is-on" : ""}`} onClick={() => set("max_price", "")}>No limit</button>
          {PRICE_CHIPS.map((p) => <button key={p} className={`chip ${String(f.max_price) === String(p) ? "is-on" : ""}`} onClick={() => set("max_price", String(p))}>{formatPrice(p)}</button>)}
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <input id="f-price" type="number" min="500" step="500" inputMode="numeric" placeholder=" " value={f.max_price || ""} onChange={(e) => set("max_price", e.target.value)} />
          <label htmlFor="f-price">Custom maximum (₹)</label>
        </div>
      </div>
      <div className="fgroup">
        <h4>Minimum rating</h4>
        <div className="chips">{RATINGS.map((r) => <button key={r.l} className={`chip ${String(f.min_rating) === r.v ? "is-on" : ""}`} onClick={() => set("min_rating", r.v)}>{r.l}</button>)}</div>
      </div>
      <div className="fgroup fgroup--row">
        <div><h4>Guests</h4><p className="muted">Stays that sleep at least this many</p></div>
        <div className="stepper">
          <button onClick={() => set("guests", g > 1 ? String(g - 1) : "")} disabled={!g} aria-label="Fewer guests"><Minus size={14} /></button>
          <span>{g || "Any"}</span>
          <button onClick={() => set("guests", String(Math.min(16, g + 1)))} aria-label="More guests"><Plus size={14} /></button>
        </div>
      </div>
      <div className="fgroup">
        <h4>Sort by</h4>
        <div className="chips">{SORT_OPTIONS.map((o) => <button key={o.value} className={`chip ${(f.sort || "") === o.value ? "is-on" : ""}`} onClick={() => set("sort", o.value)}>{o.label}</button>)}</div>
      </div>
    </Modal>
  );
}
