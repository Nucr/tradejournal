"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addStrategy, deleteStrategy, getStrategies, setStrategyImages, updateStrategy } from "@/lib/strategies";
import { uploadStrategyImage, deleteStrategyImage } from "@/lib/storage";
import { subscribeToTrades } from "@/lib/trades";
import { getUser } from "@/lib/users";
import { Strategy, Trade } from "@/lib/types";

interface StrategyStats {
  name: string;
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  avgRR: number;
  totalResult: number;
}

const MAX_IMAGES = 5;

export default function StrategiesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const [detailStrategy, setDetailStrategy] = useState<Strategy | null>(null);
  const [detailNote, setDetailNote] = useState("");
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrades(user.uid, setTrades);
    return unsub;
  }, [user]);

  const loadStrategies = useCallback(async () => {
    if (!user) return;
    const list = await getStrategies(user.uid);
    setStrategies(list);

    const uids = new Set(list.map((s) => s.createdBy));
    const names: Record<string, string> = {};
    await Promise.all(
      Array.from(uids).map(async (uid) => {
        try {
          const profile = await getUser(uid);
          names[uid] = profile?.displayName ?? uid.slice(0, 6);
        } catch {
          names[uid] = uid.slice(0, 6);
        }
      })
    );
    setCreatorNames(names);
  }, [user]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const myStrategies = useMemo(
    () => strategies.filter((s) => s.createdBy === user?.uid),
    [strategies, user]
  );

  const communityStrategies = useMemo(
    () => strategies.filter((s) => s.createdBy !== user?.uid),
    [strategies, user]
  );

  const tradeStats = useMemo(() => {
    const map = new Map<string, Trade[]>();
    for (const t of trades) {
      const key = t.strategy.trim() || "Belirtilmemiş";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    const result: StrategyStats[] = [];
    for (const [name, group] of map) {
      const total = group.length;
      const wins = group.filter((t) => t.result > 0).length;
      const losses = group.filter((t) => t.result < 0).length;
      const winRate = total > 0 ? (wins / total) * 100 : 0;
      const avgRR = total > 0 ? group.reduce((s, t) => s + t.rr, 0) / total : 0;
      const totalResult = group.reduce((s, t) => s + t.result, 0);
      result.push({ name, total, wins, losses, winRate, avgRR, totalResult });
    }
    return result.sort((a, b) => b.totalResult - a.totalResult);
  }, [trades]);

  function resetCreateForm() {
    setNewName("");
    setNewIsPublic(false);
    setNewNote("");
    setNewImageFiles([]);
    newImagePreviews.forEach((u) => URL.revokeObjectURL(u));
    setNewImagePreviews([]);
    setShowModal(false);
  }

  async function handleCreate() {
    if (!user || !newName.trim()) return;
    setSaving(true);
    try {
      const id = await addStrategy(newName.trim(), user.uid, newIsPublic, newNote.trim() || undefined);
      if (newImageFiles.length > 0) {
        const urls: string[] = [];
        for (const file of newImageFiles) {
          const url = await uploadStrategyImage(file);
          urls.push(url);
        }
        await setStrategyImages(id, urls);
      }
      resetCreateForm();
      await loadStrategies();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      alert("Strateji oluşturulamadı: " + message);
    } finally {
      setSaving(false);
    }
  }

  function handleCreateSelectImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (newImageFiles.length >= MAX_IMAGES) {
      alert(`En fazla ${MAX_IMAGES} görsel yüklenebilir.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(`"${file.name}" dosyası çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimum 10MB.`);
      if (createFileInputRef.current) createFileInputRef.current.value = "";
      return;
    }
    const preview = URL.createObjectURL(file);
    setNewImageFiles((prev) => [...prev, file]);
    setNewImagePreviews((prev) => [...prev, preview]);
    if (createFileInputRef.current) createFileInputRef.current.value = "";
  }

  function handleCreateRemoveImage(index: number) {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDelete(id: string) {
    if (!user) return;
    if (!confirm("Bu stratejiyi silmek istediğine emin misin?")) return;
    try {
      await deleteStrategy(id, user.uid);
      await loadStrategies();
    } catch {
      alert("Strateji silinemedi.");
    }
  }

  function openDetail(s: Strategy) {
    setDetailStrategy(s);
    setDetailNote(s.note);
    setDetailImages([...s.images]);
  }

  function closeDetail() {
    setDetailStrategy(null);
    setDetailNote("");
    setDetailImages([]);
    setUploading(false);
    setSavingDetail(false);
  }

  function handleDetailSelectImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (detailImages.length >= MAX_IMAGES) {
      alert(`En fazla ${MAX_IMAGES} görsel yüklenebilir.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(`"${file.name}" dosyası çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimum 10MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    uploadStrategyImage(file)
      .then(async (url) => {
        const updated = [...detailImages, url];
        await updateStrategy(detailStrategy!.id, user!.uid, { images: updated });
        setDetailImages(updated);
        await loadStrategies();
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Bilinmeyen hata";
        alert("Görsel yüklenemedi: " + message);
      })
      .finally(() => {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  }

  async function handleDeleteImage(imageUrl: string) {
    if (!user || !detailStrategy) return;
    if (!confirm("Bu görseli silmek istediğine emin misin?")) return;
    try {
      await deleteStrategyImage();
      const updated = detailImages.filter((u) => u !== imageUrl);
      await updateStrategy(detailStrategy.id, user.uid, { images: updated });
      setDetailImages(updated);
      await loadStrategies();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  async function handleSaveNote() {
    if (!user || !detailStrategy) return;
    setSavingDetail(true);
    try {
      await updateStrategy(detailStrategy.id, user.uid, { note: detailNote });
      await loadStrategies();
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setSavingDetail(false);
    }
  }

  const isOwner = (s: Strategy) => s.createdBy === user?.uid;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Stratejiler</h1>
          <p className="text-sm text-paper-300 mt-1">
            Strateji yönetimi ve performans analizi.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Strateji Ekle
        </button>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-4 py-8">
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-ink-700 bg-ink-900 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold">Yeni Strateji Oluştur</h2>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1.5">
                Strateji Adı
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn. Order Block + FVG"
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
                autoFocus
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-paper-300">
              <input
                type="checkbox"
                checked={newIsPublic}
                onChange={(e) => setNewIsPublic(e.target.checked)}
                className="rounded border-ink-700 bg-ink-950 text-mint-500 focus:ring-mint-500"
              />
              Herkese açık (toplulukla paylaş)
            </label>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1.5">
                Not
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                placeholder="Strateji hakkında notların…"
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500 resize-y"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono uppercase tracking-wide text-paper-500">
                  Görseller ({newImageFiles.length}/{MAX_IMAGES})
                </label>
                {newImageFiles.length < MAX_IMAGES && (
                  <div>
                    <input
                      ref={createFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCreateSelectImage}
                    />
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      className="rounded-lg bg-mint-500 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-mint-400 transition flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Görsel Ekle
                    </button>
                  </div>
                )}
              </div>
              {newImagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {newImagePreviews.map((preview, i) => (
                    <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-ink-700 bg-ink-950">
                      <img
                        src={preview}
                        alt={`Önizleme ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleCreateRemoveImage(i)}
                        className="absolute top-1 right-1 p-1 rounded bg-ink-950/80 text-coral-400 opacity-0 group-hover:opacity-100 hover:bg-coral-500 hover:text-white transition"
                        title="Kaldır"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-paper-500">Henüz görsel seçilmedi.</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
              >
                {saving ? "kaydediliyor…" : "Oluştur"}
              </button>
              <button
                onClick={resetCreateForm}
                className="rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-paper-300 hover:bg-ink-800 transition"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My strategies */}
      {myStrategies.length > 0 && (
        <section className="animate-fade-in-up stagger-1">
          <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
            Stratejilerim
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myStrategies.map((s) => (
              <button
                key={s.id}
                onClick={() => openDetail(s)}
                className="w-full text-left rounded-xl border border-ink-800 bg-ink-900 p-4 hover:border-ink-700 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">{s.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-paper-500">Siz</span>
                      {s.isPublic && (
                        <span className="text-[10px] font-mono bg-mint-500/10 text-mint-400 px-1.5 py-0.5 rounded">
                          Herkese Açık
                        </span>
                      )}
                    </div>
                    {(s.images.length > 0 || s.note) && (
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-paper-500">
                        {s.images.length > 0 && (
                          <span>{s.images.length}/{MAX_IMAGES} görsel</span>
                        )}
                        {s.note && <span>not var</span>}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded text-paper-500 hover:text-coral-400 hover:bg-ink-800 shrink-0"
                    title="Sil"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Community strategies */}
      {communityStrategies.length > 0 && (
        <section className="animate-fade-in-up stagger-2">
          <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
            Topluluk Stratejileri
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {communityStrategies.map((s) => (
              <button
                key={s.id}
                onClick={() => openDetail(s)}
                className="w-full text-left rounded-xl border border-ink-800 bg-ink-900 p-4 hover:border-ink-700 transition"
              >
                <p className="font-display font-semibold truncate">{s.name}</p>
                <p className="text-xs font-mono text-paper-500 mt-1">
                  {creatorNames[s.createdBy] ?? s.createdBy.slice(0, 6)}
                </p>
                {(s.images.length > 0 || s.note) && (
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-paper-500">
                    {s.images.length > 0 && (
                      <span>{s.images.length}/{MAX_IMAGES} görsel</span>
                    )}
                    {s.note && <span>not var</span>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Trade-based strategy performance */}
      {trades.length > 0 && (
        <section className="animate-fade-in-up stagger-3">
          <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
            Performans Analizi
          </h2>

          <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 mb-4">
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500">
              Toplam Strateji
            </p>
            <p className="font-display text-2xl font-semibold mt-1">
              {tradeStats.length}
            </p>
          </div>

          <div className="space-y-3">
            {tradeStats.map((s, i) => (
              <StrategyCard key={s.name} stats={s} index={i} />
            ))}
          </div>
        </section>
      )}

      {trades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-ink-800 bg-ink-900">
          <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-paper-500">Henüz işlem bulunmuyor.</p>
          <p className="text-xs text-paper-500 mt-1">
            İşlem ekledikçe strateji analizin burada görünecek.
          </p>
        </div>
      )}

      {/* Detail modal */}
      {detailStrategy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-4 py-8"
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-ink-700 bg-ink-900 p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">{detailStrategy.name}</h2>
                {!isOwner(detailStrategy) && (
                  <p className="text-xs font-mono text-paper-500 mt-1">
                    {creatorNames[detailStrategy.createdBy] ?? "Bilinmeyen"}
                  </p>
                )}
              </div>
              <button
                onClick={closeDetail}
                className="p-1 rounded text-paper-500 hover:text-paper-200 hover:bg-ink-800 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-mono uppercase tracking-wide text-paper-500">
                  Görseller ({detailImages.length}/{MAX_IMAGES})
                </h3>
                {isOwner(detailStrategy) && detailImages.length < MAX_IMAGES && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDetailSelectImage}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="rounded-lg bg-mint-500 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {uploading ? (
                        "Yükleniyor…"
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Görsel Ekle
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              {detailImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailImages.map((url, i) => (
                    <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-ink-700 bg-ink-950">
                      <img
                        src={url}
                        alt={`Görsel ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isOwner(detailStrategy) && (
                        <button
                          onClick={() => handleDeleteImage(url)}
                          className="absolute top-1 right-1 p-1 rounded bg-ink-950/80 text-coral-400 opacity-0 group-hover:opacity-100 hover:bg-coral-500 hover:text-white transition"
                          title="Sil"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-ink-700 p-8 text-center">
                  <p className="text-sm text-paper-500">Henüz görsel eklenmemiş.</p>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
                Not
              </h3>
              {isOwner(detailStrategy) ? (
                <div className="space-y-3">
                  <textarea
                    value={detailNote}
                    onChange={(e) => setDetailNote(e.target.value)}
                    rows={4}
                    placeholder="Strateji hakkında notların…"
                    className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500 resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNote}
                      disabled={savingDetail}
                      className="rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
                    >
                      {savingDetail ? "Kaydediliyor…" : "Notu Kaydet"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-ink-800 bg-ink-950 p-4">
                  {detailNote ? (
                    <p className="text-sm text-paper-200 whitespace-pre-wrap">{detailNote}</p>
                  ) : (
                    <p className="text-sm text-paper-500">Not eklenmemiş.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StrategyCard({ stats, index }: { stats: StrategyStats; index: number }) {
  const winFraction = stats.total > 0 ? stats.wins / stats.total : 0;
  const lossFraction = stats.total > 0 ? stats.losses / stats.total : 0;

  return (
    <div
      className={`rounded-xl border border-ink-800 bg-ink-900 p-5 hover:border-ink-700 transition`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold truncate">{stats.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <div>
              <span className="text-xs font-mono text-paper-500">İşlem</span>
              <p className="font-mono text-sm font-medium">{stats.total}</p>
            </div>
            <div>
              <span className="text-xs font-mono text-paper-500">Kazanma Oranı</span>
              <p
                className={`font-mono text-sm font-medium ${
                  stats.winRate >= 50 ? "text-mint-400" : "text-coral-400"
                }`}
              >
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-xs font-mono text-paper-500">Ort. RR</span>
              <p className="font-mono text-sm font-medium text-amber-400">
                {stats.avgRR.toFixed(2)}R
              </p>
            </div>
            <div>
              <span className="text-xs font-mono text-paper-500">Net Kâr/Zarar</span>
              <p
                className={`font-mono text-sm font-medium ${
                  stats.totalResult >= 0 ? "text-mint-400" : "text-coral-400"
                }`}
              >
                {stats.totalResult >= 0 ? "+" : ""}
                {stats.totalResult.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-40 shrink-0">
          <div className="flex h-6 rounded-full overflow-hidden bg-ink-800">
            <div
              className="bg-mint-500 transition-all"
              style={{ width: `${winFraction * 100}%` }}
            />
            <div
              className="bg-coral-500 transition-all"
              style={{ width: `${lossFraction * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-mono text-mint-400">{stats.wins}K</span>
            <span className="text-[10px] font-mono text-coral-400">{stats.losses}Z</span>
          </div>
        </div>
      </div>
    </div>
  );
}
