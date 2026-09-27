# Bilancom — çalışma notları

Kişisel bilanço uygulaması (eski adı Hesap Defterim). iPhone'da Safari → Paylaş → Ana Ekrana Ekle ile uygulama gibi
kullanılır. Yayın: GitHub Pages, https://alzz00.github.io/Bilancom/ (büyük B ile; `/bilancom/` 404 verir).

## Kullanıcıyla çalışma

- Türkçe yaz. Cihazları Windows PC + iPhone; Mac ve Android yok. Telefon adımlarını Safari/iOS menü adlarıyla yaz.
- Yazılıma yeni. İş bitince özetin sonuna **numaralı, somut adımlar** ekle: nereye dokunacak, ne görecek.
- Yayın, hesap, izin adımlarından önce neden gerektiğini ve neyin herkese açık olacağını 1-2 cümleyle söyle.
- Görünüm işlerinde önce 2-3 seçeneği yan yana telefon görseli olarak göster, son hali de göster.
  Kullanıcı **"yükle"** demeden yayınlama (push etme).
- Gizlilik önemli: veriler Claude'da, sunucuda ya da bilgisayarda durmasın; yalnızca telefonda.

## Bozmaman gerekenler

- Kayıtlar iPhone'da localStorage'da: **`hd.defter.v1`**. Bu anahtarın adını ya da biçimini geriye uyumsuz değiştirme,
  yoksa kullanıcının bütün verisi kaybolur. Diğer anahtarlar: `hd.tema`, `hd.birikim`, `hd.borcSira`, `hd.kilit`,
  `hd.kilit.deneme`, `hd.fiyat.v*`, `hd.hide`, `hd.safari`, `hd.bozuk.*`.
- Aynı origin (`alzz00.github.io`) altında WannaBuy da var; onun anahtarları `wb.` önekli. Onlara dokunma.
- Yedek JSON'u: `app: 'bilancom'` (eski `hesap-defterim` de kabul edilir). Şifre kilidi (`hd.kilit`) yedeğe girmez.
- İlk açılışta örnek veri yok (kullanıcı istemedi); boşken karşılama kartı görünür.

## Yayın

1. `node araclar/surum-artir.js` — `index.html` (`APP_VERSION`) ve `sw.js` (`VERSION`) aynı sürüme geçer.
2. Commit + `git push` (önce kullanıcıdan "yükle" onayı). Pages 1-2 dakikada yayınlar.
3. Telefonda "Yeni sürüm hazır – Yenile" çıkar; sürüm Ayarlar'ın en altında yazar.

Commit kimliği: `alzz00` / `333697088+alzz00@users.noreply.github.com`. Kişisel e-posta adresini yazma.
Bulut oturumu `main`'e gönderemezse PR aç; kullanıcı telefondan **Merge**'e basınca yayına çıkar.

## Mimari

- Tek dosya PWA: `index.html` + `sw.js` + `manifest.webmanifest` + `ikonlar/` + `listeler/*.json`
  (hisse: KAP, fon: TEFAS; yazdıkça öneri). Seçilen kod `code`/`codeName` alanlarında.
- Fiyatlar: `finans.truncgil.com/v4/today.json` (CORS açık, alış fiyatı). Ara ara kopuyor; 5 sn sonra bir kez yeniden dener.
- Görünüm: "Gece Mavisi & Altın" koyu (varsayılan), Ayarlar → Görünüm: Koyu / Açık / Otomatik (`hd.tema`).
- Alt menü: Özet · Varlıklar · Borçlar · Hedefler. Özet'te net birikim kartında **Güncelle** (elle girilen tüm rakamlar
  tek ekranda) ve **+**. Ödemeler kartında Yaklaşan | Takvim.
- Borçta **Ödeme gir**: tutar toplamdan düşer (`paidAmt`), "Hangi hesaptan" (`paidFrom`) seçilen hesaptan düşer; tik geri
  alınınca iade edilir. Kart/KMH için "Her ay ne ödüyorsun: Asgari | Tamamını" (`payFull`).
- Maaş (`income`: tutar, gün, hesap) maaş gününde hesaba eklenir; banner'da Geri al.
- Ayarlar'da "Net | Toplam birikim" (`hd.birikim`).
- Hedefte "Net birikimim" seçiliyken **Hariç tut** (`excludeIds`); "Seçtiğim varlıklar" (`assetIds`) sadece seçilenleri sayar.
- Listeler türe göre sıralı (giriş sırasına göre değil). Borçlarda "Bankaya göre" düğmesi (`hd.borcSira`).
- Banka varlığında hesabın para birimi seçilir (`BANK_CUR`); döviz/altın hesabı piyasa alış fiyatıyla değerlenir.
  Banka banka kur İSTENMEDİ; zaten tarayıcıdan çekilemiyor (CORS).
- Şifre kilidi: 4 rakam, tuzlu SHA-256 (`hd.kilit`), 5 yanlışta 30 sn bekleme, arka plana geçince tutarlar gizlenir.
  Veriyi şifrelemez, gizlilik perdesidir. "Şifremi unuttum" kayıtları silip kilidi kaldırır.
- Karar bekleyen: hisse/fon fiyatını otomatik çekmek (hisse: TradingView tarayıcı taraması; fon: TEFAS'ın CORS'u yok,
  GitHub Actions ile günlük JSON üretmek gerekir).

## iOS ve test tuzakları

- iOS 26+ ana ekran uygulamasında sayfa kısaysa alttaki sabit çubuk havada kalıyor. Uygulanan çözüm: standalone modda
  `html { min-height: calc(100% + 1px) }`, `html.locked`'ta overflow gizleme, scrim'de touchmove engelleme.
  `100lvh` ile üstten konumlamak işe yaramadı. Bu sorun Chromium önizlemede görünmez, doğrulama telefonda yapılır.
- Önizlemede (`node araclar/onizleme.js` → http://localhost:4546) service worker eski `index.html`'i önbellekten verir;
  denemeden önce SW'yi kaldır, önbelleği sil. Headless tarayıcı çekimlerinde her seferinde yeni profil klasörü kullan.
