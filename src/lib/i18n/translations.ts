export type Locale = "tr" | "en";

export const translations: Record<Locale, Record<string, string>> = {
  tr: {
    /* Navbar */
    "nav.features": "Özellikler",
    "nav.howItWorks": "Nasıl Çalışır",
    "nav.testimonials": "Yorumlar",
    "nav.plans": "Planlar",
    "nav.dashboard": "Panoya Git",
    "nav.subscription": "Abonelik",
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
      "Verifter ile işlemlerini kaydetmekten performans analizine, toplulukla iletişimden oyunlaştırılmış başarılara kadar her şey tek bir yerde.",
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
      "Binlerce trader işlemlerini Verifter ile kaydediyor ve performansını analiz ediyor.",
    "testimonials.1.quote":
      "Verifter sayesinde hangi stratejimin kârlı olduğunu net görebiliyorum. Performans grafikleri sayesinde zayıf yönlerimi keşfettim.",
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
    "faq.1.q": "Verifter ücretsiz mi?",
    "faq.1.a": "Evet! Verifter temel özellikleriyle tamamen ücretsizdir. İstersen daha gelişmiş özellikler için Premium plana geçebilirsin.",
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
    "pricing.free.feature3": "Liderlik tablosu (maskeli)",
    "pricing.free.feature4": "Temel grafikler",
    "pricing.free.feature5": "1 strateji, 3 hedef",
    "pricing.free.feature6": "İşlem paylaşma",
    "pricing.free.cta": "Ücretsiz Başla",
    "pricing.pro.name": "Pro",
    "pricing.pro.price": "4.99",
    "pricing.pro.period": "/ay",
    "pricing.pro.desc": "Profesyonel traderlar için gelişmiş özellikler",
    "pricing.pro.badge": "POPÜLER",
    "pricing.pro.feature1": "1.000 işlem kaydı",
    "pricing.pro.feature2": "Gelişmiş analitik & grafikler",
    "pricing.pro.feature3": "Takvim görünümü",
    "pricing.pro.feature4": "CSV içe aktarma",
    "pricing.pro.feature5": "Mesajlaşma & gruplar",
    "pricing.pro.feature6": "5 strateji, sınırsız hedef",
    "pricing.pro.feature7": "Tema rengi özelleştirme",
    "pricing.pro.cta": "Pro'ya Geç",
    "pricing.premium.name": "Premium",
    "pricing.premium.price": "9.99",
    "pricing.premium.period": "/ay",
    "pricing.premium.desc": "Profesyonel traderlar için tüm özellikler",
    "pricing.premium.feature1": "Sınırsız işlem kaydı",
    "pricing.premium.feature2": "PDF/CSV dışa aktarma",
    "pricing.premium.feature3": "Strateji görselleri (Cloudinary)",
    "pricing.premium.feature4": "API erişimi",
    "pricing.premium.feature5": "Sınırsız strateji",
    "pricing.premium.feature6": "Öncelikli destek",
    "pricing.premium.cta": "Premium'a Geç",

    /* Achievements */
    "achievements.first_trade.label": "İlk Adım",
    "achievements.first_trade.desc": "İlk işlemini ekledin",
    "achievements.ten_trades.label": "Isınıyor",
    "achievements.ten_trades.desc": "10 işlem tamamladın",
    "achievements.fifty_trades.label": "Deneyimli",
    "achievements.fifty_trades.desc": "50 işlem tamamladın",
    "achievements.trades_100.label": "Yüzlük",
    "achievements.trades_100.desc": "100 işlem tamamladın",
    "achievements.trades_500.label": "Efsanevi Sayı",
    "achievements.trades_500.desc": "500 işlem tamamladın",
    "achievements.win_streak_5.label": "Seri Yapıyor",
    "achievements.win_streak_5.desc": "5 ardışık kârlı işlem",
    "achievements.win_streak_10.label": "Ateş Serisi",
    "achievements.win_streak_10.desc": "10 ardışık kârlı işlem",
    "achievements.rr_master.label": "R:R Ustası",
    "achievements.rr_master.desc": "Ort. RR 2.0+ (min 10 tr)",
    "achievements.rr_legend.label": "R:R Efsanesi",
    "achievements.rr_legend.desc": "Ort. RR 3.0+ (min 25 tr)",
    "achievements.win_rate_60.label": "Keskin Nişancı",
    "achievements.win_rate_60.desc": "%60+ kazanma (min 20 tr)",
    "achievements.win_rate_75.label": "Suikastçı",
    "achievements.win_rate_75.desc": "%75+ kazanma (min 20 tr)",
    "achievements.consistent.label": "İstikrarlı",
    "achievements.consistent.desc": "30 günde 20+ işlem",
    "achievements.profit_500.label": "Kârda",
    "achievements.profit_500.desc": "Toplam $500+ net kâr",
    "achievements.profit_5000.label": "Kâr Krallığı",
    "achievements.profit_5000.desc": "Toplam $5.000+ net kâr",
    "achievements.level_5.label": "Uzman",
    "achievements.level_5.desc": "Seviye 5'e ulaştın",
    "achievements.level_10.label": "Efsanevi",
    "achievements.level_10.desc": "Maksimum seviyeye ulaştın",
    "achievements.comeback.label": "Diriliş",
    "achievements.comeback.desc": "3+ ardışık zarardan dönüş",
    "achievements.marathon.label": "Maraton",
    "achievements.marathon.desc": "En az 6 aydır aktif trade",
    "achievements.all_rounder.label": "Çok Yönlü",
    "achievements.all_rounder.desc": "8+ farklı paritede işlem",
    "achievements.immortal.label": "Ölümsüz",
    "achievements.immortal.desc": "200+ trade, %55+ WR, 2.0+ RR",

    /* Sidebar */
    "sidebar.overview": "Genel Bakış",
    "sidebar.journal": "Trade Defteri",
    "sidebar.messages": "Mesajlar",
    "sidebar.friends": "Arkadaşlar",
    "sidebar.discover": "Keşfet",
    "sidebar.users": "Kullanıcılar",
    "sidebar.accounts": "Hesaplar",
    "sidebar.calendar": "İşlem Takvimi",
    "sidebar.analytics": "Analitik",
    "sidebar.strategies": "Stratejiler",
    "sidebar.leaderboard": "Liderlik",
    "sidebar.reports": "Raporlar",
    "sidebar.billing": "Abonelik",
    "sidebar.settings": "Ayarlar",
    "sidebar.logout": "Çıkış yap",
    "sidebar.menu_toggle": "Menüyü aç/kapa",
    "sidebar.collapse": "Menüyü daralt",
    "sidebar.expand": "Menüyü genişlet",
    "sidebar.trade_journal_sub": "İşlem Günlüğü",

    /* Admin sidebar */
    "admin.panel": "Panel",
    "admin.users": "Kullanıcılar",
    "admin.trades": "İşlemler",
    "admin.strategies": "Stratejiler",
    "admin.leaderboard": "Liderlik",

    /* Date range */
    "daterange.today": "Bugün",
    "daterange.week": "Hafta",
    "daterange.month": "Ay",
    "daterange.year": "Yıl",
    "daterange.all": "Tümü",
    "daterange.custom": "Özel",
    "daterange.start": "Başlangıç",
    "daterange.end": "Bitiş",

    /* Auth brand */
    "auth.tagline": "trade journal & performans defteri",
    "auth.recent": "son kayıtlar",
    "auth.description": "Her işlemin ekran görüntüsü, RR'ı ve stratejisiyle tek bir deftere işlenir. Günlük, haftalık, aylık ve yıllık performansını tek bakışta gör.",

    /* Confirm dialog */
    "confirm.confirm": "Onayla",
    "confirm.cancel": "İptal",
    "confirm.processing": "İşleniyor...",

    /* Toast */
    "toast.new_achievement": "Yeni Rozet!",
    "toast.avatar_updated": "Avatar güncellendi",
    "toast.avatar_removed": "Avatar kaldırıldı",
    "toast.upload_failed": "Yükleme başarısız",
    "toast.unknown_error": "Bilinmeyen hata",

    /* Errors */
    "error.strategy_create": "Strateji oluşturulamadı",
    "error.file_too_large": "dosyası çok büyük",
    "error.max_images": "En fazla {count} görsel yüklenebilir.",

    /* Profile */
    "profile.shared_trades": "Paylaşılan İşlemlerim",
    "profile.default_name": "Trader",
  },
  en: {
    /* Navbar */
    "nav.features": "Features",
    "nav.howItWorks": "How It Works",
    "nav.testimonials": "Testimonials",
    "nav.plans": "Plans",
    "nav.dashboard": "Go to Dashboard",
    "nav.subscription": "Subscription",
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
      "Thousands of traders log their trades with Verifter and analyze their performance.",
    "testimonials.1.quote":
      "Thanks to Verifter, I can clearly see which of my strategies are profitable. Performance charts helped me discover my weaknesses.",
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
    "faq.1.q": "Is Verifter free?",
    "faq.1.a": "Yes! Verifter is completely free with its core features. You can upgrade to Premium for more advanced features.",
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
    "pricing.desc": "Start with a plan that fits your needs, upgrade anytime.",
    "pricing.free.name": "Free",
    "pricing.free.price": "0",
    "pricing.free.period": "/mo",
    "pricing.free.desc": "Basic features for individual traders",
    "pricing.free.feature1": "100 trade entries",
    "pricing.free.feature2": "Basic statistics",
    "pricing.free.feature3": "Leaderboard (masked)",
    "pricing.free.feature4": "Basic charts",
    "pricing.free.feature5": "1 strategy, 3 goals",
    "pricing.free.feature6": "Trade sharing",
    "pricing.free.cta": "Get Started Free",
    "pricing.pro.name": "Pro",
    "pricing.pro.price": "4.99",
    "pricing.pro.period": "/mo",
    "pricing.pro.desc": "Advanced features for serious traders",
    "pricing.pro.badge": "POPULAR",
    "pricing.pro.feature1": "1,000 trade entries",
    "pricing.pro.feature2": "Advanced analytics & charts",
    "pricing.pro.feature3": "Calendar view",
    "pricing.pro.feature4": "CSV import",
    "pricing.pro.feature5": "Messaging & groups",
    "pricing.pro.feature6": "5 strategies, unlimited goals",
    "pricing.pro.feature7": "Theme customization",
    "pricing.pro.cta": "Go Pro",
    "pricing.premium.name": "Premium",
    "pricing.premium.price": "9.99",
    "pricing.premium.period": "/mo",
    "pricing.premium.desc": "All features for professional traders",
    "pricing.premium.feature1": "Unlimited trade entries",
    "pricing.premium.feature2": "PDF/CSV export",
    "pricing.premium.feature3": "Strategy images (Cloudinary)",
    "pricing.premium.feature4": "API access",
    "pricing.premium.feature5": "Unlimited strategies",
    "pricing.premium.feature6": "Priority support",
    "pricing.premium.cta": "Go Premium",

    /* Achievements */
    "achievements.first_trade.label": "First Step",
    "achievements.first_trade.desc": "Added your first trade",
    "achievements.ten_trades.label": "Warming Up",
    "achievements.ten_trades.desc": "Completed 10 trades",
    "achievements.fifty_trades.label": "Experienced",
    "achievements.fifty_trades.desc": "Completed 50 trades",
    "achievements.trades_100.label": "Century",
    "achievements.trades_100.desc": "Completed 100 trades",
    "achievements.trades_500.label": "Legendary Numbers",
    "achievements.trades_500.desc": "Completed 500 trades",
    "achievements.win_streak_5.label": "On a Streak",
    "achievements.win_streak_5.desc": "5 consecutive winning trades",
    "achievements.win_streak_10.label": "Fire Streak",
    "achievements.win_streak_10.desc": "10 consecutive winning trades",
    "achievements.rr_master.label": "RR Master",
    "achievements.rr_master.desc": "Avg RR 2.0+ (min 10 tr)",
    "achievements.rr_legend.label": "RR Legend",
    "achievements.rr_legend.desc": "Avg RR 3.0+ (min 25 tr)",
    "achievements.win_rate_60.label": "Sharpshooter",
    "achievements.win_rate_60.desc": "60%+ win rate (min 20 tr)",
    "achievements.win_rate_75.label": "Assassin",
    "achievements.win_rate_75.desc": "75%+ win rate (min 20 tr)",
    "achievements.consistent.label": "Consistent",
    "achievements.consistent.desc": "20+ trades in 30 days",
    "achievements.profit_500.label": "Profitable",
    "achievements.profit_500.desc": "$500+ total net profit",
    "achievements.profit_5000.label": "Profit Kingdom",
    "achievements.profit_5000.desc": "$5,000+ total net profit",
    "achievements.level_5.label": "Expert",
    "achievements.level_5.desc": "Reached Level 5",
    "achievements.level_10.label": "Legendary",
    "achievements.level_10.desc": "Reached maximum level",
    "achievements.comeback.label": "Comeback",
    "achievements.comeback.desc": "Comeback from 3+ consecutive losses",
    "achievements.marathon.label": "Marathon",
    "achievements.marathon.desc": "Active trading for at least 6 months",
    "achievements.all_rounder.label": "All-rounder",
    "achievements.all_rounder.desc": "Traded 8+ different pairs",
    "achievements.immortal.label": "Immortal",
    "achievements.immortal.desc": "200+ trades, 55%+ WR, 2.0+ RR",

    /* Sidebar */
    "sidebar.overview": "Overview",
    "sidebar.journal": "Trade Journal",
    "sidebar.messages": "Messages",
    "sidebar.friends": "Friends",
    "sidebar.discover": "Discover",
    "sidebar.users": "Users",
    "sidebar.accounts": "Accounts",
    "sidebar.calendar": "Trade Calendar",
    "sidebar.analytics": "Analytics",
    "sidebar.strategies": "Strategies",
    "sidebar.leaderboard": "Leaderboard",
    "sidebar.reports": "Reports",
    "sidebar.billing": "Subscription",
    "sidebar.settings": "Settings",
    "sidebar.logout": "Log out",
    "sidebar.menu_toggle": "Toggle menu",
    "sidebar.collapse": "Collapse menu",
    "sidebar.expand": "Expand menu",
    "sidebar.trade_journal_sub": "Trade Journal",

    /* Admin sidebar */
    "admin.panel": "Panel",
    "admin.users": "Users",
    "admin.trades": "Trades",
    "admin.strategies": "Strategies",
    "admin.leaderboard": "Leaderboard",

    /* Date range */
    "daterange.today": "Today",
    "daterange.week": "Week",
    "daterange.month": "Month",
    "daterange.year": "Year",
    "daterange.all": "All",
    "daterange.custom": "Custom",
    "daterange.start": "Start",
    "daterange.end": "End",

    /* Auth brand */
    "auth.tagline": "trade journal & performance notebook",
    "auth.recent": "recent entries",
    "auth.description": "Every trade with screenshot, RR, and strategy is logged in a single journal. See your daily, weekly, monthly, and yearly performance at a glance.",

    /* Confirm dialog */
    "confirm.confirm": "Confirm",
    "confirm.cancel": "Cancel",
    "confirm.processing": "Processing...",

    /* Toast */
    "toast.new_achievement": "New Badge!",
    "toast.avatar_updated": "Avatar updated",
    "toast.avatar_removed": "Avatar removed",
    "toast.upload_failed": "Upload failed",
    "toast.unknown_error": "Unknown error",

    /* Errors */
    "error.strategy_create": "Failed to create strategy",
    "error.file_too_large": "file is too large",
    "error.max_images": "Maximum {count} images allowed.",

    /* Profile */
    "profile.shared_trades": "My Shared Trades",
    "profile.default_name": "Trader",
  },
};
