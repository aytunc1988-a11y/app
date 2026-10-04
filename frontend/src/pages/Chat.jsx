import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Tag } from "lucide-react";

import { db } from "@/api/base44Client";
import useCurrentUser from "@/lib/useCurrentUser";
import ConversationList from "@/components/chat/ConversationList";
import ChatThread from "@/components/chat/ChatThread";

export default function Chat() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "anzeigen" ? "anzeigen" : "leute");
  const [activeKey, setActiveKey] = useState(null);

  const { data: messages = [] } = useQuery({ queryKey: ["messages"], queryFn: () => db.entities.Message.list("-created_date", 1000) });
  const { data: profiles = [] } = useQuery({ queryKey: ["liebeProfiles"], queryFn: () => db.entities.LiebeProfile.list("-created_date", 500) });
  const { data: listings = [] } = useQuery({ queryKey: ["listings"], queryFn: () => db.entities.Listing.list("-created_date", 500) });

  const toParam = params.get("to");
  const listingParam = params.get("listing");
  useEffect(() => {
    if (toParam) {
      setActiveKey(`${toParam}:${listingParam || "none"}`);
      setTab(listingParam ? "anzeigen" : "leute");
    }
  }, [toParam, listingParam]);

  const resolvePeerName = (peerId, listingId) => {
    if (listingId) {
      const ad = listings.find((l) => l.id === listingId);
      return ad?.title || "Anzeige";
    }
    const p = profiles.find((p) => p.created_by_id === peerId);
    return p?.full_name || "Leute-Chat";
  };

  const conversations = useMemo(() => {
    if (!user) return [];
    const map = new Map();
    messages.forEach((m) => {
      const mine = m.created_by_id === user.id;
      const peer = mine ? m.recipient_id : m.created_by_id;
      if (!peer || peer === user.id) return;
      const listingId = m.listing_id || null;
      const key = `${peer}:${listingId || "none"}`;
      const prev = map.get(key);
      if (!prev || new Date(m.created_date) > new Date(prev.created_date)) {
        map.set(key, { key, peer, listingId, lastText: m.text, created_date: m.created_date });
      }
    });
    return [...map.values()];
  }, [messages, user]);

  const tabConversations = useMemo(() => {
    return conversations
      .filter((c) => (tab === "anzeigen" ? !!c.listingId : !c.listingId))
      .map((c) => {
        const profile = profiles.find((p) => p.created_by_id === c.peer);
        const name = profile?.full_name || (tab === "anzeigen" ? "Verkäufer:in" : "Leute-Chat");
        const subtitle = tab === "anzeigen" ? (listings.find((l) => l.id === c.listingId)?.title || "Anzeige") : (c.lastText || "");
        return { key: c.key, name, subtitle, image: profile?.image_url || "", lastText: c.lastText, created_date: c.created_date };
      })
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [conversations, tab, profiles, listings]);

  const active = activeKey ? (() => {
    const [peer, lk] = activeKey.split(":");
    return { peer, listingId: lk === "none" ? null : lk };
  })() : null;

  const threadMessages = useMemo(() => {
    if (!active || !user) return [];
    return messages
      .filter((m) => {
        const mine = m.created_by_id === user.id;
        const mPeer = mine ? m.recipient_id : m.created_by_id;
        return mPeer === active.peer && (m.listing_id || null) === (active.listingId || null);
      })
      .map((m) => ({ ...m, isMine: m.created_by_id === user.id }))
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [messages, active, user]);

  const send = async (text) => {
    if (!active) return;
    await db.entities.Message.create({ recipient_id: active.peer, listing_id: active.listingId || null, text });
    qc.invalidateQueries({ queryKey: ["messages"] });
  };

  const activeName = active ? resolvePeerName(active.peer, active.listingId) : "";

  return (
    <div>
      <h1 className="font-heading text-xl sm:text-3xl">Chat</h1>
      <div className="brutal bg-white mt-2 overflow-hidden">
        <div className="flex border-b-2 border-black">
          {[
            { id: "anzeigen", label: "Anzeigen", icon: Tag },
            { id: "leute", label: "Leute", icon: MessageCircle },
          ].map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setActiveKey(null); setParams({}); }} className={`flex-1 py-2 text-sm font-heading flex items-center justify-center gap-2 ${tab === t.id ? "bg-[#FDFFB6]" : "bg-white"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[260px_1fr] h-[calc(100dvh-15rem)] md:h-[60vh]">
          <div className={`border-r-2 border-black overflow-y-auto ${active ? "hidden md:block" : ""}`}>
            <ConversationList conversations={tabConversations} activeKey={activeKey} onSelect={setActiveKey} />
          </div>
          <div className={`flex flex-col min-h-0 ${active ? "" : "hidden md:flex"}`}>
            {active ? (
              <>
                <div className="border-b-2 border-black px-3 py-1.5 font-bold text-sm truncate flex items-center gap-2">
                  <button onClick={() => setActiveKey(null)} className="md:hidden p-1 -ml-1 text-lg leading-none">‹</button>
                  <span className="truncate">{activeName}</span>
                </div>
                <ChatThread messages={threadMessages} peerName={activeName} onSend={send} />
              </>
            ) : (
              <div className="flex-1 grid place-items-center text-xs font-semibold text-muted-foreground p-6 text-center">Wähle links eine Unterhaltung – oder schreib jemanden direkt aus einem Profil oder einer Anzeige an.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
