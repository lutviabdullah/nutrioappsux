import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  Droplets,
  Flame,
  GraduationCap,
  HeartPulse,
  Home,
  Leaf,
  Recycle,
  Sparkles,
  Target,
  TrendingUp,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import './styles.css';

const indonesianMenuCatalog = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Kampung',
    subtitle: 'Nasi, telur, sayur, bawang, rempah lokal',
    emoji: '🍛',
    category: 'Harian',
    basePrice: 15000,
    nutritionScore: 74,
    ecoScore: 68,
    recommendation: 'Menu klasik yang tetap cocok untuk kebutuhan energi harian, terutama saat ditambah sayuran berlimpah.',
  },
  {
    id: 'gado-gado',
    name: 'Gado-Gado Nusantara',
    subtitle: 'Sayur segar, tahu, tempe, kacang, sambal',
    emoji: '🥗',
    category: 'Vegan',
    basePrice: 12000,
    nutritionScore: 91,
    ecoScore: 89,
    recommendation: 'Pilihan paling kuat untuk pola makan seimbang karena kaya serat, protein nabati, dan kandungan sayur.',
  },
  {
    id: 'soto-ayam',
    name: 'Soto Ayam Sehat',
    subtitle: 'Kaldu ringan, ayam fillet, wortel, daun seledri',
    emoji: '🍲',
    category: 'Tradisional',
    basePrice: 16500,
    nutritionScore: 72,
    ecoScore: 71,
    recommendation: 'Soto ini ringan dan cocok untuk kebutuhan protein harian jika disajikan dengan porsi sayur lebih besar.',
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam Kampus',
    subtitle: 'Mie, ayam potong kecil, sawi, pangsit',
    emoji: '🍜',
    category: 'Kantin',
    basePrice: 17000,
    nutritionScore: 68,
    ecoScore: 62,
    recommendation: 'Menu familiar dan praktis, tetapi lebih baik dibarengi dengan sayur segar untuk keseimbangan nutrisi.',
  },
  {
    id: 'pecel',
    name: 'Pecel Sayur',
    subtitle: 'Lontong, sayur rebus, kacang, sambal',
    emoji: '🥬',
    category: 'Sehat',
    basePrice: 14000,
    nutritionScore: 85,
    ecoScore: 80,
    recommendation: 'Sangat cocok untuk menu siang yang ringan namun kaya serat dan anti lelah.',
  },
  {
    id: 'rendang',
    name: 'Rendang Padang',
    subtitle: 'Daging sapi, santan, rempah khas',
    emoji: '🥘',
    category: 'Protein',
    basePrice: 26000,
    nutritionScore: 77,
    ecoScore: 52,
    recommendation: 'Lezat untuk momen spesial, namun sebaiknya dihadirkan dengan sayur agar keseimbangan lebih optimal.',
  },
  {
    id: 'bakso',
    name: 'Bakso Sehat',
    subtitle: 'Bakso sapi, mie, sawi, kuah kaldu',
    emoji: '🍜',
    category: 'Kantin',
    basePrice: 18000,
    nutritionScore: 70,
    ecoScore: 64,
    recommendation: 'Cocok sebagai pemenuhan protein, dan pilih kuah yang lebih bening serta sayur lebih banyak.',
  },
  {
    id: 'tempe-bowl',
    name: 'Tempe Bowl',
    subtitle: 'Nasi, tempe crispy, sambal hijau, lalapan',
    emoji: '🥣',
    category: 'Plant Based',
    basePrice: 14000,
    nutritionScore: 86,
    ecoScore: 83,
    recommendation: 'Pilihan ini sangat bagus untuk gaya hidup berkelanjutan dan pas untuk makan siang rutin.',
  },
  {
    id: 'ayam-geprek',
    name: 'Ayam Geprek Ceker',
    subtitle: 'Ayam crispy, sambal, kol, timun',
    emoji: '🍗',
    category: 'Fast Food',
    basePrice: 21000,
    nutritionScore: 63,
    ecoScore: 58,
    recommendation: 'Rasa nikmat dan mengenyangkan, tapi lebih sehat bila dikombinasikan dengan sayur dan porsi wajar.',
  },
  {
    id: 'rawon',
    name: 'Rawon Suroboyo',
    subtitle: 'Daging, kuah rempah hitam, daun bawang',
    emoji: '🍲',
    category: 'Tradisional',
    basePrice: 22000,
    nutritionScore: 75,
    ecoScore: 59,
    recommendation: 'Menu ini kaya rasa dan protein, tetapi sebaiknya dipadukan dengan tambahan sayur hijau.',
  },
  {
    id: 'pempek',
    name: 'Pempek Palembang',
    subtitle: 'Ikan giling, mie, cuko, sayur mentimun',
    emoji: '🐟',
    category: 'Seafood',
    basePrice: 19000,
    nutritionScore: 79,
    ecoScore: 73,
    recommendation: 'Sumber protein yang baik untuk variasi harian jika dikonsumsi dengan porsi yang seimbang.',
  },
  {
    id: 'lontong-sayur',
    name: 'Lontong Sayur',
    subtitle: 'Lontong, sayur santan, tahu, tempe',
    emoji: '🥥',
    category: 'Tradisional',
    basePrice: 13000,
    nutritionScore: 82,
    ecoScore: 81,
    recommendation: 'Menu ini sangat ramah kantong dan juga kaya serat, terutama saat sayuran hadir lebih dominan.',
  },
  {
    id: 'sate-ayam',
    name: 'Sate Ayam Madura',
    subtitle: 'Ayam, lontong, bumbu kacang, timun',
    emoji: '🍢',
    category: 'Protein',
    basePrice: 20000,
    nutritionScore: 81,
    ecoScore: 69,
    recommendation: 'Sate bisa menjadi pilihan tinggi protein, namun lebih baik untuk takaran porsi yang moderat.',
  },
  {
    id: 'es-teh',
    name: 'Es Teh Segar',
    subtitle: 'Teh, lemon, irisan mentimun, es batu',
    emoji: '🧊',
    category: 'Minuman',
    basePrice: 7000,
    nutritionScore: 55,
    ecoScore: 88,
    recommendation: 'Minuman segar yang cocok untuk menjaga hidrasi, terutama ketika tidak terlalu manis.',
  },
  {
    id: 'rujak',
    name: 'Rujak Buah',
    subtitle: 'Buah segar, kacang, bumbu petis',
    emoji: '🍇',
    category: 'Buah',
    basePrice: 12000,
    nutritionScore: 83,
    ecoScore: 87,
    recommendation: 'Pilihan yang sangat baik untuk serat dan vitamin sekaligus tetap menyegarkan saat siang hari.',
  },
  {
    id: 'tumis-kangkung',
    name: 'Tumis Kangkung',
    subtitle: 'Kangkung, bawang putih, cabai, sedikit minyak',
    emoji: '🥬',
    category: 'Sayur',
    basePrice: 11000,
    nutritionScore: 88,
    ecoScore: 92,
    recommendation: 'Sangat cocok sebagai pendamping menu utama untuk meningkatkan asupan sayur dan menurunkan jejak karbon.',
  },
  {
    id: 'mie-rebus',
    name: 'Mie Rebus Betawi',
    subtitle: 'Mie, sayur, telur, kuah rempah',
    emoji: '🍜',
    category: 'Tradisional',
    basePrice: 16000,
    nutritionScore: 76,
    ecoScore: 70,
    recommendation: 'Menu ini tepat untuk kebutuhan kenyang tanpa overload kalori bila porsi sayur ditambah.',
  },
  {
    id: 'ikan-bakar',
    name: 'Ikan Bakar Segar',
    subtitle: 'Ikan nila, sambal, kemangi, jeruk nipis',
    emoji: '🐠',
    category: 'Seafood',
    basePrice: 24000,
    nutritionScore: 89,
    ecoScore: 76,
    recommendation: 'Pilihan sehat, kaya protein, dan sangat cocok untuk pola makan sehat yang tetap lezat.',
  },
  {
    id: 'nasi-padang',
    name: 'Nasi Padang',
    subtitle: 'Nasi, rendang, sayur, sambal hijau',
    emoji: '🍚',
    category: 'Combo',
    basePrice: 24000,
    nutritionScore: 80,
    ecoScore: 65,
    recommendation: 'Menu lengkap dan kaya rasa, tetapi pilih porsi sayur dan protein nabati untuk keseimbangan lebih baik.',
  },
  {
    id: 'sayur-asem',
    name: 'Sayur Asem Komplit',
    subtitle: 'Asem jawa, sayur, tahu, tempe, daun melinjo',
    emoji: '🥦',
    category: 'Sayur',
    basePrice: 13000,
    nutritionScore: 87,
    ecoScore: 90,
    recommendation: 'Menu yang sangat baik untuk asupan serat dan rasa segar tanpa perlu banyak tambahan lemak.',
  },
  {
    id: 'capcay',
    name: 'Capcay Organik',
    subtitle: 'Sayur, jamur, wortel, brokoli, udang',
    emoji: '🥦',
    category: 'Hidangan',
    basePrice: 19000,
    nutritionScore: 87,
    ecoScore: 82,
    recommendation: 'Menu ini memadukan berbagai jenis sayur dan protein ringan untuk kebutuhan harian yang seimbang.',
  },
];

const menuVariants = ['Classic', 'Campus', 'Sehat', 'Protein', 'Bumi', 'Rasa Lokal', 'Hemat', 'Green', 'Family', 'Chef Pick'];

const menuOptions = indonesianMenuCatalog.flatMap((base, menuIndex) =>
  Array.from({ length: 10 }, (_, variantIndex) => {
    const nutrientBoost = (variantIndex % 3) * 3 + (menuIndex % 2 === 0 ? 1 : 0);
    const ecoBoost = (variantIndex + menuIndex) % 4 === 0 ? 3 : (variantIndex % 2 === 0 ? 2 : 1);
    const variantName = menuVariants[variantIndex];
    const packageNames = [
      'Porsi Ringan',
      'Porsi Standar',
      'Porsi Protein',
      'Porsi Hijau',
      'Porsi Hemat',
      'Porsi Keluarga',
      'Porsi Energi',
      'Porsi Rendah Garam',
      'Porsi Seimbang',
      'Porsi Lokal',
    ];

    return {
      ...base,
      id: `${base.id}-${variantIndex + 1}`,
      name: `${base.name} ${variantName}`,
      subtitle: `${base.subtitle} • ${packageNames[variantIndex]}`,
      price: base.basePrice + variantIndex * 1800 + (menuIndex % 5) * 700,
      nutritionScore: Math.min(98, base.nutritionScore + nutrientBoost),
      ecoScore: Math.min(96, base.ecoScore + ecoBoost),
      recommendation: `${base.recommendation} Versi ${variantName} sangat sesuai dipakai untuk pola makan modern yang tetap peduli pada lingkungan.`,
    };
  })
);

const educationTopics = [
  {
    title: 'Piring seimbang',
    icon: UtensilsCrossed,
    text: 'Isi piring dengan karbohidrat kompleks, protein, sayur, buah, dan lemak baik agar energi lebih stabil.',
    action: 'Target cepat: setengah piring sayur dan buah, lalu lengkapi dengan protein serta sumber karbohidrat.',
  },
  {
    title: 'Protein rendah jejak',
    icon: Leaf,
    text: 'Tempe, tahu, kacang merah, edamame, dan telur bisa membantu memenuhi protein tanpa emisi setinggi daging merah.',
    action: 'Mulai dari 2-3 kali makan berbasis protein nabati per minggu.',
  },
  {
    title: 'Porsi anti mubazir',
    icon: Recycle,
    text: 'Mengambil porsi sesuai lapar, membawa kotak makan, dan menghabiskan sisa makanan membantu menekan sampah pangan.',
    action: 'Pilih porsi kecil dulu, tambah bila masih lapar.',
  },
];

const balancedIngredients = [
  {
    group: 'Karbohidrat kompleks',
    items: ['Nasi merah', 'Jagung', 'Ubi', 'Oat', 'Singkong rebus'],
    note: 'Memberi energi dan serat lebih lama.',
  },
  {
    group: 'Protein seimbang',
    items: ['Tempe', 'Tahu', 'Kacang merah', 'Edamame', 'Telur'],
    note: 'Protein nabati lokal membantu menekan jejak karbon.',
  },
  {
    group: 'Sayur dan buah lokal',
    items: ['Bayam', 'Kangkung', 'Wortel', 'Pepaya', 'Pisang'],
    note: 'Kaya vitamin, mineral, dan serat harian.',
  },
  {
    group: 'Lemak baik',
    items: ['Alpukat', 'Kacang tanah', 'Biji wijen', 'Ikan lokal', 'Minyak secukupnya'],
    note: 'Bantu rasa kenyang tanpa perlu gorengan berlebihan.',
  },
];

const carbonSmartTips = [
  'Ganti sebagian daging merah dengan tempe, tahu, telur, ikan lokal, atau kacang-kacangan.',
  'Pilih menu rebus, kukus, tumis ringan, atau panggang lebih sering daripada gorengan berat.',
  'Utamakan bahan musiman dan mudah ditemukan di sekitar kampus.',
  'Bawa botol minum dan wadah makan untuk mengurangi kemasan sekali pakai.',
];

const rangeLabels = {
  minggu: 'Minggu',
  bulan: 'Bulan',
  triwulan: '3 bulan',
};

const profileMetrics = {
  minggu: [
    { label: 'Kalori', value: 1920, unit: ' kcal', tone: 'amber', icon: Flame },
    { label: 'Air', value: 2.1, unit: ' L', tone: 'blue', icon: Droplets },
    { label: 'Protein', value: 78, unit: '%', tone: 'green', icon: Target },
  ],
  bulan: [
    { label: 'Kalori', value: 5780, unit: ' kcal', tone: 'amber', icon: Flame },
    { label: 'Air', value: 61, unit: ' L', tone: 'blue', icon: Droplets },
    { label: 'Protein', value: 84, unit: '%', tone: 'green', icon: Target },
  ],
  triwulan: [
    { label: 'Kalori', value: 17340, unit: ' kcal', tone: 'amber', icon: Flame },
    { label: 'Air', value: 192, unit: ' L', tone: 'blue', icon: Droplets },
    { label: 'Protein', value: 89, unit: '%', tone: 'green', icon: Target },
  ],
};

const mealTrendData = {
  minggu: [
    { label: 'Sen', value: 72 },
    { label: 'Sel', value: 84 },
    { label: 'Rab', value: 68 },
    { label: 'Kam', value: 91 },
    { label: 'Jum', value: 86 },
    { label: 'Sab', value: 62 },
    { label: 'Min', value: 76 },
  ],
  bulan: [
    { label: '1', value: 58 },
    { label: '5', value: 67 },
    { label: '10', value: 74 },
    { label: '15', value: 82 },
    { label: '20', value: 89 },
    { label: '25', value: 85 },
    { label: '30', value: 92 },
  ],
  triwulan: [
    { label: 'Jan', value: 60 },
    { label: 'Feb', value: 73 },
    { label: 'Mar', value: 82 },
    { label: 'Apr', value: 88 },
    { label: 'Mei', value: 91 },
    { label: 'Jun', value: 94 },
  ],
};

const profileFocus = [
  { label: 'Serat', value: 82, unit: '%', tone: 'green' },
  { label: 'Hydration', value: 91, unit: '%', tone: 'blue' },
  { label: 'Keseimbangan', value: 76, unit: '%', tone: 'amber' },
];

const initialProfileHabits = [
  { id: 'air', label: 'Minum 2L air', done: true },
  { id: 'protein', label: 'Penuhi protein nabati', done: true },
  { id: 'sayur', label: 'Tambahkan sayur hijau', done: false },
  { id: 'porsi', label: 'Ambil porsi sesuai kebutuhan', done: true },
];

function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedMenu, setSelectedMenu] = useState(menuOptions[0].id);
  const [activeInsight, setActiveInsight] = useState('nutrition');
  const [selectedPeriod, setSelectedPeriod] = useState('minggu');
  const [profileHabits, setProfileHabits] = useState(initialProfileHabits);

  const selected = useMemo(
    () => menuOptions.find((item) => item.id === selectedMenu) ?? menuOptions[0],
    [selectedMenu]
  );

  const featured = menuOptions.slice(0, 3);

  const insightData = {
    nutrition: {
      key: 'nutrition',
      title: 'Gizi',
      icon: HeartPulse,
      value: `${selected.nutritionScore}%`,
      caption: 'Protein, serat, dan energi',
      detail: `${selected.name} memberi skor gizi ${selected.nutritionScore}% yang menunjukkan keseimbangan nutrisi dari menu yang dipilih.`,
      accent: 'green',
      percent: selected.nutritionScore,
    },
    carbon: {
      key: 'carbon',
      title: 'Jejak Karbon',
      icon: Recycle,
      value: `${100 - selected.ecoScore}%`,
      caption: 'Estimasi emisi yang lebih rendah',
      detail: `Jejak karbon menu ini diperkirakan ${100 - selected.ecoScore}% lebih tinggi daripada menu paling hemat karbon.`,
      accent: 'blue',
      percent: 100 - selected.ecoScore,
    },
    recommendation: {
      key: 'recommendation',
      title: 'Rekomendasi',
      icon: BadgeCheck,
      value: selected.ecoLabel,
      caption: 'Tips agar lebih berkelanjutan',
      detail: selected.recommendation,
      accent: 'amber',
      percent: selected.ecoScore,
    },
  };

  const activeInsightData = insightData[activeInsight];

  const toggleHabit = (habitId) => {
    setProfileHabits((current) =>
      current.map((habit) =>
        habit.id === habitId ? { ...habit, done: !habit.done } : habit
      )
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Nutrio</h1>
          <p>Nutrisi Indonesia untuk gaya hidup modern</p>
        </div>
        <div className="topbar-actions">
          <div className="topbar-icon">
            <Leaf size={20} />
          </div>
          <div className="pill">Skor nutrisi</div>
        </div>
      </header>

      <main className="content">
        {activePage === 'home' ? (
          <>
            <section className="hero-card">
              <div className="hero-copy">
                <div className="eyebrow">
                  <Sparkles size={15} />
                  <span>Pelacak kebiasaan ramah lingkungan</span>
                </div>
                <h2>Pilih makan siangmu, lihat dampakmu pada bumi.</h2>
                <p>
                  Beranda ini memadukan edukasi, visual interaktif, dan rekomendasi menu yang lebih sehat untuk kehidupan kampus.
                </p>
                <div className="hero-actions">
                  <button type="button" className="primary-btn" onClick={() => setActivePage('ecocalc')}>
                    Lihat EcoCalc
                  </button>
                  <button type="button" className="secondary-btn" onClick={() => setActivePage('education')}>
                    <BookOpen size={16} />
                    Edukasi
                  </button>
                </div>
              </div>
              <div className="hero-visual" aria-hidden="true">
                <div className="planet-card">
                  <div className="planet-ring ring-a" />
                  <div className="planet-ring ring-b" />
                  <div className="planet-core">
                    <Leaf size={28} />
                  </div>
                </div>
              </div>
            </section>

            <section className="insight-dashboard">
              <div className="insight-header">
                <div>
                  <p className="eyebrow">Data interaktif</p>
                  <h3>Insight live untuk pilihanmu</h3>
                </div>
                <span className="pill">{selected.name}</span>
              </div>

              <div className="insight-cards">
                {Object.values(insightData).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`insight-card ${activeInsight === item.key ? 'active' : ''}`}
                      onClick={() => setActiveInsight(item.key)}
                    >
                      <div className="insight-icon">
                        <Icon size={15} />
                      </div>
                      <div>
                        <span className="insight-title">{item.title}</span>
                        <strong>{item.value}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className={`insight-panel ${activeInsightData.accent}`}>
                <div className="insight-panel-copy">
                  <h4>{activeInsightData.title}</h4>
                  <p>{activeInsightData.caption}</p>
                  <span>{activeInsightData.detail}</span>
                </div>
                <div className="insight-meter">
                  <div className="insight-meter-track">
                    <div className={`insight-meter-fill ${activeInsightData.accent}`} style={{ width: `${activeInsightData.percent}%` }} />
                  </div>
                  <strong>{activeInsightData.percent}%</strong>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>Menu unggulan</h3>
                <span>Terpopuler</span>
              </div>
              <div className="featured-list">
                {featured.map((menu) => (
                  <button
                    key={menu.id}
                    className="featured-item"
                    type="button"
                    onClick={() => {
                      setSelectedMenu(menu.id);
                      setActivePage('ecocalc');
                    }}
                  >
                    <div>
                      <span className="featured-name">{menu.name}</span>
                      <span className="featured-meta">{menu.subtitle}</span>
                    </div>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : activePage === 'education' ? (
          <>
            <section className="panel education-hero">
              <div className="education-hero-copy">
                <div className="eyebrow">
                  <BookOpen size={15} />
                  <span>Edukasi nutrisi</span>
                </div>
                <h3>Pilihan makan yang baik untuk tubuh dan bumi.</h3>
                <p>
                  Rekomendasi ini membantu memilih bahan bergizi seimbang, mudah ditemukan, dan lebih rendah jejak karbon.
                </p>
              </div>
              <button type="button" className="education-cta" onClick={() => setActivePage('ecocalc')}>
                <Calculator size={17} />
                Cek menu
              </button>
            </section>

            <section className="education-grid">
              {educationTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <article className="education-card" key={topic.title}>
                    <div className="education-icon">
                      <Icon size={18} />
                    </div>
                    <h4>{topic.title}</h4>
                    <p>{topic.text}</p>
                    <span>{topic.action}</span>
                  </article>
                );
              })}
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>Bahan gizi seimbang</h3>
                <span>Rendah karbon</span>
              </div>
              <div className="ingredient-list">
                {balancedIngredients.map((group) => (
                  <div className="ingredient-row" key={group.group}>
                    <div>
                      <h4>{group.group}</h4>
                      <p>{group.note}</p>
                    </div>
                    <div className="ingredient-chips">
                      {group.items.map((item) => (
                        <span className="chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel carbon-panel">
              <div className="panel-heading">
                <h3>Aksi kurangi jejak karbon</h3>
                <span>Harian</span>
              </div>
              <div className="tip-list">
                {carbonSmartTips.map((tip, index) => (
                  <div className="tip-item" key={tip}>
                    <strong>{index + 1}</strong>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : activePage === 'profile' ? (
          <>
            <section className="panel profile-hero">
              <div className="profile-header">
                <div className="profile-avatar" aria-hidden="true">
                  <User size={24} />
                </div>
                <div className="profile-copy">
                  <div className="eyebrow">Mahasiswa sehat</div>
                  <h3>Alya Pradana</h3>
                  <p>Teknik Informatika • Semester 6</p>
                </div>
                <button type="button" className="secondary-btn small-btn">
                  Edit profil
                </button>
              </div>

              <div className="profile-summary">
                <div>
                  <span>Streak aktif</span>
                  <strong>12 hari</strong>
                </div>
                <div>
                  <span>Target sehat</span>
                  <strong>82%</strong>
                </div>
                <div>
                  <span>Energi</span>
                  <strong>89%</strong>
                </div>
              </div>

              <div className="profile-focus-grid">
                {profileFocus.map(({ label, value, unit, tone }) => (
                  <div key={label} className={`focus-card ${tone}`}>
                    <div className="focus-header">
                      <span>{label}</span>
                      <strong>
                        {value}
                        {unit}
                      </strong>
                    </div>
                    <div className="focus-progress">
                      <span style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="insight-dashboard">
              <div className="insight-header">
                <div>
                  <p className="eyebrow">Ringkasan harian</p>
                  <h3>Performa nutrisi</h3>
                </div>
                <div className="segmented">
                  {Object.keys(profileMetrics).map((range) => (
                    <button
                      key={range}
                      type="button"
                      className={selectedPeriod === range ? 'segment active' : 'segment'}
                      onClick={() => setSelectedPeriod(range)}
                    >
                      {rangeLabels[range]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-metric-grid">
                {profileMetrics[selectedPeriod].map(({ label, value, unit, tone, icon: Icon }) => (
                  <div key={label} className={`profile-metric ${tone}`}>
                    <div className="metric-icon-wrap">
                      <Icon size={16} />
                    </div>
                    <div>
                      <span>{label}</span>
                      <strong>
                        {value}
                        {unit}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel chart-panel">
              <div className="panel-heading">
                <h3>Trend pola makan</h3>
                <span>{rangeLabels[selectedPeriod]}</span>
              </div>
              <div className="chart-bars">
                {mealTrendData[selectedPeriod].map((item) => (
                  <div className="chart-col" key={item.label}>
                    <div className="chart-bar-container">
                      <div className="chart-bar" style={{ height: `${item.value}%` }} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel checklist-panel">
              <div className="panel-heading">
                <h3>Checklist kebiasaan</h3>
                <span>
                  {profileHabits.filter((habit) => habit.done).length}/{profileHabits.length}
                </span>
              </div>

              <div className="habit-list">
                {profileHabits.map((habit) => (
                  <button
                    key={habit.id}
                    type="button"
                    className={`habit-item ${habit.done ? 'done' : ''}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <span className="habit-checkmark">{habit.done ? <Check size={12} /> : ''}</span>
                    <span>{habit.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="panel eco-panel">
              <div className="eco-panel-top">
                <div>
                  <div className="eyebrow">
                    <Calculator size={15} />
                    <span>NutriCalc • 200 variasi menu</span>
                  </div>
                  <h3>Pilih menu favoritmu</h3>
                  <p>Setiap item menampilkan analisis eco-nutrisi secara cepat dan interaktif.</p>
                </div>
                <div className="mini-visual" aria-hidden="true">
                  <div className="mini-circle" />
                  <div className="mini-circle small" />
                </div>
              </div>

              <div className="menu-grid">
                {menuOptions.map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    className={`menu-card ${selectedMenu === menu.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMenu(menu.id)}
                  >
                    <div className="menu-card-top">
                      <span className="emoji">{menu.emoji}</span>
                      <span className="menu-price">Rp{menu.price.toLocaleString('id-ID')}</span>
                    </div>
                    <h4>{menu.name}</h4>
                    <p>{menu.subtitle}</p>
                    <div className="chip-row">
                      <span className="chip">{menu.category}</span>
                      <span className="chip">{menu.ecoLabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className={`analysis-card ${selected.tone}`}>
              <div className="analysis-heading">
                <div className="analysis-icon">
                  <Activity size={18} />
                </div>
                <h4>Analisis Eco-Nutrisi</h4>
              </div>

              <div className="analysis-summary">
                <div>
                  <h5>{selected.name}</h5>
                  <p>{selected.subtitle}</p>
                  <div className="summary-meta">
                    <span>{selected.category}</span>
                    <span>Rp{selected.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="score-ring">
                  <span>{Math.round((selected.nutritionScore + selected.ecoScore) / 2)}%</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-labels">
                  <span>Nilai Gizi Makro</span>
                  <strong>{selected.nutritionScore}%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-bar nutrition" style={{ width: `${selected.nutritionScore}%` }} />
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-labels">
                  <span>Sustainability Score</span>
                  <strong>{selected.ecoScore}%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-bar eco" style={{ width: `${selected.ecoScore}%` }} />
                </div>
              </div>

              <div className="feedback-box">
                <p>{selected.recommendation}</p>
              </div>
            </section>
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-item ${activePage === 'home' ? 'active' : ''}`} type="button" onClick={() => setActivePage('home')}>
          <Home size={18} />
          <span>Beranda</span>
        </button>
        <button className={`nav-item ${activePage === 'ecocalc' ? 'active' : ''}`} type="button" onClick={() => setActivePage('ecocalc')}>
          <Calculator size={18} />
          <span>NutriCalc</span>
        </button>
        <button className={`nav-item ${activePage === 'education' ? 'active' : ''}`} type="button" onClick={() => setActivePage('education')}>
          <GraduationCap size={18} />
          <span>Edukasi</span>
        </button>
        <button className={`nav-item ${activePage === 'profile' ? 'active' : ''}`} type="button" onClick={() => setActivePage('profile')}>
          <User size={18} />
          <span>Profil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
