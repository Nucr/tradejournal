"use client";

import { useEffect, useRef } from "react";

export interface ToastItem {
  id: string;
  tradeId?: string;
  message: string;
}

interface UndoToastProps {
  toasts: ToastItem[];
  onUndo: (tradeId: string) => void;
  onDismiss: (id: string) => void;
}

const MAX_VISIBLE = 3;

export default function UndoToast({ toasts, onUndo, onDismiss }: UndoToastProps) {
  if (toasts.length === 0) return null;

  const visible = toasts.slice(0, MAX_VISIBLE);
  const remaining = toasts.length - MAX_VISIBLE;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm">
      {visible.map((t, i) => (
        <ToastItem
          key={t.id}
          toast={t}
          index={i}
          onUndo={onUndo}
          onDismiss={onDismiss}
        />
      ))}
      {remaining > 0 && (
        <p className="text-xs text-paper-500 text-center">
          +{remaining} tane daha
        </p>
      )}
    </div>
  );
}

function ToastItem({
  toast,
  index,
  onUndo,
  onDismiss,
}: {
  toast: ToastItem;
  index: number;
  onUndo: (tradeId: string) => void;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 px-5 py-3 shadow-xl animate-slide-in-right"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <span className="text-sm text-paper-100 flex-1">{toast.message}</span>
      {toast.tradeId && (
        <button
          onClick={() => onUndo(toast.tradeId)}
          className="rounded-lg bg-mint-500/15 px-3 py-1.5 text-sm font-medium text-mint-400 hover:bg-mint-500/25 transition shrink-0"
        >
          Geri Al
        </button>
      )}
    </div>
  );
}
