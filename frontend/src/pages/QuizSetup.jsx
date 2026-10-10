import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { db } from "@/api/base44Client";
import { getSubject } from "@/lib/subjects";


const COUNTS = ["5", "10", "20", "Alle"];
const TIMERS = [
  { id: "Aus", label: "Aus" },
  { id: "15", label: "15'" },
  { id: "30", label: "30'" },
  { id: "60", label: "60'" },
  { id: "Frei", label: "Frei" },
];

export default function QuizSetup() {
  const { subject: subjectId } = useParams();
  const navigate = useNavigate();
  const subject = getSubject(subjectId);
  const [count, setCount] = useState("10");
  const [timer, setTimer] = useState("Aus");
  const [own, setOwn] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { db.auth.me().then(setCurrentUser).catch(() => {}); }, []);
  const profession = currentUser?.profession || null;
  const { data: questions = [] } = useQuery({ queryKey: ["questions", subjectId, profession], queryFn: () => db.entities.Question.filter(profession ? { subject: subjectId, profession } : { subject: subjectId }, "-created_date", 500) });

  if (!subject) return <p className="text-center py-20 font-semibold">Fach nicht gefunden.</p>;

  const start = () => {
    const qs = new URLSearchParams({ count, timer, own: own ? "1" : "0" });
    navigate(`/quiz/${subjectId}/start?${qs.toString()}`);
  };

  return (
    <div>
      <button onClick={() => navigate("/faecher")} className="font-heading text-lg flex items-center gap-2 mb-5"><ArrowLeft className="w-5 h-5" /> Fächer</button>

      <div className="brutal bg-[#FDFFB6] p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
        <span className={`w-12 h-12 shrink-0 grid place-items-center border-2 border-black rounded-lg font-heading text-xl sm:text-2xl bg-white ${subject.bg}`}>{subject.emoji}</span>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl leading-tight">{subject.name}</h1>
          <p className="text-xs sm:text-sm font-bold mt-0.5">{questions.length} Fragen verfügbar</p>
        </div>
      </div>

      <div className="brutal bg-white p-4 sm:p-5 mt-3 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Anzahl Fragen</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {COUNTS.map((c) => (
              <button key={c} onClick={() => setCount(c)} className={`brutal-btn px-3 py-1.5 text-sm w-14 sm:w-16 ${count === c ? "bg-black text-white" : "bg-white"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Timer</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TIMERS.map((t) => (
              <button key={t.id} onClick={() => setTimer(t.id)} className={`brutal-btn px-3 py-1.5 text-sm ${timer === t.id ? "bg-black text-white" : "bg-white"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} className="w-5 h-5 accent-black" />
          <span className="font-bold">Eigene Fragen einbeziehen</span>
        </label>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={start} className="brutal-btn bg-[#FDFFB6] flex-1 py-3 font-heading flex items-center justify-center gap-2">
          <Play className="w-5 h-5" /> Quiz starten
        </button>
        <button onClick={() => navigate(`/quiz/${subjectId}/karten`)} className="brutal-btn bg-[#CAFFBF] flex-1 py-3 font-heading flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5" /> Karteikarten
        </button>
      </div>
    </div>
  );
}
