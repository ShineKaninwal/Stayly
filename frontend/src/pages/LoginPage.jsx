import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import PasswordInput from "../components/PasswordInput";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { validateEmail } from "../utils/validators";

export default function LoginPage() {
  usePageTitle("Log in");
  const { user, login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (validateEmail(email)) errs.email = validateEmail(email);
    if (!password) errs.password = "Enter your password.";
    setErrors(errs); setFormError("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = await login({ email, password });
      toast(`Welcome back, ${u.name.split(" ")[0]}!`);
      nav(from, { replace: true });
    } catch (err) {
      setFormError(err.message); setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__head">Log in</div>
        <form className="auth__body" onSubmit={submit} noValidate>
          <LogoMark size={40} />
          <h1>Welcome back to Stayly</h1>
          {formError && <div className="alert" role="alert"><AlertCircle size={18} />{formError}</div>}
          <div>
            <div className={`field ${errors.email ? "field--error" : ""}`}>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder=" " autoComplete="email" aria-invalid={!!errors.email} />
              <label htmlFor="email">Email</label>
            </div>
            {errors.email && <div className="field__error"><AlertCircle size={14} />{errors.email}</div>}
          </div>
          <PasswordInput id="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="current-password" />
          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>{busy ? <span className="spinner" aria-label="Logging in" /> : "Log in"}</button>
          <p className="auth__alt">New to Stayly? <Link to="/signup" state={{ from: loc.state?.from }} className="link">Sign up</Link></p>
        </form>
      </div>
    </div>
  );
}
