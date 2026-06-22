"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { addDoc, collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { syncUserScore } from "@/lib/scoreEngine";
import { isValid, parse } from "date-fns";
import type { TradeDirection, TradeInput } from "@/lib/types";

type ColKey = keyof Pick<TradeInput, "pair" | "direction" | "entryDate" | "exitDate" | "rr" | "result" | "strategy" | "note" | "netPnl">;

const ALL_FIELDS: { key: ColKey; label: string; required: boolean }[] = [
  { key: "pair", label: "Sembol", required: true },
  { key: "direction", label: "Yön", required: true },
  { key: "entryDate", label: "Giriş Tarihi", required: true },
  { key: "exitDate", label: "Çıkış Tarihi", required: false },
  { key: "rr", label: "R/R", required: true },
  { key: "result", label: "Sonuç", required: true },
  { key: "strategy", label: "Strateji", required: false },
  { key: "note", label: "Not", required: false },
  { key: "netPnl", label: "Net P/L", required: false },
];

const KNOWN_HEADERS: Record<string, ColKey> = {
  date: "entryDate",
  symbol: "pair",
  pair: "pair",
  direction: "direction",
  result: "result",
  rr: "rr",
  strategy: "strategy",
  note: "note",
  notes: "note",
  exitdate: "exitDate",
  exit: "exitDate",
  netpnl: "netPnl",
  pnl: "netPnl",
};

function normalizeDirection(v: string): TradeDirection | null {
  const s = v.trim().toLowerCase();
  if (s === "long") return "long";
  if (s === "short") return "short";
  if (s === "be" || s === "break even") return "be";
  return null;
}

class ParseError extends Error {
  constructor(
    public row: number,
    message: string,
  ) {
    super(message);
  }
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV en az bir başlık ve bir veri satırı içermeli");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
  return { headers, rows };
}

function autoMap(headers: string[]): Map<string, ColKey> {
  const map = new Map<string, ColKey>();
  for (const h of headers) {
    const mapped = KNOWN_HEADERS[h];
    if (mapped) map.set(h, mapped);
  }
  return map;
}

export default function ImportPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [raw, setRaw] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [mapping, setMapping] = useState<Map<string, ColKey>>(new Map());
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; err: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) { alert("Sadece CSV dosyaları kabul edilir"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Dosya boyutu 5MB'dan büyük olamaz"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        setRaw(parsed);
        setMapping(autoMap(parsed.headers));
        setResult(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "CSV okunamadı");
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const previewRows = useMemo(() => {
    if (!raw) return [];
    return raw.rows.slice(0, 10);
  }, [raw]);

  function setColMapping(csvCol: string, field: ColKey) {
    setMapping((prev) => {
      const next = new Map(prev);
      // remove field from any previous column
      for (const [k, v] of next) {
        if (v === field) next.delete(k);
      }
      next.set(csvCol, field);
      return next;
    });
  }

  const unmappedFields = ALL_FIELDS.filter((f) => {
    for (const v of mapping.values()) {
      if (v === f.key) return false;
    }
    return true;
  });

  async function handleImport() {
    if (!user || !raw) return;

    const requiredMissing = ALL_FIELDS.filter((f) => f.required).some((f) => {
      for (const v of mapping.values()) {
        if (v === f.key) return false;
      }
      return true;
    });
    if (requiredMissing) { alert("Lütfen tüm zorunlu alanları eşleştirin"); return; }

    setImporting(true);
    setResult(null);

    const okRows: TradeInput[] = [];
    const errRows: { row: number; msg: string }[] = [];

    for (let i = 0; i < raw.rows.length; i++) {
      const row = raw.rows[i];
      const rowNum = i + 2;

      try {
        const trade: Record<string, unknown> = {
          pair: "",
          direction: "",
          entryDate: "",
          exitDate: "",
          rr: 0,
          result: 0,
          strategy: "",
          note: "",
          netPnl: 0,
          screenshotUrl: "",
        };

        for (let ci = 0; ci < raw.headers.length; ci++) {
          const csvCol = raw.headers[ci];
          const field = mapping.get(csvCol);
          if (!field) continue;
          const val = row[ci] ?? "";
          trade[field] = val;
        }

        // Validate
        if (!trade.pair || typeof trade.pair !== "string") throw new ParseError(rowNum, "Sembol gerekli");
        if (!trade.entryDate || typeof trade.entryDate !== "string") throw new ParseError(rowNum, "Tarih gerekli");

        const parsedDate = parse(trade.entryDate as string, "yyyy-MM-dd", new Date());
        if (!isValid(parsedDate)) throw new ParseError(rowNum, `Geçersiz tarih: ${trade.entryDate}`);

        if (!trade.exitDate || trade.exitDate === "") {
          trade.exitDate = trade.entryDate;
        } else {
          const exitParsed = parse(trade.exitDate as string, "yyyy-MM-dd", new Date());
          if (!isValid(exitParsed)) throw new ParseError(rowNum, `Geçersiz çıkış tarihi: ${trade.exitDate}`);
        }

        const dir = normalizeDirection(trade.direction as string);
        if (!dir) throw new ParseError(rowNum, `Geçersiz yön: ${trade.direction} (Long/Short/BE olmalı)`);
        trade.direction = dir;

        const rr = Number(trade.rr);
        if (isNaN(rr)) throw new ParseError(rowNum, `Geçersiz RR: ${trade.rr}`);
        trade.rr = rr;

        const resultVal = Number(trade.result);
        if (isNaN(resultVal)) throw new ParseError(rowNum, `Geçersiz sonuç: ${trade.result}`);
        trade.result = resultVal;

        const netPnl = trade.netPnl ? Number(trade.netPnl) : 0;
        trade.netPnl = isNaN(netPnl) ? 0 : netPnl;

        okRows.push(trade as unknown as TradeInput);
      } catch (e) {
        errRows.push({
          row: rowNum,
          msg: e instanceof ParseError ? e.message : "Bilinmeyen hata",
        });
      }
    }

    // Batch write to Firestore (max 500 per batch)
    const tradesCol = collection(db, "users", user.uid, "trades");
    const batches: typeof okRows[] = [];
    for (let i = 0; i < okRows.length; i += 500) {
      batches.push(okRows.slice(i, i + 500));
    }

    for (const batch of batches) {
      const fbBatch = writeBatch(db);
      for (const trade of batch) {
        const ref = doc(tradesCol);
        fbBatch.set(ref, {
          ...trade,
          createdAt: serverTimestamp(),
        });
      }
      await fbBatch.commit();
    }

    await syncUserScore(user.uid);

    setImporting(false);
    setResult({
      ok: okRows.length,
      err: errRows.length,
      errors: errRows.slice(0, 20).map((e) => `Satır ${e.row}: ${e.msg}`),
    });
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <Link
          href="/dashboard/journal"
          className="text-paper-500 hover:text-paper-300 transition p-1 -ml-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7 7l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-semibold">CSV İçe Aktar</h1>
      </div>
      <p className="text-sm text-paper-500 mb-8">
        Trade'lerini CSV dosyasından toplu olarak içe aktar.
      </p>

      {!raw && (
        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-16 text-center cursor-pointer transition ${
            dragOver ? "border-mint-500 bg-mint-500/5" : "border-ink-700 hover:border-ink-600 bg-ink-900/50"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="w-12 h-12 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm text-paper-300 font-medium">
            CSV dosyasını sürükle bırak veya seç
          </p>
          <p className="text-xs text-paper-500 mt-1">Maksimum 5MB</p>
        </div>
      )}

      {raw && (
        <>
          {/* Column mapping */}
          <section className="rounded-xl border border-ink-800 bg-ink-900/50 p-5 mb-6">
            <h2 className="font-display text-base font-semibold mb-3">Sütun Eşleştirme</h2>
            <div className="space-y-2">
              {raw.headers.map((col) => (
                <div key={col} className="flex items-center gap-3">
                  <span className="text-sm text-paper-300 w-32 shrink-0 font-mono">{col}</span>
                  <select
                    value={mapping.get(col) ?? ""}
                    onChange={(e) => setColMapping(col, e.target.value as ColKey)}
                    className="flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500"
                  >
                    <option value="">— Eşleştirme —</option>
                    {ALL_FIELDS.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label}{f.required ? " *" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {unmappedFields.length > 0 && (
              <p className="text-xs text-amber-400 mt-3">
                Eşleştirilmemiş alanlar: {unmappedFields.map((f) => f.label).join(", ")}
              </p>
            )}
          </section>

          {/* Preview */}
          <section className="rounded-xl border border-ink-800 bg-ink-900/50 p-5 mb-6 overflow-x-auto">
            <h2 className="font-display text-base font-semibold mb-3">
              Önizleme ({raw.rows.length} satır, ilk {Math.min(10, raw.rows.length)} gösteriliyor)
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="text-left text-paper-500 font-mono text-xs py-2 pr-3">#</th>
                  {raw.headers.map((h) => (
                    <th key={h} className="text-left text-paper-500 font-mono text-xs py-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-ink-800/50 last:border-0">
                    <td className="text-paper-500 text-xs py-2 pr-3">{ri + 2}</td>
                    {row.map((cell, ci) => (
                      <td key={ci} className="text-paper-100 py-2 pr-3 max-w-[200px] truncate">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setRaw(null); setMapping(new Map()); setResult(null); }}
              className="rounded-lg border border-ink-700 text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition"
            >
              İptal
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-6 py-2.5 text-sm hover:bg-mint-400 transition disabled:opacity-40 flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-ink-950 border-t-transparent animate-spin" />
                  Aktarılıyor...
                </>
              ) : (
                "İçe Aktar"
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl border p-5 mt-6 ${
              result.err > 0 ? "border-amber-500/20 bg-amber-500/5" : "border-mint-500/20 bg-mint-500/5"
            }`}>
              <p className="text-sm font-medium text-paper-100">
                {result.ok} işlem başarıyla aktarıldı
                {result.err > 0 && `, ${result.err} hatalı satır atlandı`}.
              </p>
              {result.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-coral-400 font-mono">{e}</p>
                  ))}
                </div>
              )}
              <Link
                href="/dashboard/journal"
                className="inline-block mt-4 rounded-lg bg-mint-500 text-ink-950 font-semibold px-5 py-2 text-sm hover:bg-mint-400 transition"
              >
                Trade Defterine Dön
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
