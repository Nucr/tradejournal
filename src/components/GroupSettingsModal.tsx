"use client";

import { useState } from "react";
import {
  inviteToGroup,
  removeFromGroup,
  transferOwnership,
  leaveGroup,
  updateConversation,
  uploadGroupPhoto,
  createInvitation,
} from "@/lib/messages";
import { Conversation, UserSearchResult } from "@/lib/types";
import Avatar from "./Avatar";
import UserSearchInput from "./UserSearchInput";
import ConfirmDialog from "./ConfirmDialog";

interface GroupSettingsModalProps {
  conversation: Conversation;
  currentUid: string;
  currentDisplayName: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function GroupSettingsModal({
  conversation,
  currentUid,
  currentDisplayName,
  onClose,
  onUpdate,
}: GroupSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(conversation.name ?? "");
  const [editDescription, setEditDescription] = useState(conversation.description ?? "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);

  // Confirm dialogs
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [confirmTransfer, setConfirmTransfer] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const isOwner = conversation.ownerId === currentUid;

  async function handleInvite(user: UserSearchResult) {
    if (!isOwner) return;
    setLoading(true);
    try {
      if (conversation.groupType === "closed") {
        await createInvitation(
          conversation.id,
          conversation.name ?? "Grup",
          currentUid,
          currentDisplayName,
          user.uid
        );
        setMessage(`${user.displayName} için davet gönderildi`);
      } else {
        await inviteToGroup(conversation.id, user.uid);
        setMessage(`${user.displayName} davet edildi`);
      }
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
      setConfirmRemove(null);
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
      setConfirmTransfer(null);
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
      if (isOwner) {
        await updateConversation(conversation.id, { name: "[Silinmiş Grup]" });
        await leaveGroup(conversation.id, currentUid);
      } else {
        await leaveGroup(conversation.id, currentUid);
      }
      onClose();
      onUpdate();
    } catch {
      setMessage("Gruptan ayrılamadı");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit() {
    setLoading(true);
    try {
      const updates: { name?: string; description?: string } = {
        name: editName.trim() || conversation.name,
      };
      if (editDescription.trim()) {
        updates.description = editDescription.trim();
      }
      await updateConversation(conversation.id, updates);
      setEditing(false);
      setMessage("Grup bilgileri güncellendi");
      onUpdate();
    } catch {
      setMessage("Güncellenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoProgress(0);
    try {
      await uploadGroupPhoto(conversation.id, file, (pct) => setPhotoProgress(pct));
      setMessage("Fotoğraf güncellendi");
      onUpdate();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Yükleme hatası");
    } finally {
      setUploadingPhoto(false);
      setPhotoProgress(0);
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
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar
                avatarUrl={conversation.photoUrl}
                displayName={conversation.name ?? "Grup"}
                size="lg"
              />
              {isOwner && (
                <label className="absolute bottom-0 right-0 rounded-full bg-mint-500 p-1.5 cursor-pointer hover:bg-mint-400 transition">
                  <svg className="w-3.5 h-3.5 text-ink-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              )}
            </div>
            {uploadingPhoto && (
              <div className="w-full max-w-[200px]">
                <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-mint-500 transition-all"
                    style={{ width: `${photoProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Name & Description - View mode */}
          {!editing ? (
            <div className="text-center">
              <p className="text-sm font-medium text-paper-100">{conversation.name}</p>
              {conversation.description && (
                <p className="text-xs text-paper-500 mt-0.5">{conversation.description}</p>
              )}
              <p className="text-xs text-paper-500 mt-1">
                {conversation.groupType === "open" ? "Açık grup" : "Kapalı grup"}
                {" · "}
                {conversation.participants.length} üye
              </p>
              {isOwner && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-mint-400 hover:text-mint-300 transition mt-2"
                >
                  Düzenle
                </button>
              )}
            </div>
          ) : (
            /* Name & Description - Edit mode */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">Grup Adı</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm focus:border-mint-500 focus:outline-none text-paper-100"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">Açıklama</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm focus:border-mint-500 focus:outline-none resize-none text-paper-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-lg border border-ink-700 text-paper-300 font-medium py-2 text-sm hover:bg-ink-800 transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={loading || !editName.trim()}
                  className="flex-1 rounded-lg bg-mint-500 text-ink-950 font-semibold py-2 text-sm hover:bg-mint-400 transition disabled:opacity-40"
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}

          {/* Owner actions - invite */}
          {isOwner && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-2">
                {conversation.groupType === "closed" ? "Üye Davet Et (onay gerekli)" : "Üye Davet Et"}
              </label>
              <UserSearchInput onSelect={handleInvite} placeholder="Kullanıcı ara..." />
            </div>
          )}

          {/* Members */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-2">Üyeler ({conversation.participants.length})</p>
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
                        onClick={() => setConfirmTransfer(pid)}
                        disabled={loading}
                        className="text-[10px] font-mono text-paper-500 hover:text-amber-400 transition px-2 py-1"
                        title="Yetki devret"
                      >
                        Devret
                      </button>
                      <button
                        onClick={() => setConfirmRemove(pid)}
                        disabled={loading}
                        className="text-[10px] font-mono text-paper-500 hover:text-coral-400 transition px-2 py-1"
                        title="Çıkar"
                      >
                        Çıkar
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
            onClick={() => setConfirmLeave(true)}
            disabled={loading}
            className="w-full rounded-lg border border-coral-500/30 text-coral-400 font-medium py-2.5 text-sm hover:bg-coral-500/10 transition disabled:opacity-40"
          >
            {isOwner ? "Grubu Sil" : "Gruptan Ayrıl"}
          </button>
        </div>
      </div>

      {/* Confirm remove */}
      {confirmRemove && (
        <ConfirmDialog
          title="Üyeyi Çıkar"
          message="Bu üyeyi gruptan çıkarmak istediğine emin misin?"
          confirmLabel="Çıkar"
          cancelLabel="İptal"
          variant="danger"
          loading={loading}
          onConfirm={() => handleRemove(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {/* Confirm transfer */}
      {confirmTransfer && (
        <ConfirmDialog
          title="Yetki Devret"
          message="Grup sahipliğini bu üyeye devretmek istediğine emin misin?"
          confirmLabel="Devret"
          cancelLabel="İptal"
          variant="default"
          loading={loading}
          onConfirm={() => handleTransfer(confirmTransfer)}
          onCancel={() => setConfirmTransfer(null)}
        />
      )}

      {/* Confirm leave/delete */}
      {confirmLeave && (
        <ConfirmDialog
          title={isOwner ? "Grubu Sil" : "Gruptan Ayrıl"}
          message={
            isOwner
              ? "Grubu silmek istediğine emin misin? Bu işlem geri alınamaz."
              : "Gruptan ayrılmak istediğine emin misin?"
          }
          confirmLabel={isOwner ? "Sil" : "Ayrıl"}
          cancelLabel="İptal"
          variant="danger"
          loading={loading}
          onConfirm={handleLeave}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}
