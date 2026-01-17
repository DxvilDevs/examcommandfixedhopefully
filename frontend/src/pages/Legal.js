import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { legalApi } from "../api/legal";

export default function Legal({ me }) {
  const { key } = useParams();
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const isOwner = me?.role === "OWNER";

  useEffect(() => {
    (async () => {
      try {
        setErr(""); setMsg("");
        const r = await legalApi.get(key);
        setDoc(r);
        setTitle(r.title);
        setContent(r.content);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [key]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="text-lg font-semibold">{doc?.title || "Legal"}</div>
      {err && <div className="mt-4 text-sm text-red-200">{err}</div>}
      {msg && <div className="mt-4 text-sm text-green-200">{msg}</div>}

      {doc && (
        <div className="mt-4">
          {isOwner ? (
            <div className="space-y-3">
              <input
                className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full min-h-[260px] rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button
                className="rounded-xl px-3 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
                onClick={async () => {
                  try {
                    setErr(""); setMsg("");
                    const updated = await legalApi.update(key, { title, content });
                    setDoc(updated);
                    setMsg("Updated.");
                  } catch (e) { setErr(e.message); }
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-slate-200">{doc.content}</pre>
          )}
        </div>
      )}
    </div>
  );
}
