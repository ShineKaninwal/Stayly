import { Link } from "react-router-dom";

export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.5c-5.5 0-10 4.4-10 10 0 7.8 10 17 10 17s10-9.2 10-17c0-5.6-4.5-10-10-10z" fill="#ff385c" />
      <path d="M10.5 13.5 16 9l5.5 4.500V19h-3.200v-3.600h-4.600V19h-3.200z" fill="#fff" />
    </svg>
  );
}

export default function Logo({ wordmark = true }) {
  return (
    <Link to="/" className="logo" aria-label="Stayly home">
      <LogoMark />
      {wordmark && <span className="logo__text">stayly</span>}
    </Link>
  );
}
