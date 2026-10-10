import React from "react";

const steps = [
  { t: "Foto machen", d: "Fotografiere eine Seite aus Lehrbuch, Skript oder deinen Notizen." },
  { t: "Fragen erhalten", d: "Die KI macht daraus passende Prüfungsfragen zu genau diesem Stoff." },
  { t: "Lernen und sehen, wo du stehst", d: "Du bekommst Sofort-Feedback und siehst pro Fach, was noch sitzen muss." },
];

export default function HowItWorks() {
  return (
    <section className="px-5 py-12">
      <h2 className="text-center text-3xl font-black mb-8">So funktioniert's</h2>
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.t} className="bg-white border-2 border-black rounded-2xl p-5 shadow-[5px_5px_0_#000]">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F8F1A0] border-2 border-black font-black mb-3">
              {i + 1}
            </span>
            <h3 className="font-extrabold text-lg mb-1">{s.t}</h3>
            <p className="text-[#555] text-[0.95rem]">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
