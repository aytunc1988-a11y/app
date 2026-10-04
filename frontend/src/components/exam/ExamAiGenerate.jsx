import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { db } from "@/api/base44Client";
import { getSubject, QUESTION_JSON_SCHEMA, QUESTION_RULES } from "@/lib/subjects";

export default function ExamAiGenerate({ subject, topic, onDone }) {
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();
  const subjectObj = getSubject(subject);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `Du erstellst Prüfungsfragen für KV-Lehrlinge in der Schweiz (LAP-Vorbereitung, Kaufmann/Kauffrau EFZ).
Fach: ${subjectObj.name}.
Thema: ${topic || "allgemein, passend zum Fach"}.
Erstelle 5 neue, abwechslungsreiche und fachlich korrekte Fragen, gemischt aus mc, tf und gap.
${QUESTION_RULES}`,
        response_json_schema: QUESTION_JSON_SCHEMA,
      });
      const created = await db.entities.UserQuestion.bulkCreate(
        res.questions.map((q) => ({ ...q, options: q.type === "gap" ? [] : q.options, subject, source: "ai_generated" }))
      );
      qc.invalidateQueries({ queryKey: ["userQuestions"] });
      toast.success(`${res.questions.length} KI-Fragen generiert`);
      onDone(created.map((q) => q.id));
    } catch (e) {
      toast.error("KI-Generierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={generate} disabled={loading} className="brutal-btn bg-[#9BF6FF] w-full px-5 py-3 flex items-center justify-center gap-2">
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
      {loading ? "KI generiert…" : "KI-Fragen generieren"}
    </button>
  );
}
