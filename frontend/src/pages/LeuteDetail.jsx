import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";

import { db } from "@/api/base44Client";
import { getProfession } from "@/lib/subjects";

const AVATAR_COLORS = ["#FDFFB6", "#CAFFBF", "#9BF6FF", "#FFADAD", "#BDB2FF", "#FFD6A5"];

export default function LeuteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: p, isLoading } = useQuery({ queryKey: ["liebeProfile", id], queryFn: () => db.entities.LiebeProfile.get(id) });

  if (isLoading) return <div className="grid place-items-center py-20"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;
  if (!p) return <div className="brutal bg-white p-8 mt-6 text-center font-semibold">Profil nicht gefunden. <Link to="/leute" className="underline">Zurück</Link></div>;

  const prof = getProfession(p.profession);
  const initials = (p.full_name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const color = AVATAR_COLORS[(p.full_name?.length || 0) % AVATAR_COLORS.length];

  return (
    <div>
      <button onClick={() => navigate("/leute")} className="font-heading text-lg flex items-center gap-2 mb-5"><ArrowLeft className="w-5 h-5" /> Leute</button>

      <div className="brutal bg-white p-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full border-2 border-black grid place-items-center font-heading text-3xl overflow-hidden" style={{ background: color }}>
          {p.image_url ? <img src={p.image_url} alt={p.full_name} className="w-full h-full object-cover" /> : initials}
        </div>
        <h1 className="font-heading text-3xl mt-3">{p.full_name}</h1>
        <div className="text-sm font-semibold text-muted-foreground mt-1">{p.age} Jahre · {p.gender}</div>
        <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground mt-1">
          <MapPin className="w-4 h-4" />
          {[p.ort, p.canton].filter(Boolean).join(", ") || "Schweiz"}{p.distance_km != null ? ` · ${p.distance_km} km` : ""}
        </div>
        {prof && <span className={`mt-3 text-[10px] font-bold border-2 border-black rounded-full px-2 py-0.5 ${prof.bg}`}>{prof.name}</span>}
        {p.online && <div className="text-xs font-bold mt-2">● online</div>}
        {p.bio && <p className="mt-4 font-semibold text-left w-full whitespace-pre-wrap">{p.bio}</p>}
      </div>

      <button onClick={() => navigate(`/chat?tab=leute&to=${p.created_by_id}`)} className="brutal-btn bg-black text-white w-full py-3 mt-4 flex items-center justify-center gap-2">
        <MessageCircle className="w-5 h-5" /> Nachricht senden
      </button>
    </div>
  );
}
