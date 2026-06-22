"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addStrategy, deleteStrategy, getStrategies } from "@/lib/strategies";
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

export default function StrategiesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});

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

  async function handleCreate() {
    if (!user || !newName.trim()) return;
    setSaving(true);
    try {
      await addStrategy(newName.trim(), user.uid, newIsPublic);
      setNewName("");
      setNewIsPublic(false);
      setShowModal(false);
      await loadStrategies();
    } finally {
      setSaving(false);
    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 px-4">
          <div
            className="w-full max-w-md rounded-xl border border-ink-700 bg-ink-900 p-6 space-y-4"
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
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
              >
                {saving ? "kaydediliyor…" : "Oluştur"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewName("");
                  setNewIsPublic(false);
                }}
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
              <div
                key={s.id}
                className="rounded-xl border border-ink-800 bg-ink-900 p-4 hover:border-ink-700 transition group"
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
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded text-paper-500 hover:text-coral-400 hover:bg-ink-800"
                    title="Sil"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
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
              <div
                key={s.id}
                className="rounded-xl border border-ink-800 bg-ink-900 p-4"
              >
                <p className="font-display font-semibold truncate">{s.name}</p>
                <p className="text-xs font-mono text-paper-500 mt-1">
                  {creatorNames[s.createdBy] ?? s.createdBy.slice(0, 6)}
                </p>
              </div>
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
