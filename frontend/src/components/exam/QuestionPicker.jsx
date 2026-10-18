import React from "react";
import { Check } from "lucide-react";
import { TYPE_LABELS, getSubject } from "@/lib/subjects";

export default function QuestionPicker({ questions, selected, onToggle }) {
  if (!questions.length) {
    return <p className="text-sm font-semibold text-muted-foreground py-4">Noch keine eigenen Fragen. Importiere ein Foto oder generiere welche mit der KI.</p>;
  }
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {questions.map((q) => {
        const checked = selected.has(q.id);
        return (
          <button key={q.id} onClick={() => onToggle(q.id)} className={`w-full text-left border-2 border-black rounded-lg p-3 flex items-start gap-3 transition-all ${checked ? "bg-[#FDFFB6]" : "bg-white hover:bg-[#FAFAF5]"}`}>
            <span className={`w-5 h-5 shrink-0 mt-0.5 border-2 border-black rounded grid place-items-center ${checked ? "bg-black" : "bg-white"}`}>{checked && <Check className="w-3 h-3 text-white" />}</span>
            <span className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest">{TYPE_LABELS[q.type]} · {getSubject(q.subject)?.short}</span>
              <span className="block text-sm font-semibold truncate">{q.question}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}