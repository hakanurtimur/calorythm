import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.resolve('next/package.json'));
const sharp = require('sharp');

const ring = await readFile('public/brand/calorythm-ring-primary.svg', 'utf8');
const paths = ring.match(/<g[\s\S]*<\/g>/)[0].replaceAll('stroke-width="1.9"', 'stroke-width="3.5"');
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#20211e"/><g transform="translate(12 12) scale(.8125)">${paths}</g></svg>`;
await writeFile('src/app/icon.svg', icon);
const apple = icon.replace('rx="24"', 'rx="0"');
await sharp(Buffer.from(apple)).resize(180,180).png().toFile('src/app/apple-icon.png');
// ICO directory followed by PNG entries, supported by modern and legacy browsers.
const sizes = [16,32,48];
const images = await Promise.all(sizes.map(size => sharp(Buffer.from(icon)).resize(size,size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1,2); header.writeUInt16LE(sizes.length,4);
let offset = header.length;
images.forEach((image,index) => { const entry=6+index*16; header[entry]=sizes[index]; header[entry+1]=sizes[index]; header.writeUInt16LE(1,entry+4); header.writeUInt16LE(32,entry+6); header.writeUInt32LE(image.length,entry+8); header.writeUInt32LE(offset,entry+12); offset+=image.length; });
await writeFile('src/app/favicon.ico',Buffer.concat([header,...images]));

const wordmark = await sharp('public/brand/calorythm-wordmark-inverse.svg').resize(330).png().toBuffer();
const artwork = await sharp('public/images/calorythm-editorial-echo-v1.png').resize(1200,630,{fit:'cover'}).png().toBuffer();
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="shade"><stop stop-color="#171811"/><stop offset=".48" stop-color="#171811" stop-opacity=".95"/><stop offset=".65" stop-color="#171811" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/><g fill="#f4f1e7"><text x="64" y="250" font-family="Helvetica,Arial,sans-serif" font-size="66" letter-spacing="-2">Beslenmenin</text><text x="64" y="336" font-family="Georgia,serif" font-style="italic" font-size="82">ardındaki</text><text x="64" y="422" font-family="Georgia,serif" font-style="italic" font-size="82">bilim.</text><text x="64" y="525" font-family="Helvetica,Arial,sans-serif" font-size="23">Bağımsız beslenme bilimi yayını.</text></g><path d="M0 620H300" stroke="#f3a65a" stroke-width="20"/><path d="M300 620H600" stroke="#ea735d" stroke-width="20"/><path d="M600 620H900" stroke="#c79a45" stroke-width="20"/><path d="M900 620H1200" stroke="#a7be89" stroke-width="20"/></svg>`);
await sharp(artwork).composite([{input:overlay},{input:wordmark,left:64,top:60}]).png().toFile('public/brand/og-image.png');
