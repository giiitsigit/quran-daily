// api/wallpaper.js — v4 CLEAN LAYOUT
import {
  getDailyVerseSurahAyah, getYearProgress,
  formatHijri, fetchVerseData, FALLBACK_VERSES
} from '../lib/quran.js';

export const config = { runtime: 'edge' };

const DEVICES = {
  'iphone-pro':  { w: 1179, h: 2556 },
  'iphone':      { w: 1170, h: 2532 },
  'iphone-se':   { w: 750,  h: 1334 },
  'iphone-plus': { w: 1290, h: 2796 },
  'android-fhd': { w: 1080, h: 2400 },
  'pixel':       { w: 1080, h: 2340 },
  'universal':   { w: 1080, h: 1920 },
};

const PALETTES = {
  dark: {
    bg:'#0b1814', bgGlow:'#142820',
    accent:'#6bc49e', accentSub:'rgba(107,196,158,0.28)',
    text:'#edf5f1', textDim:'rgba(237,245,241,0.42)', textSub:'rgba(237,245,241,0.20)',
    arabic:'#edf5f1', line:'rgba(107,196,158,0.15)',
    chip:'rgba(107,196,158,0.08)', chipBrd:'rgba(107,196,158,0.22)',
    bar:'rgba(107,196,158,0.12)',
  },
  warm: {
    bg:'#f6f1e9', bgGlow:'#e8e0d2',
    accent:'#1a6644', accentSub:'rgba(26,102,68,0.28)',
    text:'#111d17', textDim:'rgba(17,29,23,0.45)', textSub:'rgba(17,29,23,0.25)',
    arabic:'#111d17', line:'rgba(26,102,68,0.14)',
    chip:'rgba(26,102,68,0.06)', chipBrd:'rgba(26,102,68,0.18)',
    bar:'rgba(26,102,68,0.10)',
  },
  black: {
    bg:'#000000', bgGlow:'#111111',
    accent:'#ffffff', accentSub:'rgba(255,255,255,0.25)',
    text:'#ffffff', textDim:'rgba(255,255,255,0.40)', textSub:'rgba(255,255,255,0.18)',
    arabic:'#ffffff', line:'rgba(255,255,255,0.10)',
    chip:'rgba(255,255,255,0.06)', chipBrd:'rgba(255,255,255,0.14)',
    bar:'rgba(255,255,255,0.08)',
  },
};

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

  const yy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
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
  const hijri = formatHijri(today);
  const C     = PALETTES[palette] || PALETTES.dark;

  const svg = buildWallpaper({ W, H, verse, dayOfYear, daysInYear, pct, hijri, C });

  return new Response(svg, {
    headers: {
      'Content-Type':  'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

// ─────────────────────────────────────────────────────────
// SVG BUILDER — simple top-to-bottom flow, no complex math
// ─────────────────────────────────────────────────────────
function buildWallpaper({ W, H, verse, dayOfYear, daysInYear, pct, hijri, C }) {
  const cx  = W / 2;
  // px() scales a "design unit" based on W=1080 baseline
  const px  = (n) => Math.round(n * W / 1080);

  // ── Font sizes ──
  const FS = {
    label:  px(22),   // "HARI KE-xx"
    chip:   px(30),   // date in chip
    tag:    px(22),   // "QS. SURAH : N"
    arabic: px(76),   // arabic verse
    latin:  px(32),   // transliteration
    trans:  px(36),   // translation
    suarAr: px(38),   // surah name arabic
    footer: px(20),   // "QURAN DAILY"
  };

  // ── Wrap text ──
  const arabicWords = (verse.arabic || '').split(' ');
  const arabicLines = chunkWords(arabicWords, 5);
  const latinLines  = wrap(verse.latin || '', px(38));
  const transLines  = wrap(verse.translation || '', px(34));

  // ── Line heights ──
  const LH = {
    arabic: FS.arabic * 1.8,
    latin:  FS.latin  * 1.65,
    trans:  FS.trans  * 1.65,
  };

  // ── Build content lines as array of {type, text?, y_offset} ──
  // We'll stack them with a cursor
  // First calculate total height of the "verse block"
  const GAP_TAG_ARABIC = px(40);
  const GAP_SEP        = px(32);
  const GAP_SURAH_AR   = px(48);

  const blockH =
    FS.tag +
    GAP_TAG_ARABIC +
    arabicLines.length * LH.arabic +
    GAP_SEP +
    latinLines.length  * LH.latin  +
    GAP_SEP +
    transLines.length  * LH.trans  +
    GAP_SURAH_AR +
    FS.suarAr;

  // ── Fixed zones ──
  // Header: top 18% — day label + chip
  // Footer: bottom 9% — progress bar + footer text
  // Middle: remaining — verse block vertically centered

  const HEADER_H = H * 0.18;
  const FOOTER_H = H * 0.09;
  const MIDDLE_H = H - HEADER_H - FOOTER_H;

  // Clamp: if block too tall for middle, start earlier
  const blockTop = HEADER_H + Math.max(0, (MIDDLE_H - blockH) / 2);

  // ── Header positions ──
  const dayLabelY  = H * 0.085;
  const chipRectY  = H * 0.105;
  const chipH      = px(60);
  const chipW      = px(480);
  const chipTextY  = chipRectY + chipH * 0.64; // vertically centered in chip

  // ── Content cursor ──
  let y = blockTop;

  // Surah tag
  const surahTagY = y + FS.tag;
  y = surahTagY + GAP_TAG_ARABIC;

  // Arabic
  const arabicSvg = arabicLines.map(line => {
    y += LH.arabic;
    return `<text x="${cx}" y="${y}"
      text-anchor="middle"
      font-family="'Scheherazade New','Amiri',Georgia,serif"
      font-size="${FS.arabic}"
      fill="${C.arabic}"
      direction="rtl">${esc(line)}</text>`;
  }).join('\n');
  // y is now after last arabic line

  // Sep 1
  y += GAP_SEP;
  const sep1Y = y;

  // Latin
  const latinSvg = latinLines.map(line => {
    y += LH.latin;
    return `<text x="${cx}" y="${y}"
      text-anchor="middle"
      font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
      font-size="${FS.latin}"
      font-style="italic"
      fill="${C.textDim}">${esc(line)}</text>`;
  }).join('\n');

  // Sep 2
  y += GAP_SEP;
  const sep2Y = y;

  // Translation
  const transSvg = transLines.map(line => {
    y += LH.trans;
    return `<text x="${cx}" y="${y}"
      text-anchor="middle"
      font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
      font-size="${FS.trans}"
      fill="${C.text}">${esc(line)}</text>`;
  }).join('\n');

  // Surah arabic name
  y += GAP_SURAH_AR;
  const surahArY = y;

  // ── Progress bar ──
  const barPad  = W * 0.14;
  const barY    = H - FOOTER_H * 0.55;
  const barW    = W - barPad * 2;
  const barH2   = px(3);
  const fillW   = Math.max(barH2, barW * pct / 100);
  const footerY = H - FOOTER_H * 0.15;

  // ── Horizontal pad for separators ──
  const sepPad = W * 0.42;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="g1" cx="50%" cy="0%" r="70%">
    <stop offset="0%"   stop-color="${C.bgGlow}" stop-opacity="0.8"/>
    <stop offset="100%" stop-color="${C.bg}"     stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="barG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${C.accentSub}"/>
    <stop offset="100%" stop-color="${C.accent}"/>
  </linearGradient>
</defs>

<!-- Background -->
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<rect width="${W}" height="${H}" fill="url(#g1)"/>

<!-- ── HEADER ── -->
<text x="${cx}" y="${dayLabelY}"
  text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${FS.label}" letter-spacing="${px(4)}"
  fill="${C.textSub}">HARI KE-${dayOfYear} DARI ${daysInYear}  ·  ${pct}%</text>

<rect x="${cx - chipW/2}" y="${chipRectY}"
  width="${chipW}" height="${chipH}" rx="${chipH/2}"
  fill="${C.chip}" stroke="${C.chipBrd}" stroke-width="1"/>
<text x="${cx}" y="${chipTextY}"
  text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${FS.chip}" fill="${C.textDim}">${esc(hijri)}</text>

<!-- ── SURAH TAG ── -->
<text x="${cx}" y="${surahTagY}"
  text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${FS.tag}" font-weight="600" letter-spacing="${px(3)}"
  fill="${C.accent}">QS. ${esc(verse.surahName.toUpperCase())} : ${verse.ayahN}</text>

<!-- ── ARABIC ── -->
${arabicSvg}

<!-- Sep 1 -->
<line x1="${sepPad}" y1="${sep1Y}" x2="${W - sepPad}" y2="${sep1Y}"
  stroke="${C.line}" stroke-width="1"/>

<!-- ── LATIN ── -->
${latinSvg}

<!-- Sep 2 -->
<line x1="${sepPad}" y1="${sep2Y}" x2="${W - sepPad}" y2="${sep2Y}"
  stroke="${C.line}" stroke-width="1"/>

<!-- ── TRANSLATION ── -->
${transSvg}

<!-- ── SURAH ARABIC ── -->
<text x="${cx}" y="${surahArY}"
  text-anchor="middle"
  font-family="'Scheherazade New','Amiri',serif"
  font-size="${FS.suarAr}" fill="${C.accentSub}">${esc(verse.surahArabic)}</text>

<!-- ── PROGRESS BAR ── -->
<rect x="${barPad}" y="${barY}"
  width="${barW}" height="${barH2}" rx="${barH2/2}"
  fill="${C.bar}"/>
<rect x="${barPad}" y="${barY}"
  width="${fillW}" height="${barH2}" rx="${barH2/2}"
  fill="url(#barG)"/>
<circle cx="${barPad + fillW}" cy="${barY + barH2/2}"
  r="${px(8)}" fill="${C.accent}"/>

<!-- ── FOOTER ── -->
<text x="${cx}" y="${footerY}"
  text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${FS.footer}" letter-spacing="${px(4)}"
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

function wrap(text, maxChars) {
  if (!text) return [''];
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length > maxChars) { if (cur) lines.push(cur); cur = w; }
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
