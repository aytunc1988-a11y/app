import React, { useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/api/base44Client";
import { getSubject } from "@/lib/subjects";
import FragenImportPanel from "@/components/exam/FragenImportPanel";

function downloadBlob(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function MeineFragen() {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const { data: mine = [] } = useQuery({ queryKey: ["userQuestions"], queryFn: () => db.entities.UserQuestion.list("-created_date", 2000) });

  const exportJson = () => {
    if (!mine.length) return toast.error("Keine Fragen zum Exportieren");
    const data = mine.map(({ id, created_by_id, created_by, created_date, ...q }) => q);
    downloadBlob("lapquiz-fragen.json", JSON.stringify({ type: "lapquiz_questions", items: data }, null, 2), "application/json");
    toast.success(`${data.length} Fragen exportiert (JSON)`);
  };

  const exportPdf = () => {
    if (!mine.length) return toast.error("Keine Fragen zum Exportieren");
    const rows = mine.map((q, i) => `<div style="margin:0 0 14px;padding:10px;border:2px solid #000;border-radius:10px"><b>${i + 1}. [${getSubject(q.subject)?.name || q.subject}] ${q.question}</b><br/>${(q.options || []).join(" · ")}<br/>✅ ${q.correct_answer}${q.explanation ? `<br/><i>${q.explanation}</i>` : ""}</div>`).join("");
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>LAP QUIZ – Meine Fragen</title></head><body style="font-family:Arial;padding:24px"><h1>LAP QUIZ – Meine Fragen (${mine.length})</h1>${rows}<script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  };

  const importJson = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : parsed.items || [];
      const valid = items.filter((q) => q.question && q.correct_answer).map((q) => ({
        subject: q.subject || "rechnungswesen", type: q.type || "mc", question: q.question,
        options: q.type === "gap" ? [] : (q.options || []), correct_answer: q.correct_answer,
        explanation: q.explanation || "", source: "ai_generated",
      }));
      if (!valid.length) return toast.error("Keine gültigen Fragen in der Datei");
      await db.entities.UserQuestion.bulkCreate(valid);
      qc.invalidateQueries({ queryKey: ["userQuestions"] });
      toast.success(`${valid.length} Fragen importiert`);
    } catch (e) { toast.error("Import fehlgeschlagen – ungültige Datei"); }
  };

  return (
    <div>
      <h1 className="font-heading text-xl sm:text-3xl">Meine Fragen</h1>
      <p className="font-semibold text-muted-foreground text-xs mt-1">Foto, Bild oder PDF importieren – die KI macht daraus Lernfragen.</p>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <button onClick={exportJson} className="brutal-btn bg-white py-2 text-xs flex items-center justify-center gap-1"><Download className="w-3.5 h-3.5" /> JSON</button>
        <button onClick={exportPdf} className="brutal-btn bg-white py-2 text-xs flex items-center justify-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF</button>
        <button onClick={() => fileRef.current?.click()} className="brutal-btn bg-[#CAFFBF] py-2 text-xs flex items-center justify-center gap-1"><Upload className="w-3.5 h-3.5" /> Import</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => importJson(e.target.files?.[0])} />
      </div>
      <div className="mt-3"><FragenImportPanel /></div>
    </div>
  );
}
