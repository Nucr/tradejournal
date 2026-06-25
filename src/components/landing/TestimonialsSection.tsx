const TESTIMONIALS = [
  {
    quote:
      "Ledger sayesinde hangi stratejimin kârlı olduğunu net görebiliyorum. Performans grafikleri sayesinde zayıf yönlerimi keşfettim.",
    name: "Ali",
    role: "Kripto Trader",
    color: "#2ED9A4",
  },
  {
    quote:
      "Günlük performans grafiği en sevdiğim özellik. İlerlememi somut olarak görmek motivasyonumu katlıyor.",
    name: "Zeynep",
    role: "Swing Trader",
    color: "#60A5FA",
  },
  {
    quote:
      "Liderlik tablosu rekabeti artırıyor. Her gün kendimi geliştiriyorum ve diğer traderlarla kıyaslanmak beni daha hırslı yapıyor.",
    name: "Can",
    role: "Scalper",
    color: "#F2B84B",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper-100">
            Traderlar Ne Diyor?
          </h2>
          <p className="mt-3 text-paper-300 max-w-xl mx-auto">
            Binlerce trader işlemlerini Ledger ile kaydediyor ve performansını analiz ediyor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-ink-800 bg-ink-900/50 p-6 animate-fade-in-up"
            >
              <svg className="w-8 h-8 text-mint-500/30 mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.404-.655-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.404-.655-2.917-1.179z" />
              </svg>
              <p className="text-sm text-paper-300 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-ink-950"
                  style={{ backgroundColor: t.color }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-paper-100">{t.name}</p>
                  <p className="text-xs text-paper-500 font-mono">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
