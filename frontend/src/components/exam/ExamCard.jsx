import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Clock, Play, BookOpen, Download } from "lucide-react";
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
    <div className="brutal bg-white p-5 flex items-center justify-between gap-3">
      <Link to={"/pruefung/" + exam.id} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={"text-[10px] font-bold uppercase tracking-widest border-2 border-black rounded-md px-1.5 py-0.5 " + (isExam ? "bg-[#FFADAD]" : "bg-[#CAFFBF]")}>
            {isExam ? "Prüfung" : "Lernen"}
          </span>
          {isExam && exam.timer_minutes ? (
            <span className="text-[10px] font-bold flex items-center gap-0.5">
              <Clock className="w-3 h-3" />{exam.timer_minutes}′
            </span>
          ) : null}
        </div>
        <div className="font-heading text-lg mt-1 truncate">{exam.title}</div>
        <div className="text-xs font-semibold text-muted-foreground mt-0.5">{(exam.question_ids || []).length} Fragen</div>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        <Link to={"/pruefung/" + exam.id + "/karten"} className="brutal-btn bg-[#CAFFBF] px-3 py-2 flex items-center gap-1 text-sm" title="Karteikarten">
          <BookOpen className="w-4 h-4" />
        </Link>
        <Link to={"/pruefung/" + exam.id} className="brutal-btn bg-[#FDFFB6] px-3 py-2 flex items-center gap-1 text-sm">
          <Play className="w-4 h-4" /> Start
        </Link>
        <button onClick={exportSingle} className="p-2 border-2 border-black rounded-lg hover:bg-[#9BF6FF] transition-colors" title="Exportieren">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-2 border-2 border-black rounded-lg hover:bg-[#FFADAD] transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
