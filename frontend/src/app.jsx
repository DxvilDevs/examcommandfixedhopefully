import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Subscribe from "./pages/Subscribe";
import Statistics from "./pages/Statistics";
import Status from "./pages/Status";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import { api } from "./api/client";

export default function App() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const u = await api("/user/me");
      setMe(u);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshMe(); }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-200 grid place-items-center">Loading…</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={me ? <Navigate to="/" /> : <Login onAuthed={refreshMe} />} />
        <Route path="/signup" element={me ? <Navigate to="/" /> : <Signup onAuthed={refreshMe} />} />

        <Route path="/" element={me ? <Layout me={me} onMe={setMe} /> : <Navigate to="/login" />}>
          <Route index element={<Home me={me} />} />
          <Route path="account" element={<Account me={me} onUpdated={setMe} />} />
          <Route path="subscribe" element={<Subscribe me={me} onUpdated={setMe} />} />
          <Route path="statistics" element={<Statistics me={me} />} />
          <Route path="status" element={<Status me={me} />} />
          <Route path="legal/:key" element={<Legal me={me} />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
