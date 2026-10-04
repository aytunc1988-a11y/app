import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2 } from "lucide-react";

import { db } from "@/api/base44Client";
import { TYPE_LABELS, professionSubjects } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import PhotoImportDialog from "@/components/photo/PhotoImportDialog";

export default function FragenImportPanel() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const profSubjects = professionSubjects(user?.profession || "kaufmann");
  const { data: mine = [], isLoading } = useQuery({ queryKey: ["userQuestions"], queryFn: () => db.entities.UserQuestion.list("-created_date", 1000) });

  const remove = async (id) => {
    await db.entities.UserQuestion.delete(id);
    qc.invalidateQueries({ queryKey: ["userQuestions"] });
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="brutal-btn bg-[#FDFFB6] w-full py-3 font-heading flex items-center justify-center gap-2 text-sm">
        <Camera className="w-4 h-4" /> Foto importieren
      </button>

      {!isLoading && mine.length === 0 && (
        <div className="brutal bg-white p-4 mt-3 text-center font-semibold text-sm">Noch keine eigenen Fragen.</div>
      )}

      {profSubjects.map((s) => {
        const list = mine.filter((q) => q.subject === s.id);
        if (!list.length) return null;
        return (
          <section key={s.id} className="mt-3">
            <h2 className={`inline-block font-heading text-sm border-2 border-black rounded-lg px-2 py-0.5 ${s.bg}`}>{s.name} · {list.length}</h2>
            <div className="space-y-2 mt-2">
              {list.map((q) => (
                <div key={q.id} className="brutal bg-white p-2.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest">{TYPE_LABELS[q.type]}</span>
                    <p className="font-semibold text-sm mt-0.5">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">→ {q.correct_answer}</p>
                  </div>
                  <button onClick={() => remove(q.id)} className="p-1.5 border-2 border-black rounded-lg hover:bg-[#FFADAD] shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      <PhotoImportDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
