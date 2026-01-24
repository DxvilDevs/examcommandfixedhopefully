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
      {/* Account Info Card */}
      <div className="glass-card p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Account Settings</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your account details and preferences
          </p>
        </div>

        {msg && (
          <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Account Name
            </label>
            <input
              className="glass-input w-full"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Preferred Name
            </label>
            <input
              className="glass-input w-full"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="Preferred name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              className="glass-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
          </div>

          <button
            className="btn-primary mt-2"
            onClick={async () => {
              try {
                setErr("");
                setMsg("");
                const u = await userApi.updateMe({
                  accountName,
                  preferredName,
                  email,
                });
                onUpdated?.(u);
                setMsg("Account details updated successfully!");
              } catch (e) {
                setErr(e.message);
              }
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="glass-card p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Change Password</h2>
          <p className="text-sm text-slate-400 mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current Password
            </label>
            <input
              className="glass-input w-full"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              type="password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <input
              className="glass-input w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              type="password"
            />
          </div>

          <button
            className="btn-secondary mt-2"
            onClick={async () => {
              try {
                setErr("");
                setMsg("");
                await userApi.changePassword({ currentPassword, newPassword });
                setCurrentPassword("");
                setNewPassword("");
                setMsg("Password updated successfully!");
              } catch (e) {
                setErr(e.message);
              }
            }}
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="glass-card p-6 shadow-xl border-indigo-400/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <span className="text-2xl">ℹ️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Account Information</h3>
            <div className="space-y-1 text-sm text-slate-300">
              <p>Plan: <span className="font-medium text-white">{me?.plan || "FREE"}</span></p>
              <p>Role: <span className="font-medium text-white">{me?.role || "USER"}</span></p>
              <p>Member since: <span className="font-medium text-white">{new Date(me?.created_at).toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
