import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LockKeyhole, MessageCircle, MessagesSquare, Tag, Trash2 } from "lucide-react";

import { db } from "@/api/base44Client";
import { toast } from "sonner";
import useCurrentUser from "@/lib/useCurrentUser";
import ConversationList from "@/components/chat/ConversationList";
import ChatThread from "@/components/chat/ChatThread";

export default function Chat() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "anzeigen" ? "anzeigen" : "leute");
  const [activeKey, setActiveKey] = useState(null);

  const { data: messages = [] } = useQuery({ queryKey: ["messages"], queryFn: () => db.entities.Message.filter({ created_by_id: user?.user_id }, "-created_date", 1000).then(sent => db.entities.Message.filter({ recipient_id: user?.user_id }, "-created_date", 1000).then(recv => [...sent, ...recv])) });
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
      const mine = m.created_by_id === user.user_id;
      const peer = mine ? m.recipient_id : m.created_by_id;
      if (!peer || peer === user.user_id) return;
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
        const unread = messages.filter((m) =>
          !m.read && m.recipient_id === user?.user_id &&
          m.created_by_id === c.peer &&
          (m.listing_id || null) === (c.listingId || null)
        ).length;
        return { key: c.key, name, subtitle, image: profile?.image_url || "", lastText: c.lastText, created_date: c.created_date, unread };
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
        const mine = m.created_by_id === user.user_id;
        const mPeer = mine ? m.recipient_id : m.created_by_id;
        return mPeer === active.peer && (m.listing_id || null) === (active.listingId || null);
      })
      .map((m) => ({ ...m, isMine: m.created_by_id === user.user_id }))
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [messages, active, user]);

  const unread = useMemo(() => {
    if (!user) return 0;
    return messages.filter((m) => !m.read && m.recipient_id === user.user_id).length;
  }, [messages, user]);

  // Ungelesene Nachrichten als gelesen markieren
  useEffect(() => {
    if (!active || !user || !messages.length) return;
    const toMark = messages.filter((m) =>
      !m.read && m.recipient_id === user.user_id &&
      m.created_by_id === active.peer &&
      (m.listing_id || null) === (active.listingId || null)
    );
    if (!toMark.length) return;
    Promise.all(toMark.map((m) => db.entities.Message.update(m.id, { read: true })))
      .then(() => qc.invalidateQueries({ queryKey: ["messages"] }));
  }, [activeKey, messages.length]);

  const deleteConversation = async () => {
    if (!active || !user) return;
    const toDelete = messages.filter((m) => {
      const mine = m.created_by_id === user.user_id;
      const mPeer = mine ? m.recipient_id : m.created_by_id;
      return mPeer === active.peer && (m.listing_id || null) === (active.listingId || null);
    });
    await Promise.all(toDelete.map(m => db.entities.Message.delete(m.id)));
    qc.invalidateQueries({ queryKey: ["messages"] });
    setActiveKey(null);
  };

  const deleteMessage = async (id) => {
    await db.entities.Message.delete(id);
    qc.invalidateQueries({ queryKey: ["messages"] });
  };

  const send = async (text) => {
    if (!active) return;
    await db.entities.Message.create({ recipient_id: active.peer, listing_id: active.listingId || null, text });
    qc.invalidateQueries({ queryKey: ["messages"] });
  };

  const activeName = active ? resolvePeerName(active.peer, active.listingId) : "";

  const handleImportExam = async (data) => {
    try {
      const allQ = await db.entities.UserQuestion.list("-created_date", 3000);
      const existingQuestions = Object.fromEntries(allQ.map(q => [JSON.stringify({q:q.question,a:q.correct_answer}), q.id]));
      for (const item of (data.items || [])) {
        const questionIds = [];
        for (const q of (item.questions || [])) {
          const key = JSON.stringify({q:q.question,a:q.correct_answer});
          if (existingQuestions[key]) {
            questionIds.push(existingQuestions[key]);
          } else {
            const created = await db.entities.UserQuestion.create(q);
            questionIds.push(created.id);
          }
        }
        await db.entities.CustomExam.create({ title: item.title, mode: item.mode || "exam", timer_minutes: item.timer_minutes || 0, question_ids: questionIds });
      }
      toast.success("Prüfung erfolgreich importiert!");
    } catch(e) { toast.error("Import fehlgeschlagen"); }
  };

  return (
    <div className="modern-page modern-chat">
      <header className="modern-chat-heading">
        <div><span>DEINE NACHRICHTEN</span><h1 className="font-heading text-2xl sm:text-4xl">Chat</h1><p>Bleib mit deiner Lerncommunity in Kontakt.</p></div>
        <div className="modern-chat-private"><LockKeyhole className="h-4 w-4" /> Privat</div>
      </header>
      <div className="modern-chat-panel">
        <div className="modern-chat-tabs" role="tablist" aria-label="Unterhaltungen">
          {[
            { id: "anzeigen", label: "Anzeigen", icon: Tag },
            { id: "leute", label: "Leute", icon: MessagesSquare },
          ].map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setActiveKey(null); setParams({}); }} className={`modern-chat-tab ${tab === t.id ? "is-active" : ""}`}>
              <t.icon className="w-4 h-4" /> {t.label}{t.id === "leute" && unread > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
            </button>
          ))}
        </div>

        <div className="modern-chat-layout">
          <div className={`modern-chat-conversations ${active ? "hidden md:block" : ""}`}>
            <ConversationList conversations={tabConversations} activeKey={activeKey} onSelect={setActiveKey} />
          </div>
          <div className={`modern-chat-thread ${active ? "" : "hidden md:flex"}`}>
            {active ? (
              <>
                <div className="modern-chat-thread-heading">
                  <button onClick={() => setActiveKey(null)} className="modern-chat-back md:hidden" aria-label="Zurück zu allen Unterhaltungen"><ArrowLeft className="h-4 w-4" /></button>
                  <div className="modern-chat-peer-avatar">{activeName.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase()}</div>
                  <div className="min-w-0"><strong className="truncate">{activeName}</strong><span>Unterhaltung</span></div>
                  <button onClick={() => { if(window.confirm("Konversation löschen?")) deleteConversation(); }} className="modern-chat-delete ml-auto" aria-label="Konversation löschen"><Trash2 className="w-4 h-4" /></button>
                </div>
                <ChatThread onImportExam={handleImportExam} messages={threadMessages} peerName={activeName} onSend={send} onDelete={deleteMessage} />
              </>
            ) : (
              <div className="modern-chat-empty">
                <div><MessagesSquare className="h-7 w-7" /></div>
                <h2>Deine Unterhaltungen</h2>
                <p>Wähle einen Chat aus der Liste oder schreib jemanden direkt über ein Profil oder Inserat an.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
