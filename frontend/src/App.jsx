import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./Auth";
import { Footer, Navbar } from "./Layout";
import Home from "./pages/Home";
import Property from "./pages/Property";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
function Protected({ children }) { const { user, ready } = useApp(); if (!ready) return null; return user ? children : <Navigate to="/login" state={{ msg: "Log in to continue." }} replace />; }
export default function App() {
  return (
    <AppProvider><Navbar />
      <Routes>
        <Route path="/" element={<Home />} /><Route path="/stays/:id" element={<Property />} />
        <Route path="/login" element={<AuthPage mode="login" />} /><Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<div className="wrap empty"><h3>Page not found</h3></div>} />
      </Routes><Footer /></AppProvider>
  );
}
