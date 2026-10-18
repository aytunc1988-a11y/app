import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Trash2, MessageCircle, Pencil, Paperclip, ShieldCheck, Tag } from "lucide-react";

import { db } from "@/api/base44Client";
import { getProfession } from "@/lib/subjects";
import useCurrentUser from "@/lib/useCurrentUser";
import { Image as UiImage } from "@/components/ui/image";

export default function AnzeigeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const [deleting, setDeleting] = useState(false);
  const { data: profiles = [] } = useQuery({ queryKey: ["liebeProfiles"], queryFn: () => db.entities.LiebeProfile.list("-created_date", 500) });

  const { data: ad, isLoading } = useQuery({ queryKey: ["listing", id], queryFn: () => db.entities.Listing.get(id) });

  if (isLoading) return <div className="grid place-items-center py-20"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;
  if (!ad) return <div className="brutal bg-white p-8 mt-6 text-center font-semibold">Anzeige nicht gefunden. <Link to="/anzeigen" className="underline">Zurück</Link></div>;

  const prof = getProfession(ad.profession);
  const isOwn = ad.created_by_id === user?.user_id || ad.created_by === user?.email;

  const remove = async () => {
    setDeleting(true);
    await db.entities.Listing.delete(ad.id);
    await qc.invalidateQueries({ queryKey: ["listings"] });
    navigate("/anzeigen");
  };

  return (
    <div className="modern-page modern-listing-detail">
      <button onClick={() => navigate("/anzeigen")} className="brutal-btn modern-detail-back bg-white"><ArrowLeft className="h-4 w-4" /> Zurück zu den Anzeigen</button>

      <div className="modern-listing-detail-grid">
        <div className="modern-listing-detail-image">
          {ad.image_url ? <UiImage src={ad.image_url} fittingType="cover" className="h-full w-full" /> : <span aria-hidden="true">{prof?.emoji || "❖"}</span>}
          <span className="modern-listing-detail-image-label"><Tag className="h-4 w-4" /> {prof?.short || "Anzeige"}</span>
        </div>

        <div className="modern-listing-detail-card">
          <div className="modern-listing-detail-top">
            <span className="modern-listing-detail-category">{prof?.name || "Anzeige"}</span>
            {ad.price != null && <span className="modern-listing-detail-price">{ad.price === 0 ? "Gratis" : `CHF ${ad.price}`}</span>}
          </div>
          <h1 className="font-heading text-2xl md:text-4xl">{ad.title}</h1>
          <div className="modern-listing-detail-location"><MapPin className="h-4 w-4" />{[ad.ort, ad.canton].filter(Boolean).join(", ") || "Schweiz"}</div>
          <div className="modern-listing-detail-divider" />
          {ad.description && <p className="modern-listing-detail-description">{ad.description}</p>}
          {ad.attachment_url && (
            <a href={ad.attachment_url} download={ad.attachment_name || "anhang"} className="brutal-btn modern-listing-attachment">
              <Paperclip className="h-4 w-4" /> {ad.attachment_name || "Anhang herunterladen"}
            </a>
          )}
          <div className="modern-listing-seller">
            <span className="modern-listing-seller-icon"><ShieldCheck className="h-5 w-5" /></span>
            <div><span>ANGEBOT VON</span><strong>{profiles.find(p => p.created_by_id === ad.created_by_id)?.full_name || ad.created_by?.split("@")[0] || "Unbekannt"}</strong></div>
          </div>
          <div className="modern-listing-detail-actions">
            {isOwn ? (
              <>
                <Link to={`/anzeigen/${ad.id}/bearbeiten`} className="brutal-btn modern-listing-edit"><Pencil className="h-4 w-4" /> Bearbeiten</Link>
                <button onClick={remove} disabled={deleting} className="brutal-btn modern-listing-delete"><Trash2 className="h-4 w-4" /> Löschen</button>
              </>
            ) : (
              <button onClick={() => navigate(`/chat?tab=anzeigen&to=${ad.created_by_id}&listing=${ad.id}`)} className="brutal-btn modern-listing-contact">
                <MessageCircle className="h-5 w-5" /> Verkäufer anschreiben
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
