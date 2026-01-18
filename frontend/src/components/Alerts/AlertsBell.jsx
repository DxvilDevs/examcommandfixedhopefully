import React, { useEffect, useState } from "react";
import { alertsApi } from "../../api/alerts";

export default function AlertsBell() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  async function load() {
    try {
      await alertsApi.refresh();
      const r = await alertsApi.list();
      setAlerts(Array.isArray(r) ? r : []);
    } catch {}
  }

  useEffect(() => { load(); }, []);

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="relative">
      <button
        className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm flex items-center gap-2"
        onClick={() => setOpen(v => !v)}
      >
        <span>Alerts</span>
        {unread > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/25 text-amber-200">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur p-3 shadow-2xl z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Notifications</div>
            <button
              className="text-xs text-slate-300 hover:text-slate-100"
              onClick={async () => { await alertsApi.markRead(); await load(); }}
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
            {alerts.slice(0, 20).map(a => (
              <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium">{a.title}</div>
                  {!a.read && <div className="h-2 w-2 rounded-full bg-amber-300" />}
                </div>
                <div className="text-xs text-slate-300 mt-1">{a.body}</div>
              </div>
            ))}
            {!alerts.length && <div className="text-sm text-slate-300">No alerts yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
