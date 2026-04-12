import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Photo } from '../models/photo';

const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed');

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function buildMetadataSvg(photo: Photo, width: number, includePeople: string[]): Buffer {
  const lineHeight = 22;
  const padding = 12;
  const lines: string[] = [];

  if (photo.title) lines.push(`Title: ${photo.title}`);
  if (photo.date_taken) lines.push(`Date: ${photo.date_taken}${photo.date_approximate ? ' (approx)' : ''}`);
  if (photo.location) lines.push(`Location: ${photo.location}`);
  if (photo.source_type) lines.push(`Source: ${photo.source_type}`);
  if (photo.description) {
    const words = photo.description.split(' ');
    let line = 'Description: ';
    for (const w of words) {
      if ((line + w).length > 60) { lines.push(line.trimEnd()); line = '  ' + w + ' '; }
      else line += w + ' ';
    }
    if (line.trim()) lines.push(line.trimEnd());
  }
  if (includePeople.length > 0) lines.push(`People: ${includePeople.join(', ')}`);
  if (!lines.length) lines.push('No metadata');

  const svgHeight = lines.length * lineHeight + padding * 2;
  const escapeLine = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const textElements = lines.map((l, i) =>
    `<text x="${padding}" y="${padding + (i + 1) * lineHeight}" font-family="monospace" font-size="14" fill="#222">${escapeLine(l)}</text>`
  ).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${svgHeight}">
  <rect width="${width}" height="${svgHeight}" fill="white"/>
  ${textElements}
</svg>`;
  return Buffer.from(svg);
}

export async function processPhoto(photo: Photo): Promise<{
  cleanPath: string;
  reviewPath: string;
  labeledPath: string;
}> {
  ensureDir(PROCESSED_DIR);

  const inputPath = path.join(process.cwd(), photo.original_path);
  const base = path.basename(photo.filename, path.extname(photo.filename));

  const cleanFile = `${base}-clean.jpg`;
  const reviewFile = `${base}-review.jpg`;
  const labeledFile = `${base}-labeled.jpg`;

  const cleanPath = path.join(PROCESSED_DIR, cleanFile);
  const reviewPath = path.join(PROCESSED_DIR, reviewFile);
  const labeledPath = path.join(PROCESSED_DIR, labeledFile);

  // Step 1: produce clean image (crop if corners set, else just normalize)
  let cleanSharp: sharp.Sharp;

  if (photo.corners) {
    try {
      const corners: number[][] = JSON.parse(photo.corners);
      const xs = corners.map(c => c[0]);
      const ys = corners.map(c => c[1]);
      const left = Math.max(0, Math.floor(Math.min(...xs)));
      const top = Math.max(0, Math.floor(Math.min(...ys)));
      const right = Math.ceil(Math.max(...xs));
      const bottom = Math.ceil(Math.max(...ys));
      const meta = await sharp(inputPath).metadata();
      const imgW = meta.width ?? 800;
      const imgH = meta.height ?? 600;
      const width = Math.min(right - left, imgW - left);
      const height = Math.min(bottom - top, imgH - top);
      cleanSharp = sharp(inputPath).extract({ left, top, width, height }).jpeg({ quality: 90 });
    } catch {
      cleanSharp = sharp(inputPath).jpeg({ quality: 90 });
    }
  } else {
    cleanSharp = sharp(inputPath).jpeg({ quality: 90 });
  }

  await cleanSharp.toFile(cleanPath);

  // Step 2: review image = clean + metadata panel below
  const cleanMeta = await sharp(cleanPath).metadata();
  const imgWidth = cleanMeta.width ?? 800;
  const imgHeight = cleanMeta.height ?? 600;

  const reviewSvg = buildMetadataSvg(photo, imgWidth, []);
  const reviewSvgMeta = await sharp(reviewSvg).metadata();
  const panelHeight = reviewSvgMeta.height ?? 80;

  const reviewSvgResized = await sharp(reviewSvg).png().toBuffer();

  await sharp(cleanPath)
    .extend({ bottom: panelHeight, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .composite([{ input: reviewSvgResized, top: imgHeight, left: 0 }])
    .jpeg({ quality: 88 })
    .toFile(reviewPath);

  // Step 3: labeled image = clean + metadata panel with people
  const peopleNames: string[] = [];
  try {
    const { getPeopleForPhoto } = await import('./photoService');
    const tags = getPeopleForPhoto(photo.id);
    tags.forEach(t => peopleNames.push(t.name));
  } catch { /* ignore */ }

  const labeledSvg = buildMetadataSvg(photo, imgWidth, peopleNames);
  const labeledSvgMeta = await sharp(labeledSvg).metadata();
  const labeledPanelHeight = labeledSvgMeta.height ?? 80;
  const labeledSvgBuf = await sharp(labeledSvg).png().toBuffer();

  await sharp(cleanPath)
    .extend({ bottom: labeledPanelHeight, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .composite([{ input: labeledSvgBuf, top: imgHeight, left: 0 }])
    .jpeg({ quality: 88 })
    .toFile(labeledPath);

  return {
    cleanPath: path.join('data', 'processed', cleanFile),
    reviewPath: path.join('data', 'processed', reviewFile),
    labeledPath: path.join('data', 'processed', labeledFile),
  };
}
