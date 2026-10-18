import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Trash2, Paperclip, Download, BookOpen } from "lucide-react";
import { db } from "@/api/base44Client";
import { toast } from "sonner";

export default function ChatThread({ messages, peerName, onSend, onDelete, onImportExam }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      onSend(`📎 [${file.name}](${file_url})`);
    } catch (err) {
      toast.error("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const isFileMsg = (text) => {
    const m = text?.match(/^📎 \[(.+?)\]\((.+?)\)$/);
    return m ? { name: m[1], url: m[2] } : null;
  };

  const isJsonExam = (name) => name?.endsWith(".json");

  const importExam = async (url, name) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data?.type === "lapquiz_exams" && onImportExam) {
        onImportExam(data);
        toast.success("Prüfung importiert!");
      } else {
        toast.error("Kein gültiger Prüfungsexport");
      }
    } catch {
      toast.error("Import fehlgeschlagen");
    }
  };

  return (
    <div className="modern-chat-messages">
      <div className="modern-chat-message-list">
        {!messages.length ? (
          <div className="modern-chat-no-messages">
            <div><MessageCircle className="h-8 w-8 mx-auto mb-2" />Noch keine Nachrichten. Schreib als erste:r!</div>
          </div>
        ) : messages.map((m) => {
          const mine = m.isMine;
          const file = isFileMsg(m.text);
          return (
            <div key={m.id} className={`modern-chat-message ${mine ? "is-mine" : ""}`}>
              {!mine && <span className="modern-chat-message-author">{peerName}</span>}
              <div className={`modern-chat-message-row ${mine ? "is-mine" : ""}`}>
                {file ? (
                  <div className={`modern-chat-bubble modern-chat-file ${mine ? "is-mine" : ""}`}>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[140px]">{file.name}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <a href={file.url} download={file.name} className={`brutal-btn text-[10px] px-2 py-1 flex items-center gap-1 font-bold ${mine ? "bg-white text-black" : "bg-[#9BF6FF]"}`}>
                        <Download className="w-3 h-3" /> Laden
                      </a>
                      {!mine && isJsonExam(file.name) && onImportExam && (
                        <button onClick={() => importExam(file.url, file.name)} className="brutal-btn bg-[#CAFFBF] text-[10px] px-2 py-1 flex items-center gap-1 font-bold text-black">
                          <BookOpen className="w-3 h-3" /> Importieren
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`modern-chat-bubble ${mine ? "is-mine" : ""}`}>{m.text}</div>
                )}
                {mine && onDelete && (
                  <button onClick={() => onDelete(m.id)} className="modern-chat-message-delete" aria-label="Nachricht löschen">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="modern-chat-composer">
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="brutal-btn modern-chat-attach" title="Datei senden" aria-label="Datei anhängen">
          {uploading ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`Nachricht an ${peerName || "..."}…`} className="modern-chat-input" aria-label={`Nachricht an ${peerName || "Kontakt"}`} />
        <button onClick={send} className="brutal-btn modern-chat-send" aria-label="Nachricht senden"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
