import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { db } from "@/api/base44Client";
import useCurrentUser from "@/lib/useCurrentUser";
import LeuteFilterModal from "@/components/leute/LeuteFilterModal";

const AVATAR_COLORS = ["#FDFFB6", "#CAFFBF", "#9BF6FF", "#FFADAD", "#BDB2FF", "#FFD6A5"];

export default function AlleProfile() {
  const [filterOpen, setFilterOpen] = useState(false);
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
      if (p.distance_km != null && p.distance_km > filters.distance) return false;
      return true;
    });
  }, [profiles, filters]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl sm:text-3xl">Alle Profile</h1>
        <button onClick={() => setFilterOpen(true)} className="brutal-btn bg-white px-2.5 py-1.5 flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-4 h-4" /> Filtern
        </button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-20 font-semibold text-muted-foreground">Keine Profile gefunden.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {filtered.map((p, i) => {
            const initials = (p.full_name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div key={p.id} className="brutal bg-white p-2 flex flex-col items-center text-center">
                <Link to={`/leute/${p.id}`} className="flex flex-col items-center text-center w-full">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-black grid place-items-center font-heading text-base" style={{ background: color }}>
                      {p.image_url ? <img src={p.image_url} alt={p.full_name} className="w-full h-full rounded-full object-cover" /> : initials}
                    </div>
                    {p.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#CAFFBF] border-2 border-black" />}
                  </div>
                  <div className="font-bold mt-1 truncate w-full text-xs">{p.full_name}</div>
                  <div className="text-[10px] font-semibold text-muted-foreground">{p.age} · {p.canton || "CH"}</div>
                  <div className="text-[10px] font-bold">{p.distance_km != null ? `${p.distance_km} km` : (p.canton && user?.canton ? (p.canton === user.canton ? "Gleicher Kanton" : p.canton) : "")}</div>
                </Link>
                <button onClick={() => navigate(`/chat?tab=leute&to=${p.created_by_id}`)} className="brutal-btn bg-[#FDFFB6] w-full py-1 text-[11px] mt-1.5">Nachricht</button>
              </div>
            );
          })}
        </div>
      )}

      <LeuteFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  );
}
