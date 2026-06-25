import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-paper-100 mb-2">404</h1>
        <p className="text-paper-300 mb-2">Sayfa bulunamadı.</p>
        <p className="text-sm text-paper-500 mb-8">Aradığın sayfa kaldırılmış, taşınmış veya hiç var olmamış olabilir.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
