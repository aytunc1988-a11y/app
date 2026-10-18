import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Loader2, MapPin, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { toast } from "sonner";

import { base44 as db } from "@/api/base44Client";
import { CANTONS } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import { useAuth } from "@/lib/AuthContext";
import { useAppTheme } from "@/lib/AppThemeContext";
import { Image as UiImage } from "@/components/ui/image";

const LABEL = "modern-profile-label";
const INPUT = "modern-profile-input";

export default function Profile() {
  const { user } = useCurrentUser();
  const { refreshUser } = useAuth();
  const { theme, setTheme } = useAppTheme();
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
  const [savingTheme, setSavingTheme] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const chooseTheme = async (value) => {
    if (value === theme || savingTheme) return;
    setTheme(value);
    setSavingTheme(true);
    try {
      await db.auth.updateMe({ theme: value });
      await refreshUser();
      toast.success("App-Design gespeichert");
    } catch {
      toast.error("App-Design konnte nicht im Profil gespeichert werden. Die Auswahl bleibt auf diesem Gerät aktiv.");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleThemeKeyDown = (event) => {
    if (!["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const nextTheme = theme === "light" ? "dark" : "light";
    chooseTheme(nextTheme);
    document.getElementById(`profile-theme-${nextTheme}`)?.focus();
  };

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
    // GPS Koordinaten erfassen
    let lat = null, lng = null;
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch(e) {}
    setSaving(true);
    const payload = {
      age: form.age === "" ? null : Number(form.age),
      canton: form.canton,
      ort: form.ort,
      bio: form.bio,
      profile_picture: form.profile_picture,
      full_name: form.full_name,
      invisible: form.invisible,
      lat, lng,
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
          lat: lat, lng: lng,
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
    <div className="modern-page modern-profile">
      <header className="modern-profile-heading">
        <div>
          <p className="modern-profile-eyebrow">DEIN KONTO</p>
          <h1 className="font-heading text-2xl sm:text-4xl">Dein Profil</h1>
          <p>Verwalte deine Angaben und entscheide, was andere sehen.</p>
        </div>
        <div className="modern-profile-secure"><ShieldCheck className="h-4 w-4" /> Deine Angaben</div>
      </header>

      <section className="modern-profile-identity" aria-label="Profilübersicht">
        <div className="modern-profile-avatar">
          {form.profile_picture ? (
            <UiImage src={form.profile_picture} fittingType="cover" className="h-full w-full" />
          ) : (
            <UserRound className="h-9 w-9" />
          )}
        </div>
        <div className="modern-profile-identity-copy">
          <span>PROFIL</span>
          <h2>{form.full_name || "Dein Name"}</h2>
          <p>{user?.email}</p>
          {(form.ort || form.canton) && <div><MapPin className="h-3.5 w-3.5" /> {[form.ort, form.canton].filter(Boolean).join(", ")}</div>}
        </div>
        <span className="modern-profile-complete"><Check className="h-3.5 w-3.5" /> Bearbeitbar</span>
      </section>

      <section className="modern-profile-form-card">
        <div className="modern-profile-section-heading">
          <div><h2>Persönliche Angaben</h2><p>Diese Informationen helfen deiner Community, dich kennenzulernen.</p></div>
        </div>
        <div className="modern-profile-form">
          <div className="modern-profile-photo">
            <div className="modern-profile-photo-frame">
              {form.profile_picture ? (
                <UiImage src={form.profile_picture} fittingType="cover" className="w-full h-full" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </div>
            <label className="brutal-btn modern-profile-upload">
              {uploading ? "Lädt…" : "Bild ändern"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} disabled={uploading} />
            </label>
          </div>
          <div className="modern-profile-fields">
            <label className="modern-profile-field">
              <span className={LABEL}>Name</span>
              <input id="profile-name" autoComplete="name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={INPUT} />
            </label>
            <div className="modern-profile-field modern-profile-readonly">
              <span className={LABEL}>E-Mail</span>
              <p>{user?.email || "Keine E-Mail hinterlegt"}</p>
            </div>
            <label className="modern-profile-field">
              <span className={LABEL}>Alter</span>
              <input id="profile-age" type="number" min="16" max="99" value={form.age} onChange={(e) => set("age", e.target.value)} className={INPUT} />
            </label>
            <label className="modern-profile-field">
              <span className={LABEL}>Kanton</span>
              <select id="profile-canton" value={form.canton} onChange={(e) => set("canton", e.target.value)} className={INPUT}>
                <option value="">– wählen –</option>
                {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="modern-profile-field modern-profile-field-wide">
              <span className={LABEL}>Ort</span>
              <input id="profile-town" autoComplete="address-level2" value={form.ort} onChange={(e) => set("ort", e.target.value)} className={INPUT} />
            </label>
            <label className="modern-profile-field modern-profile-field-wide">
              <span className={LABEL}>Über mich</span>
              <textarea id="profile-bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} className={INPUT} />
            </label>
          </div>
        </div>
        <div className="modern-profile-privacy">
          <div className="modern-profile-privacy-icon"><ShieldCheck className="h-5 w-5" /></div>
          <div className="modern-profile-privacy-copy">
            <strong>Privatsphäre</strong>
            <span>Unsichtbar schaltet dein Profil in der Leute-Übersicht aus.</span>
          </div>
          <button type="button" role="switch" aria-checked={form.invisible} aria-label="Profil in der Leute-Übersicht unsichtbar machen" onClick={() => set("invisible", !form.invisible)}
            className={`modern-profile-switch ${form.invisible ? "is-on" : ""}`}>
            <span />
          </button>
        </div>
        <div className="modern-profile-save-row">
          <span>Änderungen werden in deinem Profil gespeichert.</span>
          <button onClick={save} disabled={saving} className="brutal-btn modern-profile-save">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {saving ? "Wird gespeichert…" : "Änderungen speichern"}
          </button>
        </div>
      </section>
      <section className="modern-profile-theme-card" aria-labelledby="profile-theme-heading">
        <div className="modern-profile-section-heading">
          <div>
            <h2 id="profile-theme-heading">App-Design</h2>
            <p>Wähle die Darstellung, die dir am besten gefällt.</p>
          </div>
        </div>
        <div className="modern-theme-options" role="radiogroup" aria-labelledby="profile-theme-heading">
          <button id="profile-theme-light" type="button" role="radio" tabIndex={theme === "light" ? 0 : -1} aria-checked={theme === "light"} disabled={savingTheme} onKeyDown={handleThemeKeyDown} onClick={() => chooseTheme("light")}
            className={`modern-theme-option ${theme === "light" ? "is-selected" : ""}`}>
            <span className="modern-theme-swatch modern-theme-swatch-light" aria-hidden="true"><Sun /></span>
            <span className="modern-theme-option-copy"><strong>Hell</strong><span>Das aktuelle LAPQUIZ-Design</span></span>
            <span className="modern-theme-radio" aria-hidden="true" />
          </button>
          <button id="profile-theme-dark" type="button" role="radio" tabIndex={theme === "dark" ? 0 : -1} aria-checked={theme === "dark"} disabled={savingTheme} onKeyDown={handleThemeKeyDown} onClick={() => chooseTheme("dark")}
            className={`modern-theme-option ${theme === "dark" ? "is-selected" : ""}`}>
            <span className="modern-theme-swatch modern-theme-swatch-dark" aria-hidden="true"><Moon /></span>
            <span className="modern-theme-option-copy"><strong>Neon Night</strong><span>Dunkel mit leuchtend grünen Akzenten</span></span>
            <span className="modern-theme-radio" aria-hidden="true" />
          </button>
        </div>
        <p className="modern-theme-note">Die Auswahl wird sofort angewendet und direkt in deinem Profil gespeichert.</p>
      </section>
    </div>
  );
}
