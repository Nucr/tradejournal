"use client";

import { Message } from "@/lib/types";
import Avatar from "./Avatar";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const time = message.createdAt instanceof Date
    ? message.createdAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex gap-2 items-end ${isOwn ? "flex-row-reverse" : ""} ${showAvatar ? "mb-2" : "mb-0.5"}`}>
      {showAvatar ? (
        <div className="w-7 h-7 shrink-0">
          <Avatar displayName={message.senderName} size="sm" />
        </div>
      ) : (
        <div className="w-7 shrink-0" />
      )}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {showAvatar && (
          <p className={`text-[10px] font-mono text-paper-500 mb-0.5 ${isOwn ? "text-right" : ""}`}>
            {isOwn ? "Sen" : message.senderName}
          </p>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            isOwn
              ? "bg-mint-500 text-ink-950 rounded-br-md"
              : "bg-ink-800 text-paper-100 rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>
        <p className={`text-[10px] font-mono text-paper-600 mt-0.5 ${isOwn ? "text-right" : ""}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
