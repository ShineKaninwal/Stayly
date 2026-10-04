import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Check, CheckCircle2, Circle } from "lucide-react";
import PasswordInput from "../components/PasswordInput";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { passwordChecks, passwordValid, validateEmail } from "../utils/validators";

export default function SignupPage() {
  usePageTitle("Sign up");
  const { user, signup } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/dashboard";
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user && !busy && !done) return <Navigate to={from} replace />;

  if (done) {
    return (
      <div className="auth"><div className="auth__card"><div className="auth__body auth__success">
        <CheckCircle2 size={56} color="#008a05" />
        <h1>You're in, {done.split(" ")[0]}!</h1>
        <p className="muted">Your account is ready. Taking you to your dashboard…</p>
      </div></div></div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (f.name.trim().length < 2) errs.name = "Enter your full name.";
    if (validateEmail(f.email)) errs.email = validateEmail(f.email);
    if (!passwordValid(f.password)) errs.password = "Password doesn't meet all requirements.";
    if (f.confirm !== f.password) errs.confirm = "Passwords don't match.";
    setErrors(errs); setFormError("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = await signup({ name: f.name, email: f.email, password: f.password, confirm_password: f.confirm });
      setDone(u.name);
      setTimeout(() => nav(from, { replace: true }), 1400);
    } catch (err) {
      const d = err.details || {};
      setErrors({ name: d.name, email: d.email, password: d.password, confirm: d.confirm_password });
      setFormError(err.code === "VALIDATION_ERROR" || err.code === "EMAIL_EXISTS" ? "" : err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__head">Sign up</div>
        <form className="auth__body" onSubmit={submit} noValidate>
          <LogoMark size={40} />
          <h1>Create your Stayly account</h1>
          {formError && <div className="alert" role="alert"><AlertCircle size={18} />{formError}</div>}
          {[["name", "Full name", "text", "name"], ["email", "Email", "email", "email"]].map(([k, label, type, ac]) => (
            <div key={k}>
              <div className={`field ${errors[k] ? "field--error" : ""}`}>
                <input id={k} type={type} value={f[k]} onChange={set(k)} placeholder=" " autoComplete={ac} aria-invalid={!!errors[k]} />
                <label htmlFor={k}>{label}</label>
              </div>
              {errors[k] && <div className="field__error"><AlertCircle size={14} />{errors[k]}</div>}
            </div>
          ))}
          <PasswordInput id="password" label="Password" value={f.password} onChange={set("password")} error={errors.password} autoComplete="new-password" />
          <ul className="pwreq" aria-label="Password requirements">
            {passwordChecks(f.password).map((c) => <li key={c.id} className={c.ok ? "ok" : ""}>{c.ok ? <Check size={14} /> : <Circle size={10} />}{c.label}</li>)}
          </ul>
          <PasswordInput id="confirm" label="Confirm password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>{busy ? <span className="spinner" aria-label="Creating account" /> : "Create account"}</button>
          <p className="auth__alt">Already have an account? <Link to="/login" state={{ from: loc.state?.from }} className="link">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
