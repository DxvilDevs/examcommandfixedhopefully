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

  useEffect(() => {
    load();
  }, []);

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="relative">
      <button
        className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 relative"
        onClick={() => setOpen((v) => !v)}
      >
        <span>🔔</span>
        <span className="hidden sm:inline">Alerts</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-[10px] font-bold text-white flex items-center justify-center shadow-lg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-[360px] rounded-3xl border border-white/10 glass-card shadow-2xl z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Notifications</h3>
                <button
                  className="text-xs text-slate-400 hover:text-white smooth-transition"
                  onClick={async () => {
                    await alertsApi.markRead();
                    await load();
                  }}
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
                {alerts.slice(0, 20).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-medium text-white">{a.title}</div>
                      {!a.read && (
                        <div className="h-2 w-2 rounded-full bg-amber-400 pulse-glow flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{a.body}</div>
                  </div>
                ))}
                {!alerts.length && (
                  <div className="text-sm text-slate-400 text-center py-8">
                    No alerts yet. You're all caught up! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
