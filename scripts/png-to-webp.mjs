// Convierte todos los PNG de un directorio a WebP con sharp (q90).
//
// Uso:
//   node scripts/png-to-webp.mjs <dir>        # batch, convierte *.png del dir
//   node scripts/png-to-webp.mjs <dir> --delete-png   # además borra los PNG originales
//
// Calidad 90: sin pérdida visual perceptible, ~70% menos que PNG.

import sharp from 'sharp';
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const QUALITY = 90;

const [, , dirArg, ...flags] = process.argv;
if (!dirArg) {
  console.error('Uso: node scripts/png-to-webp.mjs <dir> [--delete-png]');
  process.exit(1);
}
const deletePng = flags.includes('--delete-png');
const dir = path.resolve(dirArg);

const files = (await readdir(dir)).filter((f) => /\.png$/i.test(f));
if (files.length === 0) {
  console.error(`Sin PNG en: ${dir}`);
  process.exit(1);
}

let totalIn = 0;
let totalOut = 0;
for (const file of files) {
  const input = path.join(dir, file);
  const output = input.replace(/\.png$/i, '.webp');
  const meta = await sharp(input).metadata();
  const out = await sharp(input).webp({ quality: QUALITY, effort: 4 }).toFile(output);
  const inSize = (await stat(input)).size;
  totalIn += inSize;
  totalOut += out.size;
  const ratio = ((1 - out.size / inSize) * 100).toFixed(1);
  console.log(
    `✓ ${file}  (${meta.width}×${meta.height})  ${(inSize / 1024).toFixed(1)} KB -> ${(out.size / 1024).toFixed(1)} KB  (${ratio}% menos)`,
  );
  if (deletePng) await unlink(input);
}

console.log(
  `\n${files.length} imágenes · ${(totalIn / 1024).toFixed(1)} KB -> ${(totalOut / 1024).toFixed(1)} KB  (${((1 - totalOut / totalIn) * 100).toFixed(1)}% menos)${deletePng ? ' · PNG borrados' : ''}`,
);
