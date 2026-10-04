import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function LandingNav() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-20 bg-[#f7f1e6]/90 backdrop-blur border-b-2 border-black">
      <div className="max-w-[960px] mx-auto px-5 h-16 flex items-center justify-between">
        <div className="font-heading text-xl tracking-tight">
          LAP<span className="bg-[#f6f3a0] border-2 border-black px-1.5 ml-1 rounded-md">QUIZ</span>
        </div>
        {isAuthenticated ? (
          <Link to="/faecher" className="brutal-btn bg-[#f6f3a0] px-5 py-2 text-sm no-underline">Zum Lernbereich</Link>
        ) : (
          <div className="flex gap-2">
            <Link to="/login?returnTo=/faecher" className="brutal-btn bg-white px-5 py-2 text-sm no-underline">Anmelden</Link>
            <Link to="/register?returnTo=/faecher" className="brutal-btn bg-[#f6f3a0] px-5 py-2 text-sm no-underline">Registrieren</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
