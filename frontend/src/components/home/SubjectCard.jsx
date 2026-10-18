import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";

export default function SubjectCard({ subject, count, accuracy, locked }) {
  if (locked) {
    return (
      <div className="modern-subject-card is-locked">
        <span className={`modern-subject-icon ${subject.bg}`}>
          {subject.emoji}
        </span>
        <div className="modern-subject-copy">
          <div>{subject.name}</div>
          <span>{count} Fragen{accuracy != null ? ` · ${accuracy}%` : ""}</span>
        </div>
        <span className="modern-subject-action is-locked">
          <Lock className="h-3.5 w-3.5" /> Gesperrt
        </span>
      </div>
    );
  }
  return (
    <Link to={`/quiz/${subject.id}`} className="modern-subject-card">
      <span className={`modern-subject-icon ${subject.bg}`}>
        {subject.emoji}
      </span>
      <div className="modern-subject-copy">
        <div>{subject.name}</div>
        <span>{count} Fragen{accuracy != null ? ` · ${accuracy}%` : ""}</span>
      </div>
      <span className="modern-subject-action">
        Starten <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
