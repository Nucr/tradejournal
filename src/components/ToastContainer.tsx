"use client";

import { useToast } from "@/lib/toast-context";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const visible = toasts.slice(0, 3);
  const remaining = toasts.length - 3;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm">
      {visible.map((t) => {
        const borderColor =
          t.type === "success"
            ? "border-mint-500/30"
            : t.type === "error"
            ? "border-coral-500/30"
            : "border-ink-700";
        const iconColor =
          t.type === "success"
            ? "text-mint-400"
            : t.type === "error"
            ? "text-coral-400"
            : "text-paper-100";

        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border ${borderColor} bg-ink-900 px-5 py-3 shadow-xl animate-slide-in-right`}
          >
            {t.type === "success" && (
              <svg className={`w-4 h-4 shrink-0 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.type === "error" && (
              <svg className={`w-4 h-4 shrink-0 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm text-paper-100 flex-1">{t.message}</span>
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); removeToast(t.id); }}
                className="rounded-lg bg-mint-500/15 px-3 py-1.5 text-sm font-medium text-mint-400 hover:bg-mint-500/25 transition shrink-0"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(t.id)}
              className="text-paper-500 hover:text-paper-300 transition shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
      {remaining > 0 && (
        <p className="text-xs text-paper-500 text-center">
          +{remaining} tane daha
        </p>
      )}
    </div>
  );
}
