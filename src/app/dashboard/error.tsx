"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-coral-500/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-semibold text-paper-100 mb-1">Bir hata oluştu</h2>
      <p className="text-sm text-paper-500 mb-6">Bu sayfa yüklenirken bir sorun oluştu.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
