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
    { step: "1", title: "Foto machen", color: "bg-[#CAFFBF]", desc: "Fotografiere eine Lehrbuchseite — die KI erkennt den Inhalt automatisch.",
    visual: <div className="w-full h-48 bg-[#CAFFBF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-3"><span className="text-6xl">📸</span><span className="font-bold text-sm">Lehrbuchseite fotografieren</span><span className="text-xs px-4 text-center text-[#555]">KI erkennt Inhalt automatisch</span></div> },
  { step: "2", title: "Fragen erhalten", color: "bg-[#9BF6FF]", desc: "Die KI generiert passende MC-, Wahr/Falsch- und Lückentextfragen zu deinem Stoff.",
    visual: <div className="w-full h-48 bg-[#9BF6FF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-3 p-4"><span className="text-5xl">🤖</span><div className="w-full space-y-1.5">{["Multiple Choice","Wahr/Falsch","Lückentext"].map((t,i)=><div key={t} className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">{i+1}</span>{t}</div>)}</div></div> },
  { step: "3", title: "Sofort Feedback", color: "bg-[#BDB2FF]", desc: "Sieh ob deine Antwort stimmt — mit Erklärung. Fortschritt wird gespeichert.",
    visual: <div className="w-full h-48 bg-[#BDB2FF] border-2 border-black rounded-xl flex flex-col items-center justify-center gap-2 p-4"><span className="text-5xl">✅</span><div className="w-full space-y-1.5"><div className="bg-[#CAFFBF] border border-black rounded px-2 py-1 text-xs font-bold">✓ Richtige Antwort erklärt</div><div className="bg-[#FFADAD] border border-black rounded px-2 py-1 text-xs font-bold">✗ Falsch – Erklärung anzeigen</div><div className="bg-white border border-black rounded px-2 py-1 text-xs font-semibold">📊 Fortschritt gespeichert</div></div></div> },
];

const ALL_QUESTIONS = [
  { q: "Was solltest du tun, bevor du ein elektrisches Gerät reparierst?", options: ["Das Gehäuse sofort öffnen","Das Gerät von der Stromversorgung trennen","Die Lautstärke prüfen"], correct: 1, feedback: "Vor Arbeiten an einem elektrischen Gerät muss es von der Stromversorgung getrennt sein." },
  { q: "Was hilft bei einem Gespräch mit Kund:innen zuerst?", options: ["Aktiv zuhören und Bedürfnisse erkennen","Sofort das teuerste Produkt anbieten","Das Gespräch möglichst kurz halten"], correct: 0, feedback: "Aktives Zuhören ist die Basis jeder guten Kundenberatung." },
  { q: "Welches Dokument zeigt den Gewinn eines Unternehmens?", options: ["Die Bilanz","Die Erfolgsrechnung","Der Lohnausweis"], correct: 1, feedback: "Die Erfolgsrechnung zeigt Erträge und Aufwände – und damit den Gewinn oder Verlust." },
  { q: "Was versteht man unter Bruttolohn?", options: ["Lohn nach allen Abzügen","Lohn vor allen Abzügen","Nur der Grundlohn"], correct: 1, feedback: "Der Bruttolohn ist das Gehalt vor Abzug von Steuern und Sozialversicherungsbeiträgen." },
  { q: "Was ist ein Aktivkonto in der Buchhaltung?", options: ["Ein Konto auf der Passivseite","Ein Konto das Vermögenswerte zeigt","Ein Konto nur für Erträge"], correct: 1, feedback: "Aktivkonten stehen auf der linken Seite der Bilanz und zeigen Vermögenswerte." },
  { q: "Was bedeutet NIN im Elektrobereich?", options: ["Niederspannungs-Installations-Norm","Nationaler Installations-Nachweis","Neue Industrie-Norm"], correct: 0, feedback: "NIN steht für Niederspannungs-Installations-Norm und regelt elektrische Installationen in der Schweiz." },
];

function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

export default function HowItWorks() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [questions, setQuestions] = useState(() => shuffle(ALL_QUESTIONS).slice(0, 3));
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 3500);
    return () => clearInterval(t);
  }, []);

  const answer = (i) => { if (picked !== null) return; setPicked(i); if (i === questions[qIdx].correct) setCorrect(c => c + 1); };

  const next = () => {
    if (qIdx + 1 >= questions.length) { setDone(true); return; }
    setQIdx(q => q + 1); setPicked(null);
  };

  const reset = () => { setQuestions(shuffle(ALL_QUESTIONS).slice(0, 3)); setQIdx(0); setPicked(null); setDone(false); setCorrect(0); };

  const q = questions[qIdx];

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
              <span className="text-xs font-bold uppercase tracking-widest text-[#555]">Multiple Choice</span>
              <span className="text-sm font-bold">{qIdx + 1} / {questions.length}</span>
            </div>
            <div className="h-2 border-2 border-black rounded-full bg-[#f0f0f0] overflow-hidden mb-5">
              <div className="h-full bg-black transition-all duration-300" style={{ width: (qIdx / questions.length * 100) + "%" }} />
            </div>
            <h3 className="font-extrabold text-lg mb-4 leading-snug">{q.q}</h3>
            <div className="grid gap-2">
              {q.options.map((opt, i) => {
                let bg = "bg-white hover:bg-[#f8f8f8]";
                if (picked !== null && i === q.correct) bg = "bg-[#CAFFBF]";
                if (picked !== null && picked === i && i !== q.correct) bg = "bg-[#FFADAD]";
                return (
                  <button key={i} disabled={picked !== null} onClick={() => answer(i)}
                    className={"border-2 border-black rounded-xl p-3.5 text-left font-semibold text-sm transition-all shadow-[3px_3px_0_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] " + bg}>
                    {String.fromCharCode(65+i)}) {opt}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <>
                <p className="mt-4 text-sm bg-[#f7f1e6] border-2 border-black rounded-xl p-4 leading-relaxed">{q.feedback}</p>
                <button onClick={next} className="mt-3 w-full border-2 border-black rounded-xl py-3 bg-[#FDFFB6] font-bold shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  {qIdx + 1 >= questions.length ? "Ergebnis anzeigen →" : "Weiter →"}
                </button>
              </>
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
