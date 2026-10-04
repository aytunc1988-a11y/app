import React from "react";
import FragenImportPanel from "@/components/exam/FragenImportPanel";

export default function MeineFragen() {
  return (
    <div>
      <h1 className="font-heading text-xl sm:text-3xl">Meine Fragen</h1>
      <p className="font-semibold text-muted-foreground text-xs mt-1">Importiere Fotos von deinen Unterlagen — die KI macht daraus Lernfragen.</p>
      <div className="mt-3">
        <FragenImportPanel />
      </div>
    </div>
  );
}
