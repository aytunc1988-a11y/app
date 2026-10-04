import React from "react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-12 md:py-[50px] px-5">
      <h2 className="font-heading text-[1.7rem] text-center mb-2 tracking-tight">Preise</h2>
      <p className="text-center text-[#555] max-w-[480px] mx-auto mb-[34px]">Fair für eine Prüfungsvorbereitung — keine versteckten Kosten.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px] max-w-[640px] mx-auto">
        <div className="bg-white border-2 border-black rounded-[20px] p-[26px] shadow-[6px_6px_0_0_#000] text-center relative">
          <h3 className="font-heading text-base mt-1.5 mb-1">Monatlich</h3>
          <div className="font-heading text-[2.2rem] my-2">CHF 9.90<span className="text-[0.9rem] font-normal">/Monat</span></div>
          <div className="text-[0.82rem] text-[#555] mb-[18px]">Flexibel, jederzeit kündbar. Ideal für eine kurze Vorbereitungsphase.</div>
          <a href="https://wa.me/41783407887?text=Hoi%2C%20ich%20m%C3%B6chte%20LAP%20QUIZ%20monatlich%20abonnieren" target="_blank" rel="noopener" className="brutal-btn bg-white w-full px-6 py-3.5 text-[0.95rem] no-underline block text-center">Abonnieren</a>
        </div>
        <div className="bg-[#f6f3a0] border-2 border-black rounded-[20px] p-[26px] shadow-[6px_6px_0_0_#000] text-center relative">
          <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-[#141414] text-[#f7f1e6] rounded-full py-1 px-3.5 text-[0.7rem] font-bold whitespace-nowrap">Bester Deal</div>
          <h3 className="font-heading text-base mt-1.5 mb-1">Lebenslang</h3>
          <div className="font-heading text-[2.2rem] my-2">CHF 39.90<span className="text-[0.9rem] font-normal"> einmalig</span></div>
          <div className="text-[0.82rem] text-[#555] mb-[18px]">Einmal zahlen, für immer nutzen — auch für die nächste Prüfung.</div>
          <a href="https://wa.me/41783407887?text=Hoi%2C%20ich%20m%C3%B6chte%20LAP%20QUIZ%20lebenslang%20kaufen" target="_blank" rel="noopener" className="brutal-btn bg-[#141414] text-[#f7f1e6] w-full px-6 py-3.5 text-[0.95rem] no-underline block text-center">Jetzt sichern</a>
        </div>
      </div>
    </section>
  );
}
