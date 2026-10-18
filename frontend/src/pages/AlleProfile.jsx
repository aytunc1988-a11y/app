import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, MapPin, MessageCircle, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { db } from "@/api/base44Client";
import useCurrentUser from "@/lib/useCurrentUser";
import LeuteFilterModal from "@/components/leute/LeuteFilterModal";

const AVATAR_COLORS = ["#FDFFB6", "#CAFFBF", "#9BF6FF", "#FFADAD", "#BDB2FF", "#FFD6A5"];

export default function AlleProfile() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [myPos, setMyPos] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setMyPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  const calcDist = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ minAge: 0, maxAge: 99, gender: "Alle", distance: 100, canton: "Alle", online: false });

  const { data: profiles = [], isLoading } = useQuery({ queryKey: ["liebeProfiles"], queryFn: () => db.entities.LiebeProfile.list("-created_date", 200) });

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (p.invisible) return false;
      if (filters.online && !p.online) return false;
      if (filters.gender !== "Alle" && p.gender !== filters.gender) return false;
      if (filters.canton !== "Alle" && p.canton !== filters.canton) return false;
      if (p.age != null && (p.age < filters.minAge || p.age > filters.maxAge)) return false;
      const pDist = (myPos && p.lat && p.lng) ? calcDist(myPos.lat, myPos.lng, p.lat, p.lng) : null;
      if (pDist != null && pDist > filters.distance) return false;
      return true;
    });
  }, [profiles, filters]);

  return (
    <div className="modern-page modern-people">
      <section className="modern-people-hero">
        <div>
          <span className="modern-listings-eyebrow"><Sparkles className="h-3.5 w-3.5" /> DEINE COMMUNITY</span>
          <h1 className="font-heading text-2xl sm:text-4xl">Lerne Leute kennen</h1>
          <p>Entdecke Lernende in deiner Nähe und vernetze dich.</p>
        </div>
        <button onClick={() => setFilterOpen(true)} className="brutal-btn modern-people-filter">
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </button>
      </section>
      <div className="modern-people-results">
        <div><h2>Profile entdecken</h2><p>Finde deine Lerncommunity.</p></div>
        <span><Search className="h-3.5 w-3.5" /> {isLoading ? "…" : `${filtered.length} ${filtered.length === 1 ? "Profil" : "Profile"}`}</span>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="modern-listings-empty">
          <div className="modern-listings-empty-icon"><Search className="h-6 w-6" /></div>
          <h2>Keine Profile gefunden</h2>
          <p>Ändere deine Filter, um mehr Lernende zu entdecken.</p>
        </div>
      ) : (
        <div className="modern-people-grid">
          {filtered.map((p, i) => {
            const initials = (p.full_name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
            const dist = (myPos && p.lat && p.lng) ? calcDist(myPos.lat, myPos.lng, p.lat, p.lng) : null;
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <article key={p.id} className="modern-person-card">
                <Link to={`/leute/${p.id}`} className="modern-person-card-link">
                  <div className="modern-person-cover" style={{ "--person-accent": color }}>
                    {p.image_url && <img src={p.image_url} alt="" className="modern-person-cover-image" />}
                    <div className="modern-person-avatar" style={{ background: color }}>
                      {p.image_url ? <img src={p.image_url} alt={p.full_name || "Profil"} className="h-full w-full rounded-full object-cover" /> : initials}
                    </div>
                    {p.online && <span className="modern-person-online"><span /> Jetzt online</span>}
                  </div>
                  <div className="modern-person-card-content">
                    <h3>{p.full_name || "Unbekannt"}</h3>
                    <p>{p.age ? `${p.age} Jahre` : "Lernende:r"}{p.canton ? ` · ${p.canton}` : ""}</p>
                    <span><MapPin className="h-3.5 w-3.5" /> {dist != null ? `${dist} km entfernt` : (p.canton && user?.canton ? (p.canton === user.canton ? "Dein Kanton" : p.canton) : "Schweiz")}</span>
                  </div>
                  <ArrowUpRight className="modern-person-open h-4 w-4" />
                </Link>
                <button onClick={() => navigate(`/chat?tab=leute&to=${p.created_by_id}`)} className="brutal-btn modern-person-message">
                  <MessageCircle className="h-4 w-4" /> Nachricht
                </button>
              </article>
            );
          })}
        </div>
      )}

      <LeuteFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  );
}
