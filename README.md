# 🕌 Quran Daily — Wallpaper Harian Al-Quran

Seperti Life Calendar tapi untuk Al-Quran. Setiap hari ganti ayat otomatis jadi wallpaper lock screen.

## ⚡ Deploy ke Vercel (5 menit)

### Cara 1: Via GitHub (Recommended)

1. Upload folder ini ke GitHub repository baru
2. Buka [vercel.com](https://vercel.com) → Sign in → **New Project**
3. Import repository GitHub Anda
4. Klik **Deploy** — selesai! Vercel auto-detect semua config

### Cara 2: Via Vercel CLI

```bash
npm i -g vercel
cd quran-daily
vercel --prod
```

---

## 📱 Cara Pakai

### Buka Web App
Buka `https://your-app.vercel.app` di browser → pilih perangkat & mode → salin URL.

### URL API Langsung
```
GET https://your-app.vercel.app/api/wallpaper
```

**Parameter:**

| Parameter | Nilai | Default | Keterangan |
|-----------|-------|---------|------------|
| `device`  | `iphone-pro`, `iphone`, `iphone-se`, `android-fhd`, `pixel`, `universal` | `iphone-pro` | Resolusi perangkat |
| `w` / `h` | angka piksel | 1179/2556 | Custom resolusi |
| `mode`    | `random`, `surah`, `tema` | `random` | Mode pemilihan ayat |
| `surah`   | 1–114 | — | Nomor surah (jika mode=surah) |
| `tema`    | `sabar`, `rezeki`, `cinta`, `syukur`, `taubat`, `ilmu`, `taqwa`, `doa`, `akhirat` | — | Tema ayat |
| `theme`   | `dark`, `light` | `dark` | Warna wallpaper |
| `tz`      | timezone string | `Asia/Jakarta` | Timezone (untuk tanggal) |

**Contoh URL:**
```
# Random harian - iPhone Pro
https://your-app.vercel.app/api/wallpaper?device=iphone-pro&mode=random

# Surah Ya-Sin - Android
https://your-app.vercel.app/api/wallpaper?device=android-fhd&mode=surah&surah=36

# Tema Sabar - Light mode
https://your-app.vercel.app/api/wallpaper?device=iphone&mode=tema&tema=sabar&theme=light
```

---

## 📱 Setup iPhone (Shortcuts)

1. Buka **Shortcuts** → **Automation** → **+** → **New Automation**
2. Trigger: **Time of Day** → 06:00 → Daily → aktifkan **"Run Immediately"**
3. Add action: **Get Contents of URL** → masukkan URL di atas
4. Add action: **Set Wallpaper Photo** → Contents of URL → Lock Screen
   - Matikan: "Show Preview" & "Crop to Subject"
5. **Done** ✓ → Test dengan ▶️

---

## 🤖 Setup Android (MacroDroid)

1. Install **MacroDroid** dari Play Store
2. Buat Macro → Trigger: **Day/Time: 06:00** setiap hari
3. Action: **Web Interactions → HTTP Request (GET)** → URL di atas
   - Save response → `/Download/quran-daily.png`
4. Action: **Device → Set Wallpaper** → file path di atas → Lock Screen
5. Save & Test ✓

---

## 🗂 Struktur Project

```
quran-daily/
├── api/
│   └── wallpaper.js      # Vercel Edge Function — generates SVG/image
├── lib/
│   └── quran.js          # Verse logic, Hijri calendar, Quran data
├── public/
│   └── index.html        # Web app settings UI
├── vercel.json           # Routing config
└── package.json
```

---

## 🔧 Kustomisasi

Edit `api/wallpaper.js` fungsi `buildSVG()` untuk mengubah tampilan wallpaper.
Edit `lib/quran.js` untuk menambah tema atau verse collections baru.

---

## 📡 API Quran

Menggunakan [alquran.cloud](https://alquran.cloud/api) API (gratis, tidak perlu API key).
- Arabic: `quran-uthmani` edition
- Terjemahan: `id.indonesian` edition  
- Latin: `en.transliteration` edition

---

Made with ❤️ — Semoga bermanfaat. بارك الله فيكم
