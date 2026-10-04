import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return; done.current = true;
    const m = location.hash.match(/session_id=([^&]+)/);
    const sid = m ? decodeURIComponent(m[1]) : null;
    (async () => {
      try {
        if (sid) {
          const u = await db.auth.exchangeSession(sid);
          setUser(u); setIsAuthenticated(true);
        }
      } catch {}
      window.history.replaceState(null, "", window.location.pathname);
      navigate("/faecher", { replace: true });
    })();
  }, [location.hash, navigate, setUser, setIsAuthenticated]);

  return <div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;
}
