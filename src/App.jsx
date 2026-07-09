import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calculator,
  GraduationCap,
  HeartPulse,
  Home,
  Leaf,
  Recycle,
  Sparkles,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import './styles.css';

const baseMenus = [
  {
    id: 'burger',
    name: 'Burger Ramah Bumi',
    subtitle: 'Roti gandum, sayur panggang, saus rendah gula',
    price: 24000,
    nutritionScore: 46,
    ecoScore: 38,
    recommendation: 'Cocok untuk momen santai, tapi lebih baik dipadukan dengan salad agar kualitas gizi meningkat.',
    tone: 'rose',
    emoji: '🍔',
    category: 'Fast Food',
    ecoLabel: 'Cukup Baik',
  },
  {
    id: 'rice-chicken',
    name: 'Nasi Ayam Kampus',
    subtitle: 'Nasi putih, ayam goreng, sup sayur',
    price: 15000,
    nutritionScore: 62,
    ecoScore: 55,
    recommendation: 'Pilihan layak untuk kebutuhan harian. Tambahkan sayur lebih banyak agar skor sustainability naik.',
    tone: 'amber',
    emoji: '🍛',
    category: 'Kantin',
    ecoLabel: 'Seimbang',
  },
  {
    id: 'gado',
    name: 'Paket Gado-Gado',
    subtitle: 'Nasi merah, tahu, tempe, sayur segar',
    price: 12000,
    nutritionScore: 91,
    ecoScore: 89,
    recommendation: 'Sangat kuat untuk menu harian. Kaya serat, protein nabati, dan sangat ramah lingkungan.',
    tone: 'emerald',
    emoji: '🥗',
    category: 'Vegan',
    ecoLabel: 'Ramah Bumi',
  },
  {
    id: 'soba',
    name: 'Soba Salmon',
    subtitle: 'Mie soba, salmon bakar, brokoli',
    price: 26000,
    nutritionScore: 74,
    ecoScore: 62,
    recommendation: 'Menu ini baik untuk protein dan omega-3, tetapi pilih porsi sedang untuk menjaga jejak karbon.',
    tone: 'sky',
    emoji: '🍜',
    category: 'Protein',
    ecoLabel: 'Cukup Baik',
  },
  {
    id: 'tempe-bowl',
    name: 'Tempe Bowl',
    subtitle: 'Bowl nasi, tempe crispy, sambal hijau',
    price: 14000,
    nutritionScore: 84,
    ecoScore: 82,
    recommendation: 'Menu ini sangat bagus untuk pola makan berkelanjutan dan mudah dipakai sebagai lunch harian.',
    tone: 'emerald',
    emoji: '🥣',
    category: 'Plant Based',
    ecoLabel: 'Hemat Karbon',
  },
  {
    id: 'soto',
    name: 'Soto Ayam Sehat',
    subtitle: 'Kaldu ringan, ayam fillet, wortel',
    price: 16500,
    nutritionScore: 69,
    ecoScore: 61,
    recommendation: 'Menu ini nyaman untuk tubuh, dan lebih baik jika memakai lebih banyak sayur dan kurang santan.',
    tone: 'amber',
    emoji: '🍲',
    category: 'Kantin',
    ecoLabel: 'Seimbang',
  },
  {
    id: 'mie-sayur',
    name: 'Mie Goreng Sayur',
    subtitle: 'Mie, kol, wortel, tauge, sedikit minyak',
    price: 13500,
    nutritionScore: 58,
    ecoScore: 66,
    recommendation: 'Porsi sayur yang padat membantu menyeimbangkan nilai gizi dan emisi makanan.',
    tone: 'emerald',
    emoji: '🍝',
    category: 'Vegetarian',
    ecoLabel: 'Ramah Bumi',
  },
  {
    id: 'wrap',
    name: 'Wrap Tahu Italia',
    subtitle: 'Tortilla gandum, tahu panggang, tomat',
    price: 17500,
    nutritionScore: 73,
    ecoScore: 71,
    recommendation: 'One-bowl style yang praktis dan lebih efisien untuk mahasiswa yang mobile.',
    tone: 'sky',
    emoji: '🌯',
    category: 'Snack',
    ecoLabel: 'Cukup Baik',
  },
  {
    id: 'salad',
    name: 'Salad Quinoa',
    subtitle: 'Quinoa, kacang, paprika, dressing lemon',
    price: 22000,
    nutritionScore: 88,
    ecoScore: 78,
    recommendation: 'Pilih ini untuk kebutuhan energi dan nutrisi yang lebih stabil dalam sehari.',
    tone: 'emerald',
    emoji: '🥬',
    category: 'Wellness',
    ecoLabel: 'Hemat Karbon',
  },
  {
    id: 'nasi-uduk',
    name: 'Nasi Uduk Nabati',
    subtitle: 'Nasi uduk, tahu, tempe, sambal',
    price: 13000,
    nutritionScore: 68,
    ecoScore: 74,
    recommendation: 'Menu ini menjaga rasa familiar tetapi lebih baik jika dikurangi minyak dan ditambah sayur.',
    tone: 'amber',
    emoji: '🍚',
    category: 'Tradisional',
    ecoLabel: 'Seimbang',
  },
];

const menuOptions = baseMenus.flatMap((base, baseIndex) =>
  ['Classic', 'Campus', 'Eco'].map((variant, variantIndex) => ({
    ...base,
    id: `${base.id}-${variantIndex + 1}`,
    name: `${base.name} ${variant}`,
    subtitle: `${base.subtitle} • ${['Porsi Ringan', 'Porsi Standar', 'Porsi Hemat'][variantIndex]}`,
    price: Number(base.price) + variantIndex * 2000,
    recommendation: `${base.recommendation} ${variantIndex === 2 ? 'Versi ini paling direkomendasikan untuk gaya hidup berkelanjutan.' : ''}`,
  }))
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

function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedMenu, setSelectedMenu] = useState(menuOptions[0].id);
  const [activeInsight, setActiveInsight] = useState('nutrition');

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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>EcoNutri</h1>
          <p>Nutrition Education for Campus Life</p>
        </div>
        <div className="topbar-actions">
          <div className="topbar-icon">
            <Leaf size={20} />
          </div>
          <div className="pill">Live eco score</div>
        </div>
      </header>

      <main className="content">
        {activePage === 'home' ? (
          <>
            <section className="hero-card">
              <div className="hero-copy">
                <div className="eyebrow">
                  <Sparkles size={15} />
                  <span>Eco habit tracker</span>
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
                  <h3>Live insight untuk pilihanmu</h3>
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
        ) : (
          <>
            <section className="panel eco-panel">
              <div className="eco-panel-top">
                <div>
                  <div className="eyebrow">
                    <Calculator size={15} />
                    <span>EcoCalc • 30 variasi menu</span>
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
          <span>EcoCalc</span>
        </button>
        <button className={`nav-item ${activePage === 'education' ? 'active' : ''}`} type="button" onClick={() => setActivePage('education')}>
          <GraduationCap size={18} />
          <span>Edukasi</span>
        </button>
        <button className="nav-item" type="button">
          <User size={18} />
          <span>Profil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
