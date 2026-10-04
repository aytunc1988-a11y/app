import React from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, FileText, BarChart3 } from "lucide-react";

const TABS = [
  { to: "/faecher", label: "Fächer", icon: BookOpen },
  { to: "/pruefungen", label: "Prüfungen", icon: FileText },
  { to: "/statistik", label: "Statistik", icon: BarChart3 },
];

export default function LearnTabs() {
  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === "/faecher"} className={({ isActive }) => `flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-lg border-2 border-black transition-all ${isActive ? "bg-[#FDFFB6] shadow-[2px_2px_0_0_#000]" : "bg-white"}`}>
          <t.icon className="w-3.5 h-3.5" /> {t.label}
        </NavLink>
      ))}
    </div>
  );
}
