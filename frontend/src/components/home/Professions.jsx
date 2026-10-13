import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BERUFE = [
  { label: "Kaufmann/-frau EFZ", emoji: "📊", color: "bg-[#FDFFB6]", hi: true },
  { label: "Elektroinstallateur/in EFZ", emoji: "⚡", color: "bg-[#FFD6A5]" },
  { label: "Fachfrau/-mann Gesundheit EFZ", emoji: "🩺", color: "bg-[#FFADAD]" },
  { label: "Informatiker/in EFZ", emoji: "💻", color: "bg-[#9BF6FF]" },
  { label: "Coiffeur/-euse EFZ", emoji: "✂️", color: "bg-[#BDB2FF]" },
  { label: "Logistiker/in EFZ", emoji: "📦", color: "bg-[#CAFFBF]" },
  { label: "Detailhandelsfachmann/-frau EFZ", emoji: "🛍️", color: "bg-[#FFD6A5]" },
  { label: "Theorieprüfung Auto (Kat. B)", emoji: "🚗", color: "bg-[#9BF6FF]" },
  { label: "+ dein Beruf", emoji: "🎓", color: "bg-white" },
];

const DEMO_QUESTIONS = [
  {
    q: "Das Eigenkapital gehört zu den Passiven der Bilanz.",
    type: "tf",
    options: ["Wahr", "Falsch"],
    correct: 0,
    feedback: "Das Eigenkapital steht in der Bilanz auf der Passivseite, zusammen mit dem Fremdkapital.",
  },
  {
    q: "Welches Konto gehört zu den Aktiven in der Bilanz?",
    type: "mc",
    options: ["Verbindlichkeiten", "Warenbestand", "Eigenkapital", "Erträge"],
    correct: 1,
    feedback: "Der Warenbestand ist ein Aktivkonto, da es Vermögenswerte des Unternehmens darstellt.",
  },
  {
    q: "Vor Arbeiten an einem elektrischen Gerät muss es _____ werden.",
    type: "gap",
    options: [],
    correct: 0,
    correctText: "von der Stromversorgung getrennt",
    feedback: "Vor Arbeiten an einem elektrischen Gerät muss es von der Stromversorgung getrennt sein.",
  },
];

export default function Professions() {
  const navigate = useNavigate();
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [gapInput, setGapInput] = useState("");
  const [done, setDone] = useState(false);

  const q = DEMO_QUESTIONS[qIdx];
  const picked = answers[qIdx];

  const answer = (i) => {
    if (picked !== undefined) return;
    const next = { ...answers, [qIdx]: i };
    setAnswers(next);
    if (qIdx + 1 >= DEMO_QUESTIONS.length) setTimeout(() => setDone(true), 800);
    else setTimeout(() => { setQIdx(qi => qi + 1); setGapInput(""); }, 900);
  };

  const answerGap = () => {
    if (picked !== undefined || !gapInput.trim()) return;
    answer(0);
  };

  const reset = () => { setQIdx(0); setAnswers({}); setGapInput(""); setDone(false); };

  const correctCount = Object.values(answers).filter((a, i) => a === 0 || DEMO_QUESTIONS[i]?.correct === a).length;

  return (
    <>
      {/* Berufe Section */}
      <section className="py-12 px-5 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">JEDER BERUF WÄHLBAR</p>
        <div className="bg-white border-2 border-black rounded-[20px] p-7 shadow-[6px_6px_0_0_#000]">
          <h2 className="font-heading text-[1.7rem] text-center tracking-tight">Für welchen Beruf lernst du?</h2>
          <p className="text-center text-[#555] max-w-[480px] mx-auto mt-1.5 mb-6">Egal welche Berufslehre — LAP QUIZ deckt sie ab.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {BERUFE.map((b) => (
              <span key={b.label} className={"border-2 border-black rounded-full py-2 px-4 text-sm font-semibold flex items-center gap-1.5 " + b.color}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Demo erweitert */}
      <section className="px-5 pb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">PROBIER ES AUS</p>
        <h2 className="text-2xl font-black mb-4 leading-tight">Drei Beispielfragen – direkt hier.</h2>

        {done ? (
          <div className="border-2 border-black rounded-2xl bg-[#CAFFBF] p-8 text-center shadow-[5px_5px_0_#000]">
            <p className="font-black text-2xl mb-1">Super gemacht! 🎉</p>
            <p className="text-[#555] mb-4">{correctCount} von {DEMO_QUESTIONS.length} richtig</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={reset} className="border-2 border-black rounded-xl px-6 py-3 bg-white font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Nochmal</button>
              <button onClick={() => navigate("/register")} className="border-2 border-black rounded-xl px-6 py-3 bg-[#FDFFB6] font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Kostenlos starten →</button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-black rounded-2xl bg-white p-6 shadow-[5px_5px_0_#000]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#555]">
                {q.type === "tf" ? "Wahr/Falsch" : q.type === "mc" ? "Multiple Choice" : "Lückentext"}
              </span>
              <span className="text-sm font-bold">{qIdx + 1} / {DEMO_QUESTIONS.length}</span>
            </div>
            <div className="h-2 border-2 border-black rounded-full bg-[#f0f0f0] overflow-hidden mb-5">
              <div className="h-full bg-black transition-all duration-300" style={{ width: (qIdx / DEMO_QUESTIONS.length * 100) + "%" }} />
            </div>
            <h3 className="font-extrabold text-lg mb-5 leading-snug">{q.q}</h3>

            {q.type === "gap" ? (
              <div className="space-y-3">
                <input
                  value={gapInput}
                  onChange={e => setGapInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && answerGap()}
                  disabled={picked !== undefined}
                  placeholder="Deine Antwort…"
                  className="w-full border-2 border-black rounded-xl px-4 py-3 font-semibold bg-white focus:outline-none"
                />
                {picked === undefined && (
                  <button onClick={answerGap} className="border-2 border-black rounded-xl px-6 py-2 bg-[#FDFFB6] font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm">
                    Prüfen
                  </button>
                )}
                {picked !== undefined && (
                  <p className="text-sm font-bold text-green-700">Antwort: {q.correctText}</p>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                {q.options.map((opt, i) => {
                  const isPicked = picked === i;
                  const isCorrect = i === q.correct;
                  let bg = "bg-white hover:bg-[#f8f8f8]";
                  if (picked !== undefined && isCorrect) bg = "bg-[#CAFFBF]";
                  if (picked !== undefined && isPicked && !isCorrect) bg = "bg-[#FFADAD]";
                  return (
                    <button key={i} disabled={picked !== undefined} onClick={() => answer(i)}
                      className={"border-2 border-black rounded-xl p-3.5 text-left font-semibold text-sm transition-all shadow-[3px_3px_0_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] " + bg}>
                      {q.type === "mc" ? String.fromCharCode(65+i) + ") " : ""}{opt}
                    </button>
                  );
                })}
              </div>
            )}
            {picked !== undefined && (
              <p className="mt-4 text-sm bg-[#f7f1e6] border-2 border-black rounded-xl p-4 leading-relaxed">{q.feedback}</p>
            )}
          </div>
        )}
      </section>

      {/* Marktplatz + Chat */}
      <section className="px-5 pb-12 border-t-2 border-black pt-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">MEHR ALS NUR QUIZ</p>
        <h2 className="text-2xl font-black mb-5 leading-tight">Lerngemeinschaft & Marktplatz.</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border-2 border-black rounded-2xl p-5 bg-[#CAFFBF] shadow-[4px_4px_0_#000]">
            <span className="text-3xl">🛍️</span>
            <h3 className="font-black text-lg mt-2 mb-1">Marktplatz</h3>
            <p className="text-sm text-[#333] leading-relaxed">Kaufe und verkaufe Lernunterlagen, Prüfungsdaten und Zusammenfassungen. Exportiere deine eigenen Prüfungen als Datei und verkaufe sie direkt als Inserat.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">📤 Prüfungen exportieren</span>
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">💰 Verkaufen</span>
            </div>
          </div>
          <div className="border-2 border-black rounded-2xl p-5 bg-[#9BF6FF] shadow-[4px_4px_0_#000]">
            <span className="text-3xl">💬</span>
            <h3 className="font-black text-lg mt-2 mb-1">Chat & Lernpartner</h3>
            <p className="text-sm text-[#333] leading-relaxed">Finde Lernpartner:innen für deinen Beruf, tausch Dateien direkt im Chat aus und lerne gemeinsam auf die LAP.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">👥 Lernpartner finden</span>
              <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">📎 Dateien tauschen</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
