import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Check, X, ChevronRight, Pause, Play } from "lucide-react";
import { db } from "@/api/base44Client";
import { getSubject, TYPE_LABELS } from "@/lib/subjects";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TYPE_COLORS = { mc: "bg-[#FDFFB6]", tf: "bg-[#CAFFBF]", gap: "bg-[#9BF6FF]" };

export default function Flashcards() {
  const { subject: subjectId } = useParams();
  const navigate = useNavigate();
  const subject = getSubject(subjectId);
  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [phase, setPhase] = useState("play");
  const [paused, setPaused] = useState(false);
  const [totalAll, setTotalAll] = useState(0);

  // Refs für aktuellen Stand (verhindert stale closure in Event-Listenern)
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = { phase, paused, questions, idx, known, unknown };
  });

  const savePause = (q, i, k, u) => {
    try {
      localStorage.setItem("fc_pause_" + subjectId, JSON.stringify({
        remaining: q.slice(i),
        known: k,
        unknown: u,
      }));
    } catch(e) {}
  };

  // Auto-Speichern beim Verlassen der Komponente (unmount)
  useEffect(() => {
    return () => {
      const s = stateRef.current;
      if (s.phase === "play" && s.questions && s.questions.length > 0 && (s.known?.length > 0 || s.unknown?.length > 0 || s.idx > 0)) {
        try {
          localStorage.setItem("fc_pause_" + subjectId, JSON.stringify({
            remaining: s.questions.slice(s.idx),
            known: s.known || [],
            unknown: s.unknown || [],
          }));
        } catch(e) {}
      }
    };
  }, [subjectId]);
  const [currentUser, setCurrentUser] = useState(null);
  const savedRef = useRef(false);

  useEffect(() => { db.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const profession = currentUser?.profession || null;
      const filter = profession ? { subject: subjectId, profession } : { subject: subjectId };
      const qs = await db.entities.Question.filter(filter, "-created_date", 500);
      const shuffled = shuffle(qs);
      setAllQuestions(shuffled);
      setQuestions(shuffled);
      setTotalAll(shuffled.length);
    })();
  }, [subjectId, currentUser]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("fc_history_" + subjectId) || "[]");
      setHistory(saved);
    } catch(e) {}
  }, [subjectId]);

  // Pause-Stand laden wenn Fragen geladen sind
  useEffect(() => {
    if (!allQuestions || !allQuestions.length) return;
    try {
      const saved = JSON.parse(localStorage.getItem("fc_pause_" + subjectId) || "null");
      if (saved && saved.remaining && saved.remaining.length > 0) {
        setQuestions(saved.remaining);
        setIdx(0);
        setKnown(saved.known || []);
        setUnknown(saved.unknown || []);
        setPaused(true);
      }
    } catch(e) {}
  }, [allQuestions]);

  const saveSession = (k, u) => {
    if (savedRef.current) return;
    savedRef.current = true;
    const session = {
      date: new Date().toLocaleDateString("de-CH"),
      time: new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }),
      known: k.length,
      unknown: u.length,
      total: k.length + u.length,
    };
    const updated = [session, ...history].slice(0, 10);
    setHistory(updated);
    try { localStorage.setItem("fc_history_" + subjectId, JSON.stringify(updated)); } catch(e) {}
  };

  const markKnown = () => {
    const newKnown = [...known, questions[idx]];
    const newUnknown = unknown;
    setKnown(newKnown);
    if (idx + 1 >= questions.length) {
      saveSession(newKnown, newUnknown);
      setPhase("done");
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
    }
  };

  const markUnknown = () => {
    const newKnown = known;
    const newUnknown = [...unknown, questions[idx]];
    setUnknown(newUnknown);
    if (idx + 1 >= questions.length) {
      saveSession(newKnown, newUnknown);
      setPhase("done");
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
    }
  };

  const restart = (onlyUnknown = false) => {
    const pool = onlyUnknown ? unknown : allQuestions;
    setQuestions(shuffle(pool));
    setIdx(0); setFlipped(false); setKnown([]); setUnknown([]);
    savedRef.current = false;
    setPhase("play");
    try { localStorage.removeItem("fc_pause_" + subjectId); } catch(e) {}
  };

  if (!subject) return <p className="text-center py-20 font-semibold">Fach nicht gefunden.</p>;
  if (!questions) return <div className="grid place-items-center py-24"><div className="w-10 h-10 border-4 border-black border-t-[#CAFFBF] rounded-full animate-spin" /></div>;

  if (!questions.length) return (
    <div className="text-center py-20">
      <p className="font-heading text-2xl">Keine Fragen</p>
      <Link to="/faecher" className="brutal-btn bg-[#FDFFB6] px-5 py-3 inline-block mt-6">Zurück</Link>
    </div>
  );

  const total = questions.length;
  const done = known.length + unknown.length;

  if (phase === "done") {
    return (
      <div>
        <button onClick={() => navigate("/faecher")} className="font-heading text-lg flex items-center gap-2 mb-4">
          <ArrowLeft className="w-5 h-5" /> Fächer
        </button>
        <div className="brutal bg-[#CAFFBF] p-6 text-center">
          <p className="font-heading text-3xl mb-2">Fertig! 🎉</p>
          <p className="font-bold text-lg">
            <span className="text-green-700">{known.length} gewusst</span> · <span className="text-red-600">{unknown.length} nicht gewusst</span>
          </p>
          <p className="text-sm font-semibold mt-1 text-muted-foreground">{Math.round(known.length / total * 100)}% richtig</p>
          <div className="flex gap-2 mt-5 justify-center flex-wrap">
            {unknown.length > 0 && (
              <button onClick={() => restart(true)} className="brutal-btn bg-[#FFADAD] px-5 py-2 font-heading flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Nur Unbekannte ({unknown.length})
              </button>
            )}
            <button onClick={() => restart(false)} className="brutal-btn bg-white px-5 py-2 font-heading flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Alle nochmal
            </button>
            <Link to={"/quiz/" + subjectId} className="brutal-btn bg-[#FDFFB6] px-5 py-2 font-heading">Zurück</Link>
          </div>
        </div>
        <div className="brutal bg-white p-4 mt-3">
          <h2 className="font-heading text-lg mb-3">📊 Verlauf</h2>
          {history.length === 0 ? <p className="text-sm text-muted-foreground">Noch keine Einträge.</p> : (
            <div className="space-y-2">
              {history.map((s, i) => (
                <div key={i} className={"flex items-center justify-between text-xs font-bold border-2 border-black rounded-lg px-3 py-2 " + (i === 0 ? "bg-[#FDFFB6]" : "bg-white")}>
                  <span>{s.date} {s.time}</span>
                  <span className="text-green-700">✓ {s.known}</span>
                  <span className="text-red-500">✗ {s.unknown}</span>
                  <span>{Math.round(s.known / s.total * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (paused) {
    return (
      <div>
        <button onClick={() => navigate("/faecher")} className="font-heading text-lg flex items-center gap-2 mb-4">
          <ArrowLeft className="w-5 h-5" /> Fächer
        </button>
        <div className="brutal bg-[#FDFFB6] p-10 text-center">
          <p className="font-heading text-3xl mb-2">⏸ Pause</p>
          <p className="font-semibold text-muted-foreground mb-1">{subject.name}</p>
          <p className="text-sm font-bold">{done}/{total} Karten · ✓{known.length} · ✗{unknown.length}</p>
          <button onClick={() => { try { localStorage.removeItem("fc_pause_" + subjectId); } catch(e) {} setPaused(false); }} className="brutal-btn bg-black text-white px-8 py-3 mt-6 font-heading flex items-center gap-2 mx-auto">
            <Play className="w-5 h-5" /> Weiter
          </button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const typeColor = TYPE_COLORS[q.type] || "bg-white";
  const typeLabel = TYPE_LABELS[q.type] || q.type;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate("/faecher")} className="font-heading text-lg flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> {subject.name}
        </button>
        <div className="flex gap-2">
          <button onClick={() => { if(window.confirm("Neustart? Fortschritt geht verloren.")) { try { localStorage.removeItem("fc_pause_" + subjectId); } catch(e) {} restart(false); } }} className="brutal-btn bg-white px-3 py-1.5 flex items-center gap-1 text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { savePause(questions, idx, known, unknown); setPaused(true); }} className="brutal-btn bg-white px-3 py-1.5 flex items-center gap-1 text-xs font-bold">
            <Pause className="w-3.5 h-3.5" /> Pause
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-3 border-2 border-black rounded-full bg-white overflow-hidden">
          <div className="h-full bg-[#CAFFBF] transition-all" style={{ width: ((done / (totalAll || total)) * 100) + "%" }} />
        </div>
        <span className="text-xs font-bold">{done}/{totalAll || total}</span>
        <span className="text-xs font-bold text-green-600">✓{known.length}</span>
        <span className="text-xs font-bold text-red-500">✗{unknown.length}</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={"text-[10px] font-bold uppercase tracking-widest border-2 border-black rounded px-2 py-0.5 " + typeColor}>{typeLabel}</span>
        <span className="text-[10px] font-semibold text-muted-foreground">Runde: Karte {idx + 1} von {questions.length}</span>
      </div>

      <div onClick={() => !flipped && setFlipped(true)} className={"brutal p-6 min-h-[240px] flex flex-col items-center justify-center text-center transition-all " + (flipped ? "bg-[#CAFFBF]" : "bg-white cursor-pointer")}>
        {!flipped ? (
          <>
            <p className="font-heading text-lg sm:text-xl leading-snug">{q.question}</p>
            {q.type === "mc" && (
              <div className="mt-4 space-y-1 w-full text-left">
                {q.options?.map((opt, i) => (
                  <div key={i} className="text-xs font-semibold border border-black rounded px-2 py-1 bg-white">{opt}</div>
                ))}
              </div>
            )}
            <p className="text-xs font-semibold text-muted-foreground mt-5">Tippen zum Aufdecken</p>
          </>
        ) : (
          <>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Antwort</span>
            <p className="font-heading text-xl sm:text-2xl text-green-700">{q.correct_answer}</p>
            {q.explanation && <p className="text-xs font-semibold text-muted-foreground mt-3 max-w-xs">{q.explanation}</p>}
          </>
        )}
      </div>

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
          <ChevronRight className="w-5 h-5" /> Aufdecken
        </button>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setShowHistory(h => !h)} className="text-xs font-bold underline text-muted-foreground">
            {showHistory ? "Verlauf ausblenden" : "Verlauf anzeigen (" + history.length + " Sessions)"}
          </button>
          {showHistory && (
            <div className="brutal bg-white p-3 mt-2 space-y-2">
              {history.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold border border-black rounded px-2 py-1">
                  <span>{s.date} {s.time}</span>
                  <span className="text-green-700">✓{s.known}</span>
                  <span className="text-red-500">✗{s.unknown}</span>
                  <span>{Math.round(s.known / s.total * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
