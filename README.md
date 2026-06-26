# Verifter — Trade Journal

Firebase Auth + Firestore ile çalışan, Vercel'e deploy edilmeye hazır kişisel trade
günlüğü. Kayıt/giriş, dashboard (gün/hafta/ay/yıl/özel tarih filtreleri), kümülatif
sonuç grafiği ve TradingView ekran görüntüsü linki + RR + kâr/zarar + strateji +
not içeren işlem kartları içerir.

## 1. Firebase projesi kur

1. https://console.firebase.google.com adresinden yeni bir proje oluştur.
2. **Build > Authentication > Get started** ile **Email/Password** sağlayıcısını aç.
3. **Build > Firestore Database > Create database** ile Firestore'u oluştur (production mode).
4. `firestore.rules` dosyasındaki kuralları Firestore Console > Rules sekmesine yapıştır
   ve **Publish** et. (Her kullanıcı sadece kendi `users/{uid}/trades` koleksiyonunu
   okuyup yazabilir.)
5. **Project settings > General > Your apps** kısmından bir **Web app** ekle, sana
   verilen `firebaseConfig` değerlerini not al.

## 2. Ortam değişkenlerini ayarla

`.env.local.example` dosyasını `.env.local` olarak kopyala ve Firebase'den aldığın
değerleri doldur:

```bash
cp .env.local.example .env.local
```

## 3. Yerelde çalıştır

```bash
npm install
npm run dev
```

`http://localhost:3000` adresinden kayıt ol ve dene.

## 4. Vercel'e deploy et

1. Bu klasörü bir GitHub reposuna push'la.
2. https://vercel.com → **New Project** → reposunu seç.
3. **Environment Variables** kısmına `.env.local` içindeki tüm `NEXT_PUBLIC_FIREBASE_*`
   değerlerini ekle.
4. **Deploy** butonuna bas. Next.js projesi olduğu için ek ayar gerekmez.
5. Deploy bittikten sonra Firebase Console > Authentication > Settings >
   **Authorized domains** kısmına Vercel'in verdiği domaini (örn. `proje.vercel.app`)
   ekle, yoksa giriş/kayıt çalışmaz.

## Veri girişi nasıl çalışıyor?

Her işlem için:
- **TradingView görsel linki**: Grafikte `Alt+S` ile aldığın paylaşım linkini
  "TradingView Görsel Linki" alanına yapıştırman yeterli; kart üzerinde küçük
  resim olarak gösterilir ve tıklayınca TradingView'da açılır.
- **RR**: Girdiğin risk/ödül oranı (örn. 2.5).
- **Sonuç (%)**: Kaç kâr/zarar aldığını yüzde olarak girersin (negatif değer zarar
  demektir).
- **Yön**: Long / Short / BE (başabaş).
- **Parite**: Serbest metin, istediğin gibi yazabilirsin (EURUSD, XAUUSD, BTCUSD…).
- **Giriş/Çıkış tarihi**: İşleme giriş ve çıkış zamanların.
- **Strateji** ve **Not**: Serbest metin alanları.

## Klasör yapısı

```
src/
  app/
    login/, register/        → auth sayfaları
    dashboard/                → genel bakış (istatistik + grafik)
    dashboard/journal/        → trade defteri (liste + ekleme/düzenleme)
  components/                 → UI bileşenleri
  lib/                        → firebase, auth context, tarih filtreleme, firestore CRUD
```
