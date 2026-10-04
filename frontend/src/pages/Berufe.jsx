import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { db } from "@/api/base44Client";
import { PROFESSIONS, getSubject } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import { useAuth } from "@/lib/AuthContext";

export default function Berufe() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(null);

  const choose = async (id) => {
    setSaving(id);
    try {
      await db.auth.updateMe({ profession: id });
      await refreshUser();
      await qc.invalidateQueries();
      navigate("/faecher");
    } catch (e) {
      toast.error("Speichern fehlgeschlagen");
      setSaving(null);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/faecher")} className="font-heading text-lg flex items-center gap-2 mb-4"><ArrowLeft className="w-5 h-5" /> Fächer</button>
      <h1 className="font-heading text-2xl sm:text-3xl">Beruf wählen</h1>
      <p className="text-sm font-semibold text-muted-foreground mt-1">Die passenden Fächer erscheinen sofort.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        {PROFESSIONS.map((p) => {
          const selected = (user?.profession || "kaufmann") === p.id;
          return (
            <button key={p.id} onClick={() => choose(p.id)} disabled={saving === p.id} className={`brutal p-3 text-left transition-all ${selected ? "bg-[#FDFFB6]" : "bg-white"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-9 h-9 shrink-0 grid place-items-center border-2 border-black rounded-lg font-heading text-lg ${p.bg}`}>{p.emoji}</span>
                  <span className="font-heading text-sm leading-tight">{p.name}</span>
                </div>
                <span className={`w-6 h-6 shrink-0 rounded-full border-2 border-black grid place-items-center ${selected ? "bg-black" : "bg-white"}`}>
                  {saving === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : selected ? <span className="w-2.5 h-2.5 rounded-full bg-[#FDFFB6]" /> : null}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {p.subjects.map((sid) => {
                  const s = getSubject(sid);
                  return s ? <span key={sid} className={`text-[10px] font-bold border-2 border-black rounded-full px-2 py-0.5 ${s.bg}`}>{s.short}</span> : null;
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
