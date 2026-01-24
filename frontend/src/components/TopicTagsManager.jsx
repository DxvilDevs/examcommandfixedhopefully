import React, { useState, useEffect } from "react";

// Mock API
const tagsApi = {
  async getTags() {
    return [
      { id: 1, name: "Mathematics", color: "#6366f1", count: 45 },
      { id: 2, name: "Physics", color: "#8b5cf6", count: 32 },
      { id: 3, name: "Chemistry", color: "#ec4899", count: 28 },
      { id: 4, name: "Biology", color: "#10b981", count: 19 },
      { id: 5, name: "English", color: "#f59e0b", count: 15 },
    ];
  },
  
  async createTag(name, color) {
    return { id: Date.now(), name, color, count: 0 };
  },
  
  async updateTag(id, data) {
    console.log("Updating tag", id, data);
  },
  
  async deleteTag(id) {
    console.log("Deleting tag", id);
  }
};

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#ef4444", // Red
  "#84cc16", // Lime
];

export default function TopicTagsManager() {
  const [tags, setTags] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    tagsApi.getTags().then(setTags);
  }, []);

  async function createTag() {
    if (!newTagName.trim()) return;
    
    const tag = await tagsApi.createTag(newTagName.trim(), newTagColor);
    setTags([...tags, tag]);
    setNewTagName("");
    setNewTagColor(PRESET_COLORS[0]);
    setShowCreate(false);
  }

  async function deleteTag(id) {
    if (!confirm("Delete this tag? This will remove it from all associated items.")) return;
    
    await tagsApi.deleteTag(id);
    setTags(tags.filter(t => t.id !== id));
  }

  return (
    <div className="glass-card p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Topic Tags</h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize your study topics with color-coded tags
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary text-sm"
        >
          + New Tag
        </button>
      </div>

      {/* Tags Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.map(tag => (
          <div
            key={tag.id}
            className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <div className="flex-1 font-medium text-white">{tag.name}</div>
              
              <div className="opacity-0 group-hover:opacity-100 smooth-transition flex gap-1">
                <button
                  onClick={() => setEditingTag(tag)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-xs text-slate-400">
              {tag.count} {tag.count === 1 ? 'item' : 'items'}
            </div>
          </div>
        ))}
      </div>

      {!tags.length && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏷️</div>
          <div className="text-lg font-semibold text-white mb-2">No tags yet</div>
          <div className="text-sm text-slate-400 mb-6">
            Create tags to organize your study topics
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreate || editingTag) && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              setShowCreate(false);
              setEditingTag(null);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">
                {editingTag ? "Edit Tag" : "Create New Tag"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tag Name
                  </label>
                  <input
                    className="glass-input w-full"
                    placeholder="e.g. Advanced Calculus"
                    value={editingTag ? editingTag.name : newTagName}
                    onChange={e => editingTag 
                      ? setEditingTag({...editingTag, name: e.target.value})
                      : setNewTagName(e.target.value)
                    }
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => editingTag
                          ? setEditingTag({...editingTag, color})
                          : setNewTagColor(color)
                        }
                        className={`w-10 h-10 rounded-xl smooth-transition ${
                          (editingTag?.color || newTagColor) === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a1f] scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                {editingTag && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Preview:</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: editingTag.color }}
                      />
                      <span className="text-sm text-white">{editingTag.name || "Tag Name"}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setEditingTag(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingTag) {
                      tagsApi.updateTag(editingTag.id, editingTag);
                      setTags(tags.map(t => t.id === editingTag.id ? editingTag : t));
                      setEditingTag(null);
                    } else {
                      createTag();
                    }
                  }}
                  className="btn-primary flex-1"
                >
                  {editingTag ? "Save" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Usage Instructions */}
      <div className="mt-6 p-4 rounded-2xl border border-indigo-400/20 bg-indigo-500/5">
        <div className="text-sm font-medium text-white mb-2">💡 Pro Tip</div>
        <div className="text-xs text-slate-400">
          Tags will appear when creating tasks, flashcards, and logging revisions. 
          Use them to filter and organize your study materials by subject or topic area.
        </div>
      </div>
    </div>
  );
}
