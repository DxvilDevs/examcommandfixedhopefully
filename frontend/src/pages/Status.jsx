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
  // faster = more urgent
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

  // owner editor state
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("INVESTIGATING");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // timeline state
  const [openTimelineId, setOpenTimelineId] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineErr, setTimelineErr] = useState("");

  const editingIssue = useMemo(
    () => issues.find((i) => i.id === editingId) || null,
    [issues, editingId]
  );

  const overallStatus =
    issues.some((i) => i.status === "INVESTIGATING")
      ? "INVESTIGATING"
      : issues.some((i) => i.status === "IDENTIFIED")
      ? "IDENTIFIED"
      : issues.some((i) => i.status === "MONITORING")
      ? "MONITORING"
      : "RESOLVED";

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

      if (!title.trim() || !description.trim()) {
        setErr("Title and description are required.");
        return;
      }

      const payload = {
        status,
        title: title.trim(),
        description: description.trim()
      };

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

  return (
    <div className="space-y-6">
      {/* STATUS FEED */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Overall pulsing dot */}
            <span className="relative inline-flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass(overallStatus)} ${
                  statusDot(overallStatus).glow
                }`}
              />
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  statusDot(overallStatus).ring
                }`}
              />
            </span>

            <div>
              <div className="text-lg font-semibold">Status</div>
              <p className="text-sm text-slate-300 mt-1">Live incidents and updates.</p>
            </div>
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
            <div key={i.id} className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {/* Incident dot */}
                    <span className="relative inline-flex h-3 w-3 shrink-0">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass(i.status)} ${
                          statusDot(i.status).glow
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-3 w-3 rounded-full ${statusDot(i.status).ring}`}
                      />
                    </span>

                    <div className="font-medium truncate">{i.title}</div>
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    Created: {formatTime(i.created_at)} • Updated: {formatTime(i.updated_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-200">
                    {i.status}
                  </span>

                  <button
                    onClick={() => toggleTimeline(i.id)}
                    className="text-xs rounded-xl px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    {openTimelineId === i.id ? "Hide" : "Timeline"}
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => loadIntoForm(i)}
                      className="text-xs rounded-xl px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition"
                    >
                      Edit
                    </button>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => deleteIssue(i.id)}
                      className="text-xs rounded-xl px-2 py-1 bg-red-500/15 border border-red-400/20 hover:bg-red-500/25 transition text-red-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-300 mt-3 whitespace-pre-wrap">
                {i.description}
              </div>

              {/* Timeline */}
              {openTimelineId === i.id && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-medium">Timeline</div>
                  {timelineErr && (
                    <div className="mt-2 text-sm text-red-200">{timelineErr}</div>
                  )}

                  <div className="mt-3 space-y-3">
                    {timeline.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-white/10 bg-slate-900/30 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium">
                            {ev.action} • {ev.status}
                          </div>
                          <div className="text-xs text-slate-400">{formatTime(ev.created_at)}</div>
                        </div>
                        <div className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                          {ev.description}
                        </div>
                      </div>
                    ))}
                    {!timeline.length && !timelineErr && (
                      <div className="text-sm text-slate-300">No timeline entries yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {!issues.length && !err && (
            <div className="text-sm text-slate-300">All systems operational.</div>
          )}
        </div>
      </div>

      {/* OWNER PANEL */}
      {isOwner && (
        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Owner Panel</div>
              <p className="text-sm text-slate-300 mt-1">Create or update incidents shown publicly.</p>
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
