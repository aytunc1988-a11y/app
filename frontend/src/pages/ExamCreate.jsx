import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";

import { db } from "@/api/base44Client";
import { SUBJECTS, professionSubjects } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import QuestionPicker from "@/components/exam/QuestionPicker";
import TimerPicker from "@/components/setup/TimerPicker";
import ExamAiGenerate from "@/components/exam/ExamAiGenerate";

export default function ExamCreate() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const profSubjects = professionSubjects(user?.profession || "kaufmann");
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("learn");
  const [timer, setTimer] = useState(0);
  const [subject, setSubject] = useState(profSubjects[0]?.id || SUBJECTS[0].id);
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState(new Set());

  const { data: mine = [] } = useQuery({ queryKey: ["userQuestions"], queryFn: () => db.entities.UserQuestion.list("-created_date", 1000) });
  const list = mine.filter((q) => q.subject === subject);

  const toggle = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const selectAll = () => {
    const all = list.every((q) => selected.has(q.id));
    setSelected((prev) => {
      const n = new Set(prev);
      list.forEach((q) => (all ? n.delete(q.id) : n.add(q.id)));
      return n;
    });
  };

  const create = async () => {
    if (!title.trim()) return;
    if (selected.size === 0) return;
    const exam = await db.entities.CustomExam.create({
      title: title.trim(),
      mode,
      timer_minutes: mode === "exam" ? timer : 0,
      question_ids: [...selected],
    });
    qc.invalidateQueries({ queryKey: ["exams"] });
    navigate(`/pruefung/${exam.id}`);
  };

  return (
    <div>
      <button onClick={() => navigate("/pruefungen")} className="brutal-btn bg-white px-3 py-2 inline-flex items-center gap-1 text-sm mb-5">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <h1 className="font-heading text-2xl sm:text-3xl">Neue Prüfung</h1>

      <div className="space-y-5 mt-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Titel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. RW Mock-Prüfung" className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-semibold bg-white" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Modus</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { id: "learn", label: "Lernen", hint: "Sofort-Feedback", bg: "bg-[#CAFFBF]" },
              { id: "exam", label: "Prüfung", hint: "Streng, mit Zeit", bg: "bg-[#FFADAD]" },
            ].map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className={`brutal p-3 text-left ${mode === m.id ? m.bg : "bg-white"}`}>
                <div className="font-heading">{m.label}</div>
                <div className="text-xs font-semibold text-muted-foreground">{m.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {mode === "exam" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Zeitlimit</label>
            <div className="mt-1"><TimerPicker value={timer} onChange={setTimer} /></div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Fach (für KI-Generierung)</label>
          <select value={subject} onChange={(e) => { setSubject(e.target.value); setSelected(new Set()); }} className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white">
            {profSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Thema (optional)</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z.B. Doppelte Buchhaltung, Bilanz, Zeitformen…" className="w-full mt-1 border-2 border-black rounded-lg px-3 py-2 font-semibold bg-white" />
          <p className="text-[11px] font-semibold text-muted-foreground mt-1">Die KI generiert Fragen passend zum Fach und diesem Thema.</p>
        </div>

        <ExamAiGenerate subject={subject} topic={topic} onDone={(ids) => setSelected((prev) => new Set([...prev, ...ids]))} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-widest">Fragen ({selected.size} ausgewählt)</label>
            {list.length > 0 && (
              <button onClick={selectAll} className="text-xs font-bold underline">
                {list.every((q) => selected.has(q.id)) ? "Alle abwählen" : "Alle auswählen"}
              </button>
            )}
          </div>
          <QuestionPicker questions={list} selected={selected} onToggle={toggle} />
        </div>

        <button onClick={create} disabled={!title.trim() || selected.size === 0} className="brutal-btn bg-[#FDFFB6] w-full py-4 font-heading flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Prüfung erstellen ({selected.size})
        </button>
      </div>
    </div>
  );
}
