import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Clock, Play, BookOpen, Download, FileText } from "lucide-react";
import { db } from "@/api/base44Client";
import { toast } from "sonner";

export default function ExamCard({ exam, index, onDelete }) {
  const isExam = exam.mode === "exam";

  const exportSingle = async () => {
    try {
      const allQ = await db.entities.UserQuestion.list("-created_date", 3000);
      const byId = Object.fromEntries(allQ.map((q) => [q.id, q]));
      const item = {
        title: exam.title, mode: exam.mode, timer_minutes: exam.timer_minutes || 0,
        questions: (exam.question_ids || []).map((id) => byId[id]).filter(Boolean)
          .map(({ id, created_by_id, created_by, created_date, ...q }) => q),
      };
      const blob = new Blob([JSON.stringify({ type: "lapquiz_exams", items: [item] }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = exam.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".json";
      a.click(); URL.revokeObjectURL(url);
    } catch(e) { toast.error("Export fehlgeschlagen"); }
  };

  return (
    <article className="modern-exam-card">
      <div className="modern-exam-card-icon"><FileText className="h-5 w-5" /></div>
      <Link to={"/pruefung/" + exam.id} className="modern-exam-card-content">
        <div className="flex items-center gap-2">
          <span className={"modern-exam-mode " + (isExam ? "is-exam" : "is-learning")}>
            {isExam ? "Prüfung" : "Lernen"}
          </span>
          {isExam && exam.timer_minutes ? (
            <span className="text-[10px] font-bold flex items-center gap-0.5">
              <Clock className="w-3 h-3" />{exam.timer_minutes}′
            </span>
          ) : null}
        </div>
        <div className="modern-exam-title">{exam.title}</div>
        <div className="modern-exam-meta">{(exam.question_ids || []).length} Fragen</div>
      </Link>
      <div className="modern-exam-card-actions">
        <Link to={"/pruefung/" + exam.id + "/karten"} className="brutal-btn modern-exam-icon-action" title="Karteikarten" aria-label="Karteikarten öffnen">
          <BookOpen className="w-4 h-4" />
        </Link>
        <Link to={"/pruefung/" + exam.id} className="brutal-btn modern-exam-start">
          <Play className="h-4 w-4" /> Starten
        </Link>
        <button onClick={exportSingle} className="modern-exam-icon-action" title="Exportieren" aria-label="Prüfung exportieren">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="modern-exam-icon-action is-destructive" aria-label="Prüfung löschen">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
