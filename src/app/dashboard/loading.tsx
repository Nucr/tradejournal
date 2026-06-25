import { StatCardSkeleton, BannerSkeleton, ChartSkeleton } from "@/components/dashboard/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-7 w-32 bg-ink-800 rounded animate-pulse" />
        <div className="h-4 w-64 bg-ink-800 rounded mt-2 animate-pulse" />
      </div>
      <BannerSkeleton />
      <div className="h-9 w-96 bg-ink-800 rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <ChartSkeleton />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="h-24 rounded-xl border border-ink-800 bg-ink-900 animate-pulse" />
        <div className="h-24 rounded-xl border border-ink-800 bg-ink-900 animate-pulse" />
      </div>
    </div>
  );
}
