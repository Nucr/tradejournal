"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/lib/messages";
import { GroupType, UserSearchResult } from "@/lib/types";
import UserSearchInput from "./UserSearchInput";

interface CreateGroupModalProps {
  uid: string;
  onClose: () => void;
}

export default function CreateGroupModal({ uid, onClose }: CreateGroupModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("open");
  const [members, setMembers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  function handleAddMember(user: UserSearchResult) {
    if (!members.find((m) => m.uid === user.uid)) {
      setMembers((prev) => [...prev, user]);
    }
  }

  function handleRemoveMember(uid: string) {
    setMembers((prev) => prev.filter((m) => m.uid !== uid));
  }

  async function handleCreate() {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      const memberUids = members.map((m) => m.uid);
      const convId = await createGroup(
        name.trim(),
        description.trim(),
        groupType,
        uid,
        memberUids
      );
      onClose();
      router.push(`/dashboard/messages/${convId}`);
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
          <h3 className="font-display text-lg font-semibold">Grup Oluştur</h3>
          <button onClick={onClose} className="text-paper-500 hover:text-paper-200 transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">Grup Adı</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Trading Stratejileri"
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm focus:border-mint-500 focus:outline-none text-paper-100 placeholder-paper-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">Açıklama (opsiyonel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Grup hakkında kısa bir açıklama..."
              rows={2}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm focus:border-mint-500 focus:outline-none resize-none text-paper-100 placeholder-paper-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-2">Grup Tipi</label>
            <div className="flex gap-3">
              <button
                onClick={() => setGroupType("open")}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${
                  groupType === "open"
                    ? "bg-mint-500/10 border-mint-500/30 text-mint-400"
                    : "border-ink-700 text-paper-400 hover:bg-ink-800"
                }`}
              >
                🔓 Açık
              </button>
              <button
                onClick={() => setGroupType("closed")}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${
                  groupType === "closed"
                    ? "bg-mint-500/10 border-mint-500/30 text-mint-400"
                    : "border-ink-700 text-paper-400 hover:bg-ink-800"
                }`}
              >
                🔒 Kapalı
              </button>
            </div>
            <p className="text-xs text-paper-500 mt-1.5">
              {groupType === "open"
                ? "Herkes katılabilir."
                : "Sadece davet edilenler katılabilir."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">Üye Ekle</label>
            <UserSearchInput onSelect={handleAddMember} placeholder="Kullanıcı ara..." excludeUid={uid} />
          </div>

          {members.length > 0 && (
            <div>
              <p className="text-xs font-mono text-paper-500 mb-2">Seçilen üyeler ({members.length})</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <span
                    key={m.uid}
                    className="inline-flex items-center gap-1.5 rounded-full bg-mint-500/10 border border-mint-500/20 px-2.5 py-1 text-xs text-mint-400"
                  >
                    {m.displayName}
                    <button onClick={() => handleRemoveMember(m.uid)} className="hover:text-coral-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-ink-700 text-paper-300 font-medium py-2.5 text-sm hover:bg-ink-800 transition"
            >
              İptal
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="flex-1 rounded-lg bg-mint-500 text-ink-950 font-semibold py-2.5 text-sm hover:bg-mint-400 transition disabled:opacity-40"
            >
              {loading ? "Oluşturuluyor..." : "Grubu Oluştur"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
