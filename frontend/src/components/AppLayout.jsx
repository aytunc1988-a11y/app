import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Home, BarChart3, LogOut, FileText, Users, UserCircle, ShoppingBag, MessageCircle, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/api/base44Client";
import { disableLocalPreview } from "@/lib/previewMode";

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
  const { logout, user, previewMode } = useAuth();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!user?.user_id) return;
    const check = async () => {
      try {
        const msgs = await db.entities.Message.filter({ recipient_id: user.user_id }, "-created_date", 100);
        setUnread(msgs.filter(m => !m.read).length);
      } catch(e) {}
    };
    check();
    const t = setInterval(check, 15000);
    return () => clearInterval(t);
  }, [user?.user_id]);

  // Online-Status setzen
  useEffect(() => {
    if (!user?.user_id) return;
    const setOnline = async () => {
      try {
        const profiles = await db.entities.LiebeProfile.filter({ created_by_id: user.user_id }, null, 1);
        if (profiles && profiles.length > 0) {
          await db.entities.LiebeProfile.update(profiles[0].id, { online: true, last_seen: new Date().toISOString() });
        }
      } catch(e) {}
    };
    const setOffline = async () => {
      try {
        const profiles = await db.entities.LiebeProfile.filter({ created_by_id: user.user_id }, null, 1);
        if (profiles && profiles.length > 0) {
          await db.entities.LiebeProfile.update(profiles[0].id, { online: false });
        }
      } catch(e) {}
    };
    setOnline();
    const t = setInterval(setOnline, 60000);
    window.addEventListener("beforeunload", setOffline);
    return () => { clearInterval(t); window.removeEventListener("beforeunload", setOffline); setOffline(); };
  }, [user?.user_id]);
  return (
    <div className="modern-app-shell min-h-screen pb-24 md:pb-10" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
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
            {user?.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `px-2.5 py-1.5 rounded-lg border-2 font-semibold text-xs whitespace-nowrap transition-all flex items-center gap-1 ${isActive ? "border-black bg-[#FDFFB6] shadow-[2px_2px_0_0_#000]" : "border-transparent hover:border-black"}`}>
                <KeyRound className="w-3.5 h-3.5" /> Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {user?.name && <span className="hidden sm:block text-xs font-bold truncate max-w-[120px]">{user.name}</span>}
            <button onClick={() => logout()} className="p-2 rounded-lg border-2 border-transparent hover:border-black transition-all" aria-label="Abmelden"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      {previewMode && (
        <aside role="status" className="bg-[#e5f2ec] border-b border-[#d7e1dc] px-4 py-2 text-sm font-semibold">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <span>Vorschau ohne Anmeldung · Daten und Änderungen sind nur in diesem Browser sichtbar.</span>
            <button onClick={() => { disableLocalPreview(); window.location.href = "/"; }} className="underline underline-offset-2 whitespace-nowrap">Vorschau beenden</button>
          </div>
        </aside>
      )}
      <main className="max-w-3xl mx-auto px-3 py-3 md:px-6 md:py-8"><Outlet /></main>
      <nav className="md:hidden fixed bottom-4 left-3 right-3 z-20 brutal bg-white grid grid-cols-5 py-2">
        {BOTTOM.map((n) => (
          <NavLink key={n.to} to={n.to} end className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1 rounded-lg text-[9px] font-bold transition-all ${isActive ? "bg-[#FDFFB6]" : ""}`}>
            <div className="relative"><n.icon className="w-5 h-5" />{n.to === "/chat" && unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}</div>{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
