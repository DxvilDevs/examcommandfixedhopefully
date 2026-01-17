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
    <div className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
        <div className="text-xl font-semibold">Sign up</div>
        <p className="text-sm text-slate-300 mt-1">Create your account.</p>

        {err && <div className="mt-4 text-sm text-red-300">{err}</div>}

        <div className="mt-5 space-y-3">
          <input className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            placeholder="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          <input className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            placeholder="Preferred name" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
          <input className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button
            className="w-full rounded-xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
            onClick={async () => {
              try {
                setErr("");
                await signup({ email, password, accountName: accountName || undefined, preferredName: preferredName || undefined });
                onAuthed?.();
              } catch (e) {
                setErr(e.message || "Signup failed");
              }
            }}
          >
            Create account
          </button>

          <Link to="/login" className="block text-sm text-slate-300 hover:text-slate-100 transition text-center">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
