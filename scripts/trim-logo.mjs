import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'src/assets/logo-lumet.png');
const outputPath = path.join(root, 'src/assets/logo-lumet.png');

const buffer = readFileSync(inputPath);
const trimmed = await sharp(buffer)
  .trim({ threshold: 10 })
  .toBuffer();

writeFileSync(outputPath, trimmed);
console.log('Logo recortado (trim) y guardado en src/assets/logo-lumet.png');
