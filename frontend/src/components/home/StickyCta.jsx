import React from "react";

export default function StickyCta() {
  const go = () => document.getElementById("preise")?.scrollIntoView({ behavior: "smooth" });
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-[#FBF8F0] border-t-2 border-black">
      <button
        onClick={go}
        className="w-full bg-[#F8F1A0] border-2 border-black rounded-xl py-3 font-extrabold shadow-[3px_3px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
      >
        Jetzt starten
      </button>
    </div>
  );
}
