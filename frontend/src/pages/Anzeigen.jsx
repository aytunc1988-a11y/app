import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, RotateCcw } from "lucide-react";

import { db } from "@/api/base44Client";
import { PROFESSIONS, CANTONS } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import ListingCard from "@/components/anzeigen/ListingCard";

const selectCls = "border-2 border-black rounded-lg px-2 py-1.5 font-bold bg-white text-xs w-full";

export default function Anzeigen() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [prof, setProf] = useState("Alle");
  const [canton, setCanton] = useState("Alle");
  const [mine, setMine] = useState(false);

  const { data: listings = [], isLoading } = useQuery({ queryKey: ["listings"], queryFn: () => db.entities.Listing.list("-created_date", 500) });
  const refresh = () => qc.invalidateQueries({ queryKey: ["listings"] });
  const reset = () => { setProf("Alle"); setCanton("Alle"); setMine(false); };
  const remove = async (id) => {
    if (!window.confirm("Inserat löschen?")) return;
    await db.entities.Listing.delete(id);
    await refresh();
  };
  const toggle = async (l) => {
    await db.entities.Listing.update(l.id, { active: l.active === false });
    await refresh();
  };

  const filtered = useMemo(() => listings.filter((l) => {
    const own = l.created_by_id === user?.id;
    if (mine && !own) return false;
    if (l.active === false && !own) return false;
    if (prof !== "Alle" && l.profession !== prof) return false;
    if (canton !== "Alle" && l.canton !== canton) return false;
    return true;
  }), [listings, prof, canton, mine, user]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-xl sm:text-3xl">Anzeigen</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setMine((m) => !m)} className={`brutal-btn px-2 py-1 text-xs ${mine ? "bg-[#FDFFB6]" : "bg-white"}`}>Meine Inserate</button>
          <Link to="/anzeigen/neu" className="brutal-btn bg-[#FDFFB6] px-2 py-1 flex items-center gap-1 text-xs"><Plus className="w-3.5 h-3.5" /> Inserat</Link>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-2">
        <select value={prof} onChange={(e) => setProf(e.target.value)} className={selectCls}>
          <option value="Alle">Alle Berufe</option>
          {PROFESSIONS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={canton} onChange={(e) => setCanton(e.target.value)} className={selectCls}>
          <option value="Alle">Alle Kantone</option>
          {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={reset} className="brutal-btn bg-white px-2 py-1.5 text-xs flex items-center justify-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-16 font-semibold text-muted-foreground">Keine Anzeigen gefunden.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 mt-3">
          {filtered.map((l) => {
            const own = l.created_by_id === user?.id;
            return <ListingCard key={l.id} listing={l} mine={own} onDelete={() => remove(l.id)} onToggle={() => toggle(l)} />;
          })}
        </div>
      )}
    </div>
  );
}
