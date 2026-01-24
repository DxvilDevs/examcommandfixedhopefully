import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatusBanner from "./StatusBanner";

export default function Layout({ me, onLogout }) {
  return (
    <div className="min-h-screen bg-[#0a0a1f] text-slate-100 relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="glow-orb w-[600px] h-[600px] bg-indigo-500 -top-40 -left-40 float-animation" />
        <div className="glow-orb w-[700px] h-[700px] bg-purple-500 top-1/3 -right-60 float-animation" style={{ animationDelay: '2s' }} />
        <div className="glow-orb w-[500px] h-[500px] bg-cyan-400 -bottom-40 left-1/4 float-animation" style={{ animationDelay: '4s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

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
