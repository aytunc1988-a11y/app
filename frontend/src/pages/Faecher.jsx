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
    <div className="modern-page modern-learning">
      <LearnTabs />
      <section className="modern-learning-hero">
        <div>
          <p className="modern-learning-eyebrow">LAP-VORBEREITUNG</p>
          <h1 className="font-heading">
            Hoi{user?.full_name ? ` ${user.full_name.split(" ")[0]}` : ""}.<br />Was lernst du heute?
          </h1>
          {profession && <span className="modern-learning-profession"><span>{profession.emoji}</span>{profession.name}</span>}
        </div>
        <Link to="/berufe" className="brutal-btn modern-learning-change bg-white">Beruf ändern</Link>
      </section>

      <div className="modern-learning-stats">
        {[
          { label: "Genauigkeit", value: totalQ ? `${Math.round((totalC / totalQ) * 100)}%` : "–", bg: "bg-[#FDFFB6]" },
          { label: "Beantwortet", value: totalQ, bg: "bg-white" },
          { label: "Lernzeit", value: formatDuration(totalTime), bg: "bg-[#FFADAD]" },
        ].map((s) => (
          <div key={s.label} className="modern-learning-stat">
            <div>{s.value}</div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="modern-learning-subjects">
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} count={questions.filter((q) => q.subject === s.id && q.profession === professionId).length} accuracy={accuracyFor(s.id)} locked={!user?.licensed || (unlockedProfessions.length > 0 && !unlockedProfessions.includes(professionId))} />
        ))}
      </div>
    </div>
  );
}
