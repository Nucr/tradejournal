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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import { cleanupDeletedTrades } from "@/lib/trades";

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

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setIsPublic(p.isPublic);
        setShowStrategy(p.showStrategy);
      }
    });
  }, [user]);

  async function handleSavePrivacy() {
    if (!user) return;
    setSaving(true);
    await saveProfile(user.uid, { isPublic, showStrategy });
    setProfile((prev) => (prev ? { ...prev, isPublic, showStrategy } : prev));
    setSaving(false);
  }

  async function handleDeleteAccount() {
    if (!user || deleting) return;
    setDeleting(true);
    try {
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
      const count = await cleanupDeletedTrades(user.uid);
      setCleanCount(count);
    } finally {
      setCleaning(false);
    }
  }

  const avatarLetter = (profile?.displayName || user?.displayName || user?.email || "?")[0].toUpperCase();
  const avatarColor = profile?.avatarColor || "#2ED9A4";

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold mb-1">Ayarlar</h1>
      <p className="text-sm text-paper-500 mb-8">Profil ve hesap ayarlarını yönet.</p>

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
              className={`relative w-11 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${
                isPublic ? "bg-mint-500" : "bg-ink-700"
              }`}
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
              className={`relative w-11 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${
                showStrategy ? "bg-mint-500" : "bg-ink-700"
              }`}
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
          disabled={cleaning}
          className="rounded-lg border border-ink-700 px-5 py-2 text-sm text-paper-300 hover:bg-ink-800 transition disabled:opacity-40"
        >
          {cleaning ? "Temizleniyor..." : "Eski İşlemleri Temizle"}
        </button>
        {cleanCount !== null && (
          <p className="text-xs text-paper-500 mt-2">{cleanCount} işlem kalıcı olarak silindi.</p>
        )}
      </section>

      {/* Delete account */}
      <section className="rounded-xl border border-coral-500/20 bg-coral-500/5 p-6">
        <h2 className="font-display text-base font-semibold text-coral-400 mb-2">Hesabı Sil</h2>
        <p className="text-sm text-paper-500 mb-4">
          Tüm trade geçmişin, stratejilerin ve profil bilgilerin kalıcı olarak silinir. Bu işlem geri alınamaz.
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
              Tüm trade geçmişin, puanın ve profil bilgilerin kalıcı olarak silinecek. Bu işlem geri alınamaz.
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
    </div>
  );
}
