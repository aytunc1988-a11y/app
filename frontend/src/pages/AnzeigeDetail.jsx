import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Trash2, MessageCircle, Pencil } from "lucide-react";

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

  const { data: ad, isLoading } = useQuery({ queryKey: ["listing", id], queryFn: () => db.entities.Listing.get(id) });

  if (isLoading) return <div className="grid place-items-center py-20"><div className="w-8 h-8 border-4 border-black border-t-[#FDFFB6] rounded-full animate-spin" /></div>;
  if (!ad) return <div className="brutal bg-white p-8 mt-6 text-center font-semibold">Anzeige nicht gefunden. <Link to="/anzeigen" className="underline">Zurück</Link></div>;

  const prof = getProfession(ad.profession);
  const isOwn = ad.created_by_id === user?.id;

  const remove = async () => {
    setDeleting(true);
    await db.entities.Listing.delete(ad.id);
    await qc.invalidateQueries({ queryKey: ["listings"] });
    navigate("/anzeigen");
  };

  return (
    <div className="-mx-3 md:-mx-6 -my-3 md:-my-8 min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-3 md:px-6 py-4 md:py-6">
        <button onClick={() => navigate("/anzeigen")} className="brutal-btn bg-white px-3 py-2 inline-flex items-center gap-1 text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Zurück zu den Anzeigen</button>

        <div className="grid md:grid-cols-2 gap-5 items-start">
          <div className="brutal bg-[#FDFFB6] overflow-hidden h-64 sm:h-80 md:h-[26rem] grid place-items-center">
            {ad.image_url ? <UiImage src={ad.image_url} fittingType="cover" className="w-full h-full" /> : <span className="font-heading text-7xl md:text-8xl">{prof?.emoji || "❖"}</span>}
          </div>

          <div className="brutal bg-white p-5 md:p-7">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className={`text-[11px] font-bold border-2 border-black rounded-full px-2.5 py-1 ${prof?.bg || "bg-white"}`}>{prof?.name || "Anzeige"}</span>
              {ad.price != null && <span className="font-heading text-3xl md:text-4xl">{ad.price === 0 ? "Gratis" : `CHF ${ad.price}`}</span>}
            </div>
            <h1 className="font-heading text-2xl md:text-4xl mt-4 leading-tight">{ad.title}</h1>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground mt-3"><MapPin className="w-4 h-4" />{[ad.ort, ad.canton].filter(Boolean).join(", ") || "Schweiz"}</div>
            {ad.description && <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed font-medium">{ad.description}</p>}
            {ad.attachment_url && <a href={ad.attachment_url} download={ad.attachment_name || "anhang"} className="brutal-btn bg-[#9BF6FF] mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm no-underline">📎 {ad.attachment_name || "Anhang herunterladen"}</a>}
            <div className="text-xs font-semibold text-muted-foreground mt-5 border-t-2 border-black pt-3">Inserat von: {ad.created_by}</div>

            <div className="mt-6">
              {isOwn ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link to={`/anzeigen/${ad.id}/bearbeiten`} className="brutal-btn bg-[#FDFFB6] py-3 flex items-center justify-center gap-2"><Pencil className="w-4 h-4" /> Bearbeiten</Link>
                  <button onClick={remove} disabled={deleting} className="brutal-btn bg-[#FFADAD] py-3 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Löschen</button>
                </div>
              ) : (
                <button onClick={() => navigate(`/chat?tab=anzeigen&to=${ad.created_by_id}&listing=${ad.id}`)} className="brutal-btn bg-black text-white w-full py-4 flex items-center justify-center gap-2 text-base"><MessageCircle className="w-5 h-5" /> Verkäufer anschreiben</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
