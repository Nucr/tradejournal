"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div
        className="relative rounded-xl border border-ink-800 bg-ink-900 p-6 max-w-sm w-full shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-semibold text-paper-100 mb-2">{title}</h3>
        <p className="text-sm text-paper-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-ink-700 text-paper-300 font-medium py-2.5 text-sm hover:bg-ink-800 transition disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-lg font-semibold py-2.5 text-sm transition disabled:opacity-40 ${
              variant === "danger"
                ? "bg-coral-500 text-white hover:bg-coral-400"
                : "bg-mint-500 text-ink-950 hover:bg-mint-400"
            }`}
          >
            {loading ? "İşleniyor..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
