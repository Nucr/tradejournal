export type Locale = "tr" | "en";

export const translations: Record<Locale, Record<string, string>> = {
  tr: {
    /* Navbar */
    "nav.features": "Özellikler",
    "nav.howItWorks": "Nasıl Çalışır",
    "nav.testimonials": "Yorumlar",
    "nav.dashboard": "Panoya Git",
    "nav.login": "Giriş Yap",
    "nav.register": "Ücretsiz Başla",

    /* Hero */
    "hero.badge": "10.000+ işlem kaydedildi",
    "hero.title1": "İşlemlerini Kaydet,",
    "hero.title2": "Performansını Analiz Et",
    "hero.desc":
      "Ekran görüntüsü, strateji ve RR ile her işlemini tek bir deftere kaydet. Günlük, haftalık, aylık performansını interaktif grafiklerle takip et.",
    "hero.cta": "Ücretsiz Başla",
    "hero.login": "Giriş Yap",

    /* Features */
    "features.title": "Neler Yapabilirsin?",
    "features.desc":
      "Ledger ile işlemlerini kaydetmekten performans analizine, toplulukla iletişimden oyunlaştırılmış başarılara kadar her şey tek bir yerde.",
    "features.1.title": "İşlem Günlüğü",
    "features.1.desc":
      "Ekran görüntüsü, giriş/çıkış, RR ve stratejiyle her işlemini eksiksiz kaydet.",
    "features.2.title": "Performans Analizi",
    "features.2.desc":
      "Günlük, haftalık, aylık ve yıllık performansını interaktif grafiklerle takip et.",
    "features.3.title": "Liderlik Tablosu",
    "features.3.desc":
      "Diğer traderlarla kıyaslanabilir puanınla rekabet et ve kendini geliştir.",
    "features.4.title": "Strateji Takibi",
    "features.4.desc":
      "Hangi stratejinin kârlı olduğunu gör, veriye dayalı kararlar al ve optimize et.",
    "features.5.title": "Başarımlar & Rütbeler",
    "features.5.desc":
      "Oyunlaştırılmış rozet sistemiyle motivasyonunu yüksek tut, ilerlemeni gör.",
    "features.6.title": "Topluluk Mesajları",
    "features.6.desc":
      "Diğer traderlarla iletişime geç, stratejilerini tartış ve deneyim paylaş.",

    /* How It Works */
    "how.title": "Nasıl Çalışır?",
    "how.desc": "Üç basit adımda işlemlerini kaydetmeye başla.",
    "how.1.title": "Hesap Oluştur",
    "how.1.desc":
      "30 saniyede ücretsiz kaydol, hemen kullanmaya başla. Kredi kartı gerekmez.",
    "how.2.title": "İşlemlerini Kaydet",
    "how.2.desc":
      "Ekran görüntüsü, strateji ve notlarınla her işlemini eksiksiz kaydet ve etiketle.",
    "how.3.title": "Performansını İzle",
    "how.3.desc":
      "Detaylı analizler ve grafiklerle gelişimini takip et, veriye dayalı kararlar al.",

    /* Stats */
    "stats.trades": "İşlem Kaydedildi",
    "stats.traders": "Aktif Trader",
    "stats.satisfaction": "Memnuniyet Oranı",

    /* Testimonials */
    "testimonials.title": "Traderlar Ne Diyor?",
    "testimonials.desc":
      "Binlerce trader işlemlerini Ledger ile kaydediyor ve performansını analiz ediyor.",
    "testimonials.1.quote":
      "Ledger sayesinde hangi stratejimin kârlı olduğunu net görebiliyorum. Performans grafikleri sayesinde zayıf yönlerimi keşfettim.",
    "testimonials.1.name": "Ali",
    "testimonials.1.role": "Kripto Trader",
    "testimonials.2.quote":
      "Günlük performans grafiği en sevdiğim özellik. İlerlememi somut olarak görmek motivasyonumu katlıyor.",
    "testimonials.2.name": "Zeynep",
    "testimonials.2.role": "Swing Trader",
    "testimonials.3.quote":
      "Liderlik tablosu rekabeti artırıyor. Her gün kendimi geliştiriyorum ve diğer traderlarla kıyaslanmak beni daha hırslı yapıyor.",
    "testimonials.3.name": "Can",
    "testimonials.3.role": "Scalper",

    /* CTA */
    "cta.title": "Hemen Başla, Ücretsiz",
    "cta.desc":
      "Kredi kartı gerekmez. 30 saniyede kaydol, işlemlerini kaydetmeye ve performansını analiz etmeye başla.",
    "cta.register": "Ücretsiz Kaydol",
    "cta.login": "Giriş Yap",

    /* Footer */
    "footer.tagline": "Trade journal & performans defteri. İşlemlerini kaydet, performansını analiz et, toplulukla rekabet et.",
    "footer.product": "Ürün",
    "footer.features": "Özellikler",
    "footer.testimonials": "Yorumlar",
    "footer.register": "Kayıt Ol",
    "footer.company": "Şirket",
    "footer.about": "Hakkında",
    "footer.contact": "İletişim",
    "footer.privacy": "Gizlilik",
    "footer.copyright": "Tüm hakları saklıdır.",
  },
  en: {
    /* Navbar */
    "nav.features": "Features",
    "nav.howItWorks": "How It Works",
    "nav.testimonials": "Testimonials",
    "nav.dashboard": "Go to Dashboard",
    "nav.login": "Log In",
    "nav.register": "Get Started Free",

    /* Hero */
    "hero.badge": "10,000+ trades logged",
    "hero.title1": "Log Your Trades,",
    "hero.title2": "Analyze Your Performance",
    "hero.desc":
      "Save every trade with screenshots, strategy, and RR in one journal. Track daily, weekly, and monthly performance with interactive charts.",
    "hero.cta": "Get Started Free",
    "hero.login": "Log In",

    /* Features */
    "features.title": "What Can You Do?",
    "features.desc":
      "From trade logging to performance analysis, community messaging to gamified achievements — everything in one place.",
    "features.1.title": "Trade Journal",
    "features.1.desc":
      "Log every trade completely with screenshots, entry/exit, RR, and strategy.",
    "features.2.title": "Performance Analytics",
    "features.2.desc":
      "Track daily, weekly, monthly, and yearly performance with interactive charts.",
    "features.3.title": "Leaderboard",
    "features.3.desc":
      "Compete with other traders using your comparable score and improve yourself.",
    "features.4.title": "Strategy Tracking",
    "features.4.desc":
      "See which strategies are profitable, make data-driven decisions and optimize.",
    "features.5.title": "Achievements & Ranks",
    "features.5.desc":
      "Keep your motivation high with a gamified badge system and track your progress.",
    "features.6.title": "Community Messages",
    "features.6.desc":
      "Connect with other traders, discuss strategies, and share experiences.",

    /* How It Works */
    "how.title": "How It Works",
    "how.desc": "Start logging your trades in three simple steps.",
    "how.1.title": "Create Account",
    "how.1.desc":
      "Sign up free in 30 seconds and start using immediately. No credit card required.",
    "how.2.title": "Log Your Trades",
    "how.2.desc":
      "Save and tag every trade completely with screenshots, strategy, and notes.",
    "how.3.title": "Track Performance",
    "how.3.desc":
      "Follow your progress with detailed analytics and charts, make data-driven decisions.",

    /* Stats */
    "stats.trades": "Trades Logged",
    "stats.traders": "Active Traders",
    "stats.satisfaction": "Satisfaction Rate",

    /* Testimonials */
    "testimonials.title": "What Traders Say",
    "testimonials.desc":
      "Thousands of traders log their trades with Ledger and analyze their performance.",
    "testimonials.1.quote":
      "Thanks to Ledger, I can clearly see which of my strategies are profitable. Performance charts helped me discover my weaknesses.",
    "testimonials.1.name": "Ali",
    "testimonials.1.role": "Crypto Trader",
    "testimonials.2.quote":
      "The daily performance chart is my favorite feature. Seeing my progress visually doubles my motivation.",
    "testimonials.2.name": "Zeynep",
    "testimonials.2.role": "Swing Trader",
    "testimonials.3.quote":
      "The leaderboard boosts competition. I improve every day and comparing with other traders makes me more ambitious.",
    "testimonials.3.name": "Can",
    "testimonials.3.role": "Scalper",

    /* CTA */
    "cta.title": "Start Now, It's Free",
    "cta.desc":
      "No credit card required. Sign up in 30 seconds and start logging your trades and analyzing performance.",
    "cta.register": "Sign Up Free",
    "cta.login": "Log In",

    /* Footer */
    "footer.tagline": "Trade journal & performance notebook. Log your trades, analyze performance, compete with the community.",
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.testimonials": "Testimonials",
    "footer.register": "Sign Up",
    "footer.company": "Company",
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",
    "footer.copyright": "All rights reserved.",
  },
};
