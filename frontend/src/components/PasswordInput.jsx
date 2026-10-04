import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function PasswordInput({ id, label, value, onChange, error, autoComplete, onBlur }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className={`field ${error ? "field--error" : ""}`}>
        <input id={id} type={show ? "text" : "password"} value={value} onChange={onChange} onBlur={onBlur} placeholder=" " autoComplete={autoComplete} aria-invalid={!!error} style={{ paddingRight: 56 }} />
        <label htmlFor={id}>{label}</label>
        <button type="button" className="field__toggle" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <div className="field__error"><AlertCircle size={14} />{error}</div>}
    </div>
  );
}
