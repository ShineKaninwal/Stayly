import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HostCTA() {
  const { user } = useAuth();
  return (
    <section className="hostcta" id="host">
      <div className="hostcta__text">
        <h2>Open your door.<br />Share your place.</h2>
        <p>Hosting on Stayly is coming soon. Create an account now and be first in line when listings open.</p>
        <Link to={user ? "/dashboard" : "/signup"} className="btn btn--primary">{user ? "Go to dashboard" : "Join Stayly"}</Link>
      </div>
      <div className="hostcta__art" aria-hidden="true" />
    </section>
  );
}
