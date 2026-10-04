import React from "react";

export default function Hero() {
  return (
    <section className="px-5 pt-14 pb-10 text-center">
      <span className="inline-block bg-[#141414] text-[#f7f1e6] rounded-full px-3.5 py-1.5 text-xs font-bold tracking-[0.05em] mb-[18px]">
        FÜR JEDEN BERUF · JEDE PRÜFUNG
      </span>
      <h1 className="font-heading text-[2.6rem] leading-[1.08] tracking-tight mb-4">
        Foto rein.<br />Bestanden raus.
      </h1>
      <p className="max-w-[520px] mx-auto mb-7 text-[1.05rem] text-[#444] leading-[1.5]">
        Fotografiere eine Lehrbuchseite oder wähle deinen Beruf — die KI macht daraus Lernfragen. Für LAP-Prüfungen und Berufslehren aller Art.
      </p>
      <div className="flex gap-3.5 justify-center flex-wrap mb-2.5">
        <a href="#pricing" className="brutal-btn bg-[#f6f3a0] px-6 py-3.5 text-[0.95rem] no-underline">Jetzt kaufen</a>
        <a href="https://wa.me/41783407887" target="_blank" rel="noopener" className="brutal-btn bg-white px-6 py-3.5 text-[0.95rem] no-underline">Frage auf WhatsApp</a>
      </div>
      <div className="text-[0.8rem] text-[#777]">Keine Kreditkarte nötig für die erste Frage</div>
    </section>
  );
}
