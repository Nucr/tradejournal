const STEPS = [
  {
    step: 1,
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Hesap Oluştur",
    desc: "30 saniyede ücretsiz kaydol, hemen kullanmaya başla. Kredi kartı gerekmez.",
  },
  {
    step: 2,
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: "İşlemlerini Kaydet",
    desc: "Ekran görüntüsü, strateji ve notlarınla her işlemini eksiksiz kaydet ve etiketle.",
  },
  {
    step: 3,
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Performansını İzle",
    desc: "Detaylı analizler ve grafiklerle gelişimini takip et, veriye dayalı kararlar al.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-ink-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper-100">
            Nasıl Çalışır?
          </h2>
          <p className="mt-3 text-paper-300 max-w-xl mx-auto">
            Üç basit adımda işlemlerini kaydetmeye başla.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-0">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex-1 relative">
              <div className="flex flex-col items-center text-center px-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-500/10 text-mint-400 mb-5">
                  {s.icon}
                </div>
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-mint-500 text-ink-950 text-xs font-bold mb-3">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-paper-100 mb-2">{s.title}</h3>
                <p className="text-sm text-paper-300 leading-relaxed max-w-xs">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-mint-500/40 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
