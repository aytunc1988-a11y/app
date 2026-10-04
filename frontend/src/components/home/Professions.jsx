import React from "react";

const TAGS = [
  { label: "LAP Kaufmann EFZ", hi: true },
  { label: "Elektroinstallateur" },
  { label: "Fachfrau Gesundheit" },
  { label: "Informatiker EFZ" },
  { label: "Coiffeur/-euse" },
  { label: "Logistiker EFZ" },
  { label: "+ dein Beruf" },
];

export default function Professions() {
  return (
    <section className="py-12 md:py-[50px] px-5">
      <div className="bg-white border-2 border-black rounded-[20px] p-7 shadow-[6px_6px_0_0_#000]">
        <h2 className="font-heading text-[1.7rem] text-center tracking-tight">Für welchen Beruf lernst du?</h2>
        <p className="text-center text-[#555] max-w-[480px] mx-auto mt-1.5 mb-[34px]">Egal welche Berufslehre — LAP QUIZ deckt sie ab.</p>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {TAGS.map((t) => (
            <span key={t.label} className={`border-2 border-black rounded-full py-[7px] px-3.5 text-[0.82rem] font-semibold ${t.hi ? "bg-[#f6f3a0]" : "bg-[#f7f1e6]"}`}>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
