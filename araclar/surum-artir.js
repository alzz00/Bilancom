// Her yayından önce çalıştır: index.html ve sw.js'ye aynı yeni sürüm numarasını yazar.
// Telefon sürüm değişince yeni dosyaları indirir ve "Yeni sürüm hazır" gösterir.
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const d = new Date();
const p = n => String(n).padStart(2, '0');
const version = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;

for (const [file, name] of [['index.html', 'APP_VERSION'], ['sw.js', 'VERSION']]) {
  const full = path.join(root, file);
  const src = fs.readFileSync(full, 'utf8');
  const out = src.replace(new RegExp(`const ${name} = '[^']*'`), `const ${name} = '${version}'`);
  if (out === src) throw new Error(`${file}: "const ${name} = '...'" satırı bulunamadı`);
  fs.writeFileSync(full, out);
}
console.log('yeni sürüm:', version);
