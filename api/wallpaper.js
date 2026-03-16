diff --git a/api/wallpaper.js b/api/wallpaper.js
index 46fd919b69f1c587357455f0549b20ff33a12f63..fd76c637bed64845ce7a51aa1effbd6e4f521c5a 100644
--- a/api/wallpaper.js
+++ b/api/wallpaper.js
@@ -1,43 +1,54 @@
 // api/wallpaper.js — v4 CLEAN LAYOUT
+import { readFile } from 'node:fs/promises';
+import { Resvg, initWasm } from '@resvg/resvg-wasm';
 import {
   getDailyVerseSurahAyah, getYearProgress,
   formatHijri, fetchVerseData, FALLBACK_VERSES
 } from '../lib/quran.js';
 
-export const config = { runtime: 'edge' };
+export const config = { runtime: 'nodejs' };
 
 const DEVICES = {
   'iphone-pro':  { w: 1179, h: 2556 },
   'iphone':      { w: 1170, h: 2532 },
   'iphone-se':   { w: 750,  h: 1334 },
   'iphone-plus': { w: 1290, h: 2796 },
   'android-fhd': { w: 1080, h: 2400 },
   'pixel':       { w: 1080, h: 2340 },
   'universal':   { w: 1080, h: 1920 },
 };
 
+let wasmReady;
+async function ensureResvgWasm() {
+  if (!wasmReady) {
+    wasmReady = readFile(new URL('../node_modules/@resvg/resvg-wasm/index_bg.wasm', import.meta.url))
+      .then((wasm) => initWasm(wasm));
+  }
+  return wasmReady;
+}
+
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
@@ -62,55 +73,59 @@ export default async function handler(req) {
 
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
+  await ensureResvgWasm();
+  const resvg = new Resvg(svg);
+  const png = resvg.render().asPng();
 
-  return new Response(svg, {
+  return new Response(png, {
     headers: {
-      'Content-Type':  'image/svg+xml',
-      'Cache-Control': 'no-cache, no-store, must-revalidate',
+      'Content-Type': 'image/png',
+      'Content-Length': String(png.byteLength),
+      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600',
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
 
   // ── Fixed zones ──
   const HEADER_H = H * 0.18;
   const FOOTER_H = H * 0.09;
   const MIDDLE_H = H - HEADER_H - FOOTER_H;
 
   // ── Wrap text first (needed to count lines for scaling) ──
   const arabicWords = (verse.arabic || '').split(' ');
 
   // Auto-scale: start at max font size, shrink until content fits
   // Try scale factors from 1.0 down to 0.45
   let scale = 1.0;
   let arabicLines, latinLines, transLines, FS, LH, GAP_TAG_ARABIC, GAP_SEP, GAP_SURAH_AR, blockH;
 
