export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 animate-pulse">
      <div className="h-3 w-16 bg-ink-700 rounded mb-3" />
      <div className="h-6 w-24 bg-ink-700 rounded" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64 animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-48 h-32 bg-ink-700 rounded-lg" />
        <div className="h-3 w-32 bg-ink-700 rounded" />
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-16 h-12 bg-ink-700 rounded" />
        <div className="w-20 h-12 bg-ink-700 rounded" />
        <div className="w-20 h-12 bg-ink-700 rounded" />
        <div className="w-28 h-12 bg-ink-700 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl border border-ink-800 bg-ink-900 p-4">
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-ink-700 rounded" />
            <div className="h-4 w-16 bg-ink-700 rounded" />
            <div className="h-4 w-20 bg-ink-700 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-5 animate-pulse">
      <div className="h-4 w-32 bg-ink-700 rounded mb-3" />
      <div className="h-8 w-48 bg-ink-700 rounded mb-2" />
      <div className="h-3 w-40 bg-ink-700 rounded" />
    </div>
  );
}
