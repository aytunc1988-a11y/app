import React, { useState } from "react";

export default function MiniDemo() {
  const [answer, setAnswer] = useState(null);
  const correct = "wahr";
  const done = answer !== null;

  const btn = (value, label) => {
    const isPicked = answer === value;
    const isRight = value === correct;
    let bg = "bg-white";
    if (done && isRight) bg = "bg-[#c8f0b4]";
    if (done && isPicked && !isRight) bg = "bg-[#ffc9c9]";
    return (
      <button
        key={value}
        disabled={done}
        onClick={() => setAnswer(value)}
        className={`${bg} flex-1 border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all`}
      >
        {label}
      </button>
    );
  };

  return (
    <section className="px-5 pt-6 pb-2">
      <div className="max-w-[520px] mx-auto bg-white border-2 border-black rounded-2xl p-5 shadow-[5px_5px_0_#000]">
        <p className="text-[0.8rem] text-[#666] mb-2">Probier es aus</p>
        <p className="font-extrabold text-lg mb-4">Das Eigenkapital gehört zu den Passiven.</p>
        <div className="flex gap-3">
          {btn("wahr", "Wahr")}
          {btn("falsch", "Falsch")}
        </div>
        {done && (
          <div className="mt-4 text-[0.9rem]" role="status">
            <p className="font-bold">{answer === correct ? "Richtig." : "Nicht ganz."}</p>
            <p className="text-[#444]">
              Das Eigenkapital steht in der Bilanz auf der Passivseite, zusammen mit dem Fremdkapital.
            </p>
            <button onClick={() => setAnswer(null)} className="mt-2 underline text-[0.85rem]">
              Nochmals
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
