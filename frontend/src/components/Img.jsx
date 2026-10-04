import { useEffect, useState } from "react";

// Falls back to a deterministic public photo if a remote image fails to load.
export default function Img({ src, seed, alt = "", ...rest }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  const url = bad ? `https://picsum.photos/seed/stayly-${seed}/900/700` : src;
  return <img src={url} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} {...rest} />;
}
