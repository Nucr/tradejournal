"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProfile, saveProfile } from "@/lib/profile";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import { cleanupOldDeletedTrades } from "@/lib/trades";
import { uploadAvatar, deleteAvatar } from "@/lib/storage";
import Avatar from "@/components/Avatar";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [showStrategy, setShowStrategy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [cleanCount, setCleanCount] = useState<number | null>(null);
  const [pendingCleanCount, setPendingCleanCount] = useState<number | null>(null);

  // Avatar state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setIsPublic(p.isPublic);
        setShowStrategy(p.showStrategy);
      }
    });
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const q = query(
      collection(db, "users", user.uid, "trades"),
      where("deletedAt", "<", ninetyDaysAgo),
      orderBy("deletedAt", "asc")
    );
    getDocs(q).then((snap) => setPendingCleanCount(snap.size));
  }, [user]);

  useEffect(() => {
    if (!avatarToast) return;
    const t = setTimeout(() => setAvatarToast(null), 3000);
    return () => clearTimeout(t);
  }, [avatarToast]);

  async function handleSavePrivacy() {
    if (!user) return;
    setSaving(true);
    await saveProfile(user.uid, { isPublic, showStrategy });
    setProfile((prev) => (prev ? { ...prev, isPublic, showStrategy } : prev));
    setSaving(false);
  }

  async function handleAvatarUpload(file: File) {
    if (!user) return;
    setAvatarUploading(true);
    setAvatarProgress(0);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const url = await uploadAvatar(user.uid, file, setAvatarProgress);
      setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
      setAvatarToast("Avatar güncellendi");
      setAvatarPreview(null);
    } catch (err) {
      setAvatarToast(err instanceof Error ? err.message : "Yükleme başarısız");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    if (!user) return;
    await deleteAvatar(user.uid);
    setProfile((prev) => (prev ? { ...prev, avatarUrl: "" } : prev));
    setAvatarToast("Avatar kaldırıldı");
  }

  async function handleDeleteAccount() {
    if (!user || deleting) return;
    setDeleting(true);
    try {
      await deleteAvatar(user.uid);

      const periods = ["weekly", "monthly", "alltime"];
      const leaderboardDeletes = periods.map((p) =>
        deleteDoc(doc(db, "leaderboard", p, "entries", user.uid))
      );
      await Promise.all(leaderboardDeletes);

      const tradesSnap = await getDocs(collection(db, "users", user.uid, "trades"));
      const batch = writeBatch(db);
      tradesSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      await deleteDoc(doc(db, "users", user.uid));
      await logout();
      router.replace("/login");
    } catch {
      setDeleting(false);
    }
  }

  async function handleCleanup() {
    if (!user || cleaning) return;
    setCleaning(true);
    setCleanCount(null);
    try {
      const count = await cleanupOldDeletedTrades(user.uid);
      setCleanCount(count);
    } finally {
      setCleaning(false);
    }
  }

  const avatarUrl = profile?.avatarUrl || "";
  const avatarColor = profile?.avatarColor || "#2ED9A4";
  const displayName = profile?.displayName || user?.displayName || "Trader";

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Ayarlar</h1>
      <p className="text-sm text-paper-500 mb-8">Profil ve hesap ayarlarını yönet.</p>

      {/* Avatar */}
      <section className="rounded-xl border border-ink-800 bg-ink-900/50 p-6 mb-6 text-center">
        <h2 className="font-display text-base font-semibold mb-4 text-left">Profil Fotoğrafı</h2>
        <div className="flex flex-col items-center gap-4">
          {avatarPreview ? (
            <Avatar
              avatarUrl={avatarPreview}
              avatarColor={avatarColor}
              displayName={displayName}
              size="lg"
            />
          ) : (
            <Avatar
              avatarUrl={avatarUrl}
              avatarColor={avatarColor}
              displayName={displayName}
              size="lg"
            />
          )}

          {avatarUploading && (
            <div className="w-full max-w-xs">
              <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-mint-500 transition-all"
                  style={{ width: `${avatarProgress}%` }}
                />
              </div>
              <p className="text-xs text-paper-500 mt-1 font-mono">%{avatarProgress}</p>
            </div>
          )}

          <div className="flex gap-3">
            <label className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-4 py-2 text-sm hover:bg-mint-400 transition cursor-pointer">
              {avatarUploading ? "Yükleniyor..." : "Fotoğraf Değiştir"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={avatarUploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarUpload(f);
                  e.target.value = "";
                }}
              />
            </label>
            {(avatarPreview || avatarUrl) && (
              <button
                onClick={() => {
                  setAvatarPreview(null);
                  if (!avatarUrl) return;
                  handleAvatarRemove();
                }}
                className="rounded-lg border border-ink-700 text-paper-300 px-4 py-2 text-sm hover:bg-ink-800 transition"
              >
                Fotoğrafı Kaldır
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-xl border border-ink-800 bg-ink-900/50 p-6 mb-6">
        <h2 className="font-display text-base font-semibold mb-4">Gizlilik</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-paper-100">Profilim herkese açık olsun</p>
              <p className="text-xs text-paper-500 mt-0.5">Liderlik tablosunda ve toplulukta görünmeni sağlar.</p>
            </div>
            <div
              role="checkbox"
              aria-checked={isPublic}
              tabIndex={0}
              onClick={() => setIsPublic((v) => !v)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsPublic((v) => !v); }}
              className={`relative w-11 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${isPublic ? "bg-mint-500" : "bg-ink-700"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${isPublic ? "translate-x-5" : ""}`} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-paper-100">Kullandığım stratejileri diğerleri görebilsin</p>
              <p className="text-xs text-paper-500 mt-0.5">Profilin üzerinden hangi stratejileri kullandığını gösterir.</p>
            </div>
            <div
              role="checkbox"
              aria-checked={showStrategy}
              tabIndex={0}
              onClick={() => setShowStrategy((v) => !v)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowStrategy((v) => !v); }}
              className={`relative w-11 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${showStrategy ? "bg-mint-500" : "bg-ink-700"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${showStrategy ? "translate-x-5" : ""}`} />
            </div>
          </label>
        </div>
        <button
          onClick={handleSavePrivacy}
          disabled={saving}
          className="mt-4 rounded-lg bg-mint-500 text-ink-950 font-semibold px-5 py-2 text-sm hover:bg-mint-400 transition disabled:opacity-40"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </section>

      {/* Cleanup deleted trades */}
      <section className="rounded-xl border border-ink-800 bg-ink-900/50 p-6 mb-6">
        <h2 className="font-display text-base font-semibold mb-2">Depolama</h2>
        <p className="text-sm text-paper-500 mb-4">
          90 günden eski silinmiş işlemleri kalıcı olarak temizler. Bu işlem geri alınamaz.
        </p>
        <button
          onClick={handleCleanup}
          disabled={cleaning || !pendingCleanCount || pendingCleanCount === 0}
          className="rounded-lg border border-ink-700 px-5 py-2 text-sm text-paper-300 hover:bg-ink-800 transition disabled:opacity-40"
        >
          {cleaning ? "Temizleniyor..." : "Silinmiş İşlemleri Temizle"}
        </button>
        {pendingCleanCount !== null && pendingCleanCount > 0 && cleanCount === null && (
          <p className="text-xs text-paper-500 mt-2">
            90 günden eski {pendingCleanCount} adet silinmiş işlem bulundu.
          </p>
        )}
        {cleanCount !== null && (
          <p className="text-xs text-paper-500 mt-2">{cleanCount} işlem kalıcı olarak silindi.</p>
        )}
      </section>

      {/* Delete account */}
      <section className="rounded-xl border border-coral-500/20 bg-coral-500/5 p-6">
        <h2 className="font-display text-base font-semibold text-coral-400 mb-2">Hesabı Sil</h2>
        <p className="text-sm text-paper-500 mb-4">
          Tüm trade geçmişin, avatarın, puanın ve profil bilgilerin kalıcı olarak silinir.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="rounded-lg bg-coral-500 text-white font-semibold px-5 py-2 text-sm hover:bg-coral-400 transition"
        >
          Hesabı Sil
        </button>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeleteModal(false)} />
          <div className="relative rounded-xl border border-ink-800 bg-ink-900 p-6 max-w-sm w-full shadow-xl animate-scale-in">
            <h3 className="font-display text-lg font-semibold text-coral-400 mb-2">Hesabı silmek istediğine emin misin?</h3>
            <p className="text-sm text-paper-500 mb-6">
              Bu işlem geri alınamaz. Tüm trade&apos;lerin, avatarın, puanın ve profil bilgilerin silinecek.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-ink-700 text-paper-300 font-medium py-2.5 text-sm hover:bg-ink-800 transition"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 rounded-lg bg-coral-500 text-white font-semibold py-2.5 text-sm hover:bg-coral-400 transition disabled:opacity-40"
              >
                {deleting ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {avatarToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in-right">
          <div className="rounded-xl border border-ink-700 bg-ink-900 px-5 py-3 shadow-xl text-sm text-paper-100">
            {avatarToast}
          </div>
        </div>
      )}
    </div>
  );
}
