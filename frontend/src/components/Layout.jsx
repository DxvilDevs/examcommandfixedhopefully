import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatusBanner from "./StatusBanner";

export default function Layout({ me, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar me={me} onLogout={onLogout} />
          <StatusBanner />
          <main className="p-6 max-w-6xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
