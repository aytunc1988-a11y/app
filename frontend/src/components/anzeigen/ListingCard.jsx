import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { getProfession } from "@/lib/subjects";
import { Image as UiImage } from "@/components/ui/image";

export default function ListingCard({ listing, mine, onDelete, onToggle }) {
  const prof = getProfession(listing.profession);
  const navigate = useNavigate();
  const inactive = listing.active === false;
  const act = (e, fn) => { e.preventDefault(); e.stopPropagation(); fn(); };
  const iconBtn = "border-2 border-black rounded bg-white p-0.5";

  return (
    <Link to={`/anzeigen/${listing.id}`} className={`brutal bg-white overflow-hidden flex ${inactive ? "opacity-60" : ""}`}>
      <div className="w-16 sm:w-24 shrink-0 border-r-2 border-black bg-[#FDFFB6] grid place-items-center overflow-hidden self-stretch">
        {listing.image_url ? (
          <UiImage src={listing.image_url} fittingType="cover" className="w-full h-full" />
        ) : (
          <span className="font-heading text-2xl">{prof?.emoji || "🏷️"}</span>
        )}
      </div>
      <div className="px-2 py-1.5 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <span className={`text-[9px] font-bold border-2 border-black rounded-full px-1.5 ${prof?.bg || "bg-white"}`}>{prof?.short || "Anzeige"}</span>
            {inactive && <span className="text-[9px] font-bold border-2 border-black rounded-full px-1.5 bg-white">Pausiert</span>}
          </div>
          {listing.price != null && <span className="font-heading text-sm shrink-0">CHF {listing.price}</span>}
        </div>
        <h3 className="font-bold mt-0.5 truncate text-xs">{listing.title}</h3>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground min-w-0">
            <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{listing.ort || listing.canton || "Schweiz"}</span>
          </div>
          {mine && (
            <div className="flex gap-1 shrink-0">
              <button onClick={(e) => act(e, () => navigate(`/anzeigen/${listing.id}/bearbeiten`))} className={iconBtn} aria-label="Bearbeiten"><Pencil className="w-3 h-3" /></button>
              <button onClick={(e) => act(e, onToggle)} className={iconBtn} aria-label={inactive ? "Aktivieren" : "Deaktivieren"}>{inactive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
              <button onClick={(e) => act(e, onDelete)} className={`${iconBtn} bg-[#FFADAD]`} aria-label="Löschen"><Trash2 className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
