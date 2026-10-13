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
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background min-h-0">
        {!messages.length ? (
          <div className="h-full grid place-items-center text-center text-sm font-semibold text-muted-foreground">
            <div><MessageCircle className="w-8 h-8 mx-auto mb-2" />Noch keine Nachrichten. Schreib als erste:r!</div>
          </div>
        ) : messages.map((m) => {
          const mine = m.isMine;
          const file = isFileMsg(m.text);
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <span className="text-[10px] font-semibold text-muted-foreground mb-0.5 ml-1">{peerName}</span>}
              <div className={`flex items-end gap-1 ${mine ? "flex-row-reverse" : ""}`}>
                {file ? (
                  <div className={`brutal px-3 py-2 max-w-[75%] ${mine ? "bg-black text-white" : "bg-white"}`}>
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
                  <div className={`max-w-[75%] brutal px-2.5 py-1 text-xs ${mine ? "bg-black text-white" : "bg-white"}`}>{m.text}</div>
                )}
                {mine && onDelete && (
                  <button onClick={() => onDelete(m.id)} className="opacity-30 hover:opacity-100 transition-opacity p-0.5">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="border-t-2 border-black p-2 flex gap-2 bg-white">
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="brutal-btn bg-white px-2.5 py-1 flex items-center" title="Datei senden">
          {uploading ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`Nachricht an ${peerName || "..."}…`} className="flex-1 border-2 border-black rounded-lg px-2.5 py-1 text-sm font-semibold bg-white" />
        <button onClick={send} className="brutal-btn bg-[#FDFFB6] px-2.5 py-1 flex items-center gap-1"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
