import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistButton({ property, variant = "card" }) {
  const { ids, toggle } = useWishlist();
  const [pop, setPop] = useState(false);
  const saved = ids.has(property.id);
  const click = (e) => {
    e.preventDefault(); e.stopPropagation();
    setPop(true); setTimeout(() => setPop(false), 300);
    toggle(property);
  };
  if (variant === "inline") {
    return (
      <button className="wl-inline" onClick={click} aria-pressed={saved}>
        <Heart size={18} fill={saved ? "#ff385c" : "none"} color={saved ? "#ff385c" : "currentColor"} className={pop ? "pop" : ""} />
        <span>{saved ? "Saved" : "Save"}</span>
      </button>
    );
  }
  return (
    <button className={`heart ${saved ? "is-saved" : ""} ${pop ? "pop" : ""}`} onClick={click} aria-pressed={saved} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}>
      <Heart size={26} strokeWidth={2} />
    </button>
  );
}
