import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Upload, Star, Download, Lock, Check, Search, Filter } from "lucide-react";
import { db } from "@/api/base44Client";
import useCurrentUser from "@/lib/useCurrentUser";
import { toast } from "sonner";

const PRICES = [0, 1, 2, 3, 5, 10];

export default function ExamMarketplace() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("browse"); // browse | sell | mypurchases
  const [search, setSearch] = useState("");
  const [selling, setSelling] = useState(false);

  // Sell form
  const [sellTitle, setSellTitle] = useState("");
  const [sellDesc, setSellDesc] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellFile, setSellFile] = useState(null);
  const [sellUploading, setSellUploading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await db.entities.ExamListing.list("-created_date", 200);
        setListings(all);
        if (user) {
          const purchases = await db.entities.ExamPurchase.filter(
            [["buyer_id", "=", user.user_id]], "-created_date", 200
          );
          setMyPurchases(purchases.map(p => p.listing_id));
        }
      } catch(e) { toast.error("Fehler beim Laden"); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const publish = async () => {
    if (!sellTitle || !sellFile) return toast.error("Titel und Datei erforderlich");
    setSellUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file: sellFile });
      await db.entities.ExamListing.create({
        title: sellTitle,
        description: sellDesc,
        price: sellPrice,
        file_url,
        file_name: sellFile.name,
        seller_name: user?.email?.split("@")[0] || "Anonym",
        seller_id: user?.user_id,
        downloads: 0,
      });
      toast.success("Prüfung veröffentlicht!");
      setSellTitle(""); setSellDesc(""); setSellPrice(0); setSellFile(null); setTab("browse");
      const all = await db.entities.ExamListing.list("-created_date", 200);
      setListings(all);
    } catch(e) { toast.error("Fehler: " + e.message); }
    finally { setSellUploading(false); }
  };

  const purchase = async (listing) => {
    if (!user) return toast.error("Bitte einloggen");
    if (listing.price > 0) {
      toast("Bezahlung noch nicht implementiert – kommt bald!");
      return;
    }
    try {
      // Gratis: direkt herunterladen + Purchase speichern
      await db.entities.ExamPurchase.create({ listing_id: listing.id, buyer_id: user.user_id, price_paid: 0 });
      await db.entities.ExamListing.update(listing.id, { downloads: (listing.downloads || 0) + 1 });
      setMyPurchases(p => [...p, listing.id]);
      // Import
      const res = await fetch(listing.file_url);
      const data = await res.json();
      if (data?.type === "lapquiz_exams") {
        const allQ = await db.entities.UserQuestion.list("-created_date", 3000);
        const byId = Object.fromEntries(allQ.map(q => [JSON.stringify({q:q.question,a:q.correct_answer}), q.id]));
        for (const item of (data.items || [])) {
          const qids = [];
          for (const q of (item.questions || [])) {
            const key = JSON.stringify({q:q.question,a:q.correct_answer});
            if (byId[key]) { qids.push(byId[key]); }
            else { const cr = await db.entities.UserQuestion.create(q); qids.push(cr.id); }
          }
          await db.entities.CustomExam.create({ title: item.title, mode: item.mode||"exam", timer_minutes: item.timer_minutes||0, question_ids: qids });
        }
        toast.success("Prüfung importiert! Jetzt unter Prüfungen verfügbar.");
      } else {
        toast.success("Heruntergeladen!");
      }
    } catch(e) { toast.error("Fehler: " + e.message); }
  };

  const filtered = listings.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl flex items-center gap-2"><ShoppingCart className="w-6 h-6" /> Marktplatz</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b-2 border-black pb-2">
        {[["browse","Entdecken"],["sell","Verkaufen"],["mypurchases","Meine Käufe"]].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} className={"brutal-btn px-4 py-1.5 text-sm font-bold " + (tab===key?"bg-black text-white":"bg-white")}>{label}</button>
        ))}
      </div>

      {/* BROWSE */}
      {tab === "browse" && (
        <div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Prüfungen suchen…" className="w-full border-2 border-black rounded-lg pl-9 pr-3 py-2 text-sm font-semibold" />
            </div>
          </div>
          {loading ? <div className="grid place-items-center py-16"><div className="w-8 h-8 border-4 border-black border-t-[#CAFFBF] rounded-full animate-spin" /></div> :
            filtered.length === 0 ? <div className="brutal bg-white p-8 text-center font-semibold text-muted-foreground">Noch keine Prüfungen im Marktplatz.</div> :
            <div className="space-y-3">
              {filtered.map(l => {
                const owned = myPurchases.includes(l.id) || l.seller_id === user?.user_id;
                return (
                  <div key={l.id} className="brutal bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-heading text-base truncate">{l.title}</div>
                        {l.description && <p className="text-xs text-muted-foreground font-semibold mt-0.5 line-clamp-2">{l.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-muted-foreground">
                          <span>👤 {l.seller_name}</span>
                          <span><Download className="w-3 h-3 inline" /> {l.downloads||0}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <span className={"brutal text-sm font-heading px-3 py-1 " + (l.price===0?"bg-[#CAFFBF]":"bg-[#FDFFB6]")}>
                          {l.price === 0 ? "Gratis" : `CHF ${l.price}.–`}
                        </span>
                        {owned ? (
                          <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Gekauft</span>
                        ) : (
                          <button onClick={() => purchase(l)} className={"brutal-btn text-xs px-3 py-1.5 font-bold flex items-center gap-1 " + (l.price===0?"bg-[#9BF6FF]":"bg-[#FFADAD]")}>
                            {l.price===0 ? <><Download className="w-3 h-3" /> Holen</> : <><Lock className="w-3 h-3" /> Kaufen</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      )}

      {/* SELL */}
      {tab === "sell" && (
        <div className="brutal bg-white p-5 space-y-4">
          <h2 className="font-heading text-xl">Prüfung verkaufen</h2>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest">Titel *</label>
            <input value={sellTitle} onChange={e=>setSellTitle(e.target.value)} className="w-full border-2 border-black rounded-lg px-3 py-2 font-semibold text-sm mt-1" placeholder="z.B. Rechnungswesen Prüfung 2024" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest">Beschreibung</label>
            <textarea value={sellDesc} onChange={e=>setSellDesc(e.target.value)} rows={3} className="w-full border-2 border-black rounded-lg px-3 py-2 font-semibold text-sm mt-1 resize-none" placeholder="Was ist enthalten? Welche Themen?" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest">Preis</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {PRICES.map(p => (
                <button key={p} onClick={()=>setSellPrice(p)} className={"brutal-btn px-3 py-1.5 text-sm font-bold " + (sellPrice===p?"bg-black text-white":"bg-white")}>
                  {p===0?"Gratis":`CHF ${p}.–`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest">Prüfungs-Datei (.json) *</label>
            <div className="mt-1">
              <label className="brutal-btn bg-[#9BF6FF] px-4 py-2 flex items-center gap-2 w-fit cursor-pointer font-bold text-sm">
                <Upload className="w-4 h-4" /> Datei wählen
                <input type="file" accept=".json" className="hidden" onChange={e=>setSellFile(e.target.files?.[0]||null)} />
              </label>
              {sellFile && <p className="text-xs font-semibold mt-1 text-green-700">✓ {sellFile.name}</p>}
            </div>
          </div>
          <button onClick={publish} disabled={sellUploading} className="brutal-btn bg-black text-white w-full py-3 font-heading flex items-center justify-center gap-2">
            {sellUploading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-4 h-4" /> Veröffentlichen</>}
          </button>
        </div>
      )}

      {/* MY PURCHASES */}
      {tab === "mypurchases" && (
        <div>
          {myPurchases.length === 0 ? (
            <div className="brutal bg-white p-8 text-center font-semibold text-muted-foreground">Noch keine Käufe.</div>
          ) : (
            <div className="space-y-3">
              {listings.filter(l => myPurchases.includes(l.id)).map(l => (
                <div key={l.id} className="brutal bg-[#CAFFBF] p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-heading text-base">{l.title}</div>
                    <div className="text-xs font-semibold text-muted-foreground">von {l.seller_name}</div>
                  </div>
                  <span className="text-xs font-bold text-green-700 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Importiert</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
