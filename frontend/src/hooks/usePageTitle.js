import { useEffect } from "react";
export function usePageTitle(title) {
  useEffect(() => { document.title = title ? `${title} · Stayly` : "Stayly — Find stays worth remembering"; }, [title]);
}
