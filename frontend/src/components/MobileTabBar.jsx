import { NavLink } from "react-router-dom";
import { Heart, Search, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MobileTabBar() {
  const { user } = useAuth();
  const cls = ({ isActive }) => `tab ${isActive ? "is-active" : ""}`;
  return (
    <nav className="tabbar" aria-label="Primary">
      <NavLink to="/" end className={cls}><Search size={22} /><span>Explore</span></NavLink>
      <NavLink to={user ? "/dashboard" : "/login"} className={cls}><Heart size={22} /><span>Wishlists</span></NavLink>
      <NavLink to={user ? "/dashboard" : "/login"} className={cls}><User size={22} /><span>{user ? "Profile" : "Log in"}</span></NavLink>
    </nav>
  );
}
