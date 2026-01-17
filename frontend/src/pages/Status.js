import React, { useEffect, useState } from "react";
import { statusApi } from "../api/status";

export default function Status({ me }) {
  const [issues, setIssues] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await statusApi.list();
        setIssues(r);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  const isOwner = me?.role === "OWNER";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="text-lg font-semibold">Status</div>
      <p className="text-sm text-slate-300 mt-1">Live issues (owner can add/update via API routes).</p>

      {err && <div className="mt-4 text-sm text-red-200">{err}</div>}

      <div className="mt-5 space-y-3">
        {issues.map((i) => (
          <div key={i.id} className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{i.title}</div>
              <div className="text-xs text-slate-300">{i.status}</div>
            </div>
            <div className="text-sm text-slate-300 mt-2">{i.description}</div>
          </div>
        ))}
        {!issues.length && <div className="text-sm text-slate-300">No incidents reported.</div>}
      </div>

      {isOwner && (
        <div className="mt-6 text-sm text-amber-200">
          Owner note: adding/updating issues is enabled in backend; next step is wiring a UI form.
        </div>
      )}
    </div>
  );
}
