"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { addTrade, deleteTrade, subscribeToTrades, updateTrade, restoreTrade } from "@/lib/trades";
import { DirectionFilter, RangeKey, ResultFilter, Trade, TradeInput } from "@/lib/types";
import { filterTrades } from "@/lib/date-utils";
import TradeFilters from "@/components/TradeFilters";
import TradeForm from "@/components/TradeForm";
import TradeCard from "@/components/TradeCard";
import UndoToast from "@/components/UndoToast";
import type { ToastItem } from "@/components/UndoToast";

export default function JournalPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [timeFilter, setTimeFilter] = useState<RangeKey>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [formError, setFormError] = useState("");

  // Stacked undo toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let toastIdCounter = 0;

  function showToast(message: string) {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [...prev, { id, tradeId: "", message } as ToastItem]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  function showDeleteToast(tradeId: string) {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [...prev, { id, tradeId, message: "İşlem silindi" }]);
  }

  function handleUndo(tradeId: string) {
    if (!user || !tradeId) return;
    restoreTrade(user.uid, tradeId);
    setToasts((prev) => prev.filter((t) => t.tradeId !== tradeId));
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrades(user.uid, setTrades);
    return () => {
      unsub();
    };
  }, [user]);

  console.log("JournalPage render: trades.length", trades.length, "resultFilter", resultFilter, "directionFilter", directionFilter, "timeFilter", timeFilter);

  const filtered = useMemo(
    () => {
      const result = filterTrades(trades, { result: resultFilter, direction: directionFilter, range: timeFilter, customStart, customEnd });
      console.log("JournalPage filtered:", result.length);
      return result;
    },
    [trades, resultFilter, directionFilter, timeFilter, customStart, customEnd]
  );

  async function handleSubmit(input: TradeInput) {
    if (!user) return;
    setFormError("");
    try {
      if (editingTrade) {
        await updateTrade(user.uid, editingTrade.id, input);
        showToast("İşlem güncellendi ✓");
      } else {
        await addTrade(user.uid, input);
        showToast("İşlem eklendi ✓");
      }
      setShowForm(false);
      setEditingTrade(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "İşlem kaydedilemedi";
      setFormError(msg);
      console.error("Trade save error:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteTrade(user.uid, id);
    showDeleteToast(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl font-semibold">Trade Defteri</h1>
          <p className="text-sm text-paper-300 mt-1">
            Tüm işlemlerin görsel, RR ve strateji detaylarıyla burada.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTrade(null);
            setShowForm(true);
            setFormError("");
          }}
          className="rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni İşlem
        </button>
        <Link
          href="/dashboard/journal/import"
          className="rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-paper-300 hover:bg-ink-800 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          CSV İçe Aktar
        </Link>
      </div>

      <div className="animate-fade-in-up stagger-1">
        <TradeFilters
          resultFilter={resultFilter}
          onResultChange={setResultFilter}
          directionFilter={directionFilter}
          onDirectionChange={setDirectionFilter}
          timeFilter={timeFilter}
          onTimeChange={setTimeFilter}
          customStart={customStart}
          customEnd={customEnd}
          onCustomChange={(s, e) => {
            setCustomStart(s);
            setCustomEnd(e);
          }}
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-ink-800 bg-ink-900 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">
                {editingTrade ? "İşlemi Düzenle" : "Yeni İşlem Ekle"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingTrade(null); setFormError(""); }}
                className="text-paper-500 hover:text-paper-100 transition p-1 rounded-lg hover:bg-ink-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {formError && (
              <p className="text-sm text-coral-400 font-mono mb-4 bg-coral-500/10 border border-coral-500/30 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <TradeForm
              initial={editingTrade ?? undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTrade(null);
                setFormError("");
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-ink-800 bg-ink-900 p-12 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-paper-500">Bu aralıkta henüz işlem yok.</p>
            <p className="text-xs text-paper-500 mt-1">Yeni bir işlem ekleyerek başla.</p>
          </div>
        )}
        {filtered.map((trade, i) => (
          <TradeCard
            key={trade.id}
            trade={trade}
            uid={user!.uid}
            index={i}
            onEdit={() => {
              setEditingTrade(trade);
              setShowForm(true);
            }}
            onDelete={() => handleDelete(trade.id)}
          />
        ))}
      </div>

      {/* Toast */}
      <UndoToast toasts={toasts} onUndo={handleUndo} onDismiss={dismissToast} />
    </div>
  );
}
