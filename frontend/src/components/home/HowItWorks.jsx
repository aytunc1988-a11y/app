import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
    { step: "1", title: "Foto machen", color: "bg-[#CAFFBF]", desc: "Fotografiere eine Lehrbuchseite — die KI erkennt den Inhalt automatisch.",
    visual: <div className="w-full h-48 bg-[#CAFFBF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-3"><span className="text-6xl">📸</span><span className="font-bold text-sm">Lehrbuchseite fotografieren</span><span className="text-xs px-4 text-center text-[#555]">KI erkennt Inhalt automatisch</span></div> },
  { step: "2", title: "Fragen erhalten", color: "bg-[#9BF6FF]", desc: "Die KI generiert passende MC-, Wahr/Falsch- und Lückentextfragen zu deinem Stoff.",
    visual: <div className="w-full h-48 bg-[#9BF6FF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-3 p-4"><span className="text-5xl">🤖</span><div className="w-full space-y-1.5">{["Multiple Choice","Wahr/Falsch","Lückentext"].map((t,i)=><div key={t} className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">{i+1}</span>{t}</div>)}</div></div> },
  { step: "3", title: "Sofort Feedback", color: "bg-[#BDB2FF]", desc: "Sieh ob deine Antwort stimmt — mit Erklärung. Fortschritt wird gespeichert.",
    visual: <div className="w-full h-48 bg-[#BDB2FF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-2 p-4"><span className="text-5xl">✅</span><div className="w-full space-y-1.5"><div className="bg-[#CAFFBF] border border-black rounded px-2 py-1 text-xs font-bold">✓ Richtige Antwort erklärt</div><div className="bg-[#FFADAD] border border-black rounded px-2 py-1 text-xs font-bold">✗ Falsch – Erklärung anzeigen</div><div className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold">📊 Fortschritt gespeichert</div></div></div> },
];

const ALL_QUESTIONS = [
  { type: "mc", q: "Welche beiden Seiten gehören zur Bilanz?", options: ["Aktiven","Passiven","Aufwand","Ertrag","Lohnabrechnung"], correct: [0, 1], feedback: "Die Bilanz stellt die Aktiven den Passiven gegenüber. Aufwand und Ertrag gehören in die Erfolgsrechnung." },
  { type: "mc", q: "Was ist vor einer Reparatur an einem elektrischen Gerät wichtig?", options: ["Das Gehäuse sofort öffnen","Das Gerät von der Stromversorgung trennen","Die Lautstärke prüfen","Ein anderes Kabel anschliessen"], correct: [1], feedback: "Vor Arbeiten an einem elektrischen Gerät muss es von der Stromversorgung getrennt sein." },
  { type: "mc", q: "Was hilft bei einem Gespräch mit Kund:innen?", options: ["Aktiv zuhören","Bedürfnisse mit Fragen klären","Sofort das teuerste Produkt anbieten","Einwände ignorieren"], correct: [0, 1], feedback: "Aktives Zuhören und passende Fragen helfen, die Bedürfnisse von Kund:innen zu erkennen." },
  { type: "mc", q: "Was versteht man unter Bruttolohn?", options: ["Lohn nach allen Abzügen","Lohn vor allen Abzügen","Nur der Grundlohn","Der Nettolohn plus Spesen"], correct: [1], feedback: "Der Bruttolohn ist das Gehalt vor Abzug von Steuern und Sozialversicherungsbeiträgen." },
  { type: "mc", q: "Was bedeutet NIN im Elektrobereich?", options: ["Niederspannungs-Installations-Norm","Nationaler Installations-Nachweis","Neue Industrie-Norm","Norm für Netzwerkinstallationen","Nationale Informationsnorm"], correct: [0], feedback: "NIN steht für Niederspannungs-Installations-Norm und regelt elektrische Installationen in der Schweiz." },
  { type: "tf", q: "Aktivkonten zeigen Vermögenswerte eines Unternehmens.", options: ["Wahr", "Falsch"], correct: [0], feedback: "Aktivkonten stehen auf der linken Seite der Bilanz und zeigen Vermögenswerte." },
  { type: "tf", q: "Der Nettolohn ist der Lohn vor allen Abzügen.", options: ["Wahr", "Falsch"], correct: [1], feedback: "Der Nettolohn ist der Betrag nach den Abzügen. Der Bruttolohn steht vor den Abzügen." },
  { type: "tf", q: "Vor Arbeiten an einem elektrischen Gerät muss die Stromzufuhr getrennt werden.", options: ["Wahr", "Falsch"], correct: [0], feedback: "Das Gerät muss vor Reparaturarbeiten sicher von der Stromversorgung getrennt werden." },
  { type: "gap", q: "Die Erfolgsrechnung zeigt Erträge und Aufwände – und damit den ___ oder Verlust.", answers: ["gewinn"], feedback: "Der Saldo aus Erträgen und Aufwänden ergibt den Gewinn oder Verlust." },
  { type: "gap", q: "Vor der Reparatur muss ein elektrisches Gerät von der Stromversorgung ___ werden.", answers: ["getrennt"], feedback: "Das Trennen von der Stromversorgung verhindert, dass während der Reparatur Strom fliesst." },
  { type: "gap", q: "Aktivkonten zeigen die ___ eines Unternehmens.", answers: ["vermögenswerte", "vermoegenswerte"], feedback: "Aktiven sind die Vermögenswerte eines Unternehmens und werden auf der Aktivseite der Bilanz aufgeführt." },
];

function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

function createQuestionSet(previousQuestions = []) {
  const previousByType = new Map(previousQuestions.map((question) => [question.type, question.q]));
  const types = ["mc", "tf", "gap"];
  const selected = types.map((type) => {
    const questions = ALL_QUESTIONS.filter((question) => question.type === type);
    const alternatives = questions.filter((question) => question.q !== previousByType.get(type));
    const pool = alternatives.length ? alternatives : questions;
    return pool[Math.floor(Math.random() * pool.length)];
  });
  return shuffle(selected);
}

const normalizeAnswer = (answer) => answer.trim().toLocaleLowerCase("de-CH");

export default function HowItWorks() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [questions, setQuestions] = useState(() => createQuestionSet());
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState([]);
  const [gapAnswer, setGapAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 3500);
    return () => clearInterval(t);
  }, []);

  const q = questions[qIdx];
  const canCheck = q.type === "gap" ? gapAnswer.trim().length > 0 : picked.length > 0;
  const answer = (i) => {
    if (checked) return;
    setPicked((current) => {
      if (q.type === "tf") return [i];
      return current.includes(i) ? current.filter((value) => value !== i) : [...current, i];
    });
  };

  const checkAnswer = () => {
    if (checked || !canCheck) return;
    const isCorrect = q.type === "gap"
      ? q.answers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(gapAnswer))
      : picked.length === q.correct.length && q.correct.every((answer) => picked.includes(answer));
    setChecked(true);
    if (isCorrect) setCorrect((count) => count + 1);
  };

  const next = () => {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    setQIdx((index) => index + 1);
    setPicked([]);
    setGapAnswer("");
    setChecked(false);
  };

  const reset = () => {
    setQuestions((previousQuestions) => createQuestionSet(previousQuestions));
    setQIdx(0);
    setPicked([]);
    setGapAnswer("");
    setChecked(false);
    setDone(false);
    setCorrect(0);
  };

  return (
    <>

      {/* 2. SO FUNKTIONIERT ES */}
      <section className="px-5 py-12 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">SO FUNKTIONIERT LAP QUIZ</p>
        <h2 className="text-2xl font-black mb-6 leading-tight">Foto rein. Fragen raus.</h2>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            {SLIDES[slide].visual}
            <div className="flex gap-2 mt-3 justify-center">
              {SLIDES.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={"h-2 rounded-full border-2 border-black transition-all " + (slide === i ? "bg-black w-8" : "bg-white w-4")} />)}
            </div>
          </div>
          <ol className="space-y-2">
            {SLIDES.map((s, i) => (
              <li key={i} onClick={() => setSlide(i)} className={"border-2 border-black rounded-2xl p-4 cursor-pointer transition-all " + (slide === i ? s.color + " shadow-[4px_4px_0_#000]" : "bg-white opacity-60")}>
                <div className="flex items-center gap-2">
                  <span className={"inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-black font-black text-sm shrink-0 " + s.color}>{s.step}</span>
                  <span className="font-extrabold text-sm">{s.title}</span>
                </div>
                {slide === i && <p className="text-sm text-[#555] mt-1.5 ml-9">{s.desc}</p>}
              </li>
            ))}
            <li className="border-2 border-black rounded-2xl p-4 bg-[#BDB2FF] shadow-[4px_4px_0_#000]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-black font-black text-sm shrink-0 bg-white">+</span>
                <span className="font-extrabold text-sm">Eigene Prüfungen importieren & exportieren</span>
              </div>
              <div className="flex gap-2 mt-2 ml-9 flex-wrap">
                <span className="bg-white border border-black rounded-full px-2 py-0.5 text-[10px] font-bold">📤 Export</span>
                <span className="bg-white border border-black rounded-full px-2 py-0.5 text-[10px] font-bold">📥 Import</span>
                <span className="bg-white border border-black rounded-full px-2 py-0.5 text-[10px] font-bold">🛍️ Verkaufen</span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* 3. DEMO */}
      <section className="px-5 py-12 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">PROBIER ES AUS</p>
        <h2 className="text-2xl font-black mb-6 leading-tight">Drei Beispielfragen – direkt hier.</h2>
        {done ? (
          <div className="border-2 border-black rounded-2xl bg-[#CAFFBF] p-8 text-center shadow-[5px_5px_0_#000]">
            <p className="font-black text-2xl mb-1">Super gemacht! 🎉</p>
            <p className="text-[#555] mb-5">{correct} von {questions.length} richtig</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={reset} className="border-2 border-black rounded-xl px-6 py-3 bg-white font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Neue Fragen</button>
              <button onClick={() => navigate("/register")} className="border-2 border-black rounded-xl px-6 py-3 bg-[#FDFFB6] font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Kostenlos starten →</button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-black rounded-2xl bg-white p-6 shadow-[5px_5px_0_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#555]">
                {q.type === "mc" ? "Multiple Choice · alle zutreffenden wählen" : q.type === "tf" ? "Wahr/Falsch" : "Lückentext"}
              </span>
              <span className="text-sm font-bold">{qIdx + 1} / {questions.length}</span>
            </div>
            <div className="h-2 border-2 border-black rounded-full bg-[#f0f0f0] overflow-hidden mb-5">
              <div className="h-full bg-black transition-all duration-300" style={{ width: ((qIdx + (checked ? 1 : 0)) / questions.length * 100) + "%" }} />
            </div>
            <h3 className="font-extrabold text-lg mb-4 leading-snug">{q.q}</h3>
            {q.type === "gap" ? (
              <label className="modern-demo-gap">
                <span>Deine Antwort</span>
                <input
                  value={gapAnswer}
                  onChange={(event) => setGapAnswer(event.target.value)}
                  disabled={checked}
                  aria-label="Antwort für den Lückentext"
                />
                {checked && (
                  <span className={`modern-demo-gap-result ${q.answers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(gapAnswer)) ? "is-correct" : "is-incorrect"}`}>
                    {q.answers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(gapAnswer)) ? "✓ Richtig" : `Richtige Antwort: ${q.answers[0]}`}
                  </span>
                )}
              </label>
            ) : (
              <div className="grid gap-2">
                {q.options.map((opt, i) => {
                  const selected = picked.includes(i);
                  const isRight = q.correct.includes(i);
                  const stateClass = checked ? (isRight ? "is-correct" : selected ? "is-incorrect" : "") : selected ? "is-selected" : "";
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={checked}
                      onClick={() => answer(i)}
                      aria-pressed={selected}
                      className={`modern-demo-option ${stateClass} border-2 border-black rounded-xl p-3.5 text-left font-semibold text-sm transition-all shadow-[3px_3px_0_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]`}
                    >
                      {q.type === "mc" && `${String.fromCharCode(65 + i)}) `}{opt}
                      {checked && isRight && <span className="modern-demo-answer-badge is-correct">{selected ? "✓ Richtig gewählt" : "✓ Richtige Antwort"}</span>}
                      {checked && selected && !isRight && <span className="modern-demo-answer-badge is-incorrect">✕ Falsch gewählt</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {checked && (
              <div className="modern-demo-explanation" aria-live="polite">
                <span className="modern-demo-explanation-icon" aria-hidden="true">?</span>
                <div>
                  <h4>Erklärung</h4>
                  <p>{q.feedback}</p>
                </div>
              </div>
            )}
            {!checked ? (
              <button
                onClick={checkAnswer}
                disabled={!canCheck}
                className="modern-demo-check mt-3 w-full border-2 border-black rounded-xl py-3 bg-[#FDFFB6] font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                Antwort prüfen
              </button>
            ) : (
              <button onClick={next} className="mt-3 w-full border-2 border-black rounded-xl py-3 bg-[#FDFFB6] font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                {qIdx + 1 >= questions.length ? "Ergebnis anzeigen →" : "Weiter →"}
              </button>
            )}
          </div>
        )}
      </section>

      {/* 4. MARKTPLATZ & CHAT */}
      <section className="px-5 py-12 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">MEHR ALS NUR QUIZ</p>
        <h2 className="text-2xl font-black mb-5 leading-tight">Lerngemeinschaft & Marktplatz.</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border-2 border-black rounded-2xl p-5 bg-[#CAFFBF] shadow-[4px_4px_0_#000]">
            <span className="text-3xl">🛍️</span>
            <h3 className="font-black text-lg mt-2 mb-1">Marktplatz</h3>
            <p className="text-sm text-[#333] leading-relaxed">Kaufe und verkaufe Lernunterlagen, Prüfungsdaten und Zusammenfassungen. Exportiere deine Prüfungen und verkaufe sie als Inserat.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">📤 Exportieren</span>
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">💰 Verkaufen</span>
            </div>
          </div>
          <div className="border-2 border-black rounded-2xl p-5 bg-[#9BF6FF] shadow-[4px_4px_0_#000]">
            <span className="text-3xl">💬</span>
            <h3 className="font-black text-lg mt-2 mb-1">Chat & Lernpartner</h3>
            <p className="text-sm text-[#333] leading-relaxed">Finde Lernpartner:innen für deinen Beruf und lerne gemeinsam auf die LAP. Direkt im Chat austauschen.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">👥 Lernpartner finden</span>
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">💬 Direkt chatten</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-10">
        <div className="bg-black rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <h2 className="text-white font-black text-2xl md:text-3xl max-w-xl leading-tight">Bereit für den nächsten Lernschritt?</h2>
          <button onClick={() => navigate("/register")} className="shrink-0 bg-[#FDFFB6] border-2 border-black rounded-xl px-7 py-4 font-bold text-black shadow-[4px_4px_0_#555] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            Kostenlos starten →
          </button>
        </div>
      </section>
    </>
  );
}
