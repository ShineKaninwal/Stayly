import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../Auth";
import Card from "../Card";
export default function Dashboard() {
  const { user, signOut, saved } = useApp(), nav = useNavigate(), [list, setList] = useState(null);
  useEffect(() => { api("/wishlist").then(setList).catch(() => setList([])); }, [saved]);
  return (
    <main className="wrap"><h1 className="h1">Welcome back, {user.name.split(" ")[0]} 👋</h1>
      <div className="profile"><div><b>{user.name}</b><div className="muted">{user.email} · Joined {new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div></div>
        <button className="btn ghost" onClick={async () => { await signOut(); nav("/"); }}>Log out</button></div>
      <h2 className="h2">Saved stays</h2>
      {list && list.length === 0 && <div className="empty"><h3>No saved stays yet</h3><p>Tap the heart on a stay to keep it here.</p><Link className="btn" to="/">Explore stays</Link></div>}
      <div className="grid">{list?.map((p) => <Card key={p.id} p={p} />)}</div></main>
  );
}
