import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, RotateCcw, Sparkles } from "lucide-react";
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
    <div className="modern-page modern-stats">
      <LearnTabs />
      <section className="modern-stats-hero">
        <div><span className="modern-learning-eyebrow"><Sparkles className="h-3.5 w-3.5" /> DEIN FORTSCHRITT</span><h1 className="font-heading">Statistik</h1><p>Sieh, wie weit du schon gekommen bist.</p></div>
        <div className="modern-stats-hero-icon"><Activity className="h-6 w-6" /></div>
      </section>
      <div className="modern-stats-summary">
        {[["Genauigkeit", `${total.pct}%`], ["Fragen", total.q], ["Sessions", total.n], ["Gesamtlernzeit", formatDuration(total.t)]].map(([l, v]) => (
          <div key={l} className="modern-stats-metric"><span>{l}</span><strong>{v}</strong></div>
        ))}
      </div>

      <div className="modern-stats-list-heading"><div><h2>Fortschritt nach Fach</h2><p>Deine Ergebnisse aus den bisherigen Lerneinheiten.</p></div></div>
      <div className="modern-stats-subject-list">
        {profSubjects.map((s) => {
          const a = agg(sessions.filter((x) => x.subject === s.id));
          return (
            <article key={s.id} className="modern-stats-subject">
              <div className="modern-stats-subject-top">
                <div className="modern-stats-subject-info">
                  <span className={`modern-subject-icon ${s.bg}`}><span className="modern-subject-icon-glyph">{s.emoji}</span></span>
                  <div><h3>{s.name}</h3><p>{a.c}/{a.q} richtig <i /> {formatDuration(a.t)}</p></div>
                </div>
                <strong>{a.q ? `${a.pct}%` : "–"}</strong>
              </div>
              <div className="modern-stats-progress" role="progressbar" aria-label={`${s.name} Fortschritt`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={a.pct}>
                <div className="modern-stats-progress-value" style={{ width: `${a.pct}%` }} />
              </div>
            </article>
          );
        })}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button disabled={!sessions.length} className="brutal-btn modern-stats-reset"><RotateCcw className="w-4 h-4" /> Statistik zurücksetzen</button>
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
