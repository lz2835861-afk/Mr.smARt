/**
 * Generate placeholder PNG icons (16/48/128) with zero dependencies.
 *
 * Draws a blue square with a lighter "shield" diamond — just enough to be a
 * recognizable toolbar mark. Writes valid PNGs via a hand-rolled encoder
 * (zlib stored/uncompressed blocks + CRC). Run: npm run icons.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../icons");
mkdirSync(outDir, { recursive: true });

const ACCENT = [47, 107, 255]; // #2f6bff
const LIGHT = [255, 255, 255];
const BG = [255, 255, 255, 0]; // transparent

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function makePng(size) {
  const px = (x, y) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.42;
    // rounded square background
    const inSquare = x >= size * 0.08 && x <= size * 0.92 && y >= size * 0.08 && y <= size * 0.92;
    if (!inSquare) return BG;
    // shield diamond in the center → light
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    if (dx + dy < r * 0.95) return [...LIGHT, 255];
    return [...ACCENT, 255];
  };

  const raw = Buffer.alloc((size * 4 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = px(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
      raw[o++] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of [16, 48, 128]) {
  const png = makePng(size);
  writeFileSync(resolve(outDir, `icon${size}.png`), png);
  console.log(`wrote icons/icon${size}.png (${png.length} bytes)`);
}
