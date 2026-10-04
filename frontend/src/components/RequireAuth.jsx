import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { KeyRound, Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/api/base44Client";
import { toast } from "sonner";

const Spinner = () => <div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;

export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  if (loading || isAuthenticated === null) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login?returnTo=/faecher" replace />;
  return <Outlet />;
}

export function RequireLicense() {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  if (user && user.licensed) return <Outlet />;
  const redeem = async () => {
    if (!code.trim()) return;
    setBusy(true);
    try { await db.auth.redeem(code.trim()); await refreshUser(); toast.success("Freigeschaltet! Viel Erfolg beim Lernen."); }
    catch (e) { toast.error(e?.response?.data?.detail || "Ungültiger Lizenzcode"); }
    finally { setBusy(false); }
  };
  return (
    <div className="max-w-md mx-auto">
      <div className="brutal bg-white p-6 text-center">
        <div className="w-14 h-14 border-2 border-black rounded-xl bg-[#FDFFB6] grid place-items-center mx-auto mb-4"><KeyRound className="w-7 h-7" /></div>
        <h1 className="font-heading text-2xl">Lern-Bereich freischalten</h1>
        <p className="text-sm font-semibold text-muted-foreground mt-2">Fächer, Prüfungen & Statistik sind mit einem Lizenzcode freigeschaltet. Code via WhatsApp erhalten.</p>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Lizenzcode eingeben" className="w-full mt-4 border-2 border-black rounded-lg px-3 py-2.5 font-bold bg-white text-center uppercase tracking-widest" />
        <button onClick={redeem} disabled={busy} className="brutal-btn bg-[#FDFFB6] w-full py-3 mt-3 font-heading flex items-center justify-center gap-2">{busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null} Freischalten</button>
        <a href="https://wa.me/41783407887" target="_blank" rel="noopener" className="brutal-btn bg-[#25D366] text-[#0b1e12] w-full py-3 mt-2 flex items-center justify-center gap-2 no-underline"><MessageCircle className="w-4 h-4" /> Code kaufen (WhatsApp)</a>
      </div>
    </div>
  );
}
