import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { db } from "@/api/base44Client";
import { formatDuration, professionSubjects } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import LearnTabs from "@/components/home/LearnTabs";

const agg = (list) => {
  const q = list.reduce((a, s) => a + s.question_count, 0);
  const c = list.reduce((a, s) => a + s.correct_count, 0);
  return { q, c, t: list.reduce((a, s) => a + s.duration_seconds, 0), pct: q ? Math.round((c / q) * 100) : 0, n: list.length };
};

export default function Stats() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => db.entities.StudySession.list("-created_date", 1000) });
  const profSubjects = professionSubjects(user?.profession || "kaufmann");
  const profIds = new Set(profSubjects.map((s) => s.id));
  const total = agg(sessions.filter((x) => profIds.has(x.subject)));

  const reset = async () => {
    await db.entities.StudySession.deleteMany({ created_by_id: user.id });
    qc.invalidateQueries({ queryKey: ["sessions"] });
  };

  return (
    <div>
      <LearnTabs />
      <h1 className="font-heading text-xl sm:text-3xl">Statistik</h1>
      <div className="brutal bg-[#FDFFB6] p-3 mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[["Genauigkeit", `${total.pct}%`], ["Fragen", total.q], ["Sessions", total.n], ["Gesamtlernzeit", formatDuration(total.t)]].map(([l, v]) => (
          <div key={l}><div className="font-heading text-lg">{v}</div><div className="text-[10px] font-bold">{l}</div></div>
        ))}
      </div>

      <div className="space-y-2 mt-3">
        {profSubjects.map((s) => {
          const a = agg(sessions.filter((x) => x.subject === s.id));
          return (
            <div key={s.id} className="brutal bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-8 h-8 shrink-0 grid place-items-center border-2 border-black rounded-lg font-heading text-sm ${s.bg}`}>{s.emoji}</span>
                  <div className="min-w-0"><div className="font-bold truncate">{s.name}</div><div className="text-xs font-semibold text-muted-foreground">{a.c}/{a.q} richtig · {formatDuration(a.t)}</div></div>
                </div>
                <span className="font-heading text-lg">{a.q ? `${a.pct}%` : "–"}</span>
              </div>
              <div className="h-2.5 border-2 border-black rounded-full mt-2 overflow-hidden bg-white">
                <div className={`h-full ${s.bg} transition-all duration-700`} style={{ width: `${a.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button disabled={!sessions.length} className="brutal-btn bg-white w-full mt-3 py-2.5 flex items-center justify-center gap-2 text-sm"><RotateCcw className="w-4 h-4" /> Statistik zurücksetzen</button>
        </AlertDialogTrigger>
        <AlertDialogContent className="brutal">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Statistik zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>Alle deine Sessions und Lernzeiten werden gelöscht.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={reset} className="bg-black">Zurücksetzen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
