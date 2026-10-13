import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BERUFE = [
  { label: "Kaufmann/-frau EFZ", emoji: "📊", color: "bg-[#FDFFB6]" },
  { label: "Elektroinstallateur/in EFZ", emoji: "⚡", color: "bg-[#FFD6A5]" },
  { label: "Fachfrau/-mann Gesundheit EFZ", emoji: "🩺", color: "bg-[#FFADAD]" },
  { label: "Informatiker/in EFZ", emoji: "💻", color: "bg-[#9BF6FF]" },
  { label: "Coiffeur/-euse EFZ", emoji: "✂️", color: "bg-[#BDB2FF]" },
  { label: "Logistiker/in EFZ", emoji: "📦", color: "bg-[#CAFFBF]" },
  { label: "Detailhandelsfachmann/-frau EFZ", emoji: "🛍️", color: "bg-[#FFD6A5]" },
  { label: "Theorieprüfung Auto (Kat. B)", emoji: "🚗", color: "bg-[#9BF6FF]" },
  { label: "+ dein Beruf", emoji: "🎓", color: "bg-white" },
];

const SLIDES = [
  {
    step: "1", title: "Foto machen", color: "bg-[#FDFFB6]",
    desc: "Fotografiere eine Seite aus deinem Lehrbuch, Skript oder deinen Notizen.",
    visual: (
      <div className="w-full h-48 bg-[#FDFFB6] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-3">
        <span className="text-6xl">📸</span>
        <span className="font-bold text-sm">Lehrbuch fotografieren</span>
        <div className="flex gap-1">
          {["Rechnungswesen","W&G","IKA"].map(t => (
            <span key={t} className="text-[10px] border border-black rounded px-1.5 py-0.5 bg-white font-semibold">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "2", title: "Fragen erhalten", color: "bg-[#CAFFBF]",
    desc: "Die KI erstellt daraus passende Prüfungsfragen zu genau diesem Stoff.",
    visual: (
      <div className="w-full h-48 bg-[#CAFFBF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-3 p-4">
        <span className="text-5xl">🤖</span>
        <div className="w-full space-y-1.5">
          {["Multiple Choice","Wahr/Falsch","Lückentext"].map((t,i) => (
            <div key={t} className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">{i+1}</span>{t}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "3", title: "Sofort Feedback", color: "bg-[#9BF6FF]",
    desc: "Sieh direkt, welche Antworten richtig sind und wo du noch üben kannst.",
    visual: (
      <div className="w-full h-48 bg-[#9BF6FF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-2 p-4">
        <span className="text-5xl">✅</span>
        <div className="w-full space-y-1.5">
          <div className="bg-[#CAFFBF] border border-black rounded px-2 py-1 text-xs font-bold">✓ Richtige Antwort erklärt</div>
          <div className="bg-[#FFADAD] border border-black rounded px-2 py-1 text-xs font-bold">✗ Falsch – Erklärung anzeigen</div>
          <div className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold">📊 Fortschritt gespeichert</div>
        </div>
      </div>
    ),
  },
];

const ALL_QUESTIONS = [
  { q: "Was solltest du tun, bevor du ein elektrisches Gerät reparierst?", options: ["Das Gehäuse sofort öffnen", "Das Gerät von der Stromversorgung trennen", "Die Lautstärke prüfen"], correct: 1, feedback: "Vor Arbeiten an einem elektrischen Gerät muss es von der Stromversorgung getrennt sein." },
  { q: "Was hilft bei einem Gespräch mit Kundinnen und Kunden zuerst?", options: ["Aktiv zuhören und Bedürfnisse erkennen", "Sofort das teuerste Produkt anbieten", "Das Gespräch möglichst kurz halten"], correct: 0, feedback: "Aktives Zuhören ist die Basis jeder guten Kundenberatung." },
  { q: "Welches Dokument zeigt den Gewinn eines Unternehmens?", options: ["Die Bilanz", "Die Erfolgsrechnung", "Der Lohnausweis"], correct: 1, feedback: "Die Erfolgsrechnung zeigt Erträge und Aufwände – und damit den Gewinn oder Verlust." },
  { q: "Was versteht man unter Bruttolohn?", options: ["Lohn nach Abzug aller Sozialversicherungen", "Lohn vor allen Abzügen", "Nur der Grundlohn ohne Zulagen"], correct: 1, feedback: "Der Bruttolohn ist das Gehalt vor Abzug von Steuern und Sozialversicherungsbeiträgen." },
  { q: "Was ist ein Aktivkonto in der Buchhaltung?", options: ["Ein Konto auf der Passivseite der Bilanz", "Ein Konto das Vermögenswerte zeigt", "Ein Konto nur für Erträge"], correct: 1, feedback: "Aktivkonten stehen auf der linken Seite der Bilanz und zeigen Vermögenswerte wie Kasse oder Debitoren." },
];

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function HowItWorks() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [questions, setQuestions] = useState(() => shuffle(ALL_QUESTIONS).slice(0, 3));
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const answer = (i) => {
    if (answers[qIdx] !== undefined) return;
    const next = { ...answers, [qIdx]: i };
    setAnswers(next);
    if (qIdx + 1 >= questions.length) setTimeout(() => setDone(true), 900);
    else setTimeout(() => setQIdx(q => q + 1), 1200);
  };

  const reset = () => {
    setQuestions(shuffle(ALL_QUESTIONS).slice(0, 3));
    setQIdx(0); setAnswers({}); setDone(false);
  };

  const q = questions[qIdx];
  const picked = answers[qIdx];
  const correctCount = Object.values(answers).filter((a, i) => a === questions[i]?.correct).length;

  return (
    <>
      {/* 1. BERUFE */}
      <section className="py-12 px-5 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">JEDER BERUF WÄHLBAR</p>
        <h2 className="text-2xl font-black mb-2 leading-tight">Für welchen Beruf lernst du?</h2>
        <p className="text-[#555] mb-6 text-sm">Egal welche Berufslehre — LAP QUIZ deckt sie ab.</p>
        <div className="flex flex-wrap gap-2">
          {BERUFE.map((b) => (
            <span key={b.label} className={"border-2 border-black rounded-full py-2 px-4 text-sm font-semibold flex items-center gap-1.5 " + b.color}>
              {b.emoji} {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* 2. SO FUNKTIONIERT ES */}
      <section className="px-5 py-12 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">SO FUNKTIONIERT LAP QUIZ</p>
        <h2 className="text-2xl font-black mb-6 leading-tight">Vom Lernstoff zur Prüfungsfrage – in Sekunden.</h2>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            {SLIDES[slide].visual}
            <div className="flex gap-2 mt-3 justify-center">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={"h-2 rounded-full border-2 border-black transition-all " + (slide === i ? "bg-black w-8" : "bg-white w-4")} />
              ))}
            </div>
          </div>
          <ol className="space-y-2">
            {SLIDES.map((s, i) => (
              <li key={i} onClick={() => setSlide(i)}
                className={"border-2 border-black rounded-2xl p-4 cursor-pointer transition-all " + (slide === i ? s.color + " shadow-[4px_4px_0_#000]" : "bg-white opacity-60")}>
                <div className="flex items-center gap-2">
                  <span className={"inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-black font-black text-sm shrink-0 " + s.color}>{s.step}</span>
                  <span className="font-extrabold text-sm">{s.title}</span>
                </div>
                {slide === i && <p className="text-sm text-[#555] mt-1.5 ml-9">{s.desc}</p>}
              </li>
            ))}
            <li className="border-2 border-black rounded-2xl p-4 bg-[#BDB2FF] shadow-[4px_4px_0_#000]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-black font-black text-sm shrink-0 bg-[#BDB2FF]">+</span>
                <span className="font-extrabold text-sm">Eigene Prüfungen importieren & exportieren</span>
              </div>
              <p className="text-xs text-[#333] mt-1.5 ml-9">Erstelle eigene Prüfungen, exportiere als JSON und teile sie — oder verkaufe sie als Inserat.</p>
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
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">KURZ AUSPROBIEREN</p>
        <h2 className="text-2xl font-black mb-6 leading-tight">3 Beispielfragen – direkt hier lösen.</h2>

        {done ? (
          <div className="border-2 border-black rounded-2xl bg-[#CAFFBF] p-8 text-center shadow-[5px_5px_0_#000]">
            <p className="font-black text-2xl mb-1">Super gemacht! 🎉</p>
            <p className="text-[#555] mb-5">{correctCount} von {questions.length} richtig</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={reset} className="border-2 border-black rounded-xl px-6 py-3 bg-white font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                Neue Fragen
              </button>
              <button onClick={() => navigate("/register")} className="border-2 border-black rounded-xl px-6 py-3 bg-[#FDFFB6] font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                Kostenlos starten →
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-black rounded-2xl bg-white p-6 shadow-[5px_5px_0_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#555]">Multiple Choice</span>
              <span className="text-sm font-bold">{qIdx + 1} / {questions.length}</span>
            </div>
            <div className="h-2 border-2 border-black rounded-full bg-[#f0f0f0] overflow-hidden mb-5">
              <div className="h-full bg-black transition-all duration-300" style={{ width: (qIdx / questions.length * 100) + "%" }} />
            </div>
            <h3 className="font-extrabold text-lg mb-4 leading-snug">{q.q}</h3>
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
                    {String.fromCharCode(65+i)}) {opt}
                  </button>
                );
              })}
            </div>
            {picked !== undefined && (
              <p className="mt-4 text-sm bg-[#f7f1e6] border-2 border-black rounded-xl p-4 leading-relaxed">{q.feedback}</p>
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
          <button onClick={() => navigate("/register")}
            className="shrink-0 bg-[#FDFFB6] border-2 border-black rounded-xl px-7 py-4 font-bold text-black shadow-[4px_4px_0_#555] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            Kostenlos starten →
          </button>
        </div>
      </section>
    </>
  );
}
