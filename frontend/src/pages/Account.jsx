import React, { useState } from "react";
import { userApi } from "../api/user";

export default function Account({ me, onUpdated }) {
  const [accountName, setAccountName] = useState(me?.account_name || "");
  const [preferredName, setPreferredName] = useState(me?.preferred_name || "");
  const [email, setEmail] = useState(me?.email || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-lg font-semibold">Account Dashboard</div>
        <p className="text-sm text-slate-300 mt-1">Manage account name, preferred name, email, password.</p>

        {msg && <div className="mt-4 text-sm text-green-200">{msg}</div>}
        {err && <div className="mt-4 text-sm text-red-200">{err}</div>}

        <div className="mt-4 grid gap-3 max-w-xl">
          <input className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account name" />
          <input className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            value={preferredName} onChange={(e) => setPreferredName(e.target.value)} placeholder="Preferred name" />
          <input className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

          <button
            className="rounded-xl px-3 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
            onClick={async () => {
              try {
                setErr(""); setMsg("");
                const u = await userApi.updateMe({ accountName, preferredName, email });
                onUpdated?.(u);
                setMsg("Saved.");
              } catch (e) {
                setErr(e.message);
              }
            }}
          >
            Save changes
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-lg font-semibold">Change Password</div>
        <div className="mt-4 grid gap-3 max-w-xl">
          <input className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" type="password" />
          <input className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 8 chars)" type="password" />

          <button
            className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium"
            onClick={async () => {
              try {
                setErr(""); setMsg("");
                await userApi.changePassword({ currentPassword, newPassword });
                setCurrentPassword(""); setNewPassword("");
                setMsg("Password updated.");
              } catch (e) {
                setErr(e.message);
              }
            }}
          >
            Update password
          </button>
        </div>
      </div>
    </div>
  );
}
