import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/subjects";

export default function SessionSummary({ subject, answered, correct, seconds, timeUp, onRestart }) {
  const pct = answered ? Math.round((correct / answered) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
      <div className={`brutal ${subject.bg} p-8 text-center`}>
        <p className="font-bold uppercase tracking-widest text-sm">{timeUp ? "Zeit abgelaufen" : "Session beendet"}</p>
        <div className="font-heading text-7xl mt-4">{pct}%</div>
        <p className="font-semibold mt-2">{subject.name}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-5">
        {[["Richtig", correct], ["Beantwortet", answered], ["Lerndauer", formatDuration(seconds)]].map(([l, v]) => (
          <div key={l} className="brutal bg-white p-4 text-center">
            <div className="font-heading text-xl">{v}</div>
            <div className="text-xs font-semibold mt-1">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button onClick={onRestart} className="brutal-btn bg-[#FDFFB6] py-3">Nochmal</button>
        <Link to="/faecher" className="brutal-btn bg-white py-3 text-center">Zu den Fächern</Link>
      </div>
    </motion.div>
  );
}
