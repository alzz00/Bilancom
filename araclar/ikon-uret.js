// Ana ekran simgelerini üretir (ek paket gerekmez): node araclar/ikon-uret.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.resolve(__dirname, '..', 'ikonlar');

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Open ledger in a 24-unit box: the same shape as the brand mark inside the app.
function cubic(p0, p1, p2, p3, n = 28) {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}
const outline = [
  [3, 5.8],
  ...cubic([3, 5.8], [6, 4.7], [9, 4.8], [12, 6.7]),
  ...cubic([12, 6.7], [15, 4.8], [18, 4.7], [21, 5.8]),
  [21, 18.4],
  ...cubic([21, 18.4], [18, 17.3], [15, 17.4], [12, 19.3]),
  ...cubic([12, 19.3], [9, 17.4], [6, 17.3], [3, 18.4]),
  [3, 5.8],
];
const strokes = [];
for (let i = 1; i < outline.length; i++) strokes.push({ a: outline[i - 1], b: outline[i], w: 1.9 });
strokes.push({ a: [12, 6.7], b: [12, 19.3], w: 1.9 });
for (const y of [9.6, 12.6]) {
  strokes.push({ a: [5.7, y], b: [9.3, y + 0.6], w: 1.3 });
  strokes.push({ a: [14.7, y + 0.6], b: [18.3, y], w: 1.3 });
}

function distSeg(px, py, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const wx = px - a[0], wy = py - a[1];
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy || 1)));
  const dx = wx - t * vx, dy = wy - t * vy;
  return Math.hypot(dx, dy);
}
function inside(px, py, poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function draw(size) {
  const buf = Buffer.alloc(size * size * 4);
  const scale = (size * 0.6) / 18; // glyph spans x 3..21
  const ox = size / 2 - 12 * scale, oy = size / 2 - 12.4 * scale;
  const top = [0x1D, 0x74, 0xBF], bottom = [0x11, 0x57, 0x94], ink = [0xF6, 0xF8, 0xFC];
  for (let py = 0; py < size; py++) {
    const t = py / (size - 1);
    for (let px = 0; px < size; px++) {
      let r = top[0] + (bottom[0] - top[0]) * t;
      let g = top[1] + (bottom[1] - top[1]) * t;
      let b = top[2] + (bottom[2] - top[2]) * t;
      const gx = (px + 0.5 - ox) / scale, gy = (py + 0.5 - oy) / scale;
      let cov = 0;
      if (gx > 1 && gx < 23 && gy > 3 && gy < 21.5) {
        if (inside(gx, gy, outline)) cov = 0.13;
        for (const s of strokes) {
          const d = distSeg(gx, gy, s.a, s.b) * scale;
          const c = Math.max(0, Math.min(1, (s.w / 2) * scale + 0.5 - d));
          if (c > cov) cov = c;
        }
      }
      r += (ink[0] - r) * cov; g += (ink[1] - g) * cov; b += (ink[2] - b) * cov;
      const i = (py * size + px) * 4;
      buf[i] = Math.round(r); buf[i + 1] = Math.round(g); buf[i + 2] = Math.round(b); buf[i + 3] = 255;
    }
  }
  return encodePng(size, buf);
}

fs.mkdirSync(OUT, { recursive: true });
for (const size of [180, 192, 512]) {
  const file = path.join(OUT, `ikon-${size}.png`);
  fs.writeFileSync(file, draw(size));
  console.log('yazıldı:', path.relative(process.cwd(), file));
}
