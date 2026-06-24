"use client";

import { useState } from "react";
import {
  inviteToGroup,
  removeFromGroup,
  transferOwnership,
  leaveGroup,
} from "@/lib/messages";
import { Conversation, UserSearchResult } from "@/lib/types";
import Avatar from "./Avatar";
import UserSearchInput from "./UserSearchInput";

interface GroupSettingsModalProps {
  conversation: Conversation;
  currentUid: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function GroupSettingsModal({
  conversation,
  currentUid,
  onClose,
  onUpdate,
}: GroupSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isOwner = conversation.ownerId === currentUid;

  async function handleInvite(user: UserSearchResult) {
    if (!isOwner) return;
    setLoading(true);
    try {
      await inviteToGroup(conversation.id, user.uid);
      setMessage(`${user.displayName} davet edildi`);
      onUpdate();
    } catch {
      setMessage("Davet gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(uid: string) {
    if (!isOwner) return;
    setLoading(true);
    try {
      await removeFromGroup(conversation.id, uid);
      setMessage("Üye çıkarıldı");
      onUpdate();
    } catch {
      setMessage("Üye çıkarılamadı");
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(uid: string) {
    if (!isOwner) return;
    setLoading(true);
    try {
      await transferOwnership(conversation.id, uid);
      setMessage("Yetki devredildi");
      onUpdate();
    } catch {
      setMessage("Yetki devredilemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    setLoading(true);
    try {
      await leaveGroup(conversation.id, currentUid);
      onClose();
      onUpdate();
    } catch {
      setMessage("Gruptan ayrılamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative rounded-xl border border-ink-800 bg-ink-900 p-6 max-w-md w-full shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Grup Ayarları</h3>
          <button onClick={onClose} className="text-paper-500 hover:text-paper-200 transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-paper-100">{conversation.name}</p>
            {conversation.description && (
              <p className="text-xs text-paper-500 mt-0.5">{conversation.description}</p>
            )}
            <p className="text-xs text-paper-500 mt-1">
              {conversation.groupType === "open" ? "🔓 Açık grup" : "🔒 Kapalı grup"}
              {" · "}
              {conversation.participants.length} üye
            </p>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-2">Üye Davet Et</label>
              <UserSearchInput onSelect={handleInvite} placeholder="Kullanıcı ara..." />
            </div>
          )}

          {/* Members */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-2">Üyeler</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {conversation.participants.map((pid) => (
                <div
                  key={pid}
                  className="flex items-center justify-between rounded-lg bg-ink-950 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar displayName={pid} size="sm" />
                    <div>
                      <p className="text-sm text-paper-200">
                        {pid === currentUid ? "Sen" : pid.slice(0, 8) + "..."}
                      </p>
                      {pid === conversation.ownerId && (
                        <span className="text-[10px] font-mono text-amber-400">Sahip</span>
                      )}
                    </div>
                  </div>
                  {isOwner && pid !== currentUid && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleTransfer(pid)}
                        disabled={loading}
                        className="text-[10px] font-mono text-paper-500 hover:text-amber-400 transition px-2 py-1"
                        title="Yetki devret"
                      >
                        👑 Devret
                      </button>
                      <button
                        onClick={() => handleRemove(pid)}
                        disabled={loading}
                        className="text-[10px] font-mono text-paper-500 hover:text-coral-400 transition px-2 py-1"
                        title="Çıkar"
                      >
                        ✕ Çıkar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {message && (
            <p className="text-xs text-mint-400">{message}</p>
          )}

          <button
            onClick={handleLeave}
            disabled={loading}
            className="w-full rounded-lg border border-coral-500/30 text-coral-400 font-medium py-2.5 text-sm hover:bg-coral-500/10 transition disabled:opacity-40"
          >
            {conversation.ownerId === currentUid ? "Grubu Sil" : "Gruptan Ayrıl"}
          </button>
        </div>
      </div>
    </div>
  );
}
