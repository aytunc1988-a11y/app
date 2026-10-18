import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

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
    <div className="modern-page modern-person-detail">
      <button onClick={() => navigate("/leute")} className="brutal-btn modern-detail-back bg-white"><ArrowLeft className="h-4 w-4" /> Zurück zu den Profilen</button>

      <section className="modern-person-profile">
        <div className="modern-person-profile-cover" style={{ "--person-accent": color }}>
          {p.image_url && <img src={p.image_url} alt="" className="modern-person-profile-cover-image" />}
          <span className={`modern-person-profile-status ${p.online ? "is-online" : ""}`}><span /> {p.online ? "Jetzt online" : "Community-Mitglied"}</span>
        </div>
        <div className="modern-person-profile-body">
          <div className="modern-person-profile-avatar" style={{ background: color }}>
            {p.image_url ? <img src={p.image_url} alt={p.full_name} className="h-full w-full object-cover" /> : initials}
          </div>
          <span className="modern-listings-eyebrow"><Sparkles className="h-3.5 w-3.5" /> COMMUNITY-PROFIL</span>
          <h1>{p.full_name}</h1>
          <div className="modern-person-profile-meta"><span>{p.age} Jahre</span>{p.gender && <><i /> <span>{p.gender}</span></>}</div>
          <div className="modern-person-profile-location">
          <MapPin className="w-4 h-4" />
          {[p.ort, p.canton].filter(Boolean).join(", ") || "Schweiz"}{p.distance_km != null ? ` · ${p.distance_km} km` : ""}
          </div>
          {prof && <span className="modern-person-profession">{prof.name}</span>}
          {p.bio && <div className="modern-person-bio"><h2>Über {p.full_name?.split(" ")[0] || "mich"}</h2><p>{p.bio}</p></div>}
          <div className="modern-person-profile-privacy"><ShieldCheck className="h-4 w-4" /> Nur öffentliche Profilangaben werden hier angezeigt.</div>
          <button onClick={() => navigate(`/chat?tab=leute&to=${p.created_by_id}`)} className="brutal-btn modern-person-profile-message">
            <MessageCircle className="h-5 w-5" /> Nachricht senden
          </button>
        </div>
      </section>
    </div>
  );
}
