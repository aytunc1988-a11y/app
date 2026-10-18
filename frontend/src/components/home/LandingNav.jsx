import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { enterLocalPreview, isLocalPreviewAvailable } from "@/lib/previewMode";

export default function LandingNav() {
  const { isAuthenticated, previewMode } = useAuth();

  return (
    <nav className="sticky top-0 z-20 bg-[#f7f1e6]/90 backdrop-blur border-b-2 border-black">
      <div className="max-w-[960px] mx-auto px-5 h-16 flex items-center justify-between">
        <div className="font-heading text-xl tracking-tight">
          LAP<span className="bg-[#f6f3a0] border-2 border-black px-1.5 ml-1 rounded-md">QUIZ</span>
        </div>
        {previewMode ? (
          <Link to="/faecher" className="brutal-btn bg-[#f6f3a0] px-5 py-2 text-sm no-underline">Vorschau öffnen</Link>
        ) : isAuthenticated ? (
          <Link to="/faecher" className="brutal-btn bg-[#f6f3a0] px-5 py-2 text-sm no-underline">Zum Lernbereich</Link>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Link to="/login?returnTo=/faecher" className="brutal-btn bg-white px-3 sm:px-5 py-2 text-xs sm:text-sm no-underline">Anmelden</Link>
            <Link to="/register?returnTo=/faecher" className="brutal-btn bg-[#f6f3a0] px-3 sm:px-5 py-2 text-xs sm:text-sm no-underline">Registrieren</Link>
            {isLocalPreviewAvailable() && <Link to="/faecher?preview=1" onClick={(event) => { event.preventDefault(); enterLocalPreview(); }} className="brutal-btn bg-[#e4f3e9] px-3 sm:px-5 py-2 text-xs sm:text-sm no-underline">Ohne Login ansehen</Link>}
          </div>
        )}
      </div>
    </nav>
  );
}
