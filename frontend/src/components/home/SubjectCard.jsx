import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SubjectCard({ subject, count, accuracy }) {
  return (
    <Link to={`/quiz/${subject.id}`} className="brutal bg-white p-2 flex items-center gap-2 group hover:-translate-y-0.5 transition-transform">
      <span className={`w-9 h-9 shrink-0 grid place-items-center border-2 border-black rounded-lg font-heading text-lg ${subject.bg}`}>
        {subject.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-heading text-sm leading-tight truncate">{subject.name}</div>
        <div className="text-[10px] font-semibold text-muted-foreground">{count} Fragen{accuracy != null ? ` · ${accuracy}%` : ""}</div>
      </div>
      <span className="brutal-btn bg-[#FDFFB6] px-2 py-1 text-[10px] flex items-center gap-1 shrink-0">
        Start <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}
