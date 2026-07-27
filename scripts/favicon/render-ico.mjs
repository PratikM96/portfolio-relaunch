/**
 * Regenerate public/favicon.ico from public/favicon.svg.
 *
 *   node scripts/favicon/render-ico.mjs
 *
 * The .ico exists only for clients that ignore the SVG and PNG <link> tags, so it needs the three legacy sizes and nothing else. The previous file carried nine images, seven of them uncompressed BMP including a 256x256 at 270KB, for 424,139 bytes total: roughly a thousand times its own favicon-32x32.png sibling, shipped to every visitor whose browser asks for /favicon.ico by convention rather than reading the tags.
 *
 * Each entry here is a PNG rather than a BMP, which every target since Vista reads, and the directory records the byte length and offset the format requires. A 256px entry is deliberately absent: nothing that falls back to .ico ever renders one that large.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SRC = path.join(ROOT, 'public/favicon.svg');
const OUT = path.join(ROOT, 'public/favicon.ico');
const SIZES = [16, 32, 48];

const pngs = await Promise.all(
  SIZES.map((s) => sharp(SRC, { density: 384 }).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toBuffer()),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type 1 = icon
header.writeUInt16LE(SIZES.length, 4);

const dir = Buffer.alloc(16 * SIZES.length);
let offset = header.length + dir.length;
SIZES.forEach((s, i) => {
  const o = i * 16;
  dir[o] = s === 256 ? 0 : s; // 0 means 256 in the ICO directory
  dir[o + 1] = s === 256 ? 0 : s;
  dir[o + 2] = 0; // palette size, 0 for truecolor
  dir[o + 3] = 0; // reserved
  dir.writeUInt16LE(1, o + 4); // color planes
  dir.writeUInt16LE(32, o + 6); // bits per pixel
  dir.writeUInt32LE(pngs[i].length, o + 8);
  dir.writeUInt32LE(offset, o + 12);
  offset += pngs[i].length;
});

const before = fs.existsSync(OUT) ? fs.statSync(OUT).size : 0;
fs.writeFileSync(OUT, Buffer.concat([header, dir, ...pngs]));
const after = fs.statSync(OUT).size;

console.log(`favicon.ico  ${SIZES.join('/')}px  ${before} -> ${after} bytes`);
SIZES.forEach((s, i) => console.log(`  ${s}x${s}  ${pngs[i].length} bytes`));
