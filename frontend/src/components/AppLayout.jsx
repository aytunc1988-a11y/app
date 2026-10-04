import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Home, BarChart3, LogOut, FileText, Users, UserCircle, ShoppingBag, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV_DESKTOP = [
  { to: "/faecher", label: "Fächer", icon: Home },
  { to: "/pruefungen", label: "Prüfungen", icon: FileText },
  { to: "/statistik", label: "Statistik", icon: BarChart3 },
  { to: "/anzeigen", label: "Anzeigen", icon: ShoppingBag },
  { to: "/leute", label: "Leute", icon: Users },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/profil", label: "Profil", icon: UserCircle },
];
const BOTTOM = [
  { to: "/faecher", label: "Lernen", icon: Home },
  { to: "/anzeigen", label: "Anzeigen", icon: ShoppingBag },
  { to: "/leute", label: "Leute", icon: Users },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/profil", label: "Profil", icon: UserCircle },
];

export default function AppLayout() {
  const { logout, user } = useAuth();
  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-3 md:px-4 h-12 md:h-16 flex items-center justify-between gap-3">
          <Link to="/faecher" className="font-heading text-xl tracking-tight shrink-0">
            LAP<span className="bg-[#FDFFB6] border-2 border-black px-1.5 ml-1 rounded-md">QUIZ</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {NAV_DESKTOP.map((n) => (
              <NavLink key={n.to} to={n.to} end className={({ isActive }) => `px-2.5 py-1.5 rounded-lg border-2 font-semibold text-xs whitespace-nowrap transition-all ${isActive ? "border-black bg-white shadow-[2px_2px_0_0_#000]" : "border-transparent hover:border-black"}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {user?.name && <span className="hidden sm:block text-xs font-bold truncate max-w-[120px]">{user.name}</span>}
            <button onClick={() => logout()} className="p-2 rounded-lg border-2 border-transparent hover:border-black transition-all" aria-label="Abmelden"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-3 py-3 md:px-6 md:py-8"><Outlet /></main>
      <nav className="md:hidden fixed bottom-4 left-3 right-3 z-20 brutal bg-white grid grid-cols-5 py-2">
        {BOTTOM.map((n) => (
          <NavLink key={n.to} to={n.to} end className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1 rounded-lg text-[9px] font-bold transition-all ${isActive ? "bg-[#FDFFB6]" : ""}`}>
            <n.icon className="w-5 h-5" />{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
