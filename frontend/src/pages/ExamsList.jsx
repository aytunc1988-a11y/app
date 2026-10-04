import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Camera } from "lucide-react";

import { db } from "@/api/base44Client";
import ExamCard from "@/components/exam/ExamCard";
import LearnTabs from "@/components/home/LearnTabs";
import FragenImportPanel from "@/components/exam/FragenImportPanel";

const SUB = [
  { id: "neu", label: "Neue Prüfung", icon: Plus },
  { id: "fragen", label: "Fragen importieren", icon: Camera },
];

export default function ExamsList() {
  const qc = useQueryClient();
  const [sub, setSub] = useState("neu");
  const { data: exams = [], isLoading } = useQuery({ queryKey: ["exams"], queryFn: () => db.entities.CustomExam.list("-created_date", 500) });

  const remove = async (id) => {
    await db.entities.CustomExam.delete(id);
    qc.invalidateQueries({ queryKey: ["exams"] });
  };

  const exportExams = () => {
    if (!exams.length) return;
    const data = exams.map(({ id, created_by_id, created_by, created_date, ...e }) => e);
    const blob = new Blob([JSON.stringify({ type: "lapquiz_exams", items: data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lapquiz-pruefungen.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <LearnTabs />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-xl sm:text-3xl">Prüfungen</h1>
        <button onClick={exportExams} className="brutal-btn bg-white px-2.5 py-1 text-xs">Export JSON</button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {SUB.map((t) => (
          <button key={t.id} onClick={() => setSub(t.id)} className={`flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-lg border-2 border-black transition-all ${sub === t.id ? "bg-[#FDFFB6] shadow-[2px_2px_0_0_#000]" : "bg-white"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {sub === "neu" ? (
        <div className="mt-3">
          <p className="font-semibold text-muted-foreground text-xs">Stelle dir eigene Prüfungen zusammen – Lern- oder Prüfungsmodus.</p>
          <Link to="/pruefung/neu" className="brutal-btn bg-[#FDFFB6] w-full mt-2 py-3 font-heading flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Neue Prüfung
          </Link>

          {isLoading ? (
            <div className="grid place-items-center py-12"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>
          ) : exams.length === 0 ? (
            <div className="brutal bg-white p-4 mt-3 text-center font-semibold text-sm">Noch keine Prüfungen erstellt.</div>
          ) : (
            <div className="space-y-3 mt-3">
              {exams.map((e, i) => <ExamCard key={e.id} exam={e} index={i} onDelete={() => remove(e.id)} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3"><FragenImportPanel /></div>
      )}
    </div>
  );
}
