"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { usePlan } from "@/lib/features";
import FeatureGate from "@/components/FeatureGate";
import {
  subscribeToConversations,
  sendMessage,
  subscribeToMessages,
  markAsRead,
  getUnreadCounts,
  subscribeToInvitations,
  acceptInvitation,
  rejectInvitation,
} from "@/lib/messages";
import { getPublicDisplayMap, UserDisplayInfo } from "@/lib/profile";
import { Conversation, Message, ConversationInvitation } from "@/lib/types";
import ConversationList from "@/components/ConversationList";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import NewConversationModal from "@/components/NewConversationModal";
import CreateGroupModal from "@/components/CreateGroupModal";
import GroupSettingsModal from "@/components/GroupSettingsModal";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const { hasFeature } = usePlan();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const [convError, setConvError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<ConversationInvitation[]>([]);
  const [invitationLoading, setInvitationLoading] = useState<string | null>(null);
  const [userDisplayMap, setUserDisplayMap] = useState<Record<string, UserDisplayInfo>>({});

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Trader";

  useEffect(() => {
    const convId = searchParams?.get("conv");
    if (convId) setActiveId(convId);
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(
      user.uid,
      (list) => {
        setConversations(list);
        setConvError(null);
        getUnreadCounts(user.uid, list).then(setUnreadCounts).catch(() => {});
        // Fetch display names for all participants
        const allUids = new Set<string>();
        list.forEach((c) => c.participants.forEach((p) => allUids.add(p)));
        const uidArray = Array.from(allUids);
        if (uidArray.length > 0) {
          getPublicDisplayMap(uidArray).then(setUserDisplayMap).catch(() => {});
        }
      },
      (err) => {
        setConvError("Sohbetler yüklenirken hata oluştu: " + err.message);
      }
    );
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToInvitations(user.uid, setInvitations);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    const unsub = subscribeToMessages(activeId, setMessages);
    if (user) markAsRead(activeId, user.uid);
    return unsub;
  }, [activeId, user]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const handleSend = useCallback(async (text: string) => {
    if (!user || !activeId) return;
    setSending(true);
    try {
      await sendMessage(activeId, user.uid, displayName, text);
    } finally {
      setSending(false);
    }
  }, [user, activeId, displayName]);

  async function handleAcceptInvitation(inv: ConversationInvitation) {
    if (!user) return;
    setInvitationLoading(inv.id);
    try {
      await acceptInvitation(inv.id, inv.conversationId, user.uid);
    } catch {
      setConvError("Davet kabul edilemedi");
    } finally {
      setInvitationLoading(null);
    }
  }

  async function handleRejectInvitation(inv: ConversationInvitation) {
    setInvitationLoading(inv.id);
    try {
      await rejectInvitation(inv.id);
    } finally {
      setInvitationLoading(null);
    }
  }

  function getConversationName(conv: Conversation): string {
    if (conv.name) return conv.name;
    if (conv.type === "direct" && user) {
      const otherUid = conv.participants.filter((p) => p !== user.uid)[0];
      if (!otherUid) return "Bilinmeyen";
      return userDisplayMap[otherUid]?.displayName ?? otherUid.slice(0, 8);
    }
    return "İsimsiz Sohbet";
  }

  function getParticipantNames(conv: Conversation): string {
    if (conv.type === "direct" && user) {
      const otherUid = conv.participants.filter((p) => p !== user.uid)[0] ?? "";
      return userDisplayMap[otherUid]?.displayName ?? otherUid.slice(0, 12);
    }
    return `${conv.participants.length} üye`;
  }

  if (!user) return null;

  return (
    <FeatureGate feature="messaging">
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-semibold">Mesajlar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGroupModal(true)}
            className="rounded-lg border border-ink-700 text-paper-300 px-3 py-2 text-sm hover:bg-ink-800 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Grup Oluştur
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-3 py-2 text-sm hover:bg-mint-400 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Mesaj
          </button>
        </div>
      </div>

      {convError && (
        <div className="rounded-xl border border-coral-500/20 bg-coral-500/5 p-4 mb-4">
          <p className="text-sm text-coral-400">{convError}</p>
        </div>
      )}

      {/* Invitations banner */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wide text-amber-400 font-semibold">
            Bekleyen Davetler ({invitations.length})
          </p>
          {invitations.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-paper-100 truncate">
                  {inv.inviterName} seni <span className="font-semibold">{inv.conversationName}</span> grubuna davet etti
                </p>
              </div>
              <div className="flex gap-2 shrink-0 ml-3">
                <button
                  onClick={() => handleAcceptInvitation(inv)}
                  disabled={invitationLoading === inv.id}
                  className="rounded-lg bg-mint-500 text-ink-950 text-xs font-semibold px-3 py-1.5 hover:bg-mint-400 transition disabled:opacity-40"
                >
                  {invitationLoading === inv.id ? "..." : "Kabul Et"}
                </button>
                <button
                  onClick={() => handleRejectInvitation(inv)}
                  disabled={invitationLoading === inv.id}
                  className="rounded-lg border border-ink-700 text-paper-300 text-xs font-medium px-3 py-1.5 hover:bg-ink-800 transition disabled:opacity-40"
                >
                  Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex rounded-xl border border-ink-800 bg-ink-900 overflow-hidden min-h-0">
        {/* Sidebar - conversation list */}
        <div className="w-72 shrink-0 border-r border-ink-800 flex flex-col overflow-hidden hidden md:flex">
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeId={activeId ?? undefined}
              onSelect={(id) => {
                setActiveId(id);
                router.replace(`/dashboard/messages?conv=${id}`);
              }}
              unreadCounts={unreadCounts}
              currentUid={user.uid}
              userDisplayMap={userDisplayMap}
            />
          </div>
        </div>

        {/* Conversation area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Conversation header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-800">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => {
                    setActiveId(null);
                    router.replace("/dashboard/messages");
                  }}
                  className="md:hidden text-paper-400 hover:text-paper-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-paper-100 truncate">
                    {getConversationName(activeConversation)}
                  </p>
                  <p className="text-xs text-paper-500 font-mono">
                    {getParticipantNames(activeConversation)}
                    {activeConversation.type === "group" && ` · ${activeConversation.groupType === "open" ? "Açık" : "Kapalı"}`}
                  </p>
                </div>
              </div>
              {activeConversation.type === "group" && (
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="text-paper-400 hover:text-paper-200 transition p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-paper-500">
                  <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">Henüz mesaj yok</p>
                  <p className="text-xs mt-1">İlk mesajı sen yaz!</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const prev = idx > 0 ? messages[idx - 1] : null;
                const showAvatar = !prev || prev.senderId !== msg.senderId;
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === user.uid}
                    showAvatar={showAvatar}
                  />
                );
              })}
            </div>

            {/* Input */}
            <MessageInput onSend={handleSend} disabled={sending} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-paper-500">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-display">Bir konuşma seç</p>
            <p className="text-sm mt-1">Soldan bir konuşma seç veya yeni bir mesaj başlat.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(true)}
                className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-4 py-2 text-sm hover:bg-mint-400 transition"
              >
                Yeni Mesaj
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                className="rounded-lg border border-ink-700 text-paper-300 px-4 py-2 text-sm hover:bg-ink-800 transition"
              >
                Grup Oluştur
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewModal && <NewConversationModal uid={user.uid} onClose={() => setShowNewModal(false)} />}
      {showGroupModal && <CreateGroupModal uid={user.uid} onClose={() => setShowGroupModal(false)} />}
      {showSettingsModal && activeConversation && (
        <GroupSettingsModal
          conversation={activeConversation}
          currentUid={user.uid}
          currentDisplayName={displayName}
          onClose={() => setShowSettingsModal(false)}
          onUpdate={() => {}}
        />
      )}
    </div>
    </FeatureGate>
  );
}
