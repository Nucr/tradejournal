import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { format } from "date-fns";

interface Props {
  params: { tradeId: string };
}

interface ShareData {
  trade: {
    pair: string;
    direction: "long" | "short" | "be";
    entryDate: string;
    exitDate: string;
    rr: number;
    result: number;
    netPnl: number;
    strategy: string;
    note: string;
    screenshotUrl: string;
  };
  user: {
    displayName: string;
    avatarColor: string;
    isPublic: boolean;
  };
}

async function fetchShareData(tradeId: string): Promise<ShareData | null> {
  const tradesSnap = await adminDb
    .collectionGroup("trades")
    .where("__name__", "==", tradeId)
    .get();

  if (tradesSnap.empty) return null;
  const tradeDoc = tradesSnap.docs[0];
  const uid = tradeDoc.ref.path.split("/")[1];
  const trade = tradeDoc.data() as ShareData["trade"];

  const userSnap = await adminDb.collection("users").doc(uid).get();
  if (!userSnap.exists) return null;

  const user = userSnap.data() as ShareData["user"];
  if (!user.isPublic) return null;

  return { trade, user };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchShareData(params.tradeId);
  if (!data) return { title: "Trade Bulunamadı" };

  const { trade, user } = data;
  const sign = trade.result >= 0 ? "+" : "";
  const title = `${trade.pair} ${trade.direction === "long" ? "Long" : trade.direction === "short" ? "Short" : "BE"} ${sign}${trade.result}% | RR: ${trade.rr} | ${user.displayName}`;

  return {
    title,
    description: `${trade.pair} işlemi — ${sign}${trade.result}% ${trade.direction === "long" ? "Long" : trade.direction === "short" ? "Short" : "BE"} • RR ${trade.rr} • ${trade.strategy ? `${trade.strategy} • ` : ""}${user.displayName}`,
    openGraph: {
      title,
      description: `${trade.pair} • ${sign}${trade.result}% • RR ${trade.rr}${trade.strategy ? ` • ${trade.strategy}` : ""}`,
      type: "article",
      siteName: "Ledger Trade Journal",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `${trade.pair} — ${sign}${trade.result}%`,
    },
  };
}

const DIRECTION_LABEL: Record<string, string> = {
  long: "LONG",
  short: "SHORT",
  be: "BE",
};

export default async function SharePage({ params }: Props) {
  const data = await fetchShareData(params.tradeId);
  if (!data) notFound();

  const { trade, user } = data;

  const toneClass =
    trade.direction === "long"
      ? "border-mint-500/40 text-mint-400 bg-mint-500/10"
      : trade.direction === "short"
        ? "border-coral-500/40 text-coral-400 bg-coral-500/10"
        : "border-amber-400/40 text-amber-400 bg-amber-400/10";

  return (
    <div className="min-h-screen bg-ink-950 text-paper-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden">
          {trade.screenshotUrl ? (
            <div className="bg-ink-950 border-b border-ink-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trade.screenshotUrl}
                alt={`${trade.pair} grafik görseli`}
                className="w-full h-48 sm:h-64 object-cover"
              />
            </div>
          ) : (
            <div className="h-32 sm:h-40 bg-ink-950 border-b border-ink-800 flex items-center justify-center text-xs text-paper-500 font-mono">
              grafik görseli yok
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-paper-300 font-medium">{user.displayName}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-semibold text-2xl">{trade.pair}</h1>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${toneClass}`}
                  >
                    {DIRECTION_LABEL[trade.direction]}
                  </span>
                </div>
                <p className="text-sm text-paper-500 font-mono mt-2">
                  {format(new Date(trade.entryDate), "dd MMM yyyy HH:mm")} →{" "}
                  {format(new Date(trade.exitDate), "dd MMM yyyy HH:mm")}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`font-mono font-bold text-2xl ${
                    trade.result > 0
                      ? "text-mint-400"
                      : trade.result < 0
                        ? "text-coral-400"
                        : "text-amber-400"
                  }`}
                >
                  {trade.result >= 0 ? "+" : ""}
                  {trade.result}%
                </p>
                <p className="text-sm text-paper-500 font-mono mt-1">{trade.rr}R</p>
                {trade.netPnl !== 0 && (
                  <p
                    className={`text-sm font-mono font-semibold mt-0.5 ${
                      trade.netPnl > 0 ? "text-mint-400" : "text-coral-400"
                    }`}
                  >
                    {trade.netPnl > 0 ? "+" : ""}${trade.netPnl.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {trade.strategy && (
              <p className="text-sm text-paper-300">
                <span className="text-paper-500 font-mono text-xs uppercase mr-2">
                  strateji
                </span>
                {trade.strategy}
              </p>
            )}

            {trade.note && (
              <p className="text-sm text-paper-300 border-l-2 border-ink-700 pl-3">
                {trade.note}
              </p>
            )}

            <div className="pt-2 border-t border-ink-800">
              <Link
                href="/dashboard/journal"
                className="inline-flex items-center gap-2 rounded-lg bg-mint-500 text-ink-950 font-semibold px-5 py-2.5 text-sm hover:bg-mint-400 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Ledger'da Görüntüle
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-paper-600 mt-4">
          Powered by Ledger Trade Journal
        </p>
      </div>
    </div>
  );
}
