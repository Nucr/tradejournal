"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { subscribeToNotifications, markNotificationRead } from "@/lib/notifications";
import { AppNotification } from "@/lib/types";

const NOTIF_LABELS: Record<string, string> = {
  new_message: "sana bir mesaj gönderdi",
  friend_request: "sana arkadaşlık isteği gönderdi",
  friend_accepted: "arkadaşlık isteğini kabul etti",
};

const NOTIF_ICONS: Record<string, string> = {
  new_message: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  friend_request: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  friend_accepted: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default function NotificationToast() {
  const { user } = useAuth();
  const router = useRouter();
  const [incoming, setIncoming] = useState<AppNotification | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, (list) => {
      const unread = list.filter((n) => !n.read);
      if (unread.length === 0) return;
      // Only toast the latest unread
      const latest = unread[0];
      // Check if we've already shown this one
      const shown = sessionStorage.getItem(`notif-toast-${latest.id}`);
      if (shown) return;
      sessionStorage.setItem(`notif-toast-${latest.id}`, "1");
      setIncoming(latest);
      setTimeout(() => setIncoming(null), 5000);
    });
    return unsub;
  }, [user]);

  if (!incoming) return null;

  const label = NOTIF_LABELS[incoming.type] ?? "bir bildirim gönderdi";

  function handleClick() {
    const n = incoming;
    if (!n) return;
    sessionStorage.removeItem(`notif-toast-${n.id}`);
    setIncoming(null);
    if (n.type === "new_message") {
      const convId = n.data?.conversationId as string | undefined;
      if (convId) router.push(`/dashboard/messages?conv=${convId}`);
    } else if (n.type === "friend_request" || n.type === "friend_accepted") {
      router.push("/dashboard/friends");
    }
    markNotificationRead(user!.uid, n.id).catch(() => {});
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-in-right">
      <button
        onClick={handleClick}
        className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4 shadow-lg hover:bg-ink-800 transition max-w-sm"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: incoming.fromAvatarColor }}
        >
          {incoming.fromDisplayName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left min-w-0">
          <p className="text-sm font-semibold text-paper-100 truncate">
            {incoming.fromDisplayName}
          </p>
          <p className="text-xs text-paper-400 mt-0.5 line-clamp-2">{label}</p>
        </div>
        <svg className="w-4 h-4 shrink-0 text-mint-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={NOTIF_ICONS[incoming.type] ?? NOTIF_ICONS.new_message} />
        </svg>
      </button>
    </div>
  );
}
