const STATS = [
  { value: "10.000+", label: "İşlem Kaydedildi" },
  { value: "500+", label: "Aktif Trader" },
  { value: "%92", label: "Memnuniyet Oranı" },
];

export default function StatsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center text-center animate-fade-in-up"
            >
              <span className="font-display text-4xl sm:text-5xl font-bold text-mint-400">
                {s.value}
              </span>
              <span className="mt-2 text-sm text-paper-300 font-mono uppercase tracking-wider">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
