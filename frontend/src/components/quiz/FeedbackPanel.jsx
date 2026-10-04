import React from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

export default function FeedbackPanel({ correct, q, onNext, isLast }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`brutal p-5 mt-5 ${correct ? "bg-[#CAFFBF]" : "bg-[#FFADAD]"}`}>
      <div className="flex items-center gap-2 font-heading text-lg">
        {correct ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
        {correct ? "Richtig!" : "Leider falsch"}
      </div>
      {!correct && <p className="mt-2 font-semibold">Korrekt: {q.correct_answer.split("|")[0]}</p>}
      {q.explanation && <p className="mt-2 text-sm leading-relaxed">{q.explanation}</p>}
      <button onClick={onNext} className="brutal-btn bg-white w-full mt-4 py-3 flex items-center justify-center gap-2">
        {isLast ? "Auswertung" : "Weiter"} <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
