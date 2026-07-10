"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { autoTable, applyPlugin } from "jspdf-autotable";
import { useAuth } from "@/lib/auth-context";
import { subscribeToTrades } from "@/lib/trades";
import { subscribeToAccounts } from "@/lib/accounts";
import { RangeKey, Trade, Account } from "@/lib/types";
import { computeStats, filterTradesByRange } from "@/lib/date-utils";
import { format, parseISO } from "date-fns";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import StatCard from "@/components/StatCard";
import { usePlan } from "@/lib/features";
import ExecutiveSummary from "@/components/reports/ExecutiveSummary";
import DetailedMetricsTable from "@/components/reports/DetailedMetricsTable";
import MonthlyPnLChart from "@/components/reports/MonthlyPnLChart";
import DayOfWeekChart from "@/components/reports/DayOfWeekChart";
import AccountBreakdown from "@/components/reports/AccountBreakdown";
import TradeListTable from "@/components/reports/TradeListTable";
import {
  computeAdvancedStats,
  computeMonthlyPnL,
  computeDayOfWeekStats,
  computeAccountBreakdown,
} from "@/components/reports/report-utils";

const RANGE_PRESETS: { key: RangeKey; label: string }[] = [
  { key: "week", label: "Bu Hafta" },
  { key: "month", label: "Bu Ay" },
  { key: "year", label: "Bu Yıl" },
  { key: "custom", label: "Özel Aralık" },
];

const PIE_COLORS = ["#2ED9A4", "#FF5D5D", "#F2B84B", "#52E3B7", "#FF8080", "#F6CC7A", "#3A4351", "#6B7480"];

export default function ReportsPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [range, setRange] = useState<RangeKey>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { hasFeature } = usePlan();
  const canExport = hasFeature("csv_export");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrades(user.uid, setTrades);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToAccounts(user.uid, setAccounts);
    return unsub;
  }, [user]);

  const accountFiltered = useMemo(() => {
    if (accountFilter === "all") return trades;
    return trades.filter((t) => t.accountId === accountFilter);
  }, [trades, accountFilter]);

  const filtered = useMemo(
    () => filterTradesByRange(accountFiltered, range, new Date(), customStart, customEnd),
    [accountFiltered, range, customStart, customEnd]
  );

  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const advanced = useMemo(() => computeAdvancedStats(filtered), [filtered]);
  const monthlyData = useMemo(() => computeMonthlyPnL(filtered), [filtered]);
  const dayData = useMemo(() => computeDayOfWeekStats(filtered), [filtered]);
  const accountBreakdown = useMemo(
    () => computeAccountBreakdown(accounts, filtered, computeStats),
    [accounts, filtered]
  );

  const accountNames = useMemo(() => {
    const map: Record<string, string> = {};
    accounts.forEach((a) => { map[a.id] = a.name; });
    return map;
  }, [accounts]);

  const strategyData = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
      const key = t.strategy.trim() || "Belirtilmemiş";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const directionData = useMemo(() => {
    const long = filtered.filter((t) => t.direction === "long").length;
    const short = filtered.filter((t) => t.direction === "short").length;
    const be = filtered.filter((t) => t.direction === "be").length;
    return [
      { name: "Long", value: long, color: "#2ED9A4" },
      { name: "Short", value: short, color: "#FF5D5D" },
      { name: "BE", value: be, color: "#F2B84B" },
    ];
  }, [filtered]);

  const selectedAccountName = useMemo(() => {
    if (accountFilter === "all") return "Tüm Hesaplar";
    return accounts.find((a) => a.id === accountFilter)?.name ?? "Tüm Hesaplar";
  }, [accountFilter, accounts]);

  async function handleCopy() {
    const lines = [
      `─── RAPOR: ${rangeLabel()} ───`,
      `Hesap: ${selectedAccountName}`,
      "",
      `Toplam İşlem: ${stats.total}`,
      `Kazanma Oranı: ${stats.winRate.toFixed(1)}% (${stats.wins}K / ${stats.losses}Z / ${stats.breakeven}BE)`,
      `Profit Factor: ${advanced.profitFactor >= 99 ? "∞" : advanced.profitFactor.toFixed(2)}`,
      `Net P&L: ${stats.totalNetPnl >= 0 ? "+" : ""}$${Math.abs(stats.totalNetPnl).toFixed(2)}`,
      `Net %: ${stats.totalResult >= 0 ? "+" : ""}${stats.totalResult.toFixed(2)}%`,
      `Toplam RR: ${stats.totalRR >= 0 ? "+" : ""}${stats.totalRR.toFixed(2)}R`,
      `Ortalama RR: ${stats.avgRR.toFixed(2)}R`,
      `Payoff Ratio: ${advanced.payoffRatio >= 99 ? "∞" : advanced.payoffRatio.toFixed(2)}`,
      `Ort. Kazanan: $${advanced.avgWin.toFixed(2)}`,
      `Ort. Kaybeden: $${advanced.avgLoss.toFixed(2)}`,
      `En Büyük Kazanç: $${advanced.largestWin.toFixed(2)}`,
      `En Büyük Kayıp: $${Math.abs(advanced.largestLoss).toFixed(2)}`,
      "",
      `En İyi İşlem: ${stats.bestTrade ? `${stats.bestTrade.pair} — ${stats.bestTrade.result >= 0 ? "+" : ""}${stats.bestTrade.result}% (${stats.bestTrade.rr}R)` : "Yok"}`,
      `En Kötü İşlem: ${stats.worstTrade ? `${stats.worstTrade.pair} — ${stats.worstTrade.result >= 0 ? "+" : ""}${stats.worstTrade.result}% (${stats.worstTrade.rr}R)` : "Yok"}`,
      `Max Galibiyet Serisi: ${stats.maxWinStreak}`,
      `Max Mağlubiyet Serisi: ${stats.maxLoseStreak}`,
      `Max Drawdown: %${advanced.maxDrawdown.toFixed(2)}`,
      `Max Ardışık Kayıp: ${advanced.consecutiveLosses}`,
      "",
      "─── Strateji Dağılımı ───",
      ...strategyData.map((s) => `  ${s.name}: ${s.value} işlem`),
      "",
      "─── Yön Dağılımı ───",
      ...directionData.map((d) => `  ${d.name}: ${d.value} işlem`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // silently fail
    }
  }

  function drawBarChart(
    pdf: jsPDF,
    data: { label: string; value: number; color?: string }[],
    x: number, y: number, w: number, h: number,
    opts: { min?: number; labelWidth?: number; showZero?: boolean } = {},
  ) {
    const labelW = opts.labelWidth ?? 20;
    const chartX = x + labelW;
    const chartW = w - labelW;
    const barH = Math.min(6, (h - (data.length - 1) * 3) / data.length);
    const values = data.map((d) => d.value);
    const absValues = values.map(Math.abs);
    const maxVal = Math.max(...absValues, 1);
    const zeroVal = opts.showZero ? Math.min(...values) : 0;

    data.forEach((d, i) => {
      const by = y + i * (barH + 3);
      const barWidth = (Math.abs(d.value) / maxVal) * chartW;
      const barX = d.value >= 0 ? chartX : chartX - barWidth;
      const color = d.color ?? (d.value >= 0 ? "#2ED9A4" : "#FF5D5D");
      pdf.setFillColor(color);
      pdf.rect(barX, by, Math.max(barWidth, 1), barH, "F");
      pdf.setTextColor("#333");
      pdf.setFontSize(7);
      pdf.text(d.label, x, by + barH / 2 + 1.5);
      pdf.text(
        d.value >= 0 ? `+${d.value.toFixed(1)}` : d.value.toFixed(1),
        chartX + chartW + 1,
        by + barH / 2 + 1.5,
      );
    });
  }

  async function handlePdfDownload() {
    if (filtered.length === 0) return;
    setPdfGenerating(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ml = 15;
      const mr = 15;
      const contentW = pw - ml - mr;
      let y = ml;
      const now = new Date();

      function addSectionTitle(title: string) {
        pdf.setFontSize(12);
        pdf.setTextColor("#111");
        pdf.text(title, ml, y);
        y += 1;
        pdf.setDrawColor("#ccc");
        pdf.setLineWidth(0.3);
        pdf.line(ml, y, ml + contentW, y);
        y += 5;
      }

      function addBodyText(text: string, size = 9, color = "#444") {
        pdf.setFontSize(size);
        pdf.setTextColor(color);
        pdf.text(text, ml, y);
        y += size * 0.5;
      }

      function checkPage(minSpace = 15) {
        if (y > ph - minSpace) {
          pdf.addPage();
          y = ml;
        }
      }

      // ── Header ──
      pdf.setFontSize(20);
      pdf.setTextColor("#111");
      pdf.text("Ticaret Raporu", ml, y);
      y += 6;
      pdf.setFontSize(9);
      pdf.setTextColor("#666");
      pdf.text(
        `${selectedAccountName}  ·  ${rangeLabel()}  ·  ${filtered.length} işlem`,
        ml, y,
      );
      y += 4;
      pdf.text(
        `${format(now, "dd MMM yyyy HH:mm")} tarihinde oluşturuldu`,
        ml, y,
      );
      y += 10;

      // ── Executive Summary Cards ──
      const cards = [
        { label: "Profit Factor", value: advanced.profitFactor >= 99 ? "∞" : advanced.profitFactor.toFixed(2) },
        { label: "Ort. Kazanan", value: `+$${advanced.avgWin.toFixed(2)}` },
        { label: "Ort. Kaybeden", value: `-$${Math.abs(advanced.avgLoss).toFixed(2)}` },
        { label: "Payoff Ratio", value: advanced.payoffRatio >= 99 ? "∞" : advanced.payoffRatio.toFixed(2) },
        { label: "En Büyük Kazanç", value: `+$${advanced.largestWin.toFixed(2)}` },
        { label: "En Büyük Kayıp", value: `-$${Math.abs(advanced.largestLoss).toFixed(2)}` },
        { label: "Max Drawdown", value: `%${advanced.maxDrawdown.toFixed(2)}` },
        { label: "Max Ardışık Kayıp", value: String(advanced.consecutiveLosses) },
      ];

      const cardW = (contentW - 10) / 3;
      const cardH = 14;

      cards.forEach((card, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = ml + col * (cardW + 5);
        const cy = y + row * (cardH + 4);
        pdf.setDrawColor("#ddd");
        pdf.setFillColor("#f9fafb");
        pdf.roundedRect(cx, cy, cardW, cardH, 2, 2, "FD");
        pdf.setFontSize(7);
        pdf.setTextColor("#888");
        pdf.text(card.label, cx + 3, cy + 4);
        pdf.setFontSize(11);
        pdf.setTextColor("#111");
        pdf.text(card.value, cx + 3, cy + cardH - 4);
      });

      y += Math.ceil(cards.length / 3) * (cardH + 4) + 2;

      // ── Quick Stats Row ──
      checkPage();
      addSectionTitle("Özet Metrikler");

      const quickStats = [
        { label: "Toplam İşlem", value: String(stats.total) },
        { label: "Kazanma Oranı", value: `${stats.winRate.toFixed(1)}%` },
        { label: "Net Kâr/Zarar", value: `${stats.totalResult >= 0 ? "+" : ""}${stats.totalResult.toFixed(2)}%` },
        { label: "Ortalama RR", value: `${stats.avgRR.toFixed(2)}R` },
        { label: "En İyi Trade", value: stats.bestTrade ? `+${stats.bestTrade.result}%` : "Yok" },
        { label: "En Kötü Trade", value: stats.worstTrade ? `${stats.worstTrade.result}%` : "Yok" },
      ];

      const qCardW = (contentW - 15) / 6;
      quickStats.forEach((s, i) => {
        const qx = ml + i * (qCardW + 3);
        if (qx + qCardW > pw - mr) return;
        pdf.setDrawColor("#ddd");
        pdf.setFillColor("#f9fafb");
        pdf.roundedRect(qx, y, qCardW, 12, 1.5, 1.5, "FD");
        pdf.setFontSize(6);
        pdf.setTextColor("#888");
        pdf.text(s.label, qx + 2, y + 3.5);
        pdf.setFontSize(9);
        pdf.setTextColor("#111");
        pdf.text(s.value, qx + 2, y + 10);
      });
      y += 16;

      // ── Detailed Metrics Table ──
      checkPage(30);
      addSectionTitle("Detaylı Metrikler");

      const metricRows = [
        ["Toplam İşlem", String(stats.total), "Brüt Kâr", `+$${advanced.grossProfit.toFixed(2)}`],
        ["Kazanan", String(stats.wins), "Brüt Zarar", `-$${advanced.grossLoss.toFixed(2)}`],
        ["Kaybeden", String(stats.losses), "Net P&L ($)", `${stats.totalNetPnl >= 0 ? "+" : ""}$${stats.totalNetPnl.toFixed(2)}`],
        ["BE", String(stats.breakeven), "Net (%)", `${stats.totalResult >= 0 ? "+" : ""}${stats.totalResult.toFixed(2)}%`],
        ["Kazanma Oranı", `${stats.winRate.toFixed(1)}%`, "Ort. RR", `${stats.avgRR.toFixed(2)}R`],
        ["Profit Factor", advanced.profitFactor >= 99 ? "∞" : advanced.profitFactor.toFixed(2), "Payoff Ratio", advanced.payoffRatio >= 99 ? "∞" : advanced.payoffRatio.toFixed(2)],
        ["Ort. Kazanan", `+$${advanced.avgWin.toFixed(2)}`, "Ort. Kaybeden", `-$${Math.abs(advanced.avgLoss).toFixed(2)}`],
        ["En Büyük Kazanç", `+$${advanced.largestWin.toFixed(2)}`, "En Büyük Kayıp", `-$${Math.abs(advanced.largestLoss).toFixed(2)}`],
        ["Max Galibiyet Serisi", String(stats.maxWinStreak), "Max Mağlubiyet Serisi", String(stats.maxLoseStreak)],
        ["Max Drawdown", `%${advanced.maxDrawdown.toFixed(2)}`, "Max Ardışık Kayıp", String(advanced.consecutiveLosses)],
      ];

      autoTable(pdf, {
        startY: y,
        head: [["Metrik", "Değer", "Metrik", "Değer"]],
        body: metricRows,
        theme: "plain",
        margin: { left: ml, right: mr },
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fontSize: 7, textColor: "#888", fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
        },
        tableWidth: contentW,
        tableLineColor: "#eee",
        tableLineWidth: 0.1,
      });
      y = (pdf as any).lastAutoTable.finalY + 8;

      // ── Monthly P&L Chart ──
      if (monthlyData.length > 1) {
        checkPage(50);
        addSectionTitle("Aylık Kâr/Zarar");
        const chartH = 50;
        drawBarChart(
          pdf,
          monthlyData.map((m) => ({ label: m.monthLabel.slice(0, 7), value: m.pnl })),
          ml, y, contentW, chartH,
          { labelWidth: 22 },
        );
        y += chartH + 6;
      }

      // ── Day of Week Chart ──
      checkPage(50);
      addSectionTitle("Gün Bazında Performans");
      const dayChartH = 50;
      drawBarChart(
        pdf,
        dayData.map((d) => ({ label: d.shortName, value: d.pnl })),
        ml, y, contentW, dayChartH,
        { labelWidth: 14 },
      );
      y += dayChartH + 6;

      // ── Strategy & Direction Summary ──
      checkPage(40);
      addSectionTitle("Strateji & Yön Dağılımı");

      const maxStratItems = strategyData.slice(0, 8);
      const stratRows = maxStratItems.map((s) => [s.name, String(s.value)]);
      const dirRows = directionData
        .filter((d) => d.value > 0)
        .map((d) => [d.name, String(d.value)]);

      autoTable(pdf, {
        startY: y,
        head: [["Strateji", "Adet"]],
        body: stratRows,
        theme: "plain",
        margin: { left: ml, right: mr },
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fontSize: 7, textColor: "#888", fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 60 } },
        tableWidth: contentW / 2 - 5,
      });
      const stratEndY = (pdf as any).lastAutoTable.finalY;

      const dirStartX = ml + contentW / 2 + 5;
      autoTable(pdf, {
        startY: y,
        head: [["Yön", "Adet"]],
        body: dirRows,
        theme: "plain",
        margin: { left: dirStartX, right: mr },
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fontSize: 7, textColor: "#888", fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 30 } },
        tableWidth: contentW / 2 - 5,
      });

      y = Math.max(stratEndY, (pdf as any).lastAutoTable.finalY) + 8;

      // ── Account Breakdown ──
      if (accountBreakdown.length > 1) {
        checkPage(30);
        addSectionTitle("Hesap Bazında Performans");

        const accRows = accountBreakdown.map((a) => [
          a.name,
          String(a.stats.total),
          `${a.stats.winRate.toFixed(1)}%`,
          `${a.pnl >= 0 ? "+" : ""}$${a.pnl.toFixed(2)}`,
          `${a.stats.totalResult >= 0 ? "+" : ""}${a.stats.totalResult.toFixed(2)}%`,
        ]);

        autoTable(pdf, {
          startY: y,
          head: [["Hesap", "İşlem", "Win Rate", "PnL ($)", "PnL (%)"]],
          body: accRows,
          theme: "plain",
          margin: { left: ml, right: mr },
          styles: { fontSize: 8, cellPadding: 1.5 },
          headStyles: { fontSize: 7, textColor: "#888", fontStyle: "bold" },
          tableWidth: contentW,
          tableLineColor: "#eee",
          tableLineWidth: 0.1,
        });
        y = (pdf as any).lastAutoTable.finalY + 8;
      }

      // ── Trade List ──
      checkPage(30);
      addSectionTitle("İşlem Listesi");

      const tradeRows = filtered.map((t) => [
        format(parseISO(t.entryDate), "dd MMM yy"),
        t.pair,
        t.direction === "long" ? "U" : t.direction === "short" ? "S" : "BE",
        `${t.result >= 0 ? "+" : ""}${t.result.toFixed(2)}%`,
        `${t.rr.toFixed(1)}R`,
        `${(t.netPnl ?? 0) >= 0 ? "+" : ""}$${(t.netPnl ?? 0).toFixed(2)}`,
        t.strategy || "-",
      ]);

      autoTable(pdf, {
        startY: y,
        head: [["Tarih", "Pair", "Yön", "Sonuç", "RR", "PnL", "Strateji"]],
        body: tradeRows,
        theme: "plain",
        margin: { left: ml, right: mr },
        styles: { fontSize: 7, cellPadding: 1.2 },
        headStyles: { fontSize: 7, textColor: "#888", fontStyle: "bold" },
        tableWidth: contentW,
        tableLineColor: "#eee",
        tableLineWidth: 0.1,
        columnStyles: {
          0: { cellWidth: 20 },
          3: { cellWidth: 18 },
          4: { cellWidth: 12 },
          5: { cellWidth: 22 },
        },
      });

      pdf.save(`rapor-${format(now, "yyyy-MM-dd")}.pdf`);
    } catch (err) {
      console.error("PDF oluşturulamadı:", err);
    } finally {
      setPdfGenerating(false);
    }
  }

  function rangeLabel(): string {
    if (range === "week") return "Bu Hafta";
    if (range === "month") return "Bu Ay";
    if (range === "year") return "Bu Yıl";
    if (range === "custom" && customStart && customEnd) {
      return `${customStart} — ${customEnd}`;
    }
    return "Tüm Zamanlar";
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-semibold">Raporlar</h1>
        <p className="text-sm text-paper-300 mt-1">
          Seçtiğin döneme ait detaylı profesyonel rapor.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up stagger-1 no-print">
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50"
        >
          <option value="all">Tüm Hesaplar</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => setRange(preset.key)}
            className={`rounded-lg border px-3 py-2 text-xs font-mono font-medium transition ${
              range === preset.key
                ? "bg-mint-500/10 text-mint-400 border-mint-500/30"
                : "bg-ink-900 text-paper-500 border-ink-800 hover:text-paper-300 hover:border-ink-700"
            }`}
          >
            {preset.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 transition"
            />
            <span className="text-paper-500 text-sm">–</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 transition"
            />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-ink-800 bg-ink-900 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-paper-500">Bu dönemde işlem bulunmuyor.</p>
        </div>
      ) : (
        <div ref={reportRef} className="space-y-8 print-friendly">
          {/* Report header — print visible */}
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900">Ticaret Raporu</h1>
            <p className="text-sm text-gray-500 mt-1">
              {selectedAccountName} · {rangeLabel()} · {filtered.length} işlem
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(new Date(), "dd MMM yyyy HH:mm")} tarihinde oluşturuldu
            </p>
          </div>

          {/* Performance Summary Cards */}
          <div className="animate-fade-in-up stagger-2">
            <ExecutiveSummary stats={advanced} tradeCount={stats.total} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in-up stagger-3">
            <StatCard label="Toplam İşlem" value={String(stats.total)} />
            <StatCard
              label="Kazanma Oranı"
              value={`${stats.winRate.toFixed(1)}%`}
              tone={stats.winRate >= 50 ? "mint" : "coral"}
              hint={`${stats.wins}K / ${stats.losses}Z / ${stats.breakeven}BE`}
            />
            <StatCard
              label="Net Kâr/Zarar"
              value={`${stats.totalResult >= 0 ? "+" : ""}${stats.totalResult.toFixed(2)}%`}
              tone={stats.totalResult >= 0 ? "mint" : "coral"}
            />
            <StatCard
              label="Ortalama RR"
              value={`${stats.avgRR.toFixed(2)}R`}
              tone="amber"
            />
            <StatCard
              label="En İyi Trade"
              value={stats.bestTrade ? `+${stats.bestTrade.result}%` : "Yok"}
              tone="mint"
              hint={stats.bestTrade?.pair}
            />
            <StatCard
              label="En Kötü Trade"
              value={stats.worstTrade ? `${stats.worstTrade.result}%` : "Yok"}
              tone="coral"
              hint={stats.worstTrade?.pair}
            />
          </div>

          {/* Detailed Metrics Table */}
          <div className="animate-fade-in-up stagger-4">
            <DetailedMetricsTable stats={stats} advanced={advanced} tradeCount={stats.total} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-5">
            {monthlyData.length > 1 && <MonthlyPnLChart data={monthlyData} />}
            <DayOfWeekChart data={dayData} />
          </div>

          {/* Strategy & Direction (existing) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-6">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
                Strateji Dağılımı
              </h2>
              {strategyData.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
                  Strateji verisi yok.
                </div>
              ) : (
                <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={strategyData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={2}
                      >
                        {strategyData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#11151B",
                          border: "1px solid #272F3B",
                          borderRadius: 8,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                        }}
                        labelStyle={{ color: "#A8B0BC" }}
                        itemStyle={{ color: "#E8ECF0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {strategyData.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-xs text-paper-300 font-mono">
                          {s.name} ({s.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
                Yön Dağılımı
              </h2>
              {directionData.every((d) => d.value === 0) ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
                  Yön verisi yok.
                </div>
              ) : (
                <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={directionData}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#1B212B" horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="#6B7480"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#6B7480"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#11151B",
                          border: "1px solid #272F3B",
                          borderRadius: 8,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                        }}
                        labelStyle={{ color: "#A8B0BC" }}
                        itemStyle={{ color: "#E8ECF0" }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                        {directionData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Account Breakdown */}
          {accountBreakdown.length > 0 && (
            <div className="animate-fade-in-up stagger-7">
              <AccountBreakdown data={accountBreakdown} />
            </div>
          )}

          {/* Trade List Table */}
          <div className="animate-fade-in-up stagger-8">
            <TradeListTable trades={filtered} accountNames={accountNames} />
          </div>

          {/* Print-only summary table for PDF */}
          <div className="hidden print:block mt-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase mb-2">İşlem Listesi</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-1 px-2">Tarih</th>
                  <th className="text-left py-1 px-2">Pair</th>
                  <th className="text-left py-1 px-2">Yön</th>
                  <th className="text-right py-1 px-2">Sonuç</th>
                  <th className="text-right py-1 px-2">RR</th>
                  <th className="text-right py-1 px-2">PnL</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((t) => (
                  <tr key={t.id} className="border-b border-gray-200">
                    <td className="py-1 px-2">{format(parseISO(t.entryDate), "dd MMM yy")}</td>
                    <td className="py-1 px-2 font-semibold">{t.pair}</td>
                    <td className="py-1 px-2">{t.direction === "long" ? "U" : t.direction === "short" ? "S" : "BE"}</td>
                    <td className={`py-1 px-2 text-right ${t.result >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {t.result >= 0 ? "+" : ""}{t.result.toFixed(2)}%
                    </td>
                    <td className="py-1 px-2 text-right">{t.rr.toFixed(1)}R</td>
                    <td className={`py-1 px-2 text-right ${t.netPnl >= 0 ? "text-green-700" : "text-red-700"}`}>
                      ${(t.netPnl ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export buttons */}
          <div className="flex justify-center gap-3 animate-fade-in-up stagger-9 no-print">
            {canExport ? (
              <button
                onClick={handleCopy}
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
                  copyFeedback
                    ? "bg-mint-500/10 text-mint-400 border-mint-500/30"
                    : "bg-ink-900 text-paper-300 border-ink-800 hover:text-paper-100 hover:border-ink-700"
                }`}
              >
                {copyFeedback ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Raporu Kopyala
                  </>
                )}
              </button>
            ) : (
              <a
                href="/pricing"
                className="rounded-lg border border-ink-800 bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper-500 hover:text-mint-400 hover:border-mint-500/30 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Premium'a Yükselt
              </a>
            )}
            {canExport ? (
              <button
                onClick={handlePdfDownload}
                disabled={pdfGenerating}
                className="rounded-lg border border-ink-800 bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper-300 hover:text-paper-100 hover:border-ink-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" />
                </svg>
                {pdfGenerating ? "Oluşturuluyor..." : "PDF İndir"}
              </button>
            ) : (
              <a
                href="/pricing"
                className="rounded-lg border border-ink-800 bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper-500 hover:text-mint-400 hover:border-mint-500/30 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Premium'a Yükselt
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
