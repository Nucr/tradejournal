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

    /* FAQ */
    "faq.title": "Sık Sorulan Sorular",
    "faq.desc": "Merak ettiklerin için cevaplar burada.",
    "faq.1.q": "Ledger ücretsiz mi?",
    "faq.1.a": "Evet! Ledger temel özellikleriyle tamamen ücretsizdir. İstersen daha gelişmiş özellikler için Premium plana geçebilirsin.",
    "faq.2.q": "Verilerim güvende mi?",
    "faq.2.a": "Tüm verilerin Firebase altyapısında 256-bit AES şifreleme ile korunur. Google Cloud sunucularında saklanır ve yalnızca sana açıktır.",
    "faq.3.q": "Hangi piyasaları destekliyor?",
    "faq.3.a": "Tüm piyasaları destekliyoruz. Forex, kripto, hisse senedi, emtia, endeks — hangi enstrümanda işlem yapıyorsan kaydedebilirsin.",
    "faq.4.q": "İşlemlerimi dışa aktarabilir miyim?",
    "faq.4.a": "Evet, tüm işlemlerini CSV ve PDF formatında dışa aktarabilirsin (Premium özellik).",
    "faq.5.q": "Mobil uygulama var mı?",
    "faq.5.a": "Henüz native mobil uygulamamız yok ancak web sürümümüz mobil tarayıcılarda kusursuz çalışır. PWA desteği ile ana ekrana ekleyip uygulama gibi kullanabilirsin.",
    "faq.6.q": "Hesabımı silebilir miyim?",
    "faq.6.a": "Evet, ayarlar sayfasından hesabını ve tüm verilerini kalıcı olarak silebilirsin.",

    /* Trust */
    "trust.title": "Güvenli ve Güvenilir",
    "trust.desc": "Verilerin uçtan uca şifrelenir, endüstri standardı güvenlik önlemleriyle korunur.",
    "trust.1": "SSL Şifreli",
    "trust.2": "Firebase Altyapı",
    "trust.3": "256-bit Şifreleme",
    "trust.4": "Google Authentication",
    "trust.5": "KVKK/GDPR Uyumlu",

    /* Newsletter */
    "newsletter.title": "Gelişmelerden Haberdar Ol",
    "newsletter.desc": "Yeni özellikler, ipuçları ve güncellemeler için bültenimize abone ol.",
    "newsletter.placeholder": "E-posta adresin",
    "newsletter.button": "Abone Ol",
    "newsletter.success": "Abone oldun! 🎉",
    "newsletter.error": "Geçersiz e-posta adresi.",

    /* Pricing */
    "pricing.title": "Planını Seç",
    "pricing.desc": "İhtiyacına uygun planla başla, istediğin zaman yükseltebilirsin.",
    "pricing.free.name": "Ücretsiz",
    "pricing.free.price": "0",
    "pricing.free.period": "/ay",
    "pricing.free.desc": "Bireysel traderlar için temel özellikler",
    "pricing.free.feature1": "100 işlem kaydı",
    "pricing.free.feature2": "Temel istatistikler",
    "pricing.free.feature3": "Liderlik tablosu",
    "pricing.free.feature4": "Temel grafikler",
    "pricing.free.cta": "Ücretsiz Başla",
    "pricing.pro.name": "Premium",
    "pricing.pro.price": "9.99",
    "pricing.pro.period": "/ay",
    "pricing.pro.desc": "Profesyonel traderlar için tüm özellikler",
    "pricing.pro.badge": "POPÜLER",
    "pricing.pro.feature1": "Sınırsız işlem kaydı",
    "pricing.pro.feature2": "Gelişmiş analitik & grafikler",
    "pricing.pro.feature3": "PDF/CSV dışa aktarma",
    "pricing.pro.feature4": "API erişimi",
    "pricing.pro.feature5": "Öncelikli destek",
    "pricing.pro.cta": "Premium'a Geç",
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

    /* FAQ */
    "faq.title": "Frequently Asked Questions",
    "faq.desc": "Answers to your questions are here.",
    "faq.1.q": "Is Ledger free?",
    "faq.1.a": "Yes! Ledger is completely free with its core features. You can upgrade to Premium for more advanced features.",
    "faq.2.q": "Is my data safe?",
    "faq.2.a": "All your data is protected with 256-bit AES encryption on Firebase infrastructure. Stored on Google Cloud servers and accessible only to you.",
    "faq.3.q": "Which markets do you support?",
    "faq.3.a": "We support all markets. Forex, crypto, stocks, commodities, indices — whatever instrument you trade, you can log it.",
    "faq.4.q": "Can I export my trades?",
    "faq.4.a": "Yes, you can export all your trades in CSV and PDF format (Premium feature).",
    "faq.5.q": "Is there a mobile app?",
    "faq.5.a": "We don't have a native mobile app yet, but our web version works perfectly on mobile browsers. You can add it to your home screen with PWA support.",
    "faq.6.q": "Can I delete my account?",
    "faq.6.a": "Yes, you can permanently delete your account and all your data from the settings page.",

    /* Trust */
    "trust.title": "Secure & Trustworthy",
    "trust.desc": "Your data is end-to-end encrypted and protected by industry-standard security measures.",
    "trust.1": "SSL Encrypted",
    "trust.2": "Firebase Infrastructure",
    "trust.3": "256-bit Encryption",
    "trust.4": "Google Authentication",
    "trust.5": "GDPR Compliant",

    /* Newsletter */
    "newsletter.title": "Stay Updated",
    "newsletter.desc": "Subscribe to our newsletter for new features, tips, and updates.",
    "newsletter.placeholder": "Your email address",
    "newsletter.button": "Subscribe",
    "newsletter.success": "You're subscribed! 🎉",
    "newsletter.error": "Invalid email address.",

    /* Pricing */
    "pricing.title": "Choose Your Plan",
    "pricing.desc": "Start with the plan that fits your needs, upgrade anytime.",
    "pricing.free.name": "Free",
    "pricing.free.price": "0",
    "pricing.free.period": "/mo",
    "pricing.free.desc": "Core features for individual traders",
    "pricing.free.feature1": "100 trade entries",
    "pricing.free.feature2": "Basic statistics",
    "pricing.free.feature3": "Leaderboard access",
    "pricing.free.feature4": "Basic charts",
    "pricing.free.cta": "Start Free",
    "pricing.pro.name": "Premium",
    "pricing.pro.price": "9.99",
    "pricing.pro.period": "/mo",
    "pricing.pro.desc": "All features for professional traders",
    "pricing.pro.badge": "POPULAR",
    "pricing.pro.feature1": "Unlimited trade entries",
    "pricing.pro.feature2": "Advanced analytics & charts",
    "pricing.pro.feature3": "PDF/CSV export",
    "pricing.pro.feature4": "API access",
    "pricing.pro.feature5": "Priority support",
    "pricing.pro.cta": "Go Premium",
  },
};
