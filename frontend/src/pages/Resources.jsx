import React, { useEffect, useState } from "react";
import PremiumCard from "../components/PremiumCard";
import { resourcesApi } from "../api/resources";
import { tagsApi } from "../api/tags";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [tags, setTags] = useState([]);
  const [newResource, setNewResource] = useState({ title: "", url: "", description: "", tags: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [resData, tagData] = await Promise.all([
          resourcesApi.list(),
          tagsApi.getTags()
        ]);
        setResources(resData || []);
        setTags(tagData || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleCreate = async () => {
    if (!newResource.title || !newResource.url) return;
    try {
      const created = await resourcesApi.create(newResource);
      setResources(prev => [...prev, created]);
      setNewResource({ title: "", url: "", description: "", tags: [] });
    } catch (e) {
      alert("Error adding resource: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Resource Library</h1>
        <p className="text-slate-400 mt-1">
          Organize links, PDFs, videos, and notes by topic
        </p>
      </div>

      <PremiumCard title="Add New Resource">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title (e.g. Quantum Mechanics Notes)"
            value={newResource.title}
            onChange={e => setNewResource(prev => ({ ...prev, title: e.target.value }))}
            className="glass-input w-full"
          />
          <input
            type="url"
            placeholder="URL or file link"
            value={newResource.url}
            onChange={e => setNewResource(prev => ({ ...prev, url: e.target.value }))}
            className="glass-input w-full"
          />
          <textarea
            placeholder="Description (optional)"
            value={newResource.description}
            onChange={e => setNewResource(prev => ({ ...prev, description: e.target.value }))}
            className="glass-input w-full h-24"
          />
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    const selected = newResource.tags.includes(tag.id)
                      ? newResource.tags.filter(id => id !== tag.id)
                      : [...newResource.tags, tag.id];
                    setNewResource(prev => ({ ...prev, tags: selected }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm smooth-transition ${
                    newResource.tags.includes(tag.id)
                      ? "bg-indigo-500/40 border-indigo-400"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleCreate}
            className="btn-primary px-6 py-2"
          >
            Add Resource
          </button>
        </div>
      </PremiumCard>

      <PremiumCard title="Your Resources">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No resources yet — add some above!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map(res => (
              <div 
                key={res.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 smooth-transition"
              >
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-white hover:text-indigo-300 block"
                >
                  {res.title}
                </a>
                {res.description && (
                  <p className="text-sm text-slate-400 mt-1">{res.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {res.tags?.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <span 
                        key={tag.id}
                        className="text-xs px-2 py-1 rounded-full bg-white/5"
                        style={{ color: tag.color, borderColor: tag.color, borderWidth: 1 }}
                      >
                        {tag.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
