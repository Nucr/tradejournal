"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDirectConversation } from "@/lib/messages";
import { UserSearchResult } from "@/lib/types";
import UserSearchInput from "./UserSearchInput";

interface NewConversationModalProps {
  uid: string;
  onClose: () => void;
}

export default function NewConversationModal({ uid, onClose }: NewConversationModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSelect(user: UserSearchResult) {
    if (loading) return;
    setLoading(true);
    try {
      const convId = await createDirectConversation(uid, user.uid);
      onClose();
      if (convId) {
        router.push(`/dashboard/messages/${convId}`);
      }
    } finally {
      setLoading(false);
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
          <h3 className="font-display text-lg font-semibold">Yeni Mesaj</h3>
          <button onClick={onClose} className="text-paper-500 hover:text-paper-200 transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-paper-500 mb-4">Mesaj göndermek istediğin kullanıcıyı ara.</p>
        <UserSearchInput
          onSelect={handleSelect}
          placeholder="Kullanıcı adı ile ara..."
          excludeUid={uid}
        />
        {loading && (
          <p className="text-xs text-paper-500 mt-3">Konuşma oluşturuluyor...</p>
        )}
      </div>
    </div>
  );
}
