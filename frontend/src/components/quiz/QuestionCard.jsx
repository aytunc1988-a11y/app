import React, { useState } from "react";
import { TYPE_LABELS, isCorrect } from "@/lib/subjects";

export default function QuestionCard({ q, answer, onAnswer, reveal = true, locked }) {
  const [gap, setGap] = useState(answer || "");
  const isLocked = locked !== undefined ? locked : answer !== null;
  const options = q.type === "tf" ? ["Wahr", "Falsch"] : q.options || [];

  const optionClass = (opt) => {
    if (answer === null) return "bg-white hover:bg-[#FDFFB6] hover:-translate-y-0.5";
    if (!reveal) return opt === answer ? "bg-[#FDFFB6]" : "bg-white opacity-60";
    if (isCorrect(q, opt)) return "bg-[#CAFFBF]";
    if (opt === answer) return "bg-[#FFADAD]";
    return "bg-white opacity-60";
  };

  return (
    <div className="brutal bg-white p-6">
      <span className="text-xs font-bold uppercase tracking-widest bg-black text-white px-2 py-1 rounded-md">{TYPE_LABELS[q.type]}</span>
      <h2 className="font-heading text-xl md:text-2xl mt-4 leading-snug">{q.question}</h2>

      {q.type === "gap" ? (
        <form onSubmit={(e) => { e.preventDefault(); if (gap.trim()) onAnswer(gap); }} className="mt-6 flex gap-2">
          <input value={gap} onChange={(e) => setGap(e.target.value)} disabled={isLocked} placeholder="Deine Antwort…" className="flex-1 min-w-0 border-2 border-black rounded-lg px-4 py-3 font-semibold bg-white" autoFocus />
          <button type="submit" disabled={isLocked || !gap.trim()} className="brutal-btn bg-[#FDFFB6] px-5">OK</button>
        </form>
      ) : (
        <div className={`grid gap-3 mt-6 ${q.type === "tf" ? "grid-cols-2" : ""}`}>
          {options.map((opt) => (
            <button key={opt} disabled={isLocked} onClick={() => onAnswer(opt)} className={`text-left border-2 border-black rounded-xl px-4 py-3 font-semibold shadow-[3px_3px_0_0_#000] transition-all ${optionClass(opt)}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
