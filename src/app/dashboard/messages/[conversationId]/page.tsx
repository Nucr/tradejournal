"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getConversation,
  subscribeToMessages,
  sendMessage,
  markAsRead,
} from "@/lib/messages";
import { getUserDisplayMap, UserDisplayInfo } from "@/lib/profile";
import { Conversation, Message } from "@/lib/types";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const conversationId = params?.conversationId as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [userDisplayMap, setUserDisplayMap] = useState<Record<string, UserDisplayInfo>>({});

  useEffect(() => {
    if (!conversationId) return;
    getConversation(conversationId).then((conv) => {
      setConversation(conv);
      if (conv) {
        getUserDisplayMap(conv.participants).then(setUserDisplayMap).catch(() => {});
      }
    });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const unsub = subscribeToMessages(conversationId, setMessages);
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !user) return;
    markAsRead(conversationId, user.uid);
  }, [conversationId, user]);

  function getConversationName(): string {
    if (!conversation) return "Sohbet";
    if (conversation.name) return conversation.name;
    if (conversation.type === "direct" && user) {
      const otherUid = conversation.participants.filter((p) => p !== user.uid)[0];
      if (!otherUid) return "Bilinmeyen";
      return userDisplayMap[otherUid]?.displayName ?? otherUid.slice(0, 8);
    }
    return "İsimsiz Sohbet";
  }

  const handleSend = useCallback(async (text: string) => {
    if (!user || !conversationId) return;
    setSending(true);
    try {
      const displayName = user.displayName ?? user.email?.split("@")[0] ?? "Trader";
      await sendMessage(conversationId, user.uid, displayName, text);
    } finally {
      setSending(false);
    }
  }, [user, conversationId]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="text-paper-400 hover:text-paper-200 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold">{getConversationName()}</h1>
          {conversation && (
            <p className="text-xs text-paper-500 font-mono">
              {conversation.type === "direct"
                ? "Özel mesaj"
                : conversation.type === "group"
                ? `${conversation.participants.length} üye`
                : "Topluluk"}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 rounded-xl border border-ink-800 bg-ink-900 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-paper-500">
              <p className="text-sm">Henüz mesaj yok</p>
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
        <MessageInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}
