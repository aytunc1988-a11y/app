import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, ArrowLeft } from "lucide-react";
import { isCorrect, formatDuration, TYPE_LABELS } from "@/lib/subjects";

export default function ExamSummary({ exam, questions, answers, seconds, timeUp, onRestart }) {
  const answered = questions.filter((q) => answers[q.id] != null).length;
  const correct = questions.filter((q) => isCorrect(q, answers[q.id])).length;
  const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
      <div className={`brutal p-8 text-center ${exam.mode === "exam" ? "bg-[#FFADAD]" : "bg-[#CAFFBF]"}`}>
        <p className="font-bold uppercase tracking-widest text-sm">{timeUp ? "Zeit abgelaufen" : "Prüfung beendet"}</p>
        <div className="font-heading text-7xl mt-4">{pct}%</div>
        <p className="font-semibold mt-2">{exam.title}</p>
        <p className="text-sm font-bold mt-1">{correct} / {questions.length} richtig · {formatDuration(seconds)}</p>
      </div>

      <button onClick={() => setReviewOpen((v) => !v)} className="w-full text-center text-sm font-bold underline mt-4">
        {reviewOpen ? "Auswertung ausblenden" : "Auswertung ansehen"}
      </button>

      {reviewOpen && (
        <div className="space-y-3 mt-4">
          {questions.map((q, i) => {
            const ans = answers[q.id];
            const ok = isCorrect(q, ans);
            return (
              <div key={q.id} className={`brutal p-4 ${ok ? "bg-[#CAFFBF]" : "bg-[#FFADAD]"}`}>
                <div className="flex items-start gap-2">
                  {ok ? <Check className="w-5 h-5 shrink-0 mt-0.5" /> : <X className="w-5 h-5 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{TYPE_LABELS[q.type]}</span>
                    <p className="font-semibold text-sm mt-0.5">{i + 1}. {q.question}</p>
                    <p className="text-sm mt-1">Deine Antwort: <span className="font-bold">{ans || "–"}</span></p>
                    {!ok && <p className="text-sm">Korrekt: <span className="font-bold">{q.correct_answer.split("|")[0]}</span></p>}
                    {q.explanation && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button onClick={onRestart} className="brutal-btn bg-[#FDFFB6] py-3 flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Nochmal</button>
        <Link to="/pruefungen" className="brutal-btn bg-white py-3 text-center flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Übersicht</Link>
      </div>
    </motion.div>
  );
}
