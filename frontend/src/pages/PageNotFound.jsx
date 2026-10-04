import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full">
        <div className="brutal bg-white p-8 text-center space-y-5">
          <h1 className="font-heading text-7xl">404</h1>
          <h2 className="font-heading text-2xl">Seite nicht gefunden</h2>
          <p className="text-muted-foreground font-semibold">Die Seite <span className="font-bold text-foreground">“{pageName}”</span> existiert nicht.</p>
          <Link to="/" className="brutal-btn bg-[#FDFFB6] px-5 py-3 inline-block">Zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}
