import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Lock, Unlock, Copy, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function Admin() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [maxUses, setMaxUses] = useState(0);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ["licenses"], queryFn: () => db.admin.listLicenses(), enabled: user?.role === "admin",
  });
  const { data: stats } = useQuery({
    queryKey: ["adminStats"], queryFn: () => db.admin.stats(), enabled: user?.role === "admin",
  });

  if (loading) return <div className="grid place-items-center py-24"><div className="w-10 h-10 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;
  if (user && user.role !== "admin") return <Navigate to="/faecher" replace />;

  const refresh = () => { qc.invalidateQueries({ queryKey: ["licenses"] }); qc.invalidateQueries({ queryKey: ["adminStats"] }); };

  const create = async () => {
    setBusy(true);
    try {
      const lic = await db.admin.createLicense({ code: custom.trim() || null, note, max_uses: Number(maxUses) || 0 });
      toast.success(`Code erstellt: ${lic.code}`);
      setNote(""); setMaxUses(0); setCustom(""); refresh();
    } catch (e) { toast.error(e?.response?.data?.detail || "Erstellen fehlgeschlagen"); }
    finally { setBusy(false); }
  };

  const toggle = async (l) => { await db.admin.updateLicense(l.id, { active: !l.active }); refresh(); };
  const remove = async (l) => { if (!window.confirm(`Code ${l.code} löschen?`)) return; await db.admin.deleteLicense(l.id); refresh(); };
  const copy = (code) => { navigator.clipboard?.writeText(code); toast.success("Code kopiert"); };

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="w-9 h-9 grid place-items-center border-2 border-black rounded-lg bg-[#FDFFB6]"><KeyRound className="w-5 h-5" /></span>
        <h1 className="font-heading text-xl sm:text-3xl">Lizenz-Verwaltung</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[["Nutzer", stats?.total_users], ["Freigeschaltet", stats?.licensed_users], ["Codes", stats?.total_codes], ["Aktiv", stats?.active_codes]].map(([l, v]) => (
          <div key={l} className="brutal bg-white p-3"><div className="font-heading text-2xl">{v ?? "–"}</div><div className="text-[10px] font-bold uppercase tracking-widest">{l}</div></div>
        ))}
      </div>

      <div className="brutal bg-[#FDFFB6] p-4 mt-4">
        <h2 className="font-heading text-lg">Neuen Code erstellen</h2>
        <div className="grid sm:grid-cols-3 gap-2 mt-3">
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Code (leer = automatisch)" className="border-2 border-black rounded-lg px-3 py-2 font-bold bg-white uppercase" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz (optional)" className="border-2 border-black rounded-lg px-3 py-2 font-semibold bg-white" />
          <input type="number" min="0" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Max. Nutzungen (0 = ∞)" className="border-2 border-black rounded-lg px-3 py-2 font-bold bg-white" />
        </div>
        <button onClick={create} disabled={busy} className="brutal-btn bg-black text-white w-full py-2.5 mt-3 flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Code erstellen
        </button>
      </div>

      <h2 className="font-heading text-lg mt-5 mb-2">Alle Codes</h2>
      {isLoading ? (
        <div className="grid place-items-center py-10"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {licenses.map((l) => (
            <div key={l.id} className={`brutal p-3 flex items-center justify-between gap-3 ${l.active ? "bg-white" : "bg-[#f1ece0] opacity-80"}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base tracking-wide">{l.code}</span>
                  <button onClick={() => copy(l.code)} className="p-1 border-2 border-black rounded bg-white" aria-label="Kopieren"><Copy className="w-3 h-3" /></button>
                  <span className={`text-[9px] font-bold border-2 border-black rounded-full px-1.5 ${l.active ? "bg-[#CAFFBF]" : "bg-[#FFADAD]"}`}>{l.active ? "aktiv" : "gesperrt"}</span>
                </div>
                <div className="text-xs font-semibold text-muted-foreground mt-0.5 truncate">
                  {l.note || "–"} · Nutzungen: {l.uses || 0}{l.max_uses ? ` / ${l.max_uses}` : " (∞)"}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(l)} className="p-2 border-2 border-black rounded-lg bg-white hover:bg-[#FDFFB6]" aria-label="Sperren/Aktivieren">
                  {l.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(l)} className="p-2 border-2 border-black rounded-lg bg-white hover:bg-[#FFADAD]" aria-label="Löschen"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {!licenses.length && <div className="brutal bg-white p-4 text-center font-semibold text-sm">Noch keine Codes.</div>}
        </div>
      )}
    </div>
  );
}
