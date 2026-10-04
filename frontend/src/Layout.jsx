import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "./Auth";
export function Logo() { return <Link to="/" className="logo"><svg width="30" height="30" viewBox="0 0 32 32"><path d="M16 3 3 14v14h9v-8h8v8h9V14z" fill="#ff385c" /></svg><span>stayly</span></Link>; }
export function Navbar() {
  const { user, signOut } = useApp(), [open, setOpen] = useState(false), nav = useNavigate();
  return (
    <header className="nav"><Logo />
      <nav className="nav-r">
        <Link to={user ? "/dashboard" : "/signup"} className="host">Become a host</Link>
        <div className="menu"><button className="menu-btn" aria-label="Menu" onClick={() => setOpen(!open)}>☰ <i className="avatar">{user ? user.name[0].toUpperCase() : "●"}</i></button>
          {open && <div className="drop" onClick={() => setOpen(false)}>
            {user ? <><Link to="/dashboard"><b>Dashboard</b></Link><Link to="/dashboard">Saved stays</Link><button onClick={async () => { await signOut(); nav("/"); }}>Log out</button></>
              : <><Link to="/signup"><b>Sign up</b></Link><Link to="/login">Log in</Link></>}</div>}
        </div>
      </nav>
    </header>
  );
}
export function Footer() {
  const cols = { Support: ["Help Centre", "Cancellation options", "Safety information"], Hosting: ["Host your home", "Hosting resources", "Community forum"], Stayly: ["About", "Careers", "Newsroom"] };
  return (
    <footer className="footer"><div className="cols">{Object.entries(cols).map(([h, l]) => <div key={h}><b>{h}</b>{l.map((x) => <a key={x} href="#!">{x}</a>)}</div>)}</div>
      <div className="foot-b">© 2026 Stayly, a student project · Fictional listings · Not affiliated with any booking company</div></footer>
  );
}
