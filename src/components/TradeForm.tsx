"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addStrategy, getStrategies } from "@/lib/strategies";
import { TradeDirection, TradeInput, Strategy } from "@/lib/types";
import DateTimePicker from "./DateTimePicker";

interface Props {
  initial?: TradeInput;
  onSubmit: (trade: TradeInput) => Promise<void>;
  onCancel: () => void;
}

export default function TradeForm({ initial, onSubmit, onCancel }: Props) {
  const { user } = useAuth();
  const [pair, setPair] = useState(initial?.pair ?? "");
  const [direction, setDirection] = useState<TradeDirection>(initial?.direction ?? "long");
  const [outcome, setOutcome] = useState<"tp" | "sl" | "be">(
    initial ? (initial.result > 0 ? "tp" : initial.result < 0 ? "sl" : "be") : "tp"
  );
  const [entryDate, setEntryDate] = useState(initial?.entryDate?.slice(0, 16) ?? "");
  const [exitDate, setExitDate] = useState(initial?.exitDate?.slice(0, 16) ?? "");
  const [rr, setRr] = useState(initial?.rr?.toString() ?? "");
  const [result, setResult] = useState(initial?.result?.toString() ?? "");
  const [netPnl, setNetPnl] = useState(initial?.netPnl?.toString() ?? "");
  const [strategy, setStrategy] = useState(initial?.strategy ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [screenshotUrl, setScreenshotUrl] = useState(initial?.screenshotUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Strategy dropdown
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [creatingSubmitting, setCreatingSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getStrategies(user.uid).then(setStrategies);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return strategies;
    const q = search.toLowerCase();
    return strategies.filter((s) => s.name.toLowerCase().includes(q));
  }, [strategies, search]);

  const myStrategies = useMemo(
    () => filtered.filter((s) => s.createdBy === user?.uid),
    [filtered, user]
  );
  const otherStrategies = useMemo(
    () => filtered.filter((s) => s.createdBy !== user?.uid),
    [filtered, user]
  );

  function selectStrategy(name: string) {
    setStrategy(name);
    setSearch(name);
    setDropdownOpen(false);
  }

  async function handleCreateStrategy() {
    if (!user || !newName.trim()) return;
    setCreatingSubmitting(true);
    try {
      await addStrategy(newName.trim(), user.uid, newIsPublic);
      const updated = await getStrategies(user.uid);
      setStrategies(updated);
      setStrategy(newName.trim());
      setSearch(newName.trim());
      setCreating(false);
      setNewName("");
      setNewIsPublic(false);
      setDropdownOpen(false);
    } finally {
      setCreatingSubmitting(false);
    }
  }

  useEffect(() => {
    if (outcome === "be") {
      setResult("0");
      setNetPnl("0");
    }
  }, [outcome]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pair || !entryDate || !exitDate) {
      setError("Parite, giriş ve çıkış tarihi zorunlu.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      let finalResult = Number(result) || 0;
      let finalPnl = Number(netPnl) || 0;
      if (outcome === "sl") {
        if (finalResult > 0) finalResult = -finalResult;
        if (finalPnl > 0) finalPnl = -finalPnl;
      }
      if (outcome === "be") {
        finalResult = 0;
        finalPnl = 0;
      }
      await onSubmit({
        pair: pair.toUpperCase(),
        direction,
        entryDate: new Date(entryDate).toISOString(),
        exitDate: new Date(exitDate).toISOString(),
        rr: Number(rr) || 0,
        result: finalResult,
        netPnl: finalPnl,
        strategy,
        note,
        screenshotUrl,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Parite">
          <input
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            placeholder="EURUSD, XAUUSD, BTCUSD…"
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500 uppercase"
          />
        </Field>

        <Field label="Yön">
          <div className="flex gap-2">
            {(["long", "short"] as TradeDirection[]).map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDirection(d)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition ${
                  direction === d
                    ? d === "long"
                      ? "border-mint-500 bg-mint-500/10 text-mint-400"
                      : "border-coral-500 bg-coral-500/10 text-coral-400"
                    : "border-ink-700 text-paper-300 hover:border-ink-600"
                }`}
              >
                {d === "long" ? "Long" : "Short"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Giriş Tarihi">
          <DateTimePicker
            value={entryDate}
            onChange={setEntryDate}
            placeholder="Giriş tarihi & saati"
          />
        </Field>

        <Field label="Çıkış Tarihi">
          <DateTimePicker
            value={exitDate}
            onChange={setExitDate}
            placeholder="Çıkış tarihi & saati"
          />
        </Field>

        <Field label="RR (Risk/Ödül)">
          <input
            type="number"
            step="0.1"
            value={rr}
            onChange={(e) => setRr(e.target.value)}
            placeholder="örn. 2.5"
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
          />
        </Field>

        <Field label="TP / SL / BE">
          <div className="flex gap-2">
            {(["tp", "sl", "be"] as const).map((o) => (
              <button
                type="button"
                key={o}
                onClick={() => setOutcome(o)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition ${
                  outcome === o
                    ? o === "tp"
                      ? "border-mint-500 bg-mint-500/10 text-mint-400"
                      : o === "sl"
                      ? "border-coral-500 bg-coral-500/10 text-coral-400"
                      : "border-amber-400 bg-amber-400/10 text-amber-400"
                    : "border-ink-700 text-paper-300 hover:border-ink-600"
                }`}
              >
                {o === "tp" ? "TP" : o === "sl" ? "SL" : "BE"}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Sonuç (% kâr/zarar)${outcome === "sl" ? " (negatif yazılacak)" : ""}`}>
          <input
            type="number"
            step="0.01"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder={outcome === "be" ? "0" : "örn. 1.8"}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
            disabled={outcome === "be"}
          />
        </Field>

        <Field label="Net Kâr/Zarar ($)" full>
          <input
            type="number"
            step="0.01"
            value={netPnl}
            onChange={(e) => setNetPnl(e.target.value)}
            placeholder="örn. 30 veya -15 (dolar cinsinden)"
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
          />
        </Field>

        {/* Strategy dropdown */}
        <Field label="Strateji" full>
          <div ref={dropdownRef} className="relative">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Strateji seçin veya yazın…"
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
            />
            {dropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg border border-ink-700 bg-ink-900 shadow-xl max-h-60 overflow-y-auto">
                {myStrategies.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wide text-paper-500">
                      Stratejilerim
                    </p>
                    {myStrategies.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectStrategy(s.name)}
                        className={`w-full text-left px-3 py-2 text-sm transition flex items-center justify-between ${
                          strategy === s.name
                            ? "bg-mint-500/10 text-mint-400"
                            : "text-paper-200 hover:bg-ink-800"
                        }`}
                      >
                        <span>{s.name}</span>
                        <span className="text-[10px] font-mono text-paper-500">
                          {s.isPublic ? "Herkese Açık" : "Özel"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {otherStrategies.length > 0 && (
                  <div>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wide text-paper-500 border-t border-ink-800">
                      Topluluk Stratejileri
                    </p>
                    {otherStrategies.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectStrategy(s.name)}
                        className={`w-full text-left px-3 py-2 text-sm transition ${
                          strategy === s.name
                            ? "bg-mint-500/10 text-mint-400"
                            : "text-paper-200 hover:bg-ink-800"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}

                {filtered.length === 0 && !creating && (
                  <p className="px-3 py-4 text-sm text-paper-500 text-center">
                    Eşleşen strateji bulunamadı.
                  </p>
                )}

                {!creating ? (
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="w-full text-left px-3 py-2.5 text-sm text-mint-400 hover:bg-ink-800 transition border-t border-ink-800 font-medium"
                  >
                    + Yeni strateji oluştur
                  </button>
                ) : (
                  <div className="p-3 border-t border-ink-800 space-y-2">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Strateji adı"
                      className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm placeholder:text-paper-500 focus:border-mint-500"
                      autoFocus
                    />
                    <label className="flex items-center gap-2 text-sm text-paper-300">
                      <input
                        type="checkbox"
                        checked={newIsPublic}
                        onChange={(e) => setNewIsPublic(e.target.checked)}
                        className="rounded border-ink-700 bg-ink-950 text-mint-500 focus:ring-mint-500"
                      />
                      Herkese açık
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateStrategy}
                        disabled={creatingSubmitting || !newName.trim()}
                        className="rounded-lg bg-mint-500 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
                      >
                        {creatingSubmitting ? "Kaydediliyor…" : "Oluştur"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreating(false)}
                        className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs text-paper-300 hover:bg-ink-800 transition"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Field>

        <Field label="TradingView Görsel Linki (Alt+S)" full>
          <input
            value={screenshotUrl}
            onChange={(e) => setScreenshotUrl(e.target.value)}
            placeholder="https://www.tradingview.com/x/xxxxxxxx/"
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
          />
        </Field>

        <Field label="Not (opsiyonel)" full>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="İşlemle ilgili gözlemlerin…"
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-coral-400 font-mono">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
        >
          {submitting ? "kaydediliyor…" : "İşlemi Kaydet"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-ink-700 px-4 py-2.5 text-sm font-medium text-paper-300 hover:bg-ink-800 transition"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? "sm:col-span-2 block" : "block"}>
      <span className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
