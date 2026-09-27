# Hesap Defterim

Kişisel mali durum defteri: varlıklar (TL, döviz, altın çeşitleri, yatırım ürünleri), banka banka borçlar,
asgari ödemeler ve net birikim. iPhone'da ana ekrana eklenip uygulama gibi kullanılır.

- **Veriler yalnızca telefonda saklanır.** Hiçbir sunucuya gönderilmez; Claude'da da bilgisayarda da durmaz.
- Altın ve döviz fiyatları `finans.truncgil.com` adresinden çekilir (alış fiyatı). Bu isteğe kişisel veri eklenmez.
- İnternet yokken de açılır; fiyatlar son alınan haliyle kalır.
- Görünüm: **Koyu** (gece mavisi ve altın, varsayılan), **Açık** ya da **Otomatik** (telefonun ayarını izler); Ayarlar'dan seçilir.
- Ana ekrandaki simge silinirse veriler de silinir. **Ayarlar → Yedek al** ile düzenli yedek al
  (Dosyalar/iCloud'a kaydet). Geri yüklemek için **Ayarlar → Yedekten geri yükle**.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Uygulamanın tamamı (görünüm + hesaplar) |
| `sw.js` | İnternetsiz açılış ve arka planda güncelleme |
| `manifest.webmanifest`, `ikonlar/` | Ana ekran adı ve simgesi |
| `araclar/onizleme.js` | Bilgisayarda deneme: `node araclar/onizleme.js` → http://localhost:4546 |
| `araclar/ikon-uret.js` | Simgeleri yeniden üretir: `node araclar/ikon-uret.js` |

## Yayın

Adres: https://alzz00.github.io/hesap-defterim/ (GitHub Pages). Yayında yalnızca kod vardır, veri yoktur.

Her güncellemede:

1. `node araclar/surum-artir.js` — `index.html` ve `sw.js`'ye aynı yeni sürüm numarasını yazar.
2. Değişikliği GitHub'a gönder (`git commit` + `git push`). Pages 1-2 dakikada yayınlar.
3. Telefonda uygulama açılınca yeni sürümü arka planda indirir ve üstte **"Yeni sürüm hazır – Yenile"** gösterir.
   Kayıtlar olduğu gibi kalır. Kurulu sürüm **Ayarlar**'ın en altında yazar.
