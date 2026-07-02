"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToAccounts, addAccount, updateAccount, deleteAccount } from "@/lib/accounts";
import { subscribeToTrades } from "@/lib/trades";
import type { Account, AccountInput, Trade } from "@/lib/types";

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubAcc = subscribeToAccounts(user.uid, setAccounts);
    const unsubTrades = subscribeToTrades(user.uid, setTrades);
    return () => { unsubAcc(); unsubTrades(); };
  }, [user]);

  function openCreate() {
    setEditingId(null);
    setName("");
    setBalance("");
    setShowForm(true);
  }

  function openEdit(acc: Account) {
    setEditingId(acc.id);
    setName(acc.name);
    setBalance(String(acc.balance));
    setShowForm(true);
  }

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const input: AccountInput = { name: name.trim(), balance: Number(balance) || 0 };
      if (editingId) {
        await updateAccount(user.uid, editingId, input);
      } else {
        await addAccount(user.uid, input);
      }
      setShowForm(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    if (!confirm("Bu hesabı silmek istediğine emin misin?")) return;
    await deleteAccount(user.uid, id);
  }

  function tradeCount(accountId: string) {
    return trades.filter((t) => t.accountId === accountId).length;
  }

  function totalPnl(accountId: string) {
    return trades
      .filter((t) => t.accountId === accountId)
      .reduce((s, t) => s + t.netPnl, 0);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl font-semibold">Hesaplar</h1>
          <p className="text-sm text-paper-300 mt-1">
            Hesap bakiyelerini ve performansını takip et.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Hesap Ekle
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-5 animate-fade-in-up">
          <h3 className="font-display text-base font-semibold mb-4">
            {editingId ? "Hesabı Düzenle" : "Yeni Hesap"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1.5">
                Hesap Adı
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="örn. Binance, Bybit, Banka..."
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1.5">
                Güncel Bakiye ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-paper-300 hover:bg-ink-800 transition"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {accounts.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-ink-800 bg-ink-900 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <p className="text-sm text-paper-500">Henüz hesap eklenmemiş.</p>
          <p className="text-xs text-paper-500 mt-1">Farklı hesaplarını ekleyip bakiyelerini takip et.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
          {accounts.map((acc) => {
            const tCount = tradeCount(acc.id);
            const pnl = totalPnl(acc.id);
            const effectiveBalance = acc.balance + pnl;
            return (
              <div
                key={acc.id}
                className="rounded-xl border border-ink-800 bg-ink-900 p-5 hover:border-ink-700 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-semibold text-paper-100">{acc.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(acc)}
                      className="rounded-lg p-1.5 text-paper-500 hover:text-paper-300 hover:bg-ink-800 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="rounded-lg p-1.5 text-paper-500 hover:text-coral-400 hover:bg-ink-800 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="font-mono text-2xl font-bold text-paper-100">
                  ${effectiveBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-paper-500 font-mono mt-0.5">Güncel Bakiye</p>
                <p className="text-[10px] text-paper-500 font-mono">
                  Başlangıç: ${Number(acc.balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-ink-800">
                  <div>
                    <p className="font-mono text-sm font-semibold text-paper-100">{tCount}</p>
                    <p className="text-[10px] text-paper-500 font-mono">İşlem</p>
                  </div>
                  <div>
                    <p className={`font-mono text-sm font-semibold ${pnl >= 0 ? "text-mint-400" : "text-coral-400"}`}>
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-paper-500 font-mono">Toplam PnL</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
