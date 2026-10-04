import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Page not found");
  return <EmptyState icon={Compass} title="We can't find that page" text="The link may be broken or the page may have moved." action={<Link to="/" className="btn btn--dark">Back to Stayly</Link>} />;
}
