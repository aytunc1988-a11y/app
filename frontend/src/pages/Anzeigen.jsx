import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, RotateCcw, Search, SlidersHorizontal, Sparkles, Tag } from "lucide-react";

import { db } from "@/api/base44Client";
import { PROFESSIONS, CANTONS } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import ListingCard from "@/components/anzeigen/ListingCard";

const selectCls = "modern-listing-select border-2 border-black rounded-lg px-3 py-2.5 font-semibold bg-white text-sm w-full";

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
    const own = l.created_by_id === user?.user_id;
    if (mine && !own) return false;
    if (l.active === false && !own) return false;
    if (prof !== "Alle" && l.profession !== prof) return false;
    if (canton !== "Alle" && l.canton !== canton) return false;
    return true;
  }), [listings, prof, canton, mine, user]);
  const hasFilters = prof !== "Alle" || canton !== "Alle" || mine;

  return (
    <div className="modern-page modern-listings">
      <section className="modern-listings-hero">
        <div className="modern-listings-hero-copy">
          <span className="modern-listings-eyebrow"><Sparkles className="h-3.5 w-3.5" /> LAPQUIZ MARKTPLATZ</span>
          <h1 className="font-heading text-2xl sm:text-4xl">Anzeigen</h1>
          <p>Finde Lernmaterial und Angebote aus deiner Community.</p>
        </div>
        <div className="modern-listings-hero-actions">
          <button onClick={() => setMine((m) => !m)} aria-pressed={mine} className={`brutal-btn modern-my-listings ${mine ? "bg-[#FDFFB6]" : "bg-white"}`}>
            <Tag className="h-4 w-4" /> Meine Inserate
          </button>
          <Link to="/anzeigen/neu" className="brutal-btn modern-create-listing bg-[#FDFFB6]">
            <Plus className="h-4 w-4" /> Inserat aufgeben <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="modern-listing-filter-panel" aria-label="Anzeigen filtern">
        <div className="modern-listing-filter-heading">
          <div className="modern-listing-filter-icon"><SlidersHorizontal className="h-4 w-4" /></div>
          <div><h2>Finde, was du suchst</h2><p>Filtere die Inserate nach Beruf und Standort.</p></div>
          <span className="modern-listing-count"><Search className="h-3.5 w-3.5" /> {isLoading ? "…" : `${filtered.length} ${filtered.length === 1 ? "Inserat" : "Inserate"}`}</span>
        </div>
        <div className="modern-listing-filters grid grid-cols-[1fr_1fr_auto] gap-2">
          <label>
            <span>Beruf</span>
            <select aria-label="Nach Beruf filtern" value={prof} onChange={(e) => setProf(e.target.value)} className={selectCls}>
              <option value="Alle">Alle Berufe</option>
              {PROFESSIONS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>
            <span>Kanton</span>
            <select aria-label="Nach Kanton filtern" value={canton} onChange={(e) => setCanton(e.target.value)} className={selectCls}>
              <option value="Alle">Alle Kantone</option>
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button onClick={reset} disabled={!hasFilters} className="brutal-btn modern-listing-reset bg-white">
            <RotateCcw className="h-4 w-4" /> Zurücksetzen
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="grid place-items-center py-16"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="modern-listings-empty">
          <div className="modern-listings-empty-icon"><Search className="h-6 w-6" /></div>
          <h2>Keine Anzeigen gefunden</h2>
          <p>Mit anderen Filtern findest du vielleicht das passende Inserat.</p>
          {hasFilters && <button onClick={reset} className="brutal-btn bg-white px-4 py-2 text-sm"><RotateCcw className="mr-2 inline h-4 w-4" /> Filter zurücksetzen</button>}
        </div>
      ) : (
        <div className="modern-listings-grid">
          {filtered.map((l) => {
            const own = l.created_by_id === user?.user_id;
            return <ListingCard key={l.id} listing={l} mine={own} onDelete={() => remove(l.id)} onToggle={() => toggle(l)} />;
          })}
        </div>
      )}
    </div>
  );
}
