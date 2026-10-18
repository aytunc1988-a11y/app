import React from "react";

const AVATAR_COLORS = ["#FDFFB6", "#CAFFBF", "#9BF6FF", "#FFADAD", "#BDB2FF", "#FFD6A5"];

export default function ConversationList({ conversations, activeKey, onSelect }) {
  if (!conversations.length) return <div className="p-6 text-center font-semibold text-muted-foreground text-sm">Noch keine Unterhaltungen.</div>;
  return (
    <div className="modern-chat-conversation-list">
      {conversations.map((c, i) => {
        const initials = (c.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <button key={c.key} onClick={() => onSelect(c.key)} aria-pressed={activeKey === c.key} className={"modern-chat-conversation " + (activeKey === c.key ? "is-active" : "")}>
            <div className="relative">
              <div className="modern-chat-conversation-avatar" style={{ background: color }}>
                {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> : initials}
              </div>
              {c.unread > 0 && (
                <span className="modern-chat-unread">
                  {c.unread > 9 ? "9+" : c.unread}
                </span>
              )}
            </div>
            <div className="modern-chat-conversation-copy">
              <div className={"truncate text-sm " + (c.unread > 0 ? "font-black" : "font-bold")}>{c.name || "Unbekannt"}</div>
              <div className={"modern-chat-conversation-subtitle " + (c.unread > 0 ? "has-unread" : "")}>{c.subtitle || c.lastText || ""}</div>
            </div>
            {c.unread > 0 && (
              <span className="modern-chat-unread-dot" />
            )}
          </button>
        );
      })}
    </div>
  );
}
