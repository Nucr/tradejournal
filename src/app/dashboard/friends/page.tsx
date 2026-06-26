"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  subscribeToFriendRequests,
  subscribeToSentRequests,
  removeFriend,
} from "@/lib/friends";
import { subscribeToProfile } from "@/lib/profile";
import { UserProfile, FriendRequest } from "@/lib/types";
import FriendRequestsModal from "@/components/FriendRequestsModal";

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProfile(user.uid, setProfile);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFriendRequests(user.uid, setRequests);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToSentRequests(user.uid, setSentRequests);
    return unsub;
  }, [user]);

  async function handleRemove(friendUid: string) {
    if (!user || removing) return;
    setRemoving(friendUid);
    try {
      await removeFriend(user.uid, friendUid);
    } finally {
      setRemoving(null);
    }
  }

  if (!user) return null;

  const friends: { uid: string; displayName: string; avatarColor: string }[] = [];
  if (profile?.friends) {
    // We store friend UIDs, we need display info from the profile
    // For now we'll show what we have and link to profiles
    friends.push(
      ...profile.friends.map((uid) => ({
        uid,
        displayName: uid,
        avatarColor: "#2ED9A4",
      }))
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Arkadaşlar</h1>
          <p className="text-sm text-paper-300 mt-1">
            Diğer traderlarla bağlantı kur ve sosyalleş.
          </p>
        </div>
        {requests.length > 0 && (
          <button
            onClick={() => setShowRequestsModal(true)}
            className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-4 py-2 text-sm hover:bg-mint-400 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            İstekler ({requests.length})
          </button>
        )}
      </div>

      {requests.length > 0 && !showRequestsModal && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-400">
              <span className="font-semibold">{requests.length}</span> bekleyen arkadaşlık isteğin var
            </p>
            <button
              onClick={() => setShowRequestsModal(true)}
              className="text-sm text-amber-400 hover:underline font-medium"
            >
              Görüntüle
            </button>
          </div>
        </div>
      )}

      {sentRequests.length > 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
          <h3 className="text-xs font-mono uppercase tracking-wide text-paper-500 font-semibold mb-3">
            Gönderilen İstekler ({sentRequests.length})
          </h3>
          <div className="space-y-2">
            {sentRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-ink-950 shrink-0"
                  style={{ backgroundColor: req.fromAvatarColor }}
                >
                  {req.fromDisplayName.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-paper-300">{req.toUid.slice(0, 8)}...</p>
                <span className="text-xs text-paper-500 ml-auto">Bekliyor</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend search */}
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-paper-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-paper-400 text-sm mb-4">
          Kullanıcılar sayfasından traderları bulup arkadaşlık isteği gönderebilirsin.
        </p>
        <button
          onClick={() => router.push("/dashboard/users")}
          className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-4 py-2 text-sm hover:bg-mint-400 transition"
        >
          Kullanıcıları Bul
        </button>
      </div>

      {/* Friends list */}
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
        <h3 className="font-display text-base font-semibold mb-4">
          Arkadaşların ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-sm text-paper-500 text-center py-6">
            Henüz arkadaşın yok. Kullanıcılar sayfasından traderlar bulup arkadaşlık isteği gönderebilirsin.
          </p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div
                key={f.uid}
                className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-950/50 p-3"
              >
                <button
                  onClick={() => router.push(`/dashboard/users/${f.uid}`)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-ink-950 shrink-0"
                    style={{ backgroundColor: f.avatarColor }}
                  >
                    {f.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-paper-100 truncate">{f.displayName}</p>
                    <p className="text-xs text-paper-500">Profili Görüntüle</p>
                  </div>
                </button>
                <button
                  onClick={() => handleRemove(f.uid)}
                  disabled={removing === f.uid}
                  className="text-xs text-coral-400 hover:text-coral-300 transition shrink-0 ml-3 disabled:opacity-40"
                >
                  {removing === f.uid ? "..." : "Arkadaşlıktan Çıkar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRequestsModal && (
        <FriendRequestsModal uid={user.uid} onClose={() => setShowRequestsModal(false)} />
      )}
    </div>
  );
}
