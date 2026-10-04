import React from "react";
import { Trash2 } from "lucide-react";
import { TYPE_LABELS } from "@/lib/subjects";

const field = "w-full border-2 border-black rounded-lg px-3 py-2 text-sm bg-white";

export default function QuestionEditor({ q, onChange, onRemove }) {
  const set = (patch) => onChange({ ...q, ...patch });
  return (
    <div className="border-2 border-black rounded-xl p-4 bg-[#FAFAF5] space-y-2">
      <div className="flex items-center gap-2">
        <select value={q.type} onChange={(e) => set({ type: e.target.value, options: e.target.value === "tf" ? ["Wahr", "Falsch"] : e.target.value === "gap" ? [] : q.options?.length === 4 ? q.options : ["", "", "", ""] })} className={`${field} font-bold`}>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={onRemove} className="p-2 border-2 border-black rounded-lg bg-white hover:bg-[#FFADAD]"><Trash2 className="w-4 h-4" /></button>
      </div>
      <textarea value={q.question} onChange={(e) => set({ question: e.target.value })} rows={2} className={field} placeholder="Frage" />
      {q.type === "mc" && (q.options || []).map((o, i) => (
        <input key={i} value={o} onChange={(e) => set({ options: q.options.map((x, j) => (j === i ? e.target.value : x)) })} className={field} placeholder={`Option ${i + 1}`} />
      ))}
      {q.type === "tf" ? (
        <select value={q.correct_answer} onChange={(e) => set({ correct_answer: e.target.value })} className={field}>
          <option value="Wahr">Richtige Antwort: Wahr</option>
          <option value="Falsch">Richtige Antwort: Falsch</option>
        </select>
      ) : q.type === "mc" ? (
        <select value={q.correct_answer} onChange={(e) => set({ correct_answer: e.target.value })} className={field}>
          <option value="">Richtige Antwort wählen…</option>
          {(q.options || []).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input value={q.correct_answer} onChange={(e) => set({ correct_answer: e.target.value })} className={field} placeholder="Richtige Antwort" />
      )}
      <textarea value={q.explanation || ""} onChange={(e) => set({ explanation: e.target.value })} rows={2} className={field} placeholder="Erklärung" />
    </div>
  );
}
