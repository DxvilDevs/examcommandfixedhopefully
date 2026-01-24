import React, { useState } from "react";
import { signup } from "../api/auth";
import { Link } from "react-router-dom";

export default function Signup({ onAuthed }) {
  const [accountName, setAccountName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a1f] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated glowing orbs background */}
      <div className="fixed inset-0 -z-10">
        <div className="glow-orb w-[500px] h-[500px] bg-indigo-500 -top-32 -right-32 float-animation" />
        <div className="glow-orb w-[600px] h-[600px] bg-fuchsia-500 top-40 -left-40 float-animation" style={{ animationDelay: '1.5s' }} />
        <div className="glow-orb w-[450px] h-[450px] bg-cyan-400 -bottom-32 right-1/4 float-animation" style={{ animationDelay: '3s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="glass-card p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Join and unlock your exam potential
            </p>
          </div>

          {err && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          )}

          <div className="space-y-4">
            <input
              className="glass-input w-full"
              placeholder="Account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <input
              className="glass-input w-full"
              placeholder="Preferred name"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
            />
            <input
              className="glass-input w-full"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="glass-input w-full"
              placeholder="Password (min 8 chars)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && document.getElementById('signup-btn').click()}
            />

            <button
              id="signup-btn"
              className="btn-primary w-full mt-6"
              onClick={async () => {
                try {
                  setErr("");
                  await signup({
                    email,
                    password,
                    accountName: accountName || undefined,
                    preferredName: preferredName || undefined
                  });
                  onAuthed?.();
                } catch (e) {
                  setErr(e.message || "Signup failed");
                }
              }}
            >
              Create Account
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-slate-400 hover:text-slate-200 smooth-transition"
            >
              Already have an account? <span className="text-indigo-400 font-medium">Login</span>
            </Link>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Start your journey to exam success
        </div>
      </div>
    </div>
  );
}
