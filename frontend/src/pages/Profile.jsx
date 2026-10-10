import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { base44 as db } from "@/api/base44Client";
import { CANTONS } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import { useAuth } from "@/lib/AuthContext";
import { Image as UiImage } from "@/components/ui/image";

const LABEL = "text-[10px] font-bold uppercase tracking-widest";
const INPUT = "w-full mt-0.5 border-2 border-black rounded-lg px-2.5 py-1.5 text-sm font-bold bg-white";

export default function Profile() {
  const { user } = useCurrentUser();
  const { refreshUser } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: user?.full_name || user?.name || "",
    age: user?.age ?? "",
    canton: user?.canton || "",
    ort: user?.ort || "",
    bio: user?.bio || "",
    invisible: user?.invisible || false,
    profile_picture: user?.profile_picture || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (user) setForm({
      full_name: user.full_name || user.name || "",
      age: user.age ?? "",
      canton: user.canton || "",
      ort: user.ort || "",
      bio: user.bio || "",
      invisible: user.invisible || false,
      profile_picture: user.profile_picture || "",
    });
  }, [user?.user_id, user?.name]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      set("profile_picture", file_url);
    } catch (e) {
      toast.error("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      age: form.age === "" ? null : Number(form.age),
      canton: form.canton,
      ort: form.ort,
      bio: form.bio,
      profile_picture: form.profile_picture,
      full_name: form.full_name,
      invisible: form.invisible,
    };
    try {
      await db.auth.updateMe(payload);
      // LiebeProfile sync
      try {
        const existing = await db.entities.LiebeProfile.filter({ created_by_id: user.user_id }, null, 1);
        const profileData = {
          full_name: payload.name || user.name,
          age: payload.age,
          canton: payload.canton,
          ort: payload.ort,
          bio: payload.bio,
          profile_picture: payload.profile_picture || "",
          profession: payload.profession || user.profession,
          invisible: payload.invisible,
        };
        if (existing && existing.length > 0) {
          await db.entities.LiebeProfile.update(existing[0].id, profileData);
        } else {
          await db.entities.LiebeProfile.create(profileData);
        }
      } catch(e) { console.warn("LiebeProfile sync failed", e); }
      await refreshUser();
      await qc.invalidateQueries();
      toast.success("Profil gespeichert");
    } catch (e) {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PROFIL</p>
      <h1 className="font-heading text-xl sm:text-3xl">Dein Profil</h1>

      <div className="brutal bg-white p-3 mt-2 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-16 h-16 border-2 border-black rounded-xl overflow-hidden bg-[#FDFFB6] grid place-items-center">
              {form.profile_picture ? (
                <UiImage src={form.profile_picture} fittingType="cover" className="w-full h-full" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </div>
            <label className="brutal-btn bg-white px-2 py-0.5 text-[10px] cursor-pointer">
              {uploading ? "Lädt…" : "Bild ändern"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} disabled={uploading} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <label className={LABEL}>Name</label>
            <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={INPUT} />
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LABEL}>Alter</label>
            <input type="number" min="16" max="99" value={form.age} onChange={(e) => set("age", e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Kanton</label>
            <select value={form.canton} onChange={(e) => set("canton", e.target.value)} className={INPUT}>
              <option value="">– wählen –</option>
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={LABEL}>Ort</label>
          <input value={form.ort} onChange={(e) => set("ort", e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Bio</label>
          <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={2} className={`${INPUT} font-semibold`} />
        </div>
      </div>

      <div className="flex items-center justify-between border-2 border-black rounded-lg px-3 py-2 bg-white mt-2">
          <span className="font-bold text-sm">Unsichtbar (nicht in Leute anzeigen)</span>
          <button type="button" onClick={() => set("invisible", !form.invisible)}
            className={`w-12 h-6 rounded-full border-2 border-black transition-all ${form.invisible ? "bg-black" : "bg-[#CAFFBF]"}`}>
            <div className={`w-4 h-4 bg-white rounded-full border-2 border-black transition-all mx-0.5 ${form.invisible ? "translate-x-6" : ""}`} />
          </button>
        </div>
        <button onClick={save} disabled={saving} className="brutal-btn bg-black text-white w-full py-3 mt-3 font-heading flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null} Speichern
      </button>
    </div>
  );
}
