import React from "react";
import { NavLink } from "react-router-dom";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-2xl smooth-transition ${
    isActive
      ? "bg-white/10 border border-white/15 shadow-lg shadow-indigo-500/10"
      : "bg-white/0 border border-transparent hover:bg-white/5 hover:border-white/10"
  }`;

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:block border-r border-white/10 min-h-screen p-4 backdrop-blur-sm bg-[#0a0a1f]/50">
      <div className="mb-6 px-2">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
          Navigation
        </div>
      </div>
      
      <nav className="space-y-2">
        <NavLink to="/" end className={linkCls}>
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/focus" className={linkCls}>
          <span className="text-lg">⏱️</span>
          <span>Focus</span>
        </NavLink>
        <NavLink to="/statistics" className={linkCls}>
          <span className="text-lg">📊</span>
          <span>Statistics</span>
        </NavLink>
        <NavLink to="/flashcards" className={linkCls}>
          <span className="text-lg">🎴</span>
          <span>Flashcards</span>
        </NavLink>
        <NavLink to="/settings" className={linkCls}>
          <span className="text-lg">⚙️</span>
          <span>Settings</span>
        </NavLink>
        <NavLink to="/subscribe" className={linkCls}>
          <span className="text-lg">⭐</span>
          <span>Upgrade</span>
        </NavLink>
        <NavLink to="/status" className={linkCls}>
          <span className="text-lg">📡</span>
          <span>Status</span>
        </NavLink>
        <NavLink to="/account" className={linkCls}>
          <span className="text-lg">👤</span>
          <span>Account</span>
        </NavLink>
        
        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2 px-2">
            Legal
          </div>
          <NavLink to="/legal/TOS" className={linkCls}>
            <span className="text-lg">📜</span>
            <span>Terms</span>
          </NavLink>
          <NavLink to="/legal/PRIVACY" className={linkCls}>
            <span className="text-lg">🔒</span>
            <span>Privacy</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
