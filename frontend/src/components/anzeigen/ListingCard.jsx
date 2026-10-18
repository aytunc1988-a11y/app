import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Trash2, Pencil, Eye, EyeOff, ArrowUpRight } from "lucide-react";
import { getProfession } from "@/lib/subjects";
import { Image as UiImage } from "@/components/ui/image";

export default function ListingCard({ listing, mine, onDelete, onToggle }) {
  const prof = getProfession(listing.profession);
  const navigate = useNavigate();
  const inactive = listing.active === false;
  const act = (e, fn) => { e.preventDefault(); e.stopPropagation(); fn(); };
  const iconBtn = "modern-listing-action";

  return (
    <article className={`modern-listing-card ${inactive ? "is-inactive" : ""}`}>
      <Link to={`/anzeigen/${listing.id}`} className="modern-listing-card-link">
        <div className="modern-listing-card-image">
          <div className="modern-listing-card-media">
            {listing.image_url ? (
              <UiImage src={listing.image_url} fittingType="cover" className="h-full w-full" />
            ) : (
              <span aria-hidden="true">{prof?.emoji || "🏷️"}</span>
            )}
          </div>
          <span className="modern-listing-profession">{prof?.short || "Anzeige"}</span>
          {inactive && <span className="modern-listing-paused">Pausiert</span>}
        </div>
        <div className="modern-listing-card-content">
          <div className="modern-listing-card-topline">
            <span className="modern-listing-location"><MapPin className="h-3.5 w-3.5" /> {[listing.ort, listing.canton].filter(Boolean).join(", ") || "Schweiz"}</span>
            {listing.price != null && <span className="modern-listing-price">{listing.price === 0 ? "Gratis" : `CHF ${listing.price}`}</span>}
          </div>
          <h3>{listing.title}</h3>
          {listing.description && <p className="modern-listing-description">{listing.description}</p>}
          <span className="modern-listing-open">Inserat ansehen <ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </Link>
      {mine && (
        <div className="modern-listing-card-actions" aria-label="Inserat verwalten">
          <button onClick={(e) => act(e, () => navigate(`/anzeigen/${listing.id}/bearbeiten`))} className={iconBtn} aria-label="Inserat bearbeiten"><Pencil className="h-4 w-4" /></button>
          <button onClick={(e) => act(e, onToggle)} className={iconBtn} aria-label={inactive ? "Inserat aktivieren" : "Inserat deaktivieren"}>{inactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
          <button onClick={(e) => act(e, onDelete)} className={`${iconBtn} is-destructive`} aria-label="Inserat löschen"><Trash2 className="h-4 w-4" /></button>
        </div>
      )}
    </article>
  );
}
