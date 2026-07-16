import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicIconsDir = path.join(root, "public", "icons");
const appDir = path.join(root, "src", "app");

const BG = "#111315";
const ACCENT = "#58C7FF";

function lightningSvg(size, maskable = false) {
  const padding = maskable ? size * 0.22 : size * 0.18;
  const inner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const boltWidth = inner * 0.34;
  const boltHeight = inner * 0.62;

  const x1 = cx - boltWidth * 0.35;
  const x2 = cx + boltWidth * 0.15;
  const x3 = cx - boltWidth * 0.05;
  const x4 = cx + boltWidth * 0.35;
  const yTop = cy - boltHeight / 2;
  const yMid = cy + boltHeight * 0.05;
  const yBottom = cy + boltHeight / 2;

  const glow = maskable
    ? ""
    : `<circle cx="${cx}" cy="${cy}" r="${inner * 0.34}" fill="${ACCENT}" opacity="0.18"/>`;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  ${glow}
  <path d="M ${x2} ${yTop} L ${x1} ${yMid} L ${x3} ${yMid} L ${x4} ${yBottom} L ${x2} ${yMid + boltHeight * 0.08} L ${x3} ${yMid} Z" fill="${ACCENT}"/>
</svg>`;
}

async function writePng(filename, size, maskable = false) {
  const svg = lightningSvg(size, maskable);
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const outputPath = path.join(publicIconsDir, filename);
  await fs.promises.writeFile(outputPath, buffer);
  return buffer;
}

async function main() {
  await fs.promises.mkdir(publicIconsDir, { recursive: true });

  await writePng("icon-192x192.png", 192, false);
  await writePng("icon-512x512.png", 512, false);
  await writePng("icon-maskable-192x192.png", 192, true);
  await writePng("icon-maskable-512x512.png", 512, true);

  const appleBuffer = await sharp(Buffer.from(lightningSvg(180, false)))
    .flatten({ background: BG })
    .png()
    .toBuffer();
  const iconBuffer = await sharp(Buffer.from(lightningSvg(512, false))).png().toBuffer();

  await fs.promises.writeFile(path.join(appDir, "apple-icon.png"), appleBuffer);
  await fs.promises.writeFile(path.join(appDir, "icon.png"), iconBuffer);

  console.log("Generated PWA icons in public/icons and src/app");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
