import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center">
        <div className="text-2xl font-semibold">404</div>
        <div className="text-slate-300 mt-2">Page not found.</div>
        <Link to="/" className="inline-block mt-4 rounded-xl px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10">
          Go Home
        </Link>
      </div>
    </div>
  );
}
