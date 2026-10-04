import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { db } from "@/api/base44Client";
import { QUESTION_JSON_SCHEMA, QUESTION_RULES } from "@/lib/subjects";

export default function AiGenerateButton({ subject }) {
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const generate = async () => {
    setLoading(true);
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `Du erstellst Prüfungsfragen für KV-Lehrlinge in der Schweiz im Fach "${subject.name}".
Erstelle 5 neue, abwechslungsreiche und fachlich korrekte Fragen, gemischt aus den Typen mc, tf und gap.
${QUESTION_RULES}`,
        response_json_schema: QUESTION_JSON_SCHEMA,
      });
      await db.entities.Question.bulkCreate(
        res.questions.map((q) => ({ ...q, options: q.type === "gap" ? [] : q.options, subject: subject.id, source: "ai_generated" }))
      );
      qc.invalidateQueries({ queryKey: ["questions"] });
      toast.success(`${res.questions.length} neue Fragen hinzugefügt`);
    } catch (e) {
      toast.error("KI-Generierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={generate} disabled={loading} className="brutal-btn w-full bg-black text-white px-5 py-3 flex items-center justify-center gap-2">
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
      {loading ? "KI generiert…" : "Fragen generieren (Admin)"}
    </button>
  );
}
