import React, { useEffect, useMemo, useState } from "react";
import { statusApi } from "../api/status";

const STATUSES = ["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"];

function statusDot(status) {
  switch (status) {
    case "INVESTIGATING":
      return { ring: "bg-yellow-400", glow: "bg-yellow-400/30" };
    case "IDENTIFIED":
      return { ring: "bg-orange-400", glow: "bg-orange-400/30" };
    case "MONITORING":
      return { ring: "bg-sky-400", glow: "bg-sky-400/30" };
    case "RESOLVED":
    default:
      return { ring: "bg-emerald-400", glow: "bg-emerald-400/30" };
  }
}

function pulseClass(status) {
  switch (status) {
    case "INVESTIGATING":
      return "animate-[ping_0.8s_ease-in-out_infinite]";
    case "IDENTIFIED":
      return "animate-[ping_1.1s_ease-in-out_infinite]";
    case "MONITORING":
      return "animate-[ping_1.6s_ease-in-out_infinite]";
    case "RESOLVED":
    default:
      return "animate-[ping_2.4s_ease-in-out_infinite]";
  }
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function Status({ me }) {
  const [issues, setIssues] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const isOwner = me?.role === "OWNER";

  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("INVESTIGATING");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [openTimelineId, setOpenTimelineId] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineErr, setTimelineErr] = useState("");

  const editingIssue = useMemo(
    () => issues.find((i) => i.id === editingId) || null,
    [issues, editingId]
  );

  const overallStatus = useMemo(() => {
    if (issues.some((i) => i.status === "INVESTIGATING")) return "INVESTIGATING";
    if (issues.some((i) => i.status === "IDENTIFIED")) return "IDENTIFIED";
    if (issues.some((i) => i.status === "MONITORING")) return "MONITORING";
    return "RESOLVED";
  }, [issues]);

  async function load() {
    try {
      setErr("");
      const r = await statusApi.list();
      setIssues(Array.isArray(r) ? r : []);
    } catch (e) {
      setErr(e.message || "Failed to load status");
    }
  }

  useEffect(() => {
    load();
  }, []);

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

      if (!title.trim() || !description.trim()) {
        setErr("Title and description are required.");
        return;
      }

      const payload = { status, title: title.trim(), description: description.trim() };

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

  async function toggleTimeline(issueId) {
    if (openTimelineId === issueId) {
      setOpenTimelineId(null);
      setTimeline([]);
      setTimelineErr("");
      return;
    }

    setOpenTimelineId(issueId);
    setTimeline([]);
    setTimelineErr("");

    try {
      const r = await statusApi.history(issueId);
      setTimeline(Array.isArray(r) ? r : []);
    } catch (e) {
      setTimelineErr(e.message || "Failed to load timeline");
    }
  }

  async function deleteIssue(issueId) {
    const ok = confirm("Delete this incident? This cannot be undone.");
    if (!ok) return;

    try {
      setErr("");
      setMsg("");
      await statusApi.remove(issueId);
      setMsg("Issue deleted.");
      if (openTimelineId === issueId) {
        setOpenTimelineId(null);
        setTimeline([]);
      }
      if (editingId === issueId) resetForm();
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  }

  const s = statusDot(overallStatus);

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="glass-card p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="relative inline-flex h-4 w-4">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass(
                  overallStatus
                )} ${s.glow}`}
              />
              <span className={`relative inline-flex h-4 w-4 rounded-full ${s.ring}`} />
            </span>

            <div>
              <h1 className="text-2xl font-bold text-white">System Status</h1>
              <p className="text-sm text-slate-400 mt-1">Live incident monitoring and updates</p>
            </div>
          </div>

          <button onClick={load} className="btn-secondary text-sm">
            🔄 Refresh
          </button>
        </div>

        {err && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="space-y-3">
          {issues.map((i) => (
            <div key={i.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="relative inline-flex h-3 w-3 flex-shrink-0">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass(
                        i.status
                      )} ${statusDot(i.status).glow}`}
                    />
                    <span
                      className={`relative inline-flex h-3 w-3 rounded-full ${
                        statusDot(i.status).ring
                      }`}
                    />
                  </span>
                  <div className="font-semibold text-white truncate">{i.title}</div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {i.status}
                  </span>
                  <button
                    onClick={() => toggleTimeline(i.id)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 smooth-transition"
                  >
                    {openTimelineId === i.id ? "Hide" : "Timeline"}
                  </button>
                  {isOwner && (
                    <>
                      <button
                        onClick={() => loadIntoForm(i)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 smooth-transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteIssue(i.id)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-400/20 hover:bg-red-500/25 smooth-transition text-red-200"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-400 mb-2">
                Created: {formatTime(i.created_at)} • Updated: {formatTime(i.updated_at)}
              </div>

              <div className="text-sm text-slate-300 whitespace-pre-wrap">{i.description}</div>

              {openTimelineId === i.id && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-3">Timeline</div>
                  {timelineErr && <div className="text-sm text-red-200 mb-2">{timelineErr}</div>}

                  <div className="space-y-2">
                    {timeline.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <div className="text-sm font-medium text-white">
                            {ev.action} • {ev.status}
                          </div>
                          <div className="text-xs text-slate-400">{formatTime(ev.created_at)}</div>
                        </div>
                        <div className="text-sm text-slate-300 whitespace-pre-wrap">
                          {ev.description}
                        </div>
                      </div>
                    ))}
                    {!timeline.length && !timelineErr && (
                      <div className="text-sm text-slate-400">No timeline entries yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {!issues.length && !err && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-lg font-semibold text-white mb-1">All Systems Operational</div>
              <div className="text-sm text-slate-400">Everything is running smoothly</div>
            </div>
          )}
        </div>
      </div>

      {/* Owner Panel */}
      {isOwner && (
        <div className="glass-card p-8 shadow-xl border-amber-300/20">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold gold-gradient bg-clip-text text-transparent">
                Owner Panel
              </h2>
              <p className="text-sm text-slate-400 mt-1">Create and manage system incidents</p>
            </div>

            <button onClick={resetForm} className="btn-secondary text-sm">
              New Issue
            </button>
          </div>

          {msg && (
            <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {msg}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select className="glass-input w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  className="glass-input w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Login issues"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                className="glass-input w-full min-h-[140px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident..."
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {editingIssue ? `Editing issue #${editingIssue.id}` : "Creating new issue"}
              </div>

              <button onClick={submit} className="btn-primary">
                {editingId ? "Update Issue" : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
