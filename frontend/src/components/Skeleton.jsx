export function CardSkeleton() {
  return (
    <div className="card-skel" aria-hidden="true">
      <div className="skeleton card-skel__img" />
      <div className="skeleton" style={{ height: 14, width: "70%", marginTop: 12 }} />
      <div className="skeleton" style={{ height: 14, width: "50%", marginTop: 8 }} />
      <div className="skeleton" style={{ height: 14, width: "30%", marginTop: 8 }} />
    </div>
  );
}
export const GridSkeleton = ({ count = 8 }) => (
  <div className="grid">{Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}</div>
);
