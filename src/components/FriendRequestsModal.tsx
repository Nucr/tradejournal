"use client";

import { useEffect, useState } from "react";
import { FriendRequest } from "@/lib/types";
import {
  subscribeToFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/friends";

interface FriendRequestsModalProps {
  uid: string;
  onClose: () => void;
}

export default function FriendRequestsModal({ uid, onClose }: FriendRequestsModalProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToFriendRequests(uid, setRequests);
    return unsub;
  }, [uid]);

  async function handleAccept(req: FriendRequest) {
    setLoadingId(req.id);
    try {
      await acceptFriendRequest(req.id, req.fromUid, uid);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(req: FriendRequest) {
    setLoadingId(req.id);
    try {
      await rejectFriendRequest(req.id);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative rounded-xl border border-ink-800 bg-ink-900 p-6 max-w-md w-full shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Arkadaşlık İstekleri</h3>
          <button onClick={onClose} className="text-paper-500 hover:text-paper-200 transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {requests.length === 0 ? (
          <p className="text-sm text-paper-500 text-center py-8">Bekleyen arkadaşlık isteği yok.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-950/50 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-ink-950 shrink-0"
                    style={{ backgroundColor: req.fromAvatarColor }}
                  >
                    {req.fromDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-paper-100 truncate">
                      {req.fromDisplayName}
                    </p>
                    <p className="text-xs text-paper-500">Arkadaşlık isteği gönderdi</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleAccept(req)}
                    disabled={loadingId === req.id}
                    className="rounded-lg bg-mint-500 text-ink-950 text-xs font-semibold px-3 py-1.5 hover:bg-mint-400 transition disabled:opacity-40"
                  >
                    {loadingId === req.id ? "..." : "Kabul Et"}
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    disabled={loadingId === req.id}
                    className="rounded-lg border border-ink-700 text-paper-300 text-xs font-medium px-3 py-1.5 hover:bg-ink-800 transition disabled:opacity-40"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
