// frontend/src/pages/Status.jsx
import React, { useEffect, useMemo, useState } from "react";
import { statusApi } from "../api/status";

const STATUSES = ["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];

export default function Status({ me }) {
  const [issues, setIssues] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // owner form state
  const isOwner = me?.role === "OWNER";
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("INVESTIGATING");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const editingIssue = useMemo(
    () => issues.find((i) => i.id === editingId) || null,
    [issues, editingId]
  );

  async function load() {
    try {
      setErr("");
      const r = await statusApi.list();
      setIssues(Array.isArray(r) ? r : []);
    } catch (e) {
      setErr(e.message || "Failed to load status");
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setEditingId(null);
    setStatus("INVESTIGATING");
    setTitle("");
    setDescription("");
  }

  function loadIntoForm(issue) {
    setMsg("");
    setErr("");
    setEditingId(issue.id);
    setStatus(issue.status);
    setTitle(issue.title);
    setDescription(issue.description);
  }

  async function submit() {
    try {
      setErr("");
      setMsg("");

      const payload = {
        status,
        title: title.trim(),
        description: description.trim()
      };

      if (!payload.title || !payload.description) {
        setErr("Title and description are required.");
        return;
      }

      if (editingId) {
        await statusApi.update(editingId, payload);
        setMsg("Issue updated.");
      } else {
        await statusApi.create(payload);
        setMsg("Issue created.");
      }

      await load();
      resetForm();
    } catch (e) {
      setErr(e.message || "Save failed");
    }
  }

  return (
    <div className="space-y-6">
      {/* Public Status Feed */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Status</div>
            <p className="text-sm text-slate-300 mt-1">Current incidents and updates.</p>
          </div>
          <button
            onClick={load}
            className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
          >
            Refresh
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200 text-sm">
            {err}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {issues.map((i) => (
            <div
              key={i.id}
              className="rounded-2xl border border-white/10 bg-slate-900/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(i.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-200">
                    {i.status}
                  </span>

                  {isOwner && (
                    <button
                      onClick={() => loadIntoForm(i)}
                      className="text-xs rounded-xl px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-300 mt-3 whitespace-pre-wrap">
                {i.description}
              </div>
            </div>
          ))}

          {!issues.length && !err && (
            <div className="text-sm text-slate-300">No incidents reported.</div>
          )}
        </div>
      </div>

      {/* Owner Panel */}
      {isOwner && (
        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Owner Panel</div>
              <p className="text-sm text-slate-300 mt-1">
                Create or update incidents shown on the Status page.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
            >
              New issue
            </button>
          </div>

          {msg && (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-200 text-sm">
              {msg}
            </div>
          )}
          {err && (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200 text-sm">
              {err}
            </div>
          )}

          <div className="mt-5 grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-300 mb-1">Status</div>
                <select
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-slate-300 mb-1">Title</div>
                <input
                  className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Login issues"
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-1">Description</div>
              <textarea
                className="w-full min-h-[140px] rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write an update…"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {editingIssue ? `Editing issue #${editingIssue.id}` : "Creating new issue"}
              </div>

              <button
                onClick={submit}
                className="rounded-xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
              >
                {editingId ? "Update issue" : "Create issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
