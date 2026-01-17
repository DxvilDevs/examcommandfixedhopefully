import React from "react";
import { NavLink } from "react-router-dom";

const linkCls = ({ isActive }) =>
  `block px-3 py-2 rounded-xl border transition ${
    isActive ? "bg-white/10 border-white/15" : "bg-white/0 border-white/0 hover:bg-white/5 hover:border-white/10"
  }`;

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:block border-r border-white/10 min-h-screen p-4">
      <div className="text-sm text-slate-300 mb-3 px-2">Navigation</div>
      <nav className="space-y-1">
        <NavLink to="/" end className={linkCls}>Home</NavLink>
        <NavLink to="/statistics" className={linkCls}>Statistics</NavLink>
        <NavLink to="/subscribe" className={linkCls}>Subscribe</NavLink>
        <NavLink to="/status" className={linkCls}>Status</NavLink>
        <NavLink to="/account" className={linkCls}>Account</NavLink>
        <NavLink to="/legal/TOS" className={linkCls}>TOS</NavLink>
        <NavLink to="/legal/PRIVACY" className={linkCls}>Privacy</NavLink>
      </nav>
    </aside>
  );
}
