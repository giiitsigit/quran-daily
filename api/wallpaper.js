// api/wallpaper.js — v3 FIXED LAYOUT
import {
  getDailyVerseSurahAyah, getYearProgress,
  formatHijri, formatGregorian,
  fetchVerseData, FALLBACK_VERSES
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
    dot:'rgba(255,255,255,0.055)', dotFill:'rgba(107,196,158,0.45)', dotHead:'#6bc49e',
    accent:'#6bc49e', accentSub:'rgba(107,196,158,0.30)',
    text:'#edf5f1', textDim:'rgba(237,245,241,0.40)', textSub:'rgba(237,245,241,0.18)',
    arabic:'#edf5f1', line:'rgba(107,196,158,0.14)',
    chip:'rgba(107,196,158,0.08)', chipBrd:'rgba(107,196,158,0.20)',
    bar:'rgba(107,196,158,0.12)',
  },
  warm: {
    bg:'#f6f1e9', bgGlow:'#e8e0d2',
    dot:'rgba(20,50,35,0.07)', dotFill:'rgba(25,95,65,0.42)', dotHead:'#1a6644',
    accent:'#1a6644', accentSub:'rgba(26,102,68,0.28)',
    text:'#111d17', textDim:'rgba(17,29,23,0.42)', textSub:'rgba(17,29,23,0.22)',
    arabic:'#111d17', line:'rgba(26,102,68,0.12)',
    chip:'rgba(26,102,68,0.06)', chipBrd:'rgba(26,102,68,0.16)',
    bar:'rgba(26,102,68,0.10)',
  },
  black: {
    bg:'#000000', bgGlow:'#101010',
    dot:'rgba(255,255,255,0.055)', dotFill:'rgba(255,255,255,0.46)', dotHead:'#ffffff',
    accent:'#ffffff', accentSub:'rgba(255,255,255,0.25)',
    text:'#ffffff', textDim:'rgba(255,255,255,0.38)', textSub:'rgba(255,255,255,0.16)',
    arabic:'#ffffff', line:'rgba(255,255,255,0.10)',
    chip:'rgba(255,255,255,0.05)', chipBrd:'rgba(255,255,255,0.12)',
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

function buildWallpaper({ W, H, verse, dayOfYear, daysInYear, pct, hijri, C }) {
  const cx = W / 2;
  const s  = (n) => +(n * (W / 1179)).toFixed(2);

  // ── FIXED VERTICAL LAYOUT ────────────────────────────
  const topLabelY  = H * 0.10;    // "HARI KE-xx · xx%"
  const chipY      = H * 0.113;   // date chip rect
  const chipTextY  = chipY + s(27);
  const chipH2     = s(40);
  const chipW2     = s(310);

  const surahTagY  = H * 0.22;    // "QS. SURAH : ayah"

  // Arabic block starts here
  const arabicStartY = H * 0.255;
  const arabicFsz    = s(50);
  const arabicLh     = arabicFsz * 1.75;

  const latinFsz   = s(20);
  const latinLh    = latinFsz * 1.6;
  const transFsz   = s(23);
  const transLh    = transFsz * 1.65;

  // Wrap text
  const arabicWords = verse.arabic.split(' ');
  const arabicLines = chunkWords(arabicWords, 5);
  const latinLines  = wrap(verse.latin, Math.floor(44 * W / 1179));
  const transLines  = wrap(verse.translation, Math.floor(40 * W / 1179));

  // Build arabic SVG, tracking Y
  let y = arabicStartY;
  const arabicSvg = arabicLines.map(line => {
    const el = `<text x="${cx}" y="${y.toFixed(1)}" text-anchor="middle"
      font-family="'Scheherazade New','Amiri',Georgia,serif"
      font-size="${arabicFsz}" fill="${C.arabic}" direction="rtl">${esc(line)}</text>`;
    y += arabicLh;
    return el;
  }).join('\n');

  y += s(20);
  const sep1Y = y;
  y += s(22);

  const latinSvg = latinLines.map(line => {
    const el = `<text x="${cx}" y="${y.toFixed(1)}" text-anchor="middle"
      font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
      font-size="${latinFsz}" font-style="italic" fill="${C.textDim}">${esc(line)}</text>`;
    y += latinLh;
    return el;
  }).join('\n');

  y += s(16);
  const sep2Y = y;
  y += s(20);

  const transSvg = transLines.map(line => {
    const el = `<text x="${cx}" y="${y.toFixed(1)}" text-anchor="middle"
      font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
      font-size="${transFsz}" fill="${C.text}">${esc(line)}</text>`;
    y += transLh;
    return el;
  }).join('\n');

  // After translation, place surah arabic name
  const surahArY = y + s(32);

  // Progress bar — fixed near bottom
  const barY  = H * 0.924;
  const barW  = W * 0.70;
  const barX  = cx - barW / 2;
  const barH2 = s(2.5);
  const fillW = barW * pct / 100;

  // Footer
  const footerY = H * 0.962;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="topGlow" cx="50%" cy="10%" r="60%" gradientUnits="userSpaceOnUse"
    x1="0" y1="0" x2="${W}" y2="${H * 0.5}">
    <stop offset="0%"   stop-color="${C.bgGlow}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${C.bg}"     stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="${C.bg}" stop-opacity="1"/>
    <stop offset="12%"  stop-color="${C.bg}" stop-opacity="0"/>
    <stop offset="72%"  stop-color="${C.bg}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${C.bg}" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="barG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${C.accentSub}"/>
    <stop offset="100%" stop-color="${C.accent}"/>
  </linearGradient>
</defs>

<!-- BG -->
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<rect width="${W}" height="${H * 0.6}" fill="url(#topGlow)" opacity="0.4"/>

<!-- Day label -->
<text x="${cx}" y="${topLabelY.toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(12)}" letter-spacing="${s(3)}" fill="${C.textSub}">HARI KE-${dayOfYear} DARI ${daysInYear}  ·  ${pct}%</text>

<!-- Date chip -->
<rect x="${(cx - chipW2/2).toFixed(1)}" y="${chipY.toFixed(1)}"
  width="${chipW2}" height="${chipH2}" rx="${s(20)}"
  fill="${C.chip}" stroke="${C.chipBrd}" stroke-width="0.8"/>
<text x="${cx}" y="${chipTextY.toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(18)}" fill="${C.textDim}">${esc(hijri)}</text>

<!-- Surah tag -->
<text x="${cx}" y="${surahTagY.toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(13)}" font-weight="600" letter-spacing="${s(2.5)}"
  fill="${C.accent}">QS. ${esc(verse.surahName.toUpperCase())} : ${verse.ayahN}</text>

<!-- ARABIC -->
${arabicSvg}

<!-- Sep 1 -->
<line x1="${(cx-s(40)).toFixed(1)}" y1="${sep1Y.toFixed(1)}"
      x2="${(cx+s(40)).toFixed(1)}" y2="${sep1Y.toFixed(1)}"
  stroke="${C.line}" stroke-width="0.8"/>

<!-- LATIN -->
${latinSvg}

<!-- Sep 2 -->
<line x1="${(cx-s(40)).toFixed(1)}" y1="${sep2Y.toFixed(1)}"
      x2="${(cx+s(40)).toFixed(1)}" y2="${sep2Y.toFixed(1)}"
  stroke="${C.line}" stroke-width="0.8"/>

<!-- TRANSLATION -->
${transSvg}

<!-- Surah arabic -->
<text x="${cx}" y="${surahArY.toFixed(1)}" text-anchor="middle"
  font-family="'Scheherazade New','Amiri',serif"
  font-size="${s(24)}" fill="${C.accentSub}">${esc(verse.surahArabic)}</text>

<!-- Progress bar -->
<rect x="${barX.toFixed(1)}" y="${barY.toFixed(1)}"
  width="${barW.toFixed(1)}" height="${barH2}" rx="${(barH2/2).toFixed(1)}"
  fill="${C.bar}"/>
<rect x="${barX.toFixed(1)}" y="${barY.toFixed(1)}"
  width="${fillW.toFixed(1)}" height="${barH2}" rx="${(barH2/2).toFixed(1)}"
  fill="url(#barG)"/>
<circle cx="${(barX+fillW).toFixed(1)}" cy="${(barY+barH2/2).toFixed(1)}"
  r="${s(5)}" fill="${C.accent}"/>

<!-- Footer -->
<text x="${cx}" y="${footerY.toFixed(1)}" text-anchor="middle"
  font-family="'DM Sans','Helvetica Neue',Arial,sans-serif"
  font-size="${s(12)}" letter-spacing="${s(3)}" fill="${C.textSub}">QURAN DAILY</text>

</svg>`;
}

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
