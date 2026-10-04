import { useEffect, useState } from "react";
import { propertyService } from "../services";

export function useProperties(params) {
  const key = JSON.stringify(params);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    propertyService.list(params, ctrl.signal)
      .then((d) => setState({ items: d.items, total: d.total, loading: false, error: null }))
      .catch((e) => { if (e.name !== "AbortError") setState({ items: [], total: 0, loading: false, error: e.message }); });
    return () => ctrl.abort();
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: () => setTick((t) => t + 1) };
}

export function useLocations() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const ctrl = new AbortController();
    propertyService.locations(ctrl.signal).then((d) => setItems(d.items)).catch(() => {});
    return () => ctrl.abort();
  }, []);
  return items;
}
