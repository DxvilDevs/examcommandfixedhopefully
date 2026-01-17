import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ me, onMe }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <Sidebar me={me} />
        <div className="flex-1 min-w-0">
          <Topbar me={me} onMe={onMe} />
          <main className="p-6 max-w-6xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
