import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Img from "./Img";
import WishlistButton from "./WishlistButton";
import { formatPrice, formatRating } from "../utils/formatters";

export default function PropertyCard({ property: p }) {
  const imgs = p.images?.length ? p.images : [p.image_url];
  const [i, setI] = useState(0);
  const go = (e, d) => { e.preventDefault(); e.stopPropagation(); setI((i + d + imgs.length) % imgs.length); };
  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/properties/${p.id}`} className="card__imglink" tabIndex={-1} aria-hidden="true">
          <div className="card__track" style={{ transform: `translateX(-${i * 100}%)` }}>
            {imgs.map((src, k) => <Img key={k} src={src} seed={`${p.id}-${k}`} alt={k === 0 ? p.title : ""} />)}
          </div>
        </Link>
        {p.reviews_count >= 200 && <span className="card__badge">Guest favourite</span>}
        <WishlistButton property={p} />
        {imgs.length > 1 && (
          <>
            {i > 0 && <button className="card__arrow card__arrow--l" onClick={(e) => go(e, -1)} aria-label="Previous photo"><ChevronLeft size={16} /></button>}
            {i < imgs.length - 1 && <button className="card__arrow card__arrow--r" onClick={(e) => go(e, 1)} aria-label="Next photo"><ChevronRight size={16} /></button>}
            <div className="card__dots">{imgs.map((_, k) => <span key={k} className={k === i ? "on" : ""} />)}</div>
          </>
        )}
      </div>
      <Link to={`/properties/${p.id}`} className="card__info">
        <div className="card__row">
          <h3>{p.region_label.replace(", India", "")}</h3>
          <span className="card__rating"><Star size={12} fill="currentColor" /> {formatRating(p.rating)}</span>
        </div>
        <p className="card__muted">{p.title}</p>
        <p className="card__muted">{p.distance_km} km to centre · Hosted by {p.host_name}</p>
        <p className="card__price"><strong>{formatPrice(p.price_per_night)}</strong> night</p>
      </Link>
    </article>
  );
}
