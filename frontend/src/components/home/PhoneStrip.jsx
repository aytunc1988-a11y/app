import React from "react";
import { Link } from "react-router-dom";

function Phone({ children }) {
  return (
    <div
      className="flex-[0_0_190px] bg-[#f7f1e6] border-2 border-black rounded-[26px] p-3.5 shadow-[6px_6px_0_0_#000]"
      style={{ scrollSnapAlign: "center" }}
    >
      {children}
    </div>
  );
}

function Brand() {
  return (
    <div className="text-[0.68rem] font-black mb-2.5">
      LAP <span className="bg-[#f6f3a0] border-2 border-black rounded-full px-1.5">QUIZ</span>
    </div>
  );
}

export default function PhoneStrip() {
  return (
    <div
      className="flex gap-[18px] overflow-x-auto pt-9 px-1 pb-2.5"
      style={{ scrollSnapType: "x mandatory" }}
    >
      <Phone>
        <Brand />
        <div className="font-heading text-base leading-[1.15] mb-2">Foto rein.<br />Fragen raus.</div>
        <div className="text-[0.66rem] text-[#555] mb-3">Lehrbuchseite fotografieren — KI generiert Lernfragen automatisch.</div>
        <Link to="/meine-fragen" className="block bg-[#f6f3a0] border-2 border-black rounded-xl p-2 text-center text-[0.68rem] font-bold shadow-[3px_3px_0_0_#000] mb-[7px] no-underline">
          📷 Foto importieren
        </Link>
      </Phone>

      <Phone>
        <Brand />
        <div className="font-heading text-base leading-[1.15] mb-2">Dein Beruf.<br />Deine Prüfung.</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {["Kaufmann EFZ", "Elektriker", "Detailhandel", "+ 200 mehr"].map((c, i) => (
            <span key={c} className={`border-2 border-black rounded-lg py-0.5 px-1.5 text-[0.6rem] font-bold ${i === 0 ? "bg-[#f6f3a0]" : ""}`}>{c}</span>
          ))}
        </div>
        <div className="text-[0.66rem] text-[#555] mb-3">Wähle deinen Beruf oder deine Theorieprüfung — passende Fächer sofort verfügbar.</div>
      </Phone>

      <Phone>
        <Brand />
        <div className="font-heading text-base leading-[1.15] mb-2">Weisst du,<br />wo du stehst?</div>
        <div className="flex gap-1.5 mb-2">
          {[["100%", "Genauigkeit"], ["6", "Fragen"]].map(([b, s]) => (
            <div key={s} className="flex-1 bg-[#f6f3a0] border-2 border-black rounded-[10px] py-[7px] px-[5px] text-center">
              <b className="block text-base">{b}</b>
              <span className="text-[0.55rem]">{s}</span>
            </div>
          ))}
        </div>
        <div className="text-[0.66rem] text-[#555] mb-3">Fortschritt live pro Fach — genau sehen, was noch sitzen muss.</div>
      </Phone>

      <Phone>
        <Brand />
        <div className="font-heading text-base leading-[1.15] mb-2">Lernen,<br />das sitzt.</div>
        <div className="bg-white border-2 border-black rounded-xl p-[7px] text-[0.64rem] mb-[5px]">
          Das Eigenkapital gehört zu den Passiven.
          <div className="border-2 border-black rounded-lg py-1 px-1.5 mt-1 bg-[#c7ecb0]">✓ Wahr</div>
        </div>
        <div className="text-[0.66rem] text-[#555] mb-3">Sofort-Feedback mit Erklärung zu jeder Antwort.</div>
      </Phone>
    </div>
  );
}
