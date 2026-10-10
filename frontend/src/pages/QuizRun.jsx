import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { X, Clock } from "lucide-react";

import { db } from "@/api/base44Client";

import { getSubject, isCorrect, formatClock } from "@/lib/subjects";
import QuestionCard from "@/components/quiz/QuestionCard";
import FeedbackPanel from "@/components/quiz/FeedbackPanel";
import SessionSummary from "@/components/quiz/SessionSummary";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizRun() {
  const { subject: subjectId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { db.auth.me().then(setCurrentUser).catch(() => {}); }, []);
  const subject = getSubject(subjectId);

  const countParam = params.get("count") || "10";
  const timerParam = params.get("timer") || "Aus";
  const own = params.get("own") === "1";
  const countdown = ["15", "30", "60"].includes(timerParam) ? Number(timerParam) * 60 : 0;

  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [saved, setSaved] = useState(false);

  const [seed, setSeed] = useState(0);

  useEffect(() => {
    (async () => {
      setQuestions(null);
      const profession = currentUser?.profession || null;
      const filter = profession ? { subject: subjectId, profession } : { subject: subjectId };
      const base = await db.entities.Question.filter(filter, "-created_date", 500);
      let pool = [...base];
      if (own) {
        const mine = await db.entities.UserQuestion.filter({ subject: subjectId }, "-created_date", 500);
        pool = [...pool, ...mine];
      }
      let qs = shuffle(pool);
      if (countParam !== "Alle") qs = qs.slice(0, Number(countParam));
      setQuestions(qs);
      setIdx(0); setAnswers({}); setElapsed(0); setSubmitted(false); setTimeUp(false); setSaved(false);
    })();
  }, [subjectId, countParam, own, seed]);

  useEffect(() => {
    if (!questions || submitted) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [questions, submitted]);

  useEffect(() => {
    if (countdown && !submitted && elapsed >= countdown) { setTimeUp(true); setSubmitted(true); }
  }, [elapsed, countdown, submitted]);

  const answered = useMemo(() => Object.keys(answers).length, [answers]);
  const correct = useMemo(() => (questions || []).filter((q) => isCorrect(q, answers[q.id])).length, [questions, answers]);

  useEffect(() => {
    if (submitted && !saved && questions && answered > 0) {
      setSaved(true);
      db.entities.StudySession.create({
        subject: subjectId,
        question_count: answered,
        correct_count: correct,
        duration_seconds: elapsed,
      }).then(() => qc.invalidateQueries({ queryKey: ["sessions"] }));
    }
  }, [submitted, saved, questions, answered, correct, elapsed, subjectId, qc]);

  if (!subject) return <p className="text-center py-20 font-semibold">Fach nicht gefunden.</p>;
  if (!questions) return <div className="grid place-items-center py-24"><div className="w-10 h-10 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;
  if (!questions.length) return (
    <div className="text-center py-20">
      <p className="font-heading text-2xl">Keine Fragen</p>
      <p className="font-semibold text-muted-foreground mt-2">Für dieses Fach sind noch keine Fragen vorhanden.</p>
      <Link to="/faecher" className="brutal-btn bg-[#FDFFB6] px-5 py-3 inline-block mt-6">Zurück</Link>
    </div>
  );

  if (submitted) return <SessionSummary subject={subject} answered={answered} correct={correct} seconds={elapsed} timeUp={timeUp} onRestart={() => setSeed((s) => s + 1)} />;

  const q = questions[idx];
  const currentAnswer = answers[q.id] ?? null;
  const onAnswer = (a) => setAnswers((prev) => ({ ...prev, [q.id]: a }));
  const clockValue = countdown ? countdown - elapsed : elapsed;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate(`/quiz/${subjectId}`)} className="p-2 border-2 border-black rounded-lg bg-white hover:bg-[#FFADAD] transition-all"><X className="w-5 h-5" /></button>
        <div className="flex-1 h-4 border-2 border-black rounded-full bg-white overflow-hidden">
          <div className="h-full bg-[#CAFFBF] border-r-2 border-black transition-all duration-500" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <div className={`border-2 border-black rounded-lg px-3 py-1.5 font-bold tabular-nums ${countdown && clockValue < 60 ? "bg-[#FFADAD]" : "bg-white"}`}>
          <Clock className="w-4 h-4 inline mr-1" />{formatClock(clockValue)}
        </div>
      </div>

      <p className="text-sm font-bold mt-4 mb-3">{subject.name} · Frage {idx + 1} / {questions.length}</p>
      <QuestionCard key={q.id} q={q} answer={currentAnswer} onAnswer={onAnswer} reveal={currentAnswer !== null} locked={currentAnswer !== null} />
      {currentAnswer !== null && (
        <FeedbackPanel correct={isCorrect(q, currentAnswer)} q={q} onNext={() => (idx + 1 >= questions.length ? setSubmitted(true) : setIdx(idx + 1))} isLast={idx + 1 >= questions.length} />
      )}
    </div>
  );
}
