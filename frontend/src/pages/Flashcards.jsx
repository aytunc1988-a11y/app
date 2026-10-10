import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw, Check, X } from "lucide-react";
import { db } from "@/api/base44Client";
import { getSubject } from "@/lib/subjects";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Flashcards() {
  const { subject: subjectId } = useParams();
  const navigate = useNavigate();
  const subject = getSubject(subjectId);
  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { db.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  useEffect(() => {
    (async () => {
      const profession = currentUser?.profession || null;
      const filter = profession ? { subject: subjectId, profession } : { subject: subjectId };
      const qs = await db.entities.Question.filter(filter, "-created_date", 500);
      setQuestions(shuffle(qs));
    })();
  }, [subjectId, currentUser]);

  if (!subject) return <p className="text-center py-20 font-semibold">Fach nicht gefunden.</p>;
  if (!questions) return <div className="grid place-items-center py-24"><div className="w-10 h-10 border-4 border-black border-t-[#CAFFBF] rounded-full animate-spin" /></div>;

  const done = known.length + unknown.length;
  const total = questions.length;

  if (done === total && total > 0) return (
    <div className="text-center py-16 space-y-4">
      <p className="font-heading text-3xl">Fertig! 🎉</p>
      <p className="font-bold text-lg"><span className="text-green-600">{known.length} gewusst</span> · <span className="text-red-500">{unknown.length} nicht gewusst</span></p>
      <div className="flex gap-3 justify-center mt-6">
        <button onClick={() => { setQuestions(shuffle(unknown.length > 0 ? unknown : questions)); setIdx(0); setFlipped(false); setKnown([]); setUnknown([]); }}
          className="brutal-btn bg-[#FDFFB6] px-5 py-2 font-heading flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> {unknown.length > 0 ? "Unbekannte wiederholen" : "Nochmal"}
        </button>
        <Link to={`/quiz/${subjectId}`} className="brutal-btn bg-white px-5 py-2 font-heading">Zurück</Link>
      </div>
    </div>
  );

  if (!questions.length) return (
    <div className="text-center py-20">
      <p className="font-heading text-2xl">Keine Fragen</p>
      <Link to="/faecher" className="brutal-btn bg-[#FDFFB6] px-5 py-3 inline-block mt-6">Zurück</Link>
    </div>
  );

  const q = questions[idx];

  const markKnown = () => { setKnown(k => [...k, q]); setIdx(i => i + 1); setFlipped(false); };
  const markUnknown = () => { setUnknown(u => [...u, q]); setIdx(i => i + 1); setFlipped(false); };

  return (
    <div>
      <button onClick={() => navigate(`/quiz/${subjectId}`)} className="font-heading text-lg flex items-center gap-2 mb-4">
        <ArrowLeft className="w-5 h-5" /> {subject.name}
      </button>

      {/* Fortschritt */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-3 border-2 border-black rounded-full bg-white overflow-hidden">
          <div className="h-full bg-[#CAFFBF] border-r-2 border-black transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="text-xs font-bold">{done}/{total}</span>
        <span className="text-xs font-bold text-green-600">✓{known.length}</span>
        <span className="text-xs font-bold text-red-500">✗{unknown.length}</span>
      </div>

      {/* Karte */}
      <div onClick={() => setFlipped(f => !f)} className="cursor-pointer select-none">
        <div className={`brutal p-6 min-h-[260px] flex flex-col items-center justify-center text-center transition-all ${flipped ? "bg-[#CAFFBF]" : "bg-white"}`}>
          {!flipped ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Frage</span>
              <p className="font-heading text-lg sm:text-xl leading-snug">{q.question}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-6">Tippen zum Aufdecken</p>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Antwort</span>
              <p className="font-heading text-xl sm:text-2xl text-green-700">{q.correct_answer}</p>
              {q.explanation && <p className="text-xs font-semibold text-muted-foreground mt-4 max-w-xs">{q.explanation}</p>}
            </>
          )}
        </div>
      </div>

      {/* Buttons */}
      {flipped ? (
        <div className="flex gap-3 mt-4">
          <button onClick={markUnknown} className="brutal-btn bg-[#FFADAD] flex-1 py-3 font-heading flex items-center justify-center gap-2">
            <X className="w-5 h-5" /> Nicht gewusst
          </button>
          <button onClick={markKnown} className="brutal-btn bg-[#CAFFBF] flex-1 py-3 font-heading flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Gewusst
          </button>
        </div>
      ) : (
        <button onClick={() => setFlipped(true)} className="brutal-btn bg-[#FDFFB6] w-full py-3 mt-4 font-heading flex items-center justify-center gap-2">
          <ArrowRight className="w-5 h-5" /> Aufdecken
        </button>
      )}
    </div>
  );
}
