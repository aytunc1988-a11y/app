import React from "react";

const items = [
  {
    q: "Wie bezahle ich?",
    a: "Mit TWINT oder Karte. Die Zahlung läuft über Stripe, deinen Zugang bekommst du direkt danach.",
  },
  {
    q: "Was passiert nach den 30 Tagen?",
    a: "Der Zugang läuft ab. Es gibt kein automatisches Abo, du entscheidest selbst, ob du verlängerst.",
  },
  {
    q: "Was bedeutet «Lebenslang»?",
    a: "Du zahlst einmal und hast dauerhaft Zugang, ohne weitere Kosten.",
  },
  {
    q: "Ist LAP QUIZ nur für Kaufleute?",
    a: "Nein. Du kannst deinen Beruf oder dein Fach auswählen, zum Beispiel Kaufmann EFZ, Detailhandel oder Elektro.",
  },
];

export default function Faq() {
  return (
    <section className="px-5 py-12 max-w-[720px] mx-auto">
      <h2 className="text-center text-3xl font-black mb-6">Häufige Fragen</h2>
      <div className="space-y-3">
        {items.map((it) => (
          <details key={it.q} className="group bg-white border-2 border-black rounded-xl px-4 py-3 shadow-[3px_3px_0_#000]">
            <summary className="cursor-pointer font-bold list-none flex justify-between items-center">
              {it.q}
              <span className="ml-3 text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-2 text-[#555] text-[0.95rem]">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
