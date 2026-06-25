"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToGoals, addGoal, deleteGoal, updateGoal } from "@/lib/goals";
import { Goal, GoalInput } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { usePlan } from "@/lib/features";
import Link from "next/link";

const METRIC_LABELS: Record<Goal["metric"], string> = {
  totalTrades: "İşlem Sayısı",
  winRate: "Win Rate",
  totalResult: "Toplam %",
  totalRR: "Toplam RR",
  consecutiveWins: "Seri Galibiyet",
};

const PERIOD_LABELS: Record<Goal["period"], string> = {
  weekly: "Haftalık",
  monthly: "Aylık",
  yearly: "Yıllık",
};

export default function GoalsWidget() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [metric, setMetric] = useState<Goal["metric"]>("totalTrades");
  const [period, setPeriod] = useState<Goal["period"]>("monthly");
  const { exceedsLimit, plan } = usePlan();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToGoals(user.uid, setGoals);
    return unsub;
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim() || !targetValue) return;
    const input: GoalInput = {
      title: title.trim(),
      targetValue: Number(targetValue),
      metric,
      period,
    };
    await addGoal(user.uid, input);
    addToast({ message: "Hedef eklendi ✓", type: "success" });
    setTitle("");
    setTargetValue("");
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteGoal(user.uid, id);
    addToast({ message: "Hedef silindi", type: "info" });
  }

  async function handleProgressUpdate(goal: Goal, newValue: number) {
    if (!user) return;
    await updateGoal(user.uid, goal.id, { currentValue: newValue });
  }

  const progressColor = (current: number, target: number) => {
    const pct = target > 0 ? (current / target) * 100 : 0;
    if (pct >= 100) return "bg-accent";
    if (pct >= 50) return "bg-amber-400";
    return "bg-accent/60";
  };

  return (
    <div className="space-y-3">
      {goals.length === 0 && !showForm && (
        <p className="text-sm text-paper-500 text-center py-6">
          Henüz hedef belirlenmemiş.
        </p>
      )}

      {goals.map((g) => {
        const pct = g.targetValue > 0 ? Math.min((g.currentValue / g.targetValue) * 100, 100) : 0;
        return (
          <div key={g.id} className="rounded-lg bg-ink-950/50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-paper-100 truncate">{g.title}</p>
                <p className="text-[10px] font-mono text-paper-500">
                  {METRIC_LABELS[g.metric]} · {PERIOD_LABELS[g.period]}
                </p>
              </div>
              <button
                onClick={() => handleDelete(g.id)}
                className="text-paper-500 hover:text-coral-400 transition shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 rounded-full bg-ink-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressColor(g.currentValue, g.targetValue)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-mono text-paper-400 shrink-0">
                {g.currentValue}/{g.targetValue}
              </span>
            </div>
          </div>
        );
      })}

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-ink-800">
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hedef adı"
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as Goal["metric"])}
              className="rounded-lg border border-ink-700 bg-ink-950 px-2 py-2 text-sm"
            >
              {Object.entries(METRIC_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Goal["period"])}
              className="rounded-lg border border-ink-700 bg-ink-950 px-2 py-2 text-sm"
            >
              {Object.entries(PERIOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Hedef değer"
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm focus:border-accent"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 hover:brightness-110 transition"
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-paper-300 hover:bg-ink-800 transition"
            >
              İptal
            </button>
          </div>
        </form>
      ) : exceedsLimit("goals", goals.length) ? (
        <div className="text-center py-3">
          <p className="text-xs text-paper-500 mb-2">
            {plan === "free" ? "Ücretsiz planda en fazla 3 hedef ekleyebilirsin." : "Hedef limitine ulaştın."}
          </p>
          <Link href="/pricing" className="text-xs font-medium text-mint-400 hover:underline">
            Yükselt
          </Link>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border border-dashed border-ink-700 py-2 text-sm text-paper-500 hover:text-paper-300 hover:border-ink-600 transition"
        >
          + Yeni Hedef
        </button>
      )}
    </div>
  );
}
