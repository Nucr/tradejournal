import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";

const SIZES = [192, 512];
const PUBLIC = resolve(import.meta.dirname, "..", "public");
const OUT = resolve(PUBLIC, "icons");

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

async function generate(size) {
  const svg = readFileSync(resolve(PUBLIC, `icon-${size}.svg`), "utf-8");
  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  const outPath = resolve(OUT, `icon-${size}.png`);
  writeFileSync(outPath, png);
  console.log(`✓ ${outPath}`);
}

Promise.all(SIZES.map(generate)).catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
