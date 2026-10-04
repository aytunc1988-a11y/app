import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, RotateCcw } from "lucide-react";
import { CANTONS } from "@/lib/subjects";

export default function LeuteFilterModal({ open, onOpenChange, filters, onApply }) {
  const [local, setLocal] = useState(filters);
  useEffect(() => setLocal(filters), [filters, open]);

  const set = (k, v) => setLocal((p) => ({ ...p, [k]: v }));
  const apply = () => { onApply(local); onOpenChange(false); };
  const reset = () => setLocal({ minAge: 18, maxAge: 99, gender: "Alle", distance: 100, canton: "Alle", online: false });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="brutal max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading text-2xl">Filter</DialogTitle>
            <div className="flex items-center gap-1">
              <button onClick={reset} className="p-1.5 rounded-lg hover:bg-black/5" aria-label="Zurücksetzen"><RotateCcw className="w-4 h-4" /></button>
              <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-black/5" aria-label="Schliessen"><X className="w-5 h-5" /></button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Altersspanne: {local.minAge}–{local.maxAge}</label>
            <div className="space-y-2 mt-2">
              <input type="range" min="18" max="99" value={local.minAge} onChange={(e) => set("minAge", Math.min(Number(e.target.value), local.maxAge))} className="w-full accent-black" />
              <input type="range" min="18" max="99" value={local.maxAge} onChange={(e) => set("maxAge", Math.max(Number(e.target.value), local.minAge))} className="w-full accent-black" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Geschlecht</label>
            <select value={local.gender} onChange={(e) => set("gender", e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
              <option value="Alle">Alle</option>
              <option value="weiblich">weiblich</option>
              <option value="männlich">männlich</option>
              <option value="divers">divers</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Distanz (km): {local.distance} km</label>
            <input type="range" min="1" max="250" value={local.distance} onChange={(e) => set("distance", Number(e.target.value))} className="w-full mt-2 accent-black" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kanton</label>
            <select value={local.canton} onChange={(e) => set("canton", e.target.value)} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
              <option value="Alle">Alle</option>
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">Jetzt online</span>
            <button onClick={() => set("online", !local.online)} className={`w-12 h-7 rounded-full border-2 border-black relative transition-colors ${local.online ? "bg-[#FDFFB6]" : "bg-white"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-black transition-all ${local.online ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        <DialogFooter>
          <button onClick={apply} className="brutal-btn bg-black text-white w-full py-3 font-heading">Anwenden</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
