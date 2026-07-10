import type { Trade } from "./types";

export function mapTrade(d: { id: string; data: () => Record<string, unknown> }): Trade {
  const data = d.data();
  return {
    id: d.id,
    pair: data.pair as string,
    direction: data.direction as Trade["direction"],
    entryDate: data.entryDate as string,
    exitDate: data.exitDate as string,
    rr: (data.rr as number) ?? 0,
    result: (data.result as number) ?? 0,
    netPnl: (data.netPnl as number) ?? 0,
    strategy: (data.strategy as string) ?? "",
    note: (data.note as string) ?? "",
    screenshotUrl: (data.screenshotUrl as string) ?? "",
    accountId: (data.accountId as string) ?? undefined,
    likeCount: (data.likeCount as number) ?? 0,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ?? (data.entryDate as string) ?? new Date().toISOString(),
    deletedAt: data.deletedAt == null ? null : ((data.deletedAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ?? null),
  };
}
