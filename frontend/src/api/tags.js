// ============================================
// tags.js
// ============================================
export const tagsApi = {
  async getTags() {
    return api("/tags");
  },

  async createTag(name, color) {
    return api("/tags", {
      method: "POST",
      body: JSON.stringify({ name, color })
    });
  },

  async updateTag(id, data) {
    return api(`/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deleteTag(id) {
    return api(`/tags/${id}`, {
      method: "DELETE"
    });
  },

  async attachTag(tagId, entityType, entityId) {
    return api(`/tags/${tagId}/attach`, {
      method: "POST",
      body: JSON.stringify({ entityType, entityId })
    });
  },

  async detachTag(tagId, entityType, entityId) {
    return api(`/tags/${tagId}/detach`, {
      method: "DELETE",
      body: JSON.stringify({ entityType, entityId })
    });
  }
};
