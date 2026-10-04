import React from "react";

const PRESETS = [0, 15, 30, 60];

export default function TimerPicker({ value, onChange }) {
  const custom = !PRESETS.includes(value);
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((m) => (
          <button key={m} onClick={() => onChange(m)} className={`border-2 border-black rounded-lg py-2 text-sm font-bold transition-all ${value === m ? "bg-black text-white" : "bg-white hover:bg-[#FDFFB6]"}`}>
            {m === 0 ? "Aus" : `${m}′`}
          </button>
        ))}
        <button onClick={() => onChange(custom ? value : 45)} className={`border-2 border-black rounded-lg py-2 text-sm font-bold transition-all ${custom ? "bg-black text-white" : "bg-white hover:bg-[#FDFFB6]"}`}>
          Frei
        </button>
      </div>
      {custom && (
        <div className="flex items-center gap-2 mt-3">
          <input type="number" min={1} max={300} value={value} onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))} className="w-24 border-2 border-black rounded-lg px-3 py-2 font-bold bg-white" />
          <span className="text-sm font-semibold">Minuten</span>
        </div>
      )}
    </div>
  );
}
