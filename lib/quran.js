// lib/quran.js — verse selection logic & data

export const SURAHS = [
  {n:1,ar:"الفاتحة",id:"Al-Fatihah",ayahs:7},{n:2,ar:"البقرة",id:"Al-Baqarah",ayahs:286},
  {n:3,ar:"آل عمران",id:"Ali Imran",ayahs:200},{n:4,ar:"النساء",id:"An-Nisa",ayahs:176},
  {n:5,ar:"المائدة",id:"Al-Maidah",ayahs:120},{n:6,ar:"الأنعام",id:"Al-An'am",ayahs:165},
  {n:7,ar:"الأعراف",id:"Al-A'raf",ayahs:206},{n:8,ar:"الأنفال",id:"Al-Anfal",ayahs:75},
  {n:9,ar:"التوبة",id:"At-Tawbah",ayahs:129},{n:10,ar:"يونس",id:"Yunus",ayahs:109},
  {n:11,ar:"هود",id:"Hud",ayahs:123},{n:12,ar:"يوسف",id:"Yusuf",ayahs:111},
  {n:13,ar:"الرعد",id:"Ar-Ra'd",ayahs:43},{n:14,ar:"إبراهيم",id:"Ibrahim",ayahs:52},
  {n:15,ar:"الحجر",id:"Al-Hijr",ayahs:99},{n:16,ar:"النحل",id:"An-Nahl",ayahs:128},
  {n:17,ar:"الإسراء",id:"Al-Isra",ayahs:111},{n:18,ar:"الكهف",id:"Al-Kahf",ayahs:110},
  {n:19,ar:"مريم",id:"Maryam",ayahs:98},{n:20,ar:"طه",id:"Ta-Ha",ayahs:135},
  {n:21,ar:"الأنبياء",id:"Al-Anbiya",ayahs:112},{n:22,ar:"الحج",id:"Al-Hajj",ayahs:78},
  {n:23,ar:"المؤمنون",id:"Al-Mu'minun",ayahs:118},{n:24,ar:"النور",id:"An-Nur",ayahs:64},
  {n:25,ar:"الفرقان",id:"Al-Furqan",ayahs:77},{n:26,ar:"الشعراء",id:"Ash-Shu'ara",ayahs:227},
  {n:27,ar:"النمل",id:"An-Naml",ayahs:93},{n:28,ar:"القصص",id:"Al-Qasas",ayahs:88},
  {n:29,ar:"العنكبوت",id:"Al-Ankabut",ayahs:69},{n:30,ar:"الروم",id:"Ar-Rum",ayahs:60},
  {n:31,ar:"لقمان",id:"Luqman",ayahs:34},{n:32,ar:"السجدة",id:"As-Sajdah",ayahs:30},
  {n:33,ar:"الأحزاب",id:"Al-Ahzab",ayahs:73},{n:34,ar:"سبأ",id:"Saba",ayahs:54},
  {n:35,ar:"فاطر",id:"Fatir",ayahs:45},{n:36,ar:"يس",id:"Ya-Sin",ayahs:83},
  {n:37,ar:"الصافات",id:"As-Saffat",ayahs:182},{n:38,ar:"ص",id:"Sad",ayahs:88},
  {n:39,ar:"الزمر",id:"Az-Zumar",ayahs:75},{n:40,ar:"غافر",id:"Ghafir",ayahs:85},
  {n:41,ar:"فصلت",id:"Fussilat",ayahs:54},{n:42,ar:"الشورى",id:"Ash-Shura",ayahs:53},
  {n:43,ar:"الزخرف",id:"Az-Zukhruf",ayahs:89},{n:44,ar:"الدخان",id:"Ad-Dukhan",ayahs:59},
  {n:45,ar:"الجاثية",id:"Al-Jathiyah",ayahs:37},{n:46,ar:"الأحقاف",id:"Al-Ahqaf",ayahs:35},
  {n:47,ar:"محمد",id:"Muhammad",ayahs:38},{n:48,ar:"الفتح",id:"Al-Fath",ayahs:29},
  {n:49,ar:"الحجرات",id:"Al-Hujurat",ayahs:18},{n:50,ar:"ق",id:"Qaf",ayahs:45},
  {n:51,ar:"الذاريات",id:"Adh-Dhariyat",ayahs:60},{n:52,ar:"الطور",id:"At-Tur",ayahs:49},
  {n:53,ar:"النجم",id:"An-Najm",ayahs:62},{n:54,ar:"القمر",id:"Al-Qamar",ayahs:55},
  {n:55,ar:"الرحمن",id:"Ar-Rahman",ayahs:78},{n:56,ar:"الواقعة",id:"Al-Waqi'ah",ayahs:96},
  {n:57,ar:"الحديد",id:"Al-Hadid",ayahs:29},{n:58,ar:"المجادلة",id:"Al-Mujadila",ayahs:22},
  {n:59,ar:"الحشر",id:"Al-Hashr",ayahs:24},{n:60,ar:"الممتحنة",id:"Al-Mumtahanah",ayahs:13},
  {n:61,ar:"الصف",id:"As-Saf",ayahs:14},{n:62,ar:"الجمعة",id:"Al-Jumu'ah",ayahs:11},
  {n:63,ar:"المنافقون",id:"Al-Munafiqun",ayahs:11},{n:64,ar:"التغابن",id:"At-Taghabun",ayahs:18},
  {n:65,ar:"الطلاق",id:"At-Talaq",ayahs:12},{n:66,ar:"التحريم",id:"At-Tahrim",ayahs:12},
  {n:67,ar:"الملك",id:"Al-Mulk",ayahs:30},{n:68,ar:"القلم",id:"Al-Qalam",ayahs:52},
  {n:69,ar:"الحاقة",id:"Al-Haqqah",ayahs:52},{n:70,ar:"المعارج",id:"Al-Ma'arij",ayahs:44},
  {n:71,ar:"نوح",id:"Nuh",ayahs:28},{n:72,ar:"الجن",id:"Al-Jinn",ayahs:28},
  {n:73,ar:"المزمل",id:"Al-Muzzammil",ayahs:20},{n:74,ar:"المدثر",id:"Al-Muddaththir",ayahs:56},
  {n:75,ar:"القيامة",id:"Al-Qiyamah",ayahs:40},{n:76,ar:"الإنسان",id:"Al-Insan",ayahs:31},
  {n:77,ar:"المرسلات",id:"Al-Mursalat",ayahs:50},{n:78,ar:"النبأ",id:"An-Naba",ayahs:40},
  {n:79,ar:"النازعات",id:"An-Nazi'at",ayahs:46},{n:80,ar:"عبس",id:"Abasa",ayahs:42},
  {n:81,ar:"التكوير",id:"At-Takwir",ayahs:29},{n:82,ar:"الانفطار",id:"Al-Infitar",ayahs:19},
  {n:83,ar:"المطففين",id:"Al-Mutaffifin",ayahs:36},{n:84,ar:"الانشقاق",id:"Al-Inshiqaq",ayahs:25},
  {n:85,ar:"البروج",id:"Al-Buruj",ayahs:22},{n:86,ar:"الطارق",id:"At-Tariq",ayahs:17},
  {n:87,ar:"الأعلى",id:"Al-A'la",ayahs:19},{n:88,ar:"الغاشية",id:"Al-Ghashiyah",ayahs:26},
  {n:89,ar:"الفجر",id:"Al-Fajr",ayahs:30},{n:90,ar:"البلد",id:"Al-Balad",ayahs:20},
  {n:91,ar:"الشمس",id:"Ash-Shams",ayahs:15},{n:92,ar:"الليل",id:"Al-Layl",ayahs:21},
  {n:93,ar:"الضحى",id:"Ad-Duhaa",ayahs:11},{n:94,ar:"الشرح",id:"Ash-Sharh",ayahs:8},
  {n:95,ar:"التين",id:"At-Tin",ayahs:8},{n:96,ar:"العلق",id:"Al-Alaq",ayahs:19},
  {n:97,ar:"القدر",id:"Al-Qadr",ayahs:5},{n:98,ar:"البينة",id:"Al-Bayyinah",ayahs:8},
  {n:99,ar:"الزلزلة",id:"Az-Zalzalah",ayahs:8},{n:100,ar:"العاديات",id:"Al-Adiyat",ayahs:11},
  {n:101,ar:"القارعة",id:"Al-Qari'ah",ayahs:11},{n:102,ar:"التكاثر",id:"At-Takathur",ayahs:8},
  {n:103,ar:"العصر",id:"Al-Asr",ayahs:3},{n:104,ar:"الهمزة",id:"Al-Humazah",ayahs:9},
  {n:105,ar:"الفيل",id:"Al-Fil",ayahs:5},{n:106,ar:"قريش",id:"Quraysh",ayahs:4},
  {n:107,ar:"الماعون",id:"Al-Ma'un",ayahs:7},{n:108,ar:"الكوثر",id:"Al-Kawthar",ayahs:3},
  {n:109,ar:"الكافرون",id:"Al-Kafirun",ayahs:6},{n:110,ar:"النصر",id:"An-Nasr",ayahs:3},
  {n:111,ar:"المسد",id:"Al-Masad",ayahs:5},{n:112,ar:"الإخلاص",id:"Al-Ikhlas",ayahs:4},
  {n:113,ar:"الفلق",id:"Al-Falaq",ayahs:5},{n:114,ar:"الناس",id:"An-Nas",ayahs:6},
];

export const THEMES = {
  sabar:   [{s:2,a:153},{s:2,a:155},{s:3,a:200},{s:39,a:10},{s:103,a:3}],
  rezeki:  [{s:11,a:6},{s:65,a:3},{s:51,a:58},{s:2,a:3}],
  cinta:   [{s:30,a:21},{s:2,a:195},{s:3,a:31},{s:19,a:96}],
  syukur:  [{s:14,a:7},{s:2,a:152},{s:27,a:40},{s:31,a:12}],
  taubat:  [{s:39,a:53},{s:66,a:8},{s:2,a:160},{s:4,a:110}],
  ilmu:    [{s:96,a:1},{s:20,a:114},{s:58,a:11},{s:2,a:269}],
  taqwa:   [{s:2,a:2},{s:3,a:102},{s:49,a:13}],
  doa:     [{s:2,a:186},{s:40,a:60},{s:1,a:5},{s:1,a:6}],
  akhirat: [{s:2,a:285},{s:3,a:185},{s:29,a:64}],
};

// Seeded random — same date always returns same verse
function seededRandom(seed) {
  let x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function getDailyVerseSurahAyah(date, surahN = null, tema = null) {
  const d = new Date(date);
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

  if (tema && THEMES[tema]) {
    const list = THEMES[tema];
    const idx = Math.floor(seededRandom(seed) * list.length);
    return list[idx];
  }

  if (surahN) {
    const surah = SURAHS.find(s => s.n === parseInt(surahN));
    if (surah) {
      const ayah = Math.floor(seededRandom(seed) * surah.ayahs) + 1;
      return { s: surah.n, a: ayah };
    }
  }

  // Random from all 6236 ayahs
  const totalVerses = 6236;
  const verseIndex = Math.floor(seededRandom(seed) * totalVerses) + 1;
  let count = 0;
  for (const s of SURAHS) {
    if (count + s.ayahs >= verseIndex) {
      return { s: s.n, a: verseIndex - count };
    }
    count += s.ayahs;
  }
  return { s: 1, a: 1 };
}

export function getYearProgress(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const end = new Date(d.getFullYear() + 1, 0, 1);
  const dayOfYear = Math.ceil((d - start) / 86400000) + 1;
  const daysInYear = Math.ceil((end - start) / 86400000);
  const pct = Math.round((dayOfYear / daysInYear) * 100);
  return { dayOfYear, daysInYear, pct };
}

export function formatHijri(date) {
  const d = new Date(date);
  const jd = Math.floor((d / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) +
            Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
              Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * lll) / 709);
  const dd = lll - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  const hMonths = ["Muharram","Safar","Rabi'ul Awal","Rabi'ul Akhir","Jumadil Awal","Jumadil Akhir","Rajab","Sya'ban","Ramadhan","Syawal","Dzulqa'dah","Dzulhijjah"];
  return `${dd} ${hMonths[m - 1]} ${y} H`;
}

export function formatGregorian(date) {
  const d = new Date(date);
  const days = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumat','Sabtu'];
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Fetch verse from Quran API (used server-side)
export async function fetchVerseData(surahN, ayahN) {
  try {
    const [arabRes, idRes, latinRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${surahN}:${ayahN}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/ayah/${surahN}:${ayahN}/id.indonesian`),
      fetch(`https://api.alquran.cloud/v1/ayah/${surahN}:${ayahN}/en.transliteration`),
    ]);
    const [arabData, idData, latinData] = await Promise.all([arabRes.json(), idRes.json(), latinRes.json()]);
    const surahInfo = SURAHS.find(s => s.n === surahN);

    return {
      arabic: arabData.data?.text || '',
      translation: idData.data?.text || '',
      latin: latinData.data?.text || '',
      surahName: surahInfo?.id || arabData.data?.surah?.englishName || '',
      surahArabic: surahInfo?.ar || '',
      surahN,
      ayahN,
    };
  } catch (e) {
    return FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
  }
}

export const FALLBACK_VERSES = [
  { arabic:"لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation:"Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.", latin:"La yukallifullahu nafsan illa wus'aha", surahName:"Al-Baqarah", surahArabic:"البقرة", surahN:2, ayahN:286 },
  { arabic:"فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", translation:"Maka sesungguhnya bersama kesulitan ada kemudahan.", latin:"Fa-inna ma'al 'usri yusra", surahName:"Ash-Sharh", surahArabic:"الشرح", surahN:94, ayahN:5 },
  { arabic:"حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ", translation:"Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung.", latin:"Hasbunallahu wa ni'mal wakil", surahName:"Ali Imran", surahArabic:"آل عمران", surahN:3, ayahN:173 },
  { arabic:"وَعَسَىٰٓ أَن تَكْرَهُوا۟ شَيْـًٔا وَهُوَ خَيْرٌ لَّكُمْ", translation:"Boleh jadi kamu membenci sesuatu, padahal ia amat baik bagimu.", latin:"Wa 'asaa an takrahuu syai-an wa huwa khayrun lakum", surahName:"Al-Baqarah", surahArabic:"البقرة", surahN:2, ayahN:216 },
  { arabic:"إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ", translation:"Sesungguhnya Allah beserta orang-orang yang sabar.", latin:"Innallaha ma'as shabiriin", surahName:"Al-Baqarah", surahArabic:"البقرة", surahN:2, ayahN:153 },
];
