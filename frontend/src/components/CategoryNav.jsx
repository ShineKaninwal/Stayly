import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "../utils/constants";

export default function CategoryNav({ active, onSelect, onFilters, filterCount }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ l: false, r: true });
  const measure = () => {
    const el = ref.current; if (!el) return;
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => { measure(); window.addEventListener("resize", measure); return () => window.removeEventListener("resize", measure); }, []);
  const scroll = (d) => ref.current?.scrollBy({ left: d * 400, behavior: "smooth" });
  return (
    <div className="cats">
      <div className="cats__inner">
        <div className="cats__scroller">
          {edge.l && <button className="cats__arrow cats__arrow--l" onClick={() => scroll(-1)} aria-label="Scroll categories left"><ChevronLeft size={14} /></button>}
          <nav className="cats__list" ref={ref} onScroll={measure} aria-label="Categories">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <button key={value} className={`cat ${active === value ? "is-active" : ""}`} onClick={() => onSelect(active === value ? "" : value)} aria-pressed={active === value}>
                <Icon size={24} strokeWidth={1.6} /><span>{label}</span>
              </button>
            ))}
          </nav>
          {edge.r && <button className="cats__arrow cats__arrow--r" onClick={() => scroll(1)} aria-label="Scroll categories right"><ChevronRight size={14} /></button>}
        </div>
        <button className="filters-btn" onClick={onFilters}>
          <SlidersHorizontal size={16} /><span>Filters</span>{filterCount > 0 && <b>{filterCount}</b>}
        </button>
      </div>
    </div>
  );
}
