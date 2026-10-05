import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera, Upload, FileText, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/api/base44Client";
import { AI_MODELS } from "@/api/base44Client";
import { getSubject, professionSubjects } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import QuestionEditor from "@/components/photo/QuestionEditor";

const blank = (subject) => ({ type: "mc", question: "", options: ["", "", "", ""], correct_answer: "", explanation: "", subject, source: "user_photo" });

export default function PhotoImportDialog({ open, onOpenChange }) {
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const subjects = professionSubjects(user?.profession || "kaufmann");
  const [stage, setStage] = useState("pick");
  const [file, setFile] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [preview, setPreview] = useState(null);
  const [subject, setSubject] = useState(subjects[0]?.id);
  const [model, setModel] = useState(AI_MODELS[0].id);
  const [items, setItems] = useState([]);

  const reset = () => { setStage("pick"); setFile(null); setPreview(null); setItems([]); setIsPdf(false); };
  const close = (o) => { if (!o) reset(); onOpenChange(o); };
  const handleFile = (f, pdf) => { if (!f) return; setFile(f); setIsPdf(pdf); setPreview(pdf ? null : URL.createObjectURL(f)); };

  const analyze = async () => {
    if (!file) return;
    setStage("loading");
    try {
      const b64 = await db.fileToDataUrl(file);
      const payload = { subjectName: getSubject(subject)?.name || subject, model };
      if (isPdf) payload.pdfBase64 = b64; else payload.imageBase64 = b64;
      const res = await db.ai.generateQuestions(payload);
      const qs = (res.questions || []).map((q) => ({ ...q, options: q.type === "gap" ? [] : q.options, subject, source: "user_photo" }));
      setItems(qs.length ? qs : [blank(subject)]);
      setStage("editing");
    } catch (e) { toast.error("Analyse fehlgeschlagen"); setStage("pick"); }
  };

  const updateItem = (i, patch) => setItems((prev) => prev.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const removeItem = (i) => setItems((prev) => prev.filter((_, j) => j !== i));
  const addItem = () => setItems((prev) => [...prev, blank(subject)]);

  const save = async () => {
    const valid = items.filter((q) => q.question?.trim() && q.correct_answer?.trim());
    if (!valid.length) { toast.error("Mindestens eine vollständige Frage nötig."); return; }
    setStage("saving");
    try {
      await db.entities.UserQuestion.bulkCreate(valid.map((q) => ({ ...q, subject })));
      qc.invalidateQueries({ queryKey: ["userQuestions"] });
      toast.success(`${valid.length} Frage(n) gespeichert`); close(false);
    } catch (e) { toast.error("Speichern fehlgeschlagen"); setStage("editing"); }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="brutal max-w-lg">
        <DialogHeader><DialogTitle className="font-heading text-xl">Importieren → KI-Fragen</DialogTitle></DialogHeader>
        {stage === "pick" && (
          <div className="space-y-4">
            <div><label className="text-xs font-bold uppercase tracking-widest">Fach</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            <div><label className="text-xs font-bold uppercase tracking-widest">KI-Modell</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
                {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select></div>
            <p className="text-[11px] font-semibold text-muted-foreground">Die KI erkennt automatisch, wie viele Fragen der Inhalt hergibt.</p>
            <div className="grid grid-cols-3 gap-2">
              <label className="brutal-btn bg-[#FDFFB6] py-3 flex flex-col items-center gap-1 cursor-pointer text-xs"><Camera className="w-5 h-5" /> Kamera<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0], false)} /></label>
              <label className="brutal-btn bg-white py-3 flex flex-col items-center gap-1 cursor-pointer text-xs"><Upload className="w-5 h-5" /> Bild<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0], false)} /></label>
              <label className="brutal-btn bg-white py-3 flex flex-col items-center gap-1 cursor-pointer text-xs"><FileText className="w-5 h-5" /> PDF<input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0], true)} /></label>
            </div>
            {preview && <img src={preview} alt="" className="w-full brutal object-contain max-h-48" />}
            {isPdf && file && <div className="brutal bg-[#CAFFBF] p-2 text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> {file.name}</div>}
            <button onClick={analyze} disabled={!file} className="brutal-btn bg-black text-white w-full py-3">Fragen aus Datei erstellen</button>
          </div>
        )}
        {stage === "loading" && <div className="py-12 flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 animate-spin" /><p className="font-semibold text-sm">KI analysiert…</p></div>}
        {(stage === "editing" || stage === "saving") && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {items.map((q, i) => <QuestionEditor key={i} q={q} onChange={(patch) => updateItem(i, patch)} onRemove={() => removeItem(i)} />)}
            <button onClick={addItem} className="brutal-btn bg-white w-full py-3 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Frage hinzufügen</button>
          </div>
        )}
        {stage !== "loading" && (
          <DialogFooter className="gap-2">
            <button onClick={() => close(false)} className="brutal-btn bg-white px-4 py-2 flex items-center gap-1"><X className="w-4 h-4" /> Abbrechen</button>
            {stage === "editing" && <button onClick={save} className="brutal-btn bg-[#FDFFB6] px-4 py-2">Speichern</button>}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
