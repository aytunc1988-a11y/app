import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { db } from "@/api/base44Client";
import { SUBJECTS, getSubject, QUESTION_JSON_SCHEMA, QUESTION_RULES } from "@/lib/subjects";
import QuestionEditor from "@/components/photo/QuestionEditor";

const blank = (subject) => ({ type: "mc", question: "", options: ["", "", "", ""], correct_answer: "", explanation: "", subject, source: "user_photo" });

export default function PhotoImportDialog({ open, onOpenChange }) {
  const qc = useQueryClient();
  const [stage, setStage] = useState("pick");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [items, setItems] = useState([]);

  const reset = () => { setStage("pick"); setFile(null); setPreview(null); setItems([]); };
  const close = (o) => { if (!o) reset(); onOpenChange(o); };
  const handleFile = (f) => { if (!f) return; setFile(f); setPreview(URL.createObjectURL(f)); };

  const analyze = async () => {
    if (!file) return;
    setStage("loading");
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `Du analysierst ein Foto von Lernunterlagen für die LAP-Vorbereitung.
Erstelle daraus passende Prüfungsfragen zum Fach "${getSubject(subject).name}".
${QUESTION_RULES}`,
        response_json_schema: QUESTION_JSON_SCHEMA,
        file_urls: [file_url],
      });
      const qs = (res.questions || []).map((q) => ({ ...q, options: q.type === "gap" ? [] : q.options, subject, source: "user_photo" }));
      setItems(qs.length ? qs : [blank(subject)]);
      setStage("editing");
    } catch (e) {
      toast.error("Analyse fehlgeschlagen");
      setStage("pick");
    }
  };

  const updateItem = (i, patch) => setItems((prev) => prev.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const removeItem = (i) => setItems((prev) => prev.filter((_, j) => j !== i));
  const addItem = () => setItems((prev) => [...prev, blank(subject)]);

  const save = async () => {
    const valid = items.filter((q) => q.question?.trim() && q.correct_answer?.trim());
    if (!valid.length) { toast.error("Mindestens eine vollständige Frage (Frage + Antwort) nötig."); return; }
    setStage("saving");
    try {
      await db.entities.UserQuestion.bulkCreate(valid.map((q) => ({ ...q, subject })));
      qc.invalidateQueries({ queryKey: ["userQuestions"] });
      toast.success(`${valid.length} Frage(n) gespeichert`);
      close(false);
    } catch (e) { toast.error("Speichern fehlgeschlagen"); setStage("editing"); }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="brutal max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Foto importieren</DialogTitle>
        </DialogHeader>

        {stage === "pick" && (
          <div className="space-y-4">
            <div className="text-[11px] font-semibold bg-[#9BF6FF] border-2 border-black rounded-lg px-2 py-1">Demo: Die KI-Analyse ist gemockt und liefert Beispielfragen.</div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Fach</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
                {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <label className="brutal-btn bg-[#FDFFB6] w-full py-4 font-heading flex items-center justify-center gap-2 cursor-pointer">
              <Camera className="w-5 h-5" /> Foto wählen
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </label>
            {preview && <img src={preview} alt="Vorschau" className="w-full brutal object-contain max-h-48" />}
            <button onClick={analyze} disabled={!file} className="brutal-btn bg-black text-white w-full py-3">Fragen aus Foto erstellen</button>
          </div>
        )}

        {stage === "loading" && (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-semibold text-sm">KI analysiert dein Foto…</p>
          </div>
        )}

        {(stage === "editing" || stage === "saving") && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Fach</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
                {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {items.map((q, i) => (
              <QuestionEditor key={i} q={q} onChange={(patch) => updateItem(i, patch)} onRemove={() => removeItem(i)} />
            ))}
            <button onClick={addItem} className="brutal-btn bg-white w-full py-3 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Frage hinzufügen</button>
          </div>
        )}

        {stage !== "loading" && (
          <DialogFooter className="gap-2">
            <button onClick={() => close(false)} className="brutal-btn bg-white px-4 py-2 flex items-center gap-1"><X className="w-4 h-4" /> Abbrechen</button>
            {stage === "editing" && (
              <button onClick={save} disabled={stage === "saving"} className="brutal-btn bg-[#FDFFB6] px-4 py-2">{stage === "saving" ? "Speichern…" : "Speichern"}</button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
