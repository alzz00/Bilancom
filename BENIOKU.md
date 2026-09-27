# Hesap Defterim

Kişisel mali durum defteri: varlıklar (TL, döviz, altın çeşitleri, yatırım ürünleri), banka banka borçlar,
asgari ödemeler ve net birikim. iPhone'da ana ekrana eklenip uygulama gibi kullanılır.

- **Veriler yalnızca telefonda saklanır.** Hiçbir sunucuya gönderilmez; Claude'da da bilgisayarda da durmaz.
- Altın ve döviz fiyatları `finans.truncgil.com` adresinden çekilir (alış fiyatı). Bu isteğe kişisel veri eklenmez.
- İnternet yokken de açılır; fiyatlar son alınan haliyle kalır.
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

Uygulama GitHub Pages üzerinden yayınlanır; yayında yalnızca kod vardır, veri yoktur.
Kod değişip GitHub'a gönderilince telefondaki uygulama bir sonraki açılışta kendini günceller.
