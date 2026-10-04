import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe, Menu, User } from "lucide-react";
import Logo from "./Logo";
import { SearchPill, SearchPanel } from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { initials } from "../utils/formatters";

function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);
  const doLogout = async () => { setOpen(false); await logout(); toast("You've been logged out."); nav("/"); };
  return (
    <div className="umenu" ref={ref}>
      <button className="umenu__btn" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
        <Menu size={16} />
        <span className={`umenu__avatar ${user ? "umenu__avatar--on" : ""}`}>{user ? initials(user.name) : <User size={18} fill="currentColor" />}</span>
      </button>
      {open && (
        <div className="umenu__drop" role="menu" onClick={() => setOpen(false)}>
          {user ? (
            <>
              <div className="umenu__hi">Hi, {user.name.split(" ")[0]}</div>
              <Link to="/dashboard" role="menuitem">Dashboard</Link>
              <Link to="/dashboard#saved" role="menuitem">Wishlist</Link>
              <hr />
              <Link to="/#host" role="menuitem">Become a host</Link>
              <button role="menuitem" onClick={doLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/signup" role="menuitem" className="strong">Sign up</Link>
              <Link to="/login" role="menuitem">Log in</Link>
              <hr />
              <Link to="/#host" role="menuitem">Become a host</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(null);
  const location = useLocation();
  const toast = useToast();
  useEffect(() => setOpen(null), [location.key]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <div className="nav-shell">
        <header className={`nav ${open ? "nav--open" : ""}`}>
          <div className="nav__row">
            <Logo />
            <div className="nav__center">
              {open ? <div className="nav__tab">Stays</div> : <SearchPill onOpen={setOpen} />}
            </div>
            <div className="nav__right">
              <Link to="/#host" className="nav__host">Become a host</Link>
              <button className="nav__globe" aria-label="Language" onClick={() => toast("Stayly is available in English (India).")}><Globe size={16} /></button>
              <UserMenu />
            </div>
          </div>
          {open && <SearchPanel initial={open} onClose={() => setOpen(null)} />}
        </header>
      </div>
      {open && <div className="backdrop" onClick={() => setOpen(null)} />}
    </>
  );
}
