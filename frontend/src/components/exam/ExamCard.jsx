import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Clock, Play } from "lucide-react";

export default function ExamCard({ exam, index, onDelete }) {
  const isExam = exam.mode === "exam";
  return (
    <div className="brutal bg-white p-5 flex items-center justify-between gap-3">
      <Link to={`/pruefung/${exam.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest border-2 border-black rounded-md px-1.5 py-0.5 ${isExam ? "bg-[#FFADAD]" : "bg-[#CAFFBF]"}`}>
            {isExam ? "Prüfung" : "Lernen"}
          </span>
          {isExam && exam.timer_minutes ? (
            <span className="text-[10px] font-bold flex items-center gap-0.5">
              <Clock className="w-3 h-3" />{exam.timer_minutes}′
            </span>
          ) : null}
        </div>
        <div className="font-heading text-lg mt-1 truncate">{exam.title}</div>
        <div className="text-xs font-semibold text-muted-foreground mt-0.5">
          {(exam.question_ids || []).length} Fragen
        </div>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        <Link to={`/pruefung/${exam.id}`} className="brutal-btn bg-[#FDFFB6] px-3 py-2 flex items-center gap-1 text-sm">
          <Play className="w-4 h-4" /> Start
        </Link>
        <button onClick={onDelete} className="p-2 border-2 border-black rounded-lg hover:bg-[#FFADAD] transition-colors" aria-label="Prüfung löschen">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
