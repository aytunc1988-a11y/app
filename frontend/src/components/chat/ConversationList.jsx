import React from "react";

const AVATAR_COLORS = ["#FDFFB6", "#CAFFBF", "#9BF6FF", "#FFADAD", "#BDB2FF", "#FFD6A5"];

export default function ConversationList({ conversations, activeKey, onSelect }) {
  if (!conversations.length) return <div className="p-6 text-center font-semibold text-muted-foreground text-sm">Noch keine Unterhaltungen.</div>;
  return (
    <div className="divide-y-2 divide-black">
      {conversations.map((c, i) => {
        const initials = (c.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <button key={c.key} onClick={() => onSelect(c.key)} className={`w-full flex items-center gap-2 p-2 text-left transition-colors ${activeKey === c.key ? "bg-[#FDFFB6]" : "hover:bg-black/5"}`}>
            <div className="w-9 h-9 rounded-full border-2 border-black grid place-items-center font-heading shrink-0 overflow-hidden" style={{ background: color }}>
              {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold truncate text-sm">{c.name || "Unbekannt"}</div>
              <div className="text-xs text-muted-foreground truncate">{c.subtitle || c.lastText || ""}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
