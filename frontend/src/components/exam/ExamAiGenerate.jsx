import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db, AI_MODELS } from "@/api/base44Client";
import { getSubject } from "@/lib/subjects";

export default function ExamAiGenerate({ subject, topic, onDone }) {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(5);
  const [model, setModel] = useState(AI_MODELS[0].id);
  const qc = useQueryClient();
  const subjectObj = getSubject(subject);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await db.ai.generateQuestions({ subjectName: subjectObj?.name || subject, topic, count, model });
      const created = await db.entities.UserQuestion.bulkCreate(
        (res.questions || []).map((q) => ({ ...q, options: q.type === "gap" ? [] : q.options, subject, source: "ai_generated" }))
      );
      qc.invalidateQueries({ queryKey: ["userQuestions"] });
      toast.success(`${created.length} KI-Fragen generiert`);
      onDone(created.map((q) => q.id));
    } catch (e) { toast.error("KI-Generierung fehlgeschlagen"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold uppercase tracking-widest shrink-0">KI-Modell</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="flex-1 border-2 border-black rounded-lg px-2 py-2 font-bold bg-white text-xs">
          {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <div className="shrink-0">
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="h-full border-2 border-black rounded-xl px-3 py-3 font-bold bg-white" aria-label="Anzahl">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading} className="brutal-btn bg-[#9BF6FF] flex-1 px-5 py-3 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? "KI generiert…" : `${count} KI-Fragen generieren`}
        </button>
      </div>
    </div>
  );
}
