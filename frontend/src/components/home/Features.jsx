import React from "react";

const FEATURES = [
  { ico: "📸", title: "KI aus deinem Material", desc: "Foto von Lehrbuch, Skript oder Notizen — die App erstellt daraus passende Prüfungsfragen." },
  { ico: "🎯", title: "Jeder Beruf wählbar", desc: "Nicht nur Kaufleute: wähle deine Lehre oder Theorieprüfung, alle Fächer sind vorstrukturiert." },
  { ico: "📊", title: "Fortschritt live", desc: "Genauigkeit, Lernzeit und Schwachstellen pro Fach — auf einen Blick in der Statistik." },
];

export default function Features() {
  return (
    <section className="py-12 md:py-[50px] px-5">
      <h2 className="font-heading text-[1.7rem] text-center mb-2 tracking-tight">Warum LAP QUIZ</h2>
      <p className="text-center text-[#555] max-w-[480px] mx-auto mb-[34px]">Kein Karteikarten-Basteln mehr. Deine Unterlagen werden zu Fragen — automatisch.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white border-2 border-black rounded-[18px] p-[22px] shadow-[5px_5px_0_0_#000]">
            <div className="w-11 h-11 border-2 border-black rounded-xl bg-[#f6f3a0] flex items-center justify-center text-[1.2rem] mb-3.5">{f.ico}</div>
            <h3 className="font-heading text-base mb-2">{f.title}</h3>
            <p className="text-[0.87rem] text-[#555] leading-[1.5]">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
