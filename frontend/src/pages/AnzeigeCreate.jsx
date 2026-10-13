import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

import { db } from "@/api/base44Client";
import { PROFESSIONS, CANTONS } from "@/lib/subjects";
import { useQuery } from "@tanstack/react-query";
import useCurrentUser from "@/lib/useCurrentUser";

export default function AnzeigeCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const qc = useQueryClient();
  const isEdit = !!id;
  const { user } = useCurrentUser();
  const { data: exams = [] } = useQuery({ queryKey: ["exams"], queryFn: () => db.entities.CustomExam.list("-created_date", 500) });
  const [exportingExam, setExportingExam] = useState(false);

  const attachExam = async (examId) => {
    if (!examId) return;
    setExportingExam(true);
    try {
      const ex = exams.find(e => e.id === examId);
      const allQ = await db.entities.UserQuestion.list("-created_date", 3000);
      const byId = Object.fromEntries(allQ.map((q) => [q.id, q]));
      const item = {
        title: ex.title, mode: ex.mode, timer_minutes: ex.timer_minutes || 0,
        questions: (ex.question_ids || []).map((id) => byId[id]).filter(Boolean)
          .map(({ id, created_by_id, created_by, created_date, ...q }) => q),
      };
      const json = JSON.stringify({ type: "lapquiz_exams", items: [item] }, null, 2);
      const file = new File([json], ex.title.replace(/[^a-z0-9]/gi,"_")+".json", { type: "application/json" });
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      setAttachment({ url: file_url, name: ex.title + ".json" });
      set("title", ex.title);
      set("description", "Prüfungsdaten: " + ex.title + " (" + (ex.question_ids||[]).length + " Fragen)");
    } catch(e) { toast.error("Export fehlgeschlagen"); }
    finally { setExportingExam(false); }
  };
  const [form, setForm] = useState({ title: "", description: "", profession: user?.profession || "kaufmann", canton: user?.canton || "", ort: user?.ort || "", price: "" });
  const [image, setImage] = useState("");
  const [attachment, setAttachment] = useState({ url: "", name: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadDoc = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.length === 1) {
      const url = await db.fileToDataUrl(files[0]);
      setAttachment({ url, name: files[0].name });
      return;
    }
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
        uploaded.push({ url: file_url, name: file.name });
      }
      setAttachment({ url: JSON.stringify(uploaded), name: uploaded.map(u => u.name).join(", ") });
    } catch { toast.error("Upload fehlgeschlagen"); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!id) return;
    db.entities.Listing.get(id).then((ad) => {
      if (!ad) return;
      setForm({ title: ad.title || "", description: ad.description || "", profession: ad.profession || "kaufmann", canton: ad.canton || "", ort: ad.ort || "", price: ad.price ?? "" });
      setImage(ad.image_url || "");
      setAttachment({ url: ad.attachment_url || "", name: ad.attachment_name || "" });
    });
  }, [id]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try { const { file_url } = await db.integrations.Core.UploadPublicFile({ file }); setImage(file_url); }
    catch { toast.error("Upload fehlgeschlagen"); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Bitte einen Titel eingeben."); return; }
    setSaving(true);
    try {
      const data = { title: form.title.trim(), description: form.description, profession: form.profession, canton: form.canton, ort: form.ort, price: form.price === "" ? null : Number(form.price), image_url: image, attachment_url: attachment.url, attachment_name: attachment.name, active: true };
      if (isEdit) {
        await db.entities.Listing.update(id, data);
        await qc.invalidateQueries({ queryKey: ["listings"] });
        await qc.invalidateQueries({ queryKey: ["listing", id] });
        toast.success("Inserat gespeichert");
        navigate(`/anzeigen/${id}`);
        return;
      }
      const ad = await db.entities.Listing.create(data);
      toast.success("Inserat veröffentlicht");
      navigate(`/anzeigen/${ad.id}`);
    } catch (e) { toast.error("Speichern fehlgeschlagen"); setSaving(false); }
  };

  return (
    <div>
      <button onClick={() => navigate("/anzeigen")} className="brutal-btn bg-white px-3 py-2 inline-flex items-center gap-1 text-sm mb-5"><ArrowLeft className="w-4 h-4" /> Zurück</button>
      <h1 className="font-heading text-2xl sm:text-3xl">{isEdit ? "Inserat bearbeiten" : "Inserat aufgeben"}</h1>

      <div className="space-y-4 mt-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Bild</label>
          <label className="brutal-btn bg-white w-full py-4 mt-1 flex items-center justify-center gap-2 cursor-pointer">
            <Camera className="w-5 h-5" /> {uploading ? "Lädt…" : (image ? "Bild ändern" : "Bild wählen")}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} disabled={uploading} />
          </label>
          {image && <img src={image} alt="" className="w-full brutal mt-2 max-h-48 object-cover" />}
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Datei anhängen (z.B. Prüfungsunterlagen – PDF/Bild)</label>
          <label className="brutal-btn bg-white w-full py-3 mt-1 flex items-center justify-center gap-2 cursor-pointer text-sm">
            <Camera className="w-4 h-4" /> {attachment.name ? "Datei ändern" : "Datei wählen"}
            <input type="file" accept="application/pdf,image/*,application/json" multiple className="hidden" onChange={uploadDoc} />
          </label>
          {attachment.name && <div className="brutal bg-[#CAFFBF] p-2 mt-2 text-sm font-bold truncate">📎 {attachment.name}</div>}
          {exams.length > 0 && (
            <div className="mt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Eigene Prüfung anhängen</label>
              <select onChange={(e) => attachExam(e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white text-sm" defaultValue="">
                <option value="">– Prüfung wählen –</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.title} ({(e.question_ids||[]).length} Fragen)</option>)}
              </select>
              {exportingExam && <p className="text-xs font-semibold mt-1">Exportiere…</p>}
            </div>
          )}
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Titel</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white" placeholder="z.B. Lehrbücher Rechnungswesen" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Beschreibung</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-semibold bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Rubrik (Beruf)</label>
            <select value={form.profession} onChange={(e) => set("profession", e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
              {PROFESSIONS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Preis (CHF)</label>
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white" placeholder="0 = gratis" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Kanton</label>
            <select value={form.canton} onChange={(e) => set("canton", e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
              <option value="">– wählen –</option>
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Ort</label>
            <input value={form.ort} onChange={(e) => set("ort", e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white" />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="brutal-btn bg-[#FDFFB6] w-full py-4 font-heading flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null} {isEdit ? "Speichern" : "Veröffentlichen"}</button>
      </div>
    </div>
  );
}
