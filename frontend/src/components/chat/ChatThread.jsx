import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";

export default function ChatThread({ messages, peerName, onSend }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background min-h-0">
        {!messages.length ? (
          <div className="h-full grid place-items-center text-center text-sm font-semibold text-muted-foreground"><div><MessageCircle className="w-8 h-8 mx-auto mb-2" />Noch keine Nachrichten. Schreib als erste:r!</div></div>
        ) : messages.map((m) => {
          const mine = m.isMine;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <span className="text-[10px] font-semibold text-muted-foreground mb-0.5 ml-1">{peerName}</span>}
              <div className={`max-w-[75%] brutal px-2.5 py-1 text-xs ${mine ? "bg-black text-white" : "bg-white"}`}>{m.text}</div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="border-t-2 border-black p-2 flex gap-2 bg-white">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`Nachricht an ${peerName || "..."}…`} className="flex-1 border-2 border-black rounded-lg px-2.5 py-1 text-sm font-semibold bg-white" />
        <button onClick={send} className="brutal-btn bg-[#FDFFB6] px-2.5 py-1 flex items-center gap-1"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
