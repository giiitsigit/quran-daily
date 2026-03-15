// api/wallpaper.js — v2 MODERN MINIMAL
// Life Calendar dot-grid · clean sans-serif · warm teal Quran palette
// GET /api/wallpaper?device=iphone-pro&mode=random&palette=dark

import {
  getDailyVerseSurahAyah, getYearProgress,
  formatHijri, formatGregorian,
  fetchVerseData, FALLBACK_VERSES
} from '../lib/quran.js';

export const config = { runtime: 'edge' };

// ── Device presets ──────────────────────────────────────
const DEVICES = {
  'iphone-pro':  { w: 1179, h: 2556 },
  'iphone':      { w: 1170, h: 2532 },
  'iphone-se':   { w: 750,  h: 1334 },
  'iphone-plus': { w: 1290, h: 2796 },
  'android-fhd': { w: 1080, h: 2400 },
  'pixel':       { w: 1080, h: 2340 },
  'universal':   { w: 1080, h: 1920 },
};

// ── Palettes ─────────────────────────────────────────────
// Deep teal-black (Qareeb-inspired — primary)
// Warm cream (light mode)
// Pure black (ultra minimal)
const PALETTES = {
  dark: {
    bg:        '#0b1814',
    bgGlow:    '#142820',
    dot:       'rgba(255,255,255,0.055)',
    dotFill:   'rgba(107,196,158,0.50)',
    dotHead:   '#6bc49e',
    accent:    '#6bc49e',
    accentSub: 'rgba(107,196,158,0.32)',
    text:      '#edf5f1',
    textDim:   'rgba(237,245,241,0.40)',
    textSub:   'rgba(237,245,241,0.18)',
    arabic:    '#edf5f1',
    line:      'rgba(107,196,158,0.14)',
    chip:      'rgba(107,196,158,0.08)',
    chipBrd:   'rgba(107,196,158,0.20)',
    bar:       'rgba(107,196,158,0.12)',
  },
  warm: {
    bg:        '#f6f1e9',
    bgGlow:    '#e8e0d2',
    dot:       'rgba(20,50,35,0.07)',
    dotFill:   'rgba(25,95,65,0.42)',
    dotHead:   '#1a6644',
    accent:    '#1a6644',
    accentSub: 'rgba(26,102,68,0.28)',
    text:      '#111d17',
    textDim:   'rgba(17,29,23,0.42)',
    textSub:   'rgba(17,29,23,0.22)',
    arabic:    '#111d17',
    line:      'rgba(26,102,68,0.12)',
    chip:      'rgba(26,102,68,0.06)',
    chipBrd:   'rgba(26,102,68,0.16)',
    bar:       'rgba(26,102,68,0.10)',
  },
  black: {
    bg:        '#000000',
    bgGlow:    '#101010',
    dot:       'rgba(255,255,255,0.055)',
    dotFill:   'rgba(255,255,255,0.46)',
    dotHead:   '#ffffff',
    accent:    '#ffffff',
    accentSub: 'rgba(255,255,255,0.25)',
    text:      '#ffffff',
    textDim:   'rgba(255,255,255,0.38)',
    textSub:   'rgba(255,255,255,0.16)',
    arabic:    '#ffffff',
    line:      'rgba(255,255,255,0.10)',
    chip:      'rgba(255,255,255,0.05)',
    chipBrd:   'rgba(255,255,255,0.12)',
    bar:       'rgba(255,255,255,0.08)',
  },
};

// ── Handler ──────────────────────────────────────────────
export default async function handler(req) {
  const url = new URL(req.url);
  const p   = url.searchParams;

  const deviceKey = p.get('device') || 'iphone-pro';
  const device    = DEVICES[deviceKey] || DEVICES['iphone-pro'];
  let W = parseInt(p.get('w')) || device.w;
  let H = parseInt(p.get('h')) || device.h;
  W = Math.min(Math.max(W, 720), 1440);
  H = Math.min(Math.max(H, 1280), 3200);

  const mode    = p.get('mode')    || 'random';
  const surahN  = p.get('surah')   || null;
  const tema    = p.get('tema')    || null;
  const palette = p.get('palette') || 'dark';
  const tz      = p.get('tz')      || 'Asia/Jakarta';

  let today;
  try { today = new Date(new Date().toLocaleString('en-US', { timeZone: tz })); }
  catch { today = new Date(); }

  const yy  = today.getFullYear();
  const mm  = String(today.getMonth() + 1).padStart(2, '0');
  const dd  = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yy}-${mm}-${dd}`;

  const ref = getDailyVerseSurahAyah(
    todayStr,
    mode === 'surah' ? surahN : null,
    mode === 'tema'  ? tema   : null
  );

  let verse;
  try { verse = await fetchVerseData(ref.s, ref.a); }
  catch { verse = FALLBACK_VERSES[0]; }

  const { dayOfYear, daysInYear, pct } = getYearProgress(todayStr);
  const hijri     = formatHijri(today);
  const gregorian = formatGregorian(today);
  const C         = PALETTES[palette] || PALETTES.dark;

  const svg = buildWallpaper({ W, H, verse, dayOfYear, daysInYear, pct, hijri, gregorian, C });

  return new Response(svg, {
    headers: {
      'Content-Type':  'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma':        'no-cache',
    },
  });
}

// ── SVG Builder ───────────────────────────────────────────
function buildWallpaper({ W, H, verse, dayOfYear, daysInYear, pct, hijri, gregorian, C }) {
  const cx = W / 2;
  // Scale helper — all measurements relative to iPhone Pro 1179px width
  const s  = (n) => +(n * (W / 1179)).toFixed(2);

  // ── Dot grid: 18 cols × 26 rows, top 42% ──────────────
  const COLS = 18, ROWS = 26;
  const PAD  = s(88);
  const gridW = W - PAD * 2;
  const gridH = H * 0.42;
  const gridTop = H * 0.045;
  const cellW = gridW / COLS;
  const cellH = gridH / ROWS;
  const dotR  = Math.min(cellW, cellH) * 0.155;

  const total   = COLS * ROWS;
  const filled  = Math.round(total * pct / 100);

  let dotsSvg = '';
  let idx = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      idx++;
      const x = PAD + cellW * c + cellW / 2;
      const y = gridTop + cellH * r + cellH / 2;
      const isHead = idx === filled;
      const isFill = idx <= filled;
      dotsSvg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"
        r="${isHead ? (dotR * 1.7).toFixed(1) : dotR.toFixed(1)}"
        fill="${isHead ? C.dotHead : isFill ? C.dotFill : C.dot}"
        ${isHead ? `opacity="1"` : ''}/>`;
    }
  }

  // ── Verse text layout ─────────────────────────────────
  // Zone: from 52% to 90% of H
  const zoneTop = H * 0.52;
  const zoneBot = H * 0.893;
  const zoneH   = zoneBot - zoneTop;

  const arabicWords = verse.arabic.split(' ');
  // ~5 words per line for Arabic
  const arabicLines = chunkWords(arabicWords, 5);
  const arabicFsz   = s(52);
  const arabicLh    = arabicFsz * 1.82;

  // Latin & translation
  const maxCh = Math.floor(40 * (W / 1179));
  const latinLines = wrap(verse.latin,       maxCh);
  const transLines = wrap(verse.translation, Math.floor(38 * W / 1179));

  const latinFsz  = s(21);
  const latinLh   = latinFsz * 1.6;
  const transFsz  = s(24);
  const transLh   = transFsz * 1.65;
  const gapA      = s(22); // gap after arabic
  const gapL      = s(18); // gap after latin

  const totalH = arabicLines.length * arabicLh
               + gapA
               + latinLines.length * latinLh
               + gapL
               + transLines.length * transLh;

  // Vertically center the block within the zone
  let y = zoneTop + (zoneH - totalH) / 2;

  // Arabic
  const arabicSvg = arabicLines.map(line => {
    const el = `<text x="${cx}" y="${y.toFixed(1)}" text-anchor="middle"
      font-family="'Scheherazade New','Amiri',Georgia,serif"
      font-size="${arabicFsz}" fill="${C.arabic}" direction="rtl">${esc(line)}</text>`;
    y += arabicLh;
    return el;
  }).join('\n  ');

  y += gapA;
  const sep1 = y;
  y += s(20);

  const latinSvg = latinLines.map(line => {
    const el = `<text x="${cx}" y="${y.toFixed(1)}" text-anchor="middle"
      font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
      font-size="${latinFsz}" font-style="italic" fill="${C.textDim}">${esc(line)}</text>`;
    y += latinLh;
    return el;
  }).join('\n  ');

  y += gapL;
  const sep2 = y;
  y += s(20);

  const transSvg = transLines.map(line => {
    const el = `<text x="${cx}" y="${y.toFixed(1)}" text-anchor="middle"
      font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
      font-size="${transFsz}" font-weight="400" fill="${C.text}">${esc(line)}</text>`;
    y += transLh;
    return el;
  }).join('\n  ');

  // ── Surah tag above arabic ────────────────────────────
  const tagY     = zoneTop + (zoneH - totalH) / 2 - s(48);
  const tagTxtY  = tagY + s(28);
  const tagLabel = `QS. ${verse.surahName.toUpperCase()} : ${verse.ayahN}`;
  const tagW     = s(300);
  const tagH2    = s(40);

  // ── Progress bar ─────────────────────────────────────
  const barY  = H * 0.927;
  const barW  = W * 0.68;
  const barX  = cx - barW / 2;
  const barH2 = s(2.5);
  const fillW = barW * pct / 100;

  // ── Date chip ─────────────────────────────────────────
  const chipY   = H * 0.478;
  const chipH   = s(42);
  const chipW   = s(320);
  const chipTY  = chipY + s(27);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <!-- Top radial glow behind dot grid -->
  <radialGradient id="topGlow" cx="50%" cy="15%" r="55%" gradientUnits="objectBoundingBox">
    <stop offset="0%"   stop-color="${C.bgGlow}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${C.bg}"     stop-opacity="0"/>
  </radialGradient>
  <!-- Fade mask: dots dissolve into content -->
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"  stop-color="${C.bg}" stop-opacity="1"/>
    <stop offset="10%" stop-color="${C.bg}" stop-opacity="0"/>
    <stop offset="70%" stop-color="${C.bg}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${C.bg}" stop-opacity="1"/>
  </linearGradient>
  <!-- Bar gradient -->
  <linearGradient id="barG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${C.accentSub}"/>
    <stop offset="100%" stop-color="${C.accent}"/>
  </linearGradient>
</defs>

<!-- Background -->
<rect width="${W}" height="${H}" fill="${C.bg}"/>

<!-- Top glow -->
<rect width="${W}" height="${H * 0.55}" fill="url(#topGlow)" opacity="0.6"/>

<!-- DOT GRID -->
${dotsSvg}

<!-- Fade mask over dots -->
<rect width="${W}" height="${H}" fill="url(#fade)"/>

<!-- ─────── TOP LABEL ─────── -->
<!-- Day counter -->
<text x="${cx}" y="${(H * 0.472).toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(12)}" font-weight="400" letter-spacing="${s(3.5)}"
  fill="${C.textSub}">HARI KE-${dayOfYear} DARI ${daysInYear}  ·  ${pct}%</text>

<!-- Date chip -->
<rect x="${(cx - chipW / 2).toFixed(1)}" y="${chipY.toFixed(1)}"
  width="${chipW}" height="${chipH}" rx="${s(21)}"
  fill="${C.chip}" stroke="${C.chipBrd}" stroke-width="0.8"/>
<text x="${cx}" y="${chipTY.toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(19)}" font-weight="400" fill="${C.textDim}">${esc(hijri)}</text>

<!-- ─────── SURAH TAG ─────── -->
<text x="${cx}" y="${tagTxtY.toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(14)}" font-weight="600" letter-spacing="${s(2)}"
  fill="${C.accent}">${esc(tagLabel)}</text>

<!-- ─────── VERSE BLOCK ─────── -->
${arabicSvg}

<!-- Sep 1 -->
<line x1="${(cx - s(44)).toFixed(1)}" y1="${sep1.toFixed(1)}"
      x2="${(cx + s(44)).toFixed(1)}" y2="${sep1.toFixed(1)}"
  stroke="${C.line}" stroke-width="0.8"/>

${latinSvg}

<!-- Sep 2 -->
<line x1="${(cx - s(44)).toFixed(1)}" y1="${sep2.toFixed(1)}"
      x2="${(cx + s(44)).toFixed(1)}" y2="${sep2.toFixed(1)}"
  stroke="${C.line}" stroke-width="0.8"/>

${transSvg}

<!-- Surah arabic (small, below translation) -->
<text x="${cx}" y="${(H * 0.896).toFixed(1)}" text-anchor="middle"
  font-family="'Scheherazade New','Amiri',serif"
  font-size="${s(26)}" fill="${C.accentSub}">${esc(verse.surahArabic)}</text>

<!-- ─────── PROGRESS BAR ─────── -->
<!-- Track -->
<rect x="${barX.toFixed(1)}" y="${barY.toFixed(1)}"
  width="${barW.toFixed(1)}" height="${barH2.toFixed(1)}"
  rx="${(barH2 / 2).toFixed(1)}" fill="${C.bar}"/>
<!-- Fill -->
<rect x="${barX.toFixed(1)}" y="${barY.toFixed(1)}"
  width="${fillW.toFixed(1)}" height="${barH2.toFixed(1)}"
  rx="${(barH2 / 2).toFixed(1)}" fill="url(#barG)"/>
<!-- Head dot -->
<circle cx="${(barX + fillW).toFixed(1)}" cy="${(barY + barH2 / 2).toFixed(1)}"
  r="${s(5.5)}" fill="${C.accent}"/>

<!-- ─────── FOOTER ─────── -->
<text x="${cx}" y="${(H * 0.965).toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(13)}" font-weight="400" letter-spacing="${s(3)}"
  fill="${C.textSub}">QURAN DAILY</text>

</svg>`;
}

// ── Helpers ──────────────────────────────────────────────
function chunkWords(words, n) {
  const out = [];
  for (let i = 0; i < words.length; i += n)
    out.push(words.slice(i, i + n).join(' '));
  return out;
}

function wrap(text, max) {
  if (!text) return [''];
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
