import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Check, X, ChevronRight, Pause, Play } from "lucide-react";
import { db } from "@/api/base44Client";
import { TYPE_LABELS } from "@/lib/subjects";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TYPE_COLORS = { mc: "bg-[#FDFFB6]", tf: "bg-[#CAFFBF]", gap: "bg-[#9BF6FF]" };

export default function ExamFlashcards() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [allQuestions, setAllQuestions] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState("play");
  const [totalAll, setTotalAll] = useState(0);
  const [history, setHistory] = useState([]);
  const savedRef = useRef(false);
  const stateRef = useRef({});

  useEffect(() => { stateRef.current = { phase, paused, questions, idx, known, unknown }; });

  useEffect(() => {
    (async () => {
      const ex = await db.entities.CustomExam.get(examId);
      setExam(ex);
      const allQ = await db.entities.UserQuestion.list("-created_date", 3000);
      const qs = (ex.question_ids || []).map((id) => allQ.find((q) => q.id === id)).filter(Boolean);
      const shuffled = shuffle(qs);
      setAllQuestions(shuffled);
      setTotalAll(shuffled.length);
      setQuestions(shuffled);
    })();
  }, [examId]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("exam_pause_" + examId) || "null");
      if (saved && saved.remaining && saved.remaining.length > 0 && allQuestions) {
        setQuestions(saved.remaining);
        setKnown(saved.known || []);
        setUnknown(saved.unknown || []);
        setPaused(true);
      }
    } catch(e) {}
  }, [allQuestions]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("exam_fc_history_" + examId) || "[]")); } catch(e) {}
  }, [examId]);

  const savePause = (q, i, k, u) => {
    try {
      localStorage.setItem("exam_pause_" + examId, JSON.stringify({ remaining: q.slice(i), known: k, unknown: u }));
    } catch(e) {}
  };

  useEffect(() => {
    return () => {
      const s = stateRef.current;
      if (s.phase === "play" && s.questions && s.questions.length > 0 && (s.known?.length > 0 || s.unknown?.length > 0 || s.idx > 0)) {
        savePause(s.questions, s.idx, s.known, s.unknown);
      }
    };
  }, [examId]);

  const saveSession = (k, u) => {
    if (savedRef.current) return;
    savedRef.current = true;
    const session = { date: new Date().toLocaleDateString("de-CH"), time: new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }), known: k.length, unknown: u.length, total: k.length + u.length };
    const updated = [session, ...history].slice(0, 10);
    setHistory(updated);
    try { localStorage.setItem("exam_fc_history_" + examId, JSON.stringify(updated)); } catch(e) {}
    try { localStorage.removeItem("exam_pause_" + examId); } catch(e) {}
  };

  const markKnown = () => {
    const nk = [...known, questions[idx]], nu = unknown;
    setKnown(nk);
    if (idx + 1 >= questions.length) { saveSession(nk, nu); setPhase("done"); }
    else { setIdx(i => i + 1); setFlipped(false); }
  };

  const markUnknown = () => {
    const nk = known, nu = [...unknown, questions[idx]];
    setUnknown(nu);
    if (idx + 1 >= questions.length) { saveSession(nk, nu); setPhase("done"); }
    else { setIdx(i => i + 1); setFlipped(false); }
  };

  const restart = (onlyUnknown = false) => {
    const pool = onlyUnknown ? unknown : allQuestions;
    setQuestions(shuffle(pool)); setIdx(0); setFlipped(false); setKnown([]); setUnknown([]);
    savedRef.current = false; setPhase("play");
    try { localStorage.removeItem("exam_pause_" + examId); } catch(e) {}
  };

  if (!exam || !questions) return <div className="grid place-items-center py-24"><div className="w-10 h-10 border-4 border-black border-t-[#CAFFBF] rounded-full animate-spin" /></div>;
  if (!questions.length) return <div className="text-center py-20"><p className="font-heading text-2xl">Keine Fragen</p><Link to="/pruefungen" className="brutal-btn bg-[#FDFFB6] px-5 py-3 inline-block mt-6">Zurück</Link></div>;

  const done = known.length + unknown.length;
  const total = questions.length;

  if (phase === "done") return (
    <div>
      <button onClick={() => navigate("/pruefungen")} className="font-heading text-lg flex items-center gap-2 mb-4"><ArrowLeft className="w-5 h-5" /> Prüfungen</button>
      <div className="brutal bg-[#CAFFBF] p-6 text-center">
        <p className="font-heading text-3xl mb-2">Fertig! 🎉</p>
        <p className="font-bold text-lg"><span className="text-green-700">{known.length} gewusst</span> · <span className="text-red-600">{unknown.length} nicht gewusst</span></p>
        <p className="text-sm font-semibold mt-1 text-muted-foreground">{Math.round(known.length / (totalAll||1) * 100)}% richtig</p>
        <div className="flex gap-2 mt-5 justify-center flex-wrap">
          {unknown.length > 0 && <button onClick={() => restart(true)} className="brutal-btn bg-[#FFADAD] px-5 py-2 font-heading flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Nur Unbekannte ({unknown.length})</button>}
          <button onClick={() => restart(false)} className="brutal-btn bg-white px-5 py-2 font-heading flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Alle nochmal</button>
          <Link to="/pruefungen" className="brutal-btn bg-[#FDFFB6] px-5 py-2 font-heading">Zurück</Link>
        </div>
      </div>
      {history.length > 0 && (
        <div className="brutal bg-white p-4 mt-3">
          <h2 className="font-heading text-lg mb-3">📊 Verlauf</h2>
          <div className="space-y-2">
            {history.map((s, i) => (
              <div key={i} className={"flex items-center justify-between text-xs font-bold border-2 border-black rounded-lg px-3 py-2 " + (i===0?"bg-[#FDFFB6]":"bg-white")}>
                <span>{s.date} {s.time}</span><span className="text-green-700">✓ {s.known}</span><span className="text-red-500">✗ {s.unknown}</span><span>{Math.round(s.known/s.total*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (paused) return (
    <div>
      <button onClick={() => navigate("/pruefungen")} className="font-heading text-lg flex items-center gap-2 mb-4"><ArrowLeft className="w-5 h-5" /> Prüfungen</button>
      <div className="brutal bg-[#FDFFB6] p-10 text-center">
        <p className="font-heading text-3xl mb-2">⏸ Pause</p>
        <p className="font-semibold text-muted-foreground mb-1">{exam.title}</p>
        <p className="text-sm font-bold">{done}/{totalAll||total} · ✓{known.length} · ✗{unknown.length}</p>
        <button onClick={() => { try { localStorage.removeItem("exam_pause_" + examId); } catch(e) {} setPaused(false); }} className="brutal-btn bg-black text-white px-8 py-3 mt-6 font-heading flex items-center gap-2 mx-auto"><Play className="w-5 h-5" /> Weiter</button>
      </div>
    </div>
  );

  const q = questions[idx];
  const typeColor = TYPE_COLORS[q.type] || "bg-white";
  const typeLabel = TYPE_LABELS[q.type] || q.type;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate("/pruefungen")} className="font-heading text-lg flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> {exam.title}</button>
        <div className="flex gap-2">
          <button onClick={() => { if(window.confirm("Neustart?")) restart(false); }} className="brutal-btn bg-white px-3 py-1.5 flex items-center gap-1 text-xs font-bold"><RotateCcw className="w-3.5 h-3.5" /></button>
          <button onClick={() => { savePause(questions, idx, known, unknown); setPaused(true); }} className="brutal-btn bg-white px-3 py-1.5 flex items-center gap-1 text-xs font-bold"><Pause className="w-3.5 h-3.5" /> Pause</button>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-3 border-2 border-black rounded-full bg-white overflow-hidden">
          <div className="h-full bg-[#CAFFBF] transition-all" style={{ width: (done/(totalAll||total)*100)+"%" }} />
        </div>
        <span className="text-xs font-bold">{done}/{totalAll||total}</span>
        <span className="text-xs font-bold text-green-600">✓{known.length}</span>
        <span className="text-xs font-bold text-red-500">✗{unknown.length}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className={"text-[10px] font-bold uppercase tracking-widest border-2 border-black rounded px-2 py-0.5 "+typeColor}>{typeLabel}</span>
        <span className="text-[10px] font-semibold text-muted-foreground">Runde: Karte {idx+1} von {total}</span>
      </div>
      <div onClick={() => !flipped && setFlipped(true)} className={"brutal p-6 min-h-[240px] flex flex-col items-center justify-center text-center transition-all "+(flipped?"bg-[#CAFFBF]":"bg-white cursor-pointer")}>
        {!flipped ? (
          <><p className="font-heading text-lg sm:text-xl leading-snug">{q.question}</p>
          {q.type==="mc" && <div className="mt-4 space-y-1 w-full text-left">{q.options?.map((opt,i)=><div key={i} className="text-xs font-semibold border border-black rounded px-2 py-1 bg-white">{opt}</div>)}</div>}
          <p className="text-xs font-semibold text-muted-foreground mt-5">Tippen zum Aufdecken</p></>
        ) : (
          <><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Antwort</span>
          <p className="font-heading text-xl sm:text-2xl text-green-700">{q.correct_answer}</p>
          {q.explanation && <p className="text-xs font-semibold text-muted-foreground mt-3 max-w-xs">{q.explanation}</p>}</>
        )}
      </div>
      {flipped ? (
        <div className="flex gap-3 mt-4">
          <button onClick={markUnknown} className="brutal-btn bg-[#FFADAD] flex-1 py-3 font-heading flex items-center justify-center gap-2"><X className="w-5 h-5" /> Nicht gewusst</button>
          <button onClick={markKnown} className="brutal-btn bg-[#CAFFBF] flex-1 py-3 font-heading flex items-center justify-center gap-2"><Check className="w-5 h-5" /> Gewusst</button>
        </div>
      ) : (
        <button onClick={() => setFlipped(true)} className="brutal-btn bg-[#FDFFB6] w-full py-3 mt-4 font-heading flex items-center justify-center gap-2"><ChevronRight className="w-5 h-5" /> Aufdecken</button>
      )}
    </div>
  );
}
