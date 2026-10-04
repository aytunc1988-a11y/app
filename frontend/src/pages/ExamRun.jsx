import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { X, Clock, ArrowLeft, ArrowRight, Flag } from "lucide-react";

import { db } from "@/api/base44Client";
import { isCorrect, formatClock } from "@/lib/subjects";
import QuestionCard from "@/components/quiz/QuestionCard";
import FeedbackPanel from "@/components/quiz/FeedbackPanel";
import ExamSummary from "@/components/exam/ExamSummary";

export default function ExamRun() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    (async () => {
      const ex = await db.entities.CustomExam.get(examId);
      setExam(ex);
      const all = await db.entities.UserQuestion.list("-created_date", 3000);
      setQuestions((ex.question_ids || []).map((id) => all.find((q) => q.id === id)).filter(Boolean));
    })();
  }, [examId]);

  useEffect(() => {
    if (!questions || submitted) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [questions, submitted]);

  useEffect(() => {
    if (exam?.mode === "exam" && exam.timer_minutes && elapsed >= exam.timer_minutes * 60 && !submitted) {
      setTimeUp(true);
      setSubmitted(true);
    }
  }, [elapsed, exam, submitted]);

  const restart = () => { setIdx(0); setAnswers({}); setElapsed(0); setSubmitted(false); setTimeUp(false); };

  if (!exam || !questions) return <div className="grid place-items-center py-24"><div className="w-10 h-10 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;
  if (!questions.length) return (
    <div className="text-center py-20">
      <p className="font-heading text-2xl">Keine Fragen</p>
      <p className="font-semibold text-muted-foreground mt-2">Diese Prüfung enthält keine Fragen mehr.</p>
      <Link to="/pruefungen" className="brutal-btn bg-[#FDFFB6] px-5 py-3 inline-block mt-6">Zurück</Link>
    </div>
  );
  if (submitted) return <ExamSummary exam={exam} questions={questions} answers={answers} seconds={elapsed} timeUp={timeUp} onRestart={restart} />;

  const q = questions[idx];
  const currentAnswer = answers[q.id] ?? null;
  const isLearn = exam.mode === "learn";
  const onAnswer = (a) => setAnswers((prev) => ({ ...prev, [q.id]: a }));

  const header = (
    <div className="flex items-center justify-between gap-3">
      <Link to="/pruefungen" className="p-2 border-2 border-black rounded-lg bg-white hover:bg-[#FFADAD] transition-all"><X className="w-5 h-5" /></Link>
      <div className="flex-1 h-4 border-2 border-black rounded-full bg-white overflow-hidden">
        <div className={`h-full ${exam.mode === "exam" ? "bg-[#FFADAD]" : "bg-[#CAFFBF]"} border-r-2 border-black transition-all duration-500`} style={{ width: `${(idx / questions.length) * 100}%` }} />
      </div>
      {isLearn ? (
        <div className="border-2 border-black rounded-lg px-3 py-1.5 font-bold tabular-nums bg-white"><Clock className="w-4 h-4 inline mr-1" />{formatClock(elapsed)}</div>
      ) : (
        <div className={`border-2 border-black rounded-lg px-3 py-1.5 font-bold tabular-nums ${exam.timer_minutes && exam.timer_minutes * 60 - elapsed < 60 ? "bg-[#FFADAD]" : "bg-white"}`}>
          <Clock className="w-4 h-4 inline mr-1" />{formatClock(exam.timer_minutes ? exam.timer_minutes * 60 - elapsed : elapsed)}
        </div>
      )}
    </div>
  );

  if (isLearn) {
    return (
      <div>
        {header}
        <p className="text-sm font-bold mt-4 mb-3">{exam.title} · Frage {idx + 1} / {questions.length}</p>
        <QuestionCard key={q.id} q={q} answer={currentAnswer} onAnswer={onAnswer} reveal={currentAnswer !== null} locked={currentAnswer !== null} />
        {currentAnswer !== null && (
          <FeedbackPanel correct={isCorrect(q, currentAnswer)} q={q} onNext={() => (idx + 1 >= questions.length ? setSubmitted(true) : setIdx(idx + 1))} isLast={idx + 1 >= questions.length} />
        )}
      </div>
    );
  }

  return (
    <div>
      {header}
      <p className="text-sm font-bold mt-4 mb-3">{exam.title} · Frage {idx + 1} / {questions.length} · {Object.keys(answers).length} beantwortet</p>
      <QuestionCard key={q.id} q={q} answer={currentAnswer} onAnswer={onAnswer} reveal={false} locked={false} />
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="brutal-btn bg-white py-3 flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Zurück</button>
        {idx + 1 < questions.length ? (
          <button onClick={() => setIdx(idx + 1)} className="brutal-btn bg-[#FDFFB6] py-3 flex items-center justify-center gap-2">Weiter <ArrowRight className="w-4 h-4" /></button>
        ) : (
          <button onClick={() => setSubmitted(true)} className="brutal-btn bg-black text-white py-3 flex items-center justify-center gap-2"><Flag className="w-4 h-4" /> Abgeben</button>
        )}
      </div>
    </div>
  );
}
