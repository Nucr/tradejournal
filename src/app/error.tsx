"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-coral-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-paper-100 mb-2">Bir şeyler ters gitti</h1>
        <p className="text-sm text-paper-500 mb-8">
          Beklenmedik bir hata oluştu. Lütfen tekrar dene.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition"
        >
          Tekrar Dene
        </button>
      </div>
    </main>
  );
}
