import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api/client";

/* Layout + Pages */
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Focus from "./pages/Focus";
import Account from "./pages/Account";
import Subscribe from "./pages/Subscribe";
import Statistics from "./pages/Statistics";
import Status from "./pages/Status";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Preview from "./pages/Preview";

export default function App() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const user = await api("/user/me");
      setMe(user);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 grid place-items-center">
        Loading…
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Routes>
          {/* ===== AUTH ===== */}
          <Route
            path="/login"
            element={
              me ? <Navigate to="/" replace /> : <Login onAuthed={refreshMe} />
            }
          />
          <Route
            path="/signup"
            element={
              me ? <Navigate to="/" replace /> : <Signup onAuthed={refreshMe} />
            }
          />

          {/* ===== APP SHELL (SIDEBAR + TOPBAR) ===== */}
          <Route
            path="/"
            element={
              me ? (
                <Layout me={me} onLogout={() => setMe(null)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Home me={me} />} />
            <Route path="focus" element={<Focus me={me} />} />
            <Route path="preview" element={<Preview />} />
            <Route path="account" element={<Account me={me} onUpdated={setMe} />} />
            <Route path="subscribe" element={<Subscribe me={me} onUpdated={setMe} />} />
            <Route path="statistics" element={<Statistics me={me} />} />
            <Route path="status" element={<Status me={me} />} />
            <Route path="legal/:key" element={<Legal me={me} />} />
          </Route>

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
