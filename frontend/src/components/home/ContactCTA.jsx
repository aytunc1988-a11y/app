import React from "react";

export default function ContactCTA() {
  return (
    <section className="py-12 md:py-[50px] px-5">
      <div className="bg-[#141414] text-[#f7f1e6] rounded-3xl py-10 px-7 text-center">
        <h2 className="font-heading text-[1.6rem] mb-2.5">Fragen? Schreib mir direkt.</h2>
        <p className="text-[#cfcac0] max-w-[420px] mx-auto mb-6">Ob Wunsch-Beruf noch nicht dabei ist oder du Hilfe beim Kauf brauchst — Antwort meist innert Stunden.</p>
        <a href="https://wa.me/41783407887" target="_blank" rel="noopener" className="inline-flex items-center gap-2.5 bg-[#25D366] text-[#0b1e12] rounded-[14px] py-3.5 px-6 font-bold no-underline shadow-[4px_4px_0_0_#0f0f0f]">
          💬 WhatsApp: +41 78 340 78 87
        </a>
      </div>
    </section>
  );
}
