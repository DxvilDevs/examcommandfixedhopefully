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
        setErr("");
        setMsg("");
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
    <div className="glass-card p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-4">{doc?.title || "Legal Document"}</h1>
      
      {err && (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {err}
        </div>
      )}
      {msg && (
        <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {msg}
        </div>
      )}

      {doc && (
        <div className="mt-6">
          {isOwner ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  className="glass-input w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
                <textarea
                  className="glass-input w-full min-h-[400px] font-mono text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              
              <button
                className="btn-primary"
                onClick={async () => {
                  try {
                    setErr("");
                    setMsg("");
                    const updated = await legalApi.update(key, { title, content });
                    setDoc(updated);
                    setMsg("Document updated successfully.");
                  } catch (e) {
                    setErr(e.message);
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="prose prose-invert prose-slate max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-white/5 rounded-2xl p-6 border border-white/10">
                {doc.content}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
