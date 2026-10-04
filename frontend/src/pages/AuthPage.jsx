import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../Auth";
export default function AuthPage({ mode }) {
  const signup = mode === "signup", { signIn } = useApp(), nav = useNavigate(), loc = useLocation();
  const [v, setV] = useState({ name: "", email: "", password: "", confirm: "" }), [show, setShow] = useState(false), [err, setErr] = useState(loc.state?.msg || ""), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (signup) {
      if (v.name.trim().length < 2) return setErr("Enter your full name.");
      if (v.password.length < 8 || !/\d/.test(v.password) || !/[A-Za-z]/.test(v.password)) return setErr("Password needs 8+ characters with a letter and a number.");
      if (v.password !== v.confirm) return setErr("Passwords don't match.");
    }
    setBusy(true);
    try { await signIn(await api(signup ? "/auth/signup" : "/auth/login", "POST", v)); nav("/dashboard"); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <main className="auth"><form className="auth-box" onSubmit={submit} noValidate>
      <h1>{signup ? "Sign up" : "Log in"}</h1><h2>Welcome to Stayly</h2>
      {err && <div className="alert" role="alert">{err}</div>}
      {signup && <label className="fld"><span>Full name</span><input value={v.name} onChange={set("name")} autoComplete="name" /></label>}
      <label className="fld"><span>Email</span><input type="email" value={v.email} onChange={set("email")} autoComplete="email" /></label>
      <label className="fld"><span>Password</span><input type={show ? "text" : "password"} value={v.password} onChange={set("password")} autoComplete={signup ? "new-password" : "current-password"} />
        <button type="button" className="eye" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></label>
      {signup && <><label className="fld"><span>Confirm password</span><input type={show ? "text" : "password"} value={v.confirm} onChange={set("confirm")} autoComplete="new-password" /></label>
        <p className="muted small">At least 8 characters, with a letter and a number.</p></>}
      <button className="btn full" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Log in"}</button>
      <p className="muted center">{signup ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New to Stayly? <Link to="/signup">Sign up</Link></>}</p>
    </form></main>
  );
}
