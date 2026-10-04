import PropertyCard from "./PropertyCard";
export default function PropertyGrid({ items }) {
  return <div className="grid">{items.map((p) => <PropertyCard key={p.id} property={p} />)}</div>;
}
