import React, { useState } from "react";
import Account from "./Account";
import EmailDigestSettings from "../components/EmailDigestSettings";
import TopicTagsManager from "../components/TopicTagsManager";

export default function Settings({ me, onUpdated }) {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", name: "Account", icon: "👤" },
    { id: "notifications", name: "Notifications", icon: "📧" },
    { id: "tags", name: "Topic Tags", icon: "🏷️" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl smooth-transition font-medium ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "account" && <Account me={me} onUpdated={onUpdated} />}
        {activeTab === "notifications" && <EmailDigestSettings />}
        {activeTab === "tags" && <TopicTagsManager />}
      </div>
    </div>
  );
}
