import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SLIDES = [
  {
    step: "1", title: "Foto machen",
    desc: "Fotografiere eine Seite aus deinem Lehrbuch, Skript oder deinen Notizen.",
    color: "bg-[#FDFFB6]",
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
    step: "2", title: "Fragen erhalten",
    desc: "Die KI erstellt daraus passende Prüfungsfragen zu genau diesem Stoff.",
    color: "bg-[#CAFFBF]",
    visual: (
      <div className="w-full h-48 bg-[#CAFFBF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-3 p-4">
        <span className="text-5xl">🤖</span>
        <div className="w-full space-y-1.5">
          {["Multiple Choice","Wahr/Falsch","Lückentext"].map((t,i) => (
            <div key={t} className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">{i+1}</span>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "3", title: "Sofort Feedback bekommen",
    desc: "Sieh direkt, welche Antworten richtig sind und wo du noch üben kannst.",
    color: "bg-[#9BF6FF]",
    visual: (
      <div className="w-full h-48 bg-[#9BF6FF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-2 p-4">
        <span className="text-5xl">✅</span>
        <div className="w-full space-y-1.5">
          <div className="bg-[#CAFFBF] border border-black rounded px-2 py-1 text-xs font-bold flex items-center gap-2">✓ Richtige Antwort erklärt</div>
          <div className="bg-[#FFADAD] border border-black rounded px-2 py-1 text-xs font-bold flex items-center gap-2">✗ Falsch – Erklärung anzeigen</div>
          <div className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold flex items-center gap-2">📊 Fortschritt gespeichert</div>
        </div>
      </div>
    ),
  },
];

const QUESTIONS = [
  {
    q: "Was solltest du tun, bevor du ein elektrisches Gerät reparierst?",
    options: ["Das Gehäuse sofort öffnen", "Das Gerät von der Stromversorgung trennen", "Die Lautstärke prüfen"],
    correct: 1,
    feedback: "Vor Arbeiten an einem elektrischen Gerät muss es von der Stromversorgung getrennt sein.",
  },
  {
    q: "Was hilft bei einem Gespräch mit Kundinnen und Kunden zuerst?",
    options: ["Aktiv zuhören und Bedürfnisse erkennen", "Sofort das teuerste Produkt anbieten", "Das Gespräch möglichst kurz halten"],
    correct: 0,
    feedback: "Aktives Zuhören ist die Basis jeder guten Kundenberatung.",
  },
  {
    q: "Welches Dokument zeigt den Gewinn eines Unternehmens?",
    options: ["Die Bilanz", "Die Erfolgsrechnung", "Der Lohnausweis"],
    correct: 1,
    feedback: "Die Erfolgsrechnung zeigt Erträge und Aufwände – und damit den Gewinn oder Verlust.",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [shuffledQ, setShuffledQ] = useState(QUESTIONS);
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
    if (qIdx + 1 >= QUESTIONS.length) setTimeout(() => setDone(true), 800);
    else setTimeout(() => setQIdx(q => q + 1), 1200);
  };

  const shuffle = (a) => { const b = [...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
  const [shuffledQ, setShuffledQ] = useState(QUESTIONS);
  const reset = () => { setShuffledQ(shuffle(QUESTIONS)); setQIdx(0); setAnswers({}); setDone(false); };

  const q = shuffledQ[qIdx];
  const picked = answers[qIdx];

  return (
    <>
      {/* Berufe Section */}
      <section className="py-12 px-5 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">JEDER BERUF WÄHLBAR</p>
        <div className="bg-white border-2 border-black rounded-[20px] p-7 shadow-[6px_6px_0_0_#000]">
          <h2 className="font-heading text-[1.7rem] text-center tracking-tight">Für welchen Beruf lernst du?</h2>
          <p className="text-center text-[#555] max-w-[480px] mx-auto mt-1.5 mb-6">Egal welche Berufslehre — LAP QUIZ deckt sie ab.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Kaufmann/-frau EFZ", emoji: "📊", color: "bg-[#FDFFB6]" },
              { label: "Elektroinstallateur/in EFZ", emoji: "⚡", color: "bg-[#FFD6A5]" },
              { label: "Fachfrau/-mann Gesundheit EFZ", emoji: "🩺", color: "bg-[#FFADAD]" },
              { label: "Informatiker/in EFZ", emoji: "💻", color: "bg-[#9BF6FF]" },
              { label: "Coiffeur/-euse EFZ", emoji: "✂️", color: "bg-[#BDB2FF]" },
              { label: "Logistiker/in EFZ", emoji: "📦", color: "bg-[#CAFFBF]" },
              { label: "Detailhandelsfachmann/-frau EFZ", emoji: "🛍️", color: "bg-[#FFD6A5]" },
              { label: "Theorieprüfung Auto (Kat. B)", emoji: "🚗", color: "bg-[#9BF6FF]" },
              { label: "+ dein Beruf", emoji: "🎓", color: "bg-white" },
            ].map((b) => (
              <span key={b.label} className={"border-2 border-black rounded-full py-2 px-4 text-sm font-semibold flex items-center gap-1.5 " + b.color}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* So funktioniert LAP Quiz */}
      <section className="px-5 py-12 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">SO FUNKTIONIERT LAP QUIZ</p>
        <h2 className="text-3xl font-black mb-6 leading-tight">Vom Lernstoff zur passenden Prüfungsfrage – Schritt für Schritt.</h2>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Visual */}
          <div>
            {SLIDES[slide].visual}
            <div className="flex gap-2 mt-3 justify-center">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={"h-2 rounded-full border-2 border-black transition-all " + (slide === i ? "bg-black w-8" : "bg-white w-4")} />
              ))}
            </div>
          </div>
          {/* Steps */}
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
            {/* Prüfungsimport */}
            <li className="border-2 border-black rounded-2xl p-4 bg-white opacity-60">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-black font-black text-sm shrink-0 bg-[#BDB2FF]">+</span>
                <span className="font-extrabold text-sm">Eigene Prüfungen importieren</span>
              </div>
            </li>
          </ol>
        </div>

        {/* Prüfungsimport Erklärung */}
        <div className="mt-6 border-2 border-black rounded-2xl bg-[#BDB2FF] p-5 shadow-[4px_4px_0_#000]">
          <p className="font-black text-lg mb-1">📥 Prüfungen importieren & exportieren</p>
          <p className="text-sm text-[#333] leading-relaxed">
            Erstelle eigene Prüfungen mit deinen Fragen, exportiere sie als JSON-Datei und teile sie mit Lernkolleg:innen.
            Importiere Prüfungen von anderen direkt in dein Konto – mit einem Klick. Prüfungsdaten kannst du auch als Inserat verkaufen.
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">📤 Exportieren</span>
            <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">📥 Importieren</span>
            <span className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold">🛍️ Als Inserat verkaufen</span>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-5 py-10">
        <div className="bg-black rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <h2 className="text-white font-black text-2xl md:text-3xl max-w-xl leading-tight">Bereit für den nächsten Lernschritt?</h2>
          <button onClick={() => navigate("/faecher")}
            className="shrink-0 bg-[#FDFFB6] border-2 border-black rounded-xl px-7 py-4 font-bold text-black shadow-[4px_4px_0_#555] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            Quiz starten
          </button>
        </div>
      </section>

      {/* Beispielfragen */}
      <section className="px-5 py-12 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">KURZ AUSPROBIEREN</p>
        <h2 className="text-3xl font-black mb-1 leading-tight">Drei Beispielfragen zum Einstieg.</h2>

        {done ? (
          <div className="border-2 border-black rounded-2xl bg-[#CAFFBF] p-8 text-center shadow-[5px_5px_0_#000]">
            <p className="font-black text-2xl mb-1">Super gemacht! 🎉</p>
            <p className="text-[#555] mb-4">{Object.values(answers).filter((a, i) => a === shuffledQ[i]?.correct).length} von {shuffledQ.length} richtig</p>
            <button onClick={reset} className="border-2 border-black rounded-xl px-6 py-3 bg-white font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Nochmal versuchen</button>
          </div>
        ) : (
          <div className="border-2 border-black rounded-2xl bg-white p-6 sm:p-8 shadow-[5px_5px_0_#000]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#555]">Dein Fortschritt</span>
              <span className="text-sm font-bold">{qIdx + 1} / {shuffledQ.length}</span>
            </div>
            <div className="h-3 border-2 border-black rounded-full bg-[#f0f0f0] overflow-hidden mb-6">
              <div className="h-full bg-black transition-all duration-300" style={{ width: (qIdx / shuffledQ.length * 100) + "%" }} />
            </div>
            <h3 className="font-extrabold text-lg mb-5 leading-snug">{q.q}</h3>
            <div className="grid gap-3">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const isCorrect = i === q.correct;
                let bg = "bg-white hover:bg-[#f8f8f8]";
                if (picked !== undefined && isCorrect) bg = "bg-[#CAFFBF]";
                if (picked !== undefined && isPicked && !isCorrect) bg = "bg-[#FFADAD]";
                return (
                  <button key={i} disabled={picked !== undefined} onClick={() => answer(i)}
                    className={"border-2 border-black rounded-xl p-4 text-left font-semibold transition-all shadow-[3px_3px_0_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] " + bg}>
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
    </>
  );
}
