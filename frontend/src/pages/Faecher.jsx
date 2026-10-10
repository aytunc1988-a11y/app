import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { db } from "@/api/base44Client";
import { formatDuration, professionSubjects, getProfession } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import SubjectCard from "@/components/home/SubjectCard";
import LearnTabs from "@/components/home/LearnTabs";

export default function Faecher() {
  const { user } = useCurrentUser();
  const professionId = user?.profession || "kaufmann";
  const unlockedProfessions = user?.unlocked_professions || [];
  const profession = getProfession(professionId);
  const subjects = professionSubjects(professionId);

  const { data: questions = [] } = useQuery({ queryKey: ["questions"], queryFn: () => db.entities.Question.list("-created_date", 2000) });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => db.entities.StudySession.list("-created_date", 1000) });

  const totalQ = sessions.reduce((a, s) => a + s.question_count, 0);
  const totalC = sessions.reduce((a, s) => a + s.correct_count, 0);
  const totalTime = sessions.reduce((a, s) => a + s.duration_seconds, 0);

  const accuracyFor = (id) => {
    const ss = sessions.filter((s) => s.subject === id);
    const q = ss.reduce((a, s) => a + s.question_count, 0);
    return q ? Math.round((ss.reduce((a, s) => a + s.correct_count, 0) / q) * 100) : null;
  };

  return (
    <div>
      <LearnTabs />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">LAP-Vorbereitung</p>
        <Link to="/berufe" className="brutal-btn bg-white px-2.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-widest">Beruf ändern</Link>
      </div>
      <h1 className="font-heading text-xl sm:text-3xl mt-2 leading-[1.05]">
        Hoi{user?.full_name ? ` ${user.full_name.split(" ")[0]}` : ""}.<br />Was lernst du heute?
      </h1>

      {profession && (
        <div className="brutal bg-white p-3 mt-4 flex items-center gap-2">
          <span className={`w-8 h-8 grid place-items-center border-2 border-black rounded-lg font-heading ${profession.bg}`}>{profession.emoji}</span>
          <span className="font-bold text-sm">{profession.name}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { label: "Genauigkeit", value: totalQ ? `${Math.round((totalC / totalQ) * 100)}%` : "–", bg: "bg-[#FDFFB6]" },
          { label: "Beantwortet", value: totalQ, bg: "bg-white" },
          { label: "Lernzeit", value: formatDuration(totalTime), bg: "bg-[#FFADAD]" },
        ].map((s) => (
          <div key={s.label} className={`brutal p-3 md:p-4 ${s.bg}`}>
            <div className="font-heading text-lg md:text-2xl truncate">{s.value}</div>
            <div className="text-xs font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 mt-4">
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} count={questions.filter((q) => q.subject === s.id && q.profession === professionId).length} accuracy={accuracyFor(s.id)} locked={!user?.licensed || (unlockedProfessions.length > 0 && !unlockedProfessions.includes(professionId))} />
        ))}
      </div>
    </div>
  );
}
