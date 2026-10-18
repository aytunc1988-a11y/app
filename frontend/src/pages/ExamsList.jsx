import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Camera, Upload, Download, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { db } from "@/api/base44Client";
import ExamCard from "@/components/exam/ExamCard";
import LearnTabs from "@/components/home/LearnTabs";
import FragenImportPanel from "@/components/exam/FragenImportPanel";

const SUB = [
  { id: "neu", label: "Neue Prüfung", icon: Plus },
  { id: "fragen", label: "Fragen importieren", icon: Camera },
];

export default function ExamsList() {
  const qc = useQueryClient();
  const [sub, setSub] = useState("neu");
  const fileRef = useRef(null);
  const { data: exams = [], isLoading } = useQuery({ queryKey: ["exams"], queryFn: () => db.entities.CustomExam.list("-created_date", 500) });

  const remove = async (id) => {
    await db.entities.CustomExam.delete(id);
    qc.invalidateQueries({ queryKey: ["exams"] });
  };

  const exportExams = async () => {
    if (!exams.length) return;
    const allQ = await db.entities.UserQuestion.list("-created_date", 3000);
    const byId = Object.fromEntries(allQ.map((q) => [q.id, q]));
    const items = exams.map((e) => ({
      title: e.title, mode: e.mode, timer_minutes: e.timer_minutes || 0,
      questions: (e.question_ids || []).map((id) => byId[id]).filter(Boolean).map(({ id, created_by_id, created_by, created_date, ...q }) => q),
    }));
    const blob = new Blob([JSON.stringify({ type: "lapquiz_exams", items }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lapquiz-pruefungen.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importExams = async (file) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const items = Array.isArray(parsed) ? parsed : parsed.items || [];
      let count = 0;
      for (const ex of items) {
        const qs = (ex.questions || []).filter((q) => q.question && q.correct_answer);
        let ids = [];
        if (qs.length) {
          const created = await db.entities.UserQuestion.bulkCreate(qs.map((q) => ({
            subject: q.subject || "rechnungswesen", type: q.type || "mc",
            options: q.type === "gap" ? [] : (q.options || []), question: q.question,
            correct_answer: q.correct_answer, explanation: q.explanation || "", source: "ai_generated",
          })));
          ids = created.map((c) => c.id);
        }
        await db.entities.CustomExam.create({ title: ex.title || "Importierte Prüfung", mode: ex.mode || "learn", timer_minutes: ex.timer_minutes || 0, question_ids: ids });
        count++;
      }
      qc.invalidateQueries({ queryKey: ["exams"] });
      qc.invalidateQueries({ queryKey: ["userQuestions"] });
      if (count) toast.success(`${count} Prüfung(en) importiert`);
      else toast.error("Keine gültigen Prüfungen in der Datei");
    } catch (e) { toast.error("Import fehlgeschlagen – ungültige Datei"); }
  };

  return (
    <div className="modern-page modern-exams">
      <LearnTabs />
      <section className="modern-exams-hero">
        <div>
          <span className="modern-learning-eyebrow"><Sparkles className="h-3.5 w-3.5" /> DEIN LERNBEREICH</span>
          <h1 className="font-heading">Prüfungen</h1>
          <p>Erstelle eigene Prüfungen oder lerne mit deinen Fragen.</p>
        </div>
        <div className="modern-exams-tools">
          <button onClick={exportExams} disabled={!exams.length} className="brutal-btn modern-exam-tool bg-white"><Download className="h-4 w-4" /> Export</button>
          <button onClick={() => fileRef.current?.click()} className="brutal-btn modern-exam-tool bg-white"><Upload className="h-4 w-4" /> Import</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => importExams(e.target.files?.[0])} />
        </div>
      </section>

      <div className="modern-exam-tabs" role="tablist" aria-label="Prüfungen verwalten">
        {SUB.map((t) => (
          <button key={t.id} role="tab" aria-selected={sub === t.id} onClick={() => setSub(t.id)} className={`modern-exam-tab ${sub === t.id ? "is-active" : ""}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {sub === "neu" ? (
        <div className="modern-exam-content">
          <div className="modern-exam-create">
            <div className="modern-exam-create-icon"><FileText className="h-5 w-5" /></div>
            <div><h2>Deine nächste Prüfung</h2><p>Stelle Fragen zusammen und übe in deinem eigenen Tempo.</p></div>
            <Link to="/pruefung/neu" className="brutal-btn modern-exam-create-button bg-[#FDFFB6]">
              <Plus className="h-4 w-4" /> Neue Prüfung
            </Link>
          </div>
          <div className="modern-exam-list-heading"><h2>Deine Prüfungen</h2><span>{exams.length} {exams.length === 1 ? "Prüfung" : "Prüfungen"}</span></div>

          {isLoading ? (
            <div className="grid place-items-center py-12"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>
          ) : exams.length === 0 ? (
            <div className="modern-exams-empty"><div><FileText className="h-6 w-6" /></div><h2>Noch keine Prüfungen</h2><p>Erstelle deine erste eigene Prüfung oder importiere eine bestehende Datei.</p></div>
          ) : (
            <div className="modern-exam-list">
              {exams.map((e, i) => <ExamCard key={e.id} exam={e} index={i} onDelete={() => remove(e.id)} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3"><FragenImportPanel /></div>
      )}
    </div>
  );
}
