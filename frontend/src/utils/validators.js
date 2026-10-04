export const validateEmail = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address.");
export const passwordChecks = (pw) => [
  { id: "len", label: "At least 8 characters", ok: pw.length >= 8 },
  { id: "upper", label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
  { id: "lower", label: "One lowercase letter", ok: /[a-z]/.test(pw) },
  { id: "num", label: "One number", ok: /\d/.test(pw) },
];
export const passwordValid = (pw) => passwordChecks(pw).every((c) => c.ok);
