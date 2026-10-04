import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/gripsky-brand-mark-v1.png");
const output = path.join(root, "assets/brand/silhouette");
const sourceHash = "bb0cb87bf147097680d617d485208febd69882aa2b9e5a0dfa8701720f26e0c6";
const sizes = [16, 24, 32, 48, 64, 96, 128, 180, 192, 256, 512];
const colors = {
  light: { rgb: [0xf3, 0xee, 0xe1], hex: "#F3EEE1" },
  ink: { rgb: [0x14, 0x3f, 0x3b], hex: "#143F3B" },
};

function silhouette(sourcePixels, color) {
  const result = Buffer.alloc(sourcePixels.length);
  for (let i = 0; i < sourcePixels.length; i += 4) {
    // Match the SVG feColorMatrix in BrandSilhouette.tsx: alpha = 2 - 4 * red.
    const alpha = Math.max(0, Math.min(255, Math.round(510 - 4 * sourcePixels[i])));
    result[i] = color[0];
    result[i + 1] = color[1];
    result[i + 2] = color[2];
    result[i + 3] = alpha;
  }
  return result;
}

function iconCrop(pixels) {
  let left = 512, top = 512, right = 0, bottom = 0;
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    if (pixels[(y * 512 + x) * 4 + 3] <= 12) continue;
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  if (left > right) throw new Error("Brand separation produced an empty mark");
  const extent = Math.max(right - left + 1, bottom - top + 1);
  const side = extent + 2 * Math.ceil(extent * .05);
  return {
    left: Math.round((left + right - side + 1) / 2),
    top: Math.round((top + bottom - side + 1) / 2),
    width: side,
    height: side,
  };
}

function standaloneSvg(maskPng, fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="GripSky silhouette">
  <defs><mask id="mark" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512"><image x="0" y="0" width="512" height="512" href="data:image/png;base64,${maskPng.toString("base64")}"/></mask></defs>
  <rect width="512" height="512" fill="${fill}" mask="url(#mark)"/>
</svg>\n`;
}

function previewSvg(images) {
  const rows = sizes.map((size, i) => {
    const x = 48 + i * 124;
    const display = Math.min(size, 92);
    return {
      light: `<text x="${x + 46}" y="191" text-anchor="middle">${size}px</text><image x="${x + (92 - display) / 2}" y="${142 - display}" width="${display}" height="${display}" href="data:image/png;base64,${images.light[i].toString("base64")}"/>`,
      ink: `<text x="${x + 46}" y="386" text-anchor="middle">${size}px</text><image x="${x + (92 - display) / 2}" y="${337 - display}" width="${display}" height="${display}" href="data:image/png;base64,${images.ink[i].toString("base64")}"/>`,
    };
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1470" height="420" viewBox="0 0 1470 420">
    <rect width="1470" height="210" fill="#143F3B"/><rect y="210" width="1470" height="210" fill="#EEEAE0"/>
    <g font-family="Arial, sans-serif" font-size="17"><text x="48" y="37" fill="#F3EEE1">GRIPSKY · LIGHT ON DARK</text><text x="48" y="247" fill="#143F3B">GRIPSKY · INK ON PAPER</text></g>
    <g font-family="Arial, sans-serif" font-size="13" fill="#C1D2CA">${rows.map(row => row.light).join("\n")}</g>
    <g font-family="Arial, sans-serif" font-size="13" fill="#143F3B">${rows.map(row => row.ink).join("\n")}</g>
  </svg>`;
}

const original = await readFile(source);
const actualHash = createHash("sha256").update(original).digest("hex");
if (actualHash !== sourceHash) throw new Error(`Brand source changed: ${actualHash}`);

const { data, info } = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.width !== 512 || info.height !== 512 || info.channels !== 4) {
  throw new Error(`Expected a 512px RGBA source, got ${info.width}×${info.height}/${info.channels}`);
}
await mkdir(output, { recursive: true });
const crop = iconCrop(silhouette(data, colors.light.rgb));

const images = { light: [], ink: [] };
for (const [name, color] of Object.entries(colors)) {
  const master = await sharp(silhouette(data, color.rgb), {
    raw: { width: 512, height: 512, channels: 4 },
  }).extract(crop).resize(512, 512, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
  for (const size of sizes) {
    const png = size === 512
      ? master
      : await sharp(master).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
    images[name].push(png);
    await writeFile(path.join(output, `gripsky-silhouette-${name}-${size}.png`), png);
  }
  await writeFile(path.join(output, `gripsky-silhouette-${name}.svg`), standaloneSvg(images.light.at(-1) ?? master, color.hex));
}
await writeFile(path.join(output, "preview.png"), await sharp(Buffer.from(previewSvg(images))).png().toBuffer());
console.log(`Wrote ${sizes.length * 2} PNG sizes, two self-contained SVGs and a preview to ${output}`);
