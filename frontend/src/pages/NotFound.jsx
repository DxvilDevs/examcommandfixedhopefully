import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          {/* Glow effect */}
          <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-3xl" />
          
          <div className="relative text-8xl font-bold">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/" className="btn-primary inline-block">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
