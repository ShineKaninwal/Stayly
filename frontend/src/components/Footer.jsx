import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { CATEGORIES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

const DEST = ["Goa", "Manali", "Udaipur", "Kerala", "Jaipur", "Ooty"];

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="footer">
      <div className="container footer__cols">
        <div><h4>Explore</h4><ul>{CATEGORIES.slice(0, 6).map((c) => <li key={c.value}><Link to={`/?category=${encodeURIComponent(c.value)}`}>{c.label}</Link></li>)}</ul></div>
        <div><h4>Destinations</h4><ul>{DEST.map((d) => <li key={d}><Link to={`/?location=${d}`}>{d}</Link></li>)}</ul></div>
        <div><h4>Account</h4><ul>
          {user ? <><li><Link to="/dashboard">Dashboard</Link></li><li><Link to="/dashboard#saved">Saved stays</Link></li></> : <><li><Link to="/login">Log in</Link></li><li><Link to="/signup">Sign up</Link></li></>}
        </ul></div>
        <div><h4>Stayly</h4><ul><li><Link to="/#host">Become a host</Link></li><li><Link to="/">Find a stay</Link></li></ul>
          <p className="footer__note">Stayly is a student project built for learning. Properties are fictional and it is not affiliated with any booking company.</p></div>
      </div>
      <div className="container footer__bar">
        <span>© 2026 Stayly · Find stays worth remembering.</span>
        <span className="footer__right"><Globe size={16} /> English (IN) &nbsp; ₹ INR</span>
      </div>
    </footer>
  );
}
