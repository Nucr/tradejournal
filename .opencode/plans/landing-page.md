# Landing Page Plan — Ledger (Trade Journal)

## Amaç
`/` yolundaki mevcut spinner/yönlendirme sayfasını, ürünü tanıtan tam fonksiyonlu bir landing page ile değiştirmek.

## Teknoloji
- Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3
- Firebase Auth (auth-context ile mevcut)
- Dark-first tema, light mode uyumlu (mevcut CSS override'ları ile)
- Marka: **Ledger** — trade journal & performans defteri

---

## Dosya Yapısı

```
src/
├── app/
│   └── page.tsx                    # Ana landing page (section'ları birleştirir + auth yönlendirme)
├── components/
│   └── landing/
│       ├── Navbar.tsx              # Sticky navigasyon (logo + linkler + giriş/kayıt)
│       ├── HeroSection.tsx         # Büyük başlık, CTA, dashboard mockup
│       ├── FeaturesSection.tsx     # Özellik grid'i (6 kart)
│       ├── HowItWorksSection.tsx   # 3 adım
│       ├── StatsSection.tsx        # İstatistik kartları (3 metrik)
│       ├── TestimonialsSection.tsx # Kullanıcı yorumları (3 kart)
│       ├── CTASection.tsx          # Final CTA
│       └── Footer.tsx              # Alt bilgi
```

---

## Bileşen Detayları

### 1. Navbar (`Navbar.tsx`)
- **use client**, sticky (`fixed top-0`)
- Scroll durumuna göre arkaplan: `bg-transparent` -> `bg-ink-950/80 backdrop-blur-lg`
- Logo: "Ledger" (font-display, mint yeşili hover)
- Scroll linkleri (smooth scroll): Özellikler (#features), Nasıl Çalışır (#how-it-works), Yorumlar (#testimonials)
- Sağ tarafta auth durumu:
  - **Loading:** spinner
  - **Authenticated:** "Panoya Git" (mint buton -> /dashboard)
  - **Not authenticated:** "Giriş Yap" (link -> /login) + "Ücretsiz Başla" (mint buton -> /register)
- Transition: `transition-all duration-300`

### 2. Hero (`HeroSection.tsx`)
- **use client**, `min-h-screen`, flex layout
- Arkaplan: `bg-grid-fade` gradient efekti
- Sol taraf:
  - **Headline** (2 satır): "İşlemlerini Kaydet, Performansını Analiz Et"
  - **Subheadline** (paper-300, max-w-lg): Açıklama metni
  - 2 CTA butonu:
    - "Ücretsiz Başla" -> /register (bg-mint-500, birincil)
    - "Giriş Yap" -> /login (border-ink-700, ikincil)
  - **Stat badge**: "10.000+ işlem kaydedildi" küçük rozet
- Sağ taraf: Dashboard mockup (CSS ile stilize edilmiş ekran görüntüsü placeholder'ı — koyu kart, gradient ve ikonlarla)
- `animate-fade-in-up` animasyonu

### 3. Features (`FeaturesSection.tsx`)
- id="features", py-24
- Başlık: "Neler Yapabilirsin?" + alt metin
- 6 kart grid (3 sütun desktop, 2 tablet, 1 mobil)
- Her kart: SVG ikon (inline) + başlık + açıklama
- Kartlar:
  1. **İşlem Günlüğü** — "Ekran görüntüsü, giriş/çıkış, RR ve stratejiyle her işlemini kaydet."
  2. **Performans Analizi** — "Günlük, haftalık, aylık ve yıllık performansını interaktif grafiklerle takip et."
  3. **Liderlik Tablosu** — "Diğer traderlarla kıyaslanabilir puanınla rekabet et."
  4. **Strateji Takibi** — "Hangi stratejinin kârlı olduğunu gör, veriye dayalı kararlar al."
  5. **Başarımlar & Rütbeler** — "Oyunlaştırılmış rozet sistemiyle motivasyonunu yüksek tut."
  6. **Topluluk Mesajları** — "Diğer traderlarla iletişime geç, deneyim paylaş."
- Hover: `hover:border-mint-500/30 hover:bg-ink-850`
- Stagger animasyon

### 4. How It Works (`HowItWorksSection.tsx`)
- id="how-it-works", py-24, bg-ink-900/50 arkaplan
- Başlık: "Nasıl Çalışır?"
- 3 adım yatay (flex, responsive):
  1. **Hesap Oluştur** — "30 saniyede ücretsiz kaydol."
  2. **İşlemlerini Kaydet** — "Ekran görüntüsü, strateji ve notlarınla eksiksiz kaydet."
  3. **Performansını İzle** — "Detaylı analizlerle gelişimini takip et."
- Her adımda: step numarası (circle) + ikon + başlık + açıklama
- Adımlar arası çizgi bağlantı (responsive)

### 5. Stats (`StatsSection.tsx`)
- py-20
- 3 metrik yan yana:
  - "10.000+" — "İşlem Kaydedildi"
  - "500+" — "Aktif Trader"
  - "%92" — "Memnuniyet Oranı"
- Her metrik: büyük sayı (font-display, 4xl) + etiket
- İsteğe bağlı: IntersectionObserver ile sayı sayma animasyonu

### 6. Testimonials (`TestimonialsSection.tsx`)
- id="testimonials", py-24
- Başlık: "Traderlar Ne Diyor?"
- 3 yorum kartı (mock):
  - **Ali**, "Kripto Trader" — "Ledger sayesinde hangi stratejimin kârlı olduğunu net görebiliyorum."
  - **Zeynep**, "Swing Trader" — "Günlük performans grafiği en sevdiğim özellik. İlerlememi somut olarak görüyorum."
  - **Can**, "Scalper" — "Liderlik tablosu rekabeti artırıyor. Her gün kendimi geliştiriyorum."
- 3 sütun (desktop), 2 (tablet), 1 (mobil)
- Kart: icon + quote metni + isim + rütbe

### 7. CTA (`CTASection.tsx`)
- py-24, text-center
- Büyük başlık: "Hemen Başla, Ücretsiz"
- Alt metin: "Kredi kartı gerekmez. 30 saniyede kaydol, işlemlerini kaydetmeye başla."
- Büyük CTA butonu: "Ücretsiz Kaydol" -> /register (bg-mint-500, hover scale)
- İkincil: "Giriş Yap" -> /login

### 8. Footer (`Footer.tsx`)
- border-t border-ink-800, py-12
- 3 sütun:
  - **Ledger** — kısa açıklama + copyright
  - **Ürün** — Özellikler, Liderlik, Fiyatlandırma (# linkleri)
  - **Şirket** — Hakkında, İletişim, Gizlilik
- Alt satır: "© 2025 Ledger. Tüm hakları saklıdır."

---

## `page.tsx` Mantığı

```tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import StatsSection from "@/components/landing/StatsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner />;
  if (user) return null; // redirecting

  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </>
  );
}
```

---

## Animasyonlar
- Mevcut CSS animasyonları kullanılacak: `animate-fade-in-up`, `animate-scale-in`, `stagger-*`
- Section'lar scroll'da `IntersectionObserver` ile tetiklenebilir (küçük bir custom hook)
- Navbar scroll geçişi CSS transition ile
- CTA butonlarında hover scale efekti

## Tema
- Dark default, light mode otomatik (mevcut globals.css override'ları sayesinde)
- Navbar light mode override'ları globals.css'e eklenmeli
- Kartlarda light mode'da beyaz arkaplan sağlanmalı

## Yapılacaklar (Sıralı)
1. `src/components/landing/` dizinini oluştur
2. Navbar.tsx yaz
3. HeroSection.tsx yaz
4. FeaturesSection.tsx yaz
5. HowItWorksSection.tsx yaz
6. StatsSection.tsx yaz
7. TestimonialsSection.tsx yaz
8. CTASection.tsx yaz
9. Footer.tsx yaz
10. page.tsx'i güncelle
11. Light mode override'larını globals.css'e ekle
12. `npm run build` ile doğrula
