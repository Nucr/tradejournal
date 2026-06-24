"use client";

import { Conversation } from "@/lib/types";
import Avatar from "./Avatar";

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  unreadCounts: Map<string, number>;
  currentUid: string;
}

function getConversationName(conv: Conversation, currentUid: string): string {
  if (conv.name) return conv.name;
  if (conv.type === "direct") {
    return conv.participants.filter((p) => p !== currentUid)[0] ?? "Bilinmeyen";
  }
  return "İsimsiz Sohbet";
}

function getLastMessagePreview(msg: { text: string; senderName: string } | undefined): string {
  if (!msg) return "Henüz mesaj yok";
  return msg.text.length > 40 ? msg.text.slice(0, 40) + "..." : msg.text;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "direct": return "Özel";
    case "group": return "Grup";
    case "community": return "Topluluk";
    default: return "";
  }
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  unreadCounts,
  currentUid,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-paper-500">
        <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm">Henüz mesajın yok</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-ink-800">
      {conversations.map((conv) => {
        const unread = unreadCounts.get(conv.id) ?? 0;
        const name = getConversationName(conv, currentUid);
        const isActive = conv.id === activeId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition ${
              isActive
                ? "bg-mint-500/10 border-l-2 border-mint-500"
                : "hover:bg-ink-800/50 border-l-2 border-transparent"
            }`}
          >
            <Avatar
              displayName={name}
              avatarColor={conv.type === "community" ? "#2ED9A4" : conv.type === "group" ? "#F2B84B" : undefined}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium truncate ${unread > 0 ? "text-paper-100 font-semibold" : "text-paper-200"}`}>
                  {name}
                </p>
                <span className="text-[10px] font-mono text-paper-500 shrink-0">
                  {getTypeLabel(conv.type)}
                </span>
              </div>
              <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-paper-300 font-medium" : "text-paper-500"}`}>
                {conv.lastMessage
                  ? `${conv.lastMessage.senderName}: ${getLastMessagePreview(conv.lastMessage)}`
                  : "Henüz mesaj yok"}
              </p>
            </div>
            {unread > 0 && (
              <span className="min-w-[20px] h-5 rounded-full bg-mint-500 text-ink-950 text-[10px] font-bold flex items-center justify-center px-1">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
