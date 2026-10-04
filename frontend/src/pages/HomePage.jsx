import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchX, X, WifiOff } from "lucide-react";
import CategoryNav from "../components/CategoryNav";
import FilterModal from "../components/FilterModal";
import PropertyGrid from "../components/PropertyGrid";
import PropertyCard from "../components/PropertyCard";
import { GridSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import HostCTA from "../components/HostCTA";
import Img from "../components/Img";
import { useLocations, useProperties } from "../hooks/useProperties";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatPrice, plural } from "../utils/formatters";

const API_KEYS = ["location", "category", "max_price", "guests", "min_rating", "sort"];
const CHIP_LABEL = { location: (v) => `Where: ${v}`, category: (v) => v, max_price: (v) => `Up to ${formatPrice(v)}`, guests: (v) => plural(Number(v), "guest"), min_rating: (v) => `${v}+ rating`, sort: (v) => `Sort: ${v.replace("_", " ")}` };

export default function HomePage() {
  usePageTitle("");
  const [sp, setSp] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const locations = useLocations();

  const params = useMemo(() => Object.fromEntries(API_KEYS.filter((k) => sp.get(k)).map((k) => [k, sp.get(k)])), [sp]);
  const searching = ["location", "max_price", "guests", "min_rating"].some((k) => params[k]);
  const showExtras = !searching && !params.category;
  const { items, total, loading, error, reload } = useProperties({ ...params, limit: 60 });
  const trending = useProperties({ sort: "popular", limit: 4 });

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next);
  };
  const clearAll = () => setSp(new URLSearchParams());
  const filterCount = ["location", "max_price", "guests", "min_rating", "sort"].filter((k) => params[k]).length;

  return (
    <>
      <CategoryNav active={params.category || ""} onSelect={(c) => update({ category: c })} onFilters={() => setFiltersOpen(true)} filterCount={filterCount} />
      <FilterModal open={filtersOpen} onClose={() => setFiltersOpen(false)} params={params} onApply={update} />

      <div className="container home">
        {Object.keys(params).length > 0 && !loading && !error && (
          <div className="results-head">
            <h1>{plural(total, "stay")}{params.location ? ` in ${params.location}` : ""}</h1>
            <div className="chips chips--active">
              {Object.entries(params).map(([k, v]) => (
                <button key={k} className="chip is-on" onClick={() => update({ [k]: "" })} aria-label={`Remove filter ${CHIP_LABEL[k](v)}`}>{CHIP_LABEL[k](v)} <X size={12} /></button>
              ))}
              <button className="link" onClick={clearAll}>Clear all</button>
            </div>
          </div>
        )}

        {loading && <GridSkeleton />}
        {error && <EmptyState icon={WifiOff} title="Couldn't load stays" text={error} action={<button className="btn btn--dark" onClick={reload}>Try again</button>} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState icon={SearchX} title="No exact matches" text="Try changing or removing some of your filters, or search a different destination." action={<button className="btn btn--dark" onClick={clearAll}>Clear all filters</button>} />
        )}
        {!loading && !error && items.length > 0 && <PropertyGrid items={items} />}

        {showExtras && !loading && !error && (
          <>
            <section className="section">
              <h2>Popular destinations</h2>
              <p className="section__sub">Places guests keep coming back to.</p>
              <div className="dest-grid">
                {locations.slice(0, 6).map((l) => (
                  <Link key={l.location} to={`/?location=${l.location}`} className="dest">
                    <Img src={l.image_url} seed={`dest-${l.location}`} alt="" />
                    <div className="dest__shade" />
                    <div className="dest__text"><strong>{l.location}</strong><span>From {formatPrice(l.min_price)} / night</span></div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>Trending stays</h2>
              <p className="section__sub">Most-reviewed stays this season.</p>
              {trending.loading ? <GridSkeleton count={4} /> : <div className="grid">{trending.items.map((p) => <PropertyCard key={p.id} property={p} />)}</div>}
            </section>

            <section className="section">
              <h2>Explore nearby</h2>
              <div className="nearby">
                {locations.map((l) => (
                  <Link key={l.location} to={`/?location=${l.location}`} className="nearby__item">
                    <Img src={l.image_url} seed={`near-${l.location}`} alt="" />
                    <span><strong>{l.location}</strong><small>{plural(l.count, "stay")}</small></span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
        <HostCTA />
      </div>
    </>
  );
}
