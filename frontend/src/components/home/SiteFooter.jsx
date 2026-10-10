import React from "react";

export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t-2 border-black py-8 px-5 text-center text-[0.85rem] text-[#555]">
      <div className="flex justify-center gap-5 mb-3 font-bold text-black">
        <a href="/impressum" className="underline">Impressum</a>
        <a href="/agb" className="underline">AGB</a>
        <a href="/datenschutz" className="underline">Datenschutz</a>
      </div>
      <p>LAP QUIZ – Lern-App für Berufsprüfungen in der Schweiz</p>
      <p className="mt-1">© {new Date().getFullYear()} LAP QUIZ</p>
    </footer>
  );
}
