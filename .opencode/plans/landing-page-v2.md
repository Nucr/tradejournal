# Landing Page Ek Özellikler Planı

## 1. FAQ (Accordion) Bölümü

### Dosyalar
- `src/components/landing/FAQSection.tsx` — yeni
- `src/lib/i18n/translations.ts` — FAQ metinleri eklenecek (tr/en)
- `src/app/page.tsx` — FAQSection import + sıralama

### İçerik
6-8 sık sorulan soru, accordion formatında (tıkla aç/kapa):
- "Ledger ücretsiz mi?" / "Is Ledger free?"
- "Verilerim güvende mi?" / "Is my data safe?"
- "Hangi piyasaları destekliyor?" / "Which markets are supported?"
- "TradingView entegrasyonu var mı?" / "Is TradingView integrated?"
- "İşlemlerimi dışa aktarabilir miyim?" / "Can I export my trades?"
- "Mobil uygulama var mı?" / "Is there a mobile app?"

### Bileşen Detayı
- `useState` ile açık olan soru index'i tutulur
- Her FAQ item: soru metni + açılıp kapanan cevap
- Animasyon: `max-height` transition veya `animate-slide-up`
- İkon: `+` / `−` veya chevron SVG
- `useInView` ile scroll reveal

---

## 2. Scroll to Top Butonu

### Dosyalar
- `src/components/landing/ScrollToTop.tsx` — yeni

### Bileşen Detayı
- `fixed bottom-6 right-6 z-40`
- `useState` ile scroll pozisyonu takibi (`window.scrollY > 300`)
- Görünür olduğunda `opacity-100 translate-y-0`, değilken `opacity-0 translate-y-4 pointer-events-none`
- Tıklandığında `window.scrollTo({ top: 0, behavior: "smooth" })`
- İkon: yukarı ok SVG, `bg-mint-500` daire içinde
- Hover: scale + glow
- Sayfa boyunca görünür, tüm section'lardan bağımsız

---

## 3. SEO & OG Meta İyileştirmeleri

### Dosyalar
- `src/app/layout.tsx` — metadata güncellenecek
- `public/og-image.png` — yeni (opsiyonel)

### Yapılacaklar
1. **metadata** nesnesi genişletilecek:
   ```ts
   export const metadata: Metadata = {
     title: {
       default: "Ledger — Trade Journal & Performans Defteri",
       template: "%s | Ledger",
     },
     description: "İşlemlerini kaydet, performansını analiz et. Ekran görüntüsü, strateji ve RR ile her işlemini tek bir deftere kaydet.",
     keywords: ["trade journal", "işlem günlüğü", "trader", "performans analizi", "forex", "kripto"],
     openGraph: {
       title: "Ledger — Trade Journal & Performans Defteri",
       description: "İşlemlerini kaydet, performansını analiz et.",
       url: "https://ledger.app",
       siteName: "Ledger",
       locale: "tr_TR",
       type: "website",
     },
     twitter: {
       card: "summary_large_image",
       title: "Ledger — Trade Journal",
       description: "İşlemlerini kaydet, performansını analiz et.",
     },
     robots: { index: true, follow: true },
   };
   ```

2. **JSON-LD Structured Data** — layout.tsx içine script:
   ```ts
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{
       __html: JSON.stringify({
         "@context": "https://schema.org",
         "@type": "SoftwareApplication",
         name: "Ledger",
         applicationCategory: "BusinessApplication",
         operatingSystem: "Web",
         description: "Trade journal & performans defteri",
         offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
       }),
     }}
   />
   ```

3. **OG Image** (opsiyonel) — `public/og-image.png` 1200x630px

---

## 4. Trust Badges Bölümü

### Dosyalar
- `src/components/landing/TrustBadgesSection.tsx` — yeni
- `src/app/page.tsx` — eklenecek

### Bileşen Detayı
- Section id: `trust`
- Sadece ikon + metin, minimal tasarım
- 4-5 badge yatay grid:
  - 🔒 SSL Şifreli / SSL Encrypted
  - ☁️ Firebase Altyapı / Firebase Infrastructure
  - 🏦 256-bit Şifreleme / 256-bit Encryption
  - 🔑 Google Authentication
  - 📋 KVKK/GDPR Uyumlu / GDPR Compliant
- Her badge: ikon (emoji veya inline SVG) + kısa metin
- `useInView` scroll reveal
- Footer'dan hemen önce veya CTA'dan sonra

---

## 5. Pricing Bölümü

### Dosyalar
- `src/components/landing/PricingSection.tsx` — yeni
- `src/lib/i18n/translations.ts` — pricing metinleri
- `src/app/page.tsx` — eklenecek

### Kartlar
**Free (Ücretsiz)**
- 0 TL/ay
- 100 işlem kaydı
- Temel istatistikler
- Liderlik tablosu
- ~~Gelişmiş analitik~~
- ~~API erişimi~~
- CTA: "Ücretsiz Başla" → /register

**Premium (Pro)**
- 9.99 USD/ay veya 99 USD/yıl
- Sınırsız işlem kaydı
- Tüm grafikler + gelişmiş analitik
- API erişimi
- PDF/CSV export
- Öncelikli destek
- CTA: "Premium'a Geç" → /register?plan=pro (veya disabled)

### Bileşen Detayı
- 2 kart yan yana (free vs pro)
- Pro kartı "POPÜLER" veya "ÖNERİLEN" badge'i
- Aylık / Yıllık toggle (opsiyonel)
- `useInView` scroll reveal
- Hover: kart yükselme efekti
- Pro kartı border: `border-mint-500`

---

## 6. i18n URL Routing (`/en`, `/tr`)

### Yapılacaklar
1. **Kök layout** `lang` attribute'u locale'e göre dinamik olmalı
2. **i18n context** başlangıç dilini URL'den almalı:
   - `/` → tr (default)
   - `/en` → English
   - `/tr` → Türkçe
3. **Middleware** `src/middleware.ts` ile yönlendirme
4. **LanguageToggle** butonu route'lar arası geçiş yapmalı

### Dizin Yapısı
```
src/
  app/
    [locale]/
      page.tsx          # landing page locale wrapper
      layout.tsx        # locale layout
      ...
    page.tsx            # redirect to /tr (default)
    layout.tsx          # kök layout
  middleware.ts          # locale redirect
```

### Detay
- Next.js App Router `[locale]` dynamic segment
- Middleware: `Accept-Language` header'a göre yönlendirme, cookie'de locale saklama
- `I18nProvider` locale'i URL'den alsın
- Tüm landing page route'ları locale altına taşınsın
- `LanguageToggle` → `router.push(`/${newLocale}`)`

### Dikkat Edilmesi Gerekenler
- Auth sayfaları (`/login`, `/register`) da locale altına taşınmalı mı?
  - Öneri: hayır, sadece landing page locale'li olsun. Auth sayfaları `/login`, `/register` sabit kalsın.
- SEO için canonical URL'ler önemli

---

## 7. Newsletter Bölümü

### Dosyalar
- `src/components/landing/NewsletterSection.tsx` — yeni
- `src/lib/i18n/translations.ts` — newsletter metinleri

### Bileşen Detayı
- Minimal input + buton formu
- Email input + "Abone Ol" / "Subscribe" butonu
- placeholder: "E-posta adresin" / "Your email address"
- Success state: "Abone oldunuz! 🎉" / "You're subscribed! 🎉"
- Error state: geçersiz email mesajı
- Backend: Firebase extension veya basit API route (`/api/subscribe`)
  - Not: Şimdilik sadece frontend, backend sonra eklenir
- `useInView` scroll reveal
- Footer'dan hemen önce

---

## Sıralama & İş Akışı

| Adım | Özellik | Tahmini Süre |
|------|---------|-------------|
| 1 | Scroll to Top | 15 dk |
| 2 | SEO / OG Meta | 15 dk |
| 3 | FAQ (Accordion) | 30 dk |
| 4 | Trust Badges | 20 dk |
| 5 | Newsletter | 20 dk |
| 6 | Pricing | 45 dk |
| 7 | i18n URL Routing | 60 dk |

Toplam: ~3 saat

---

## Çeviri Güncellemeleri

Tüm yeni bölümlerin metinleri `src/lib/i18n/translations.ts`'e TR + EN olarak eklenecek:
- `faq.*` — sorular ve cevaplar
- `pricing.*` — plan adları, özellik listeleri, fiyatlar
- `trust.*` — badge metinleri
- `newsletter.*` — input placeholder, buton, mesajlar
- `footer.scrollToTop` — scroll butonu aria label

---

## Onay

Bu planı onaylarsan implementasyona başlayabilirim. Her adım build ile doğrulanarak ilerler.
