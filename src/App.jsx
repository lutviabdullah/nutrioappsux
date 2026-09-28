import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  CircleDot,
  Droplets,
  Flame,
  GraduationCap,
  HeartPulse,
  Home,
  Leaf,
  LogIn,
  LogOut,
  LockKeyhole,
  Mail,
  Recycle,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { supabase } from './supabaseClient';
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

const carbonMenuGroups = [
  {
    key: 'low',
    title: 'Jejak karbon rendah',
    description: 'Pilihan paling ramah lingkungan',
    range: 'Eco score 80+',
    tone: 'low',
    items: menuOptions.filter((menu) => menu.ecoScore >= 80),
  },
  {
    key: 'medium',
    title: 'Jejak karbon sedang',
    description: 'Pilihan seimbang untuk sehari-hari',
    range: 'Eco score 65–79',
    tone: 'medium',
    items: menuOptions.filter((menu) => menu.ecoScore >= 65 && menu.ecoScore < 80),
  },
  {
    key: 'high',
    title: 'Jejak karbon tinggi',
    description: 'Nikmati lebih jarang dan imbangi dengan menu hijau',
    range: 'Eco score di bawah 65',
    tone: 'high',
    items: menuOptions.filter((menu) => menu.ecoScore < 65),
  },
];

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

const educationIcons = {
  utensils: UtensilsCrossed,
  leaf: Leaf,
  recycle: Recycle,
};

const defaultProfile = {
  full_name: 'Alya Pradana',
  university: '',
  faculty: 'Teknik Informatika',
  semester: 6,
};

function mapEducationRow(row) {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    title: row.title,
    icon: educationIcons[row.icon] || BookOpen,
    text: row.summary,
    action: row.action,
  };
}

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
  const [authSession, setAuthSession] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [demoUser, setDemoUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nutrio-demo-session') || 'null');
    } catch {
      return null;
    }
  });
  const [selectedMenu, setSelectedMenu] = useState(menuOptions[0].id);
  const [activeInsight, setActiveInsight] = useState('nutrition');
  const [selectedPeriod, setSelectedPeriod] = useState('minggu');
  const [profileHabits, setProfileHabits] = useState(initialProfileHabits);
  const [educationContent, setEducationContent] = useState(educationTopics);
  const [profile, setProfile] = useState(defaultProfile);
  const [profileDraft, setProfileDraft] = useState(defaultProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('connecting');
  const [supabaseUserId, setSupabaseUserId] = useState(null);
  const [catalogRows, setCatalogRows] = useState(indonesianMenuCatalog);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogRefreshToken, setCatalogRefreshToken] = useState(0);
  const [catalogStatus, setCatalogStatus] = useState('local');
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const savedProfile = localStorage.getItem('nutrio-profile');
    if (savedProfile) {
      try {
        const parsedProfile = { ...defaultProfile, ...JSON.parse(savedProfile) };
        setProfile(parsedProfile);
        setProfileDraft(parsedProfile);
      } catch {
        localStorage.removeItem('nutrio-profile');
      }
    }

    if (!supabase) {
      setSupabaseStatus('setup');
      setIsAuthReady(true);
      return () => {};
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setAuthSession(session);
        setIsAuthReady(true);
      }
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (!cancelled) setAuthSession(data.session);
      })
      .catch((error) => {
        console.warn('Supabase session restore failed:', error.message);
        if (!cancelled) setSupabaseStatus('offline');
      })
      .finally(() => {
        if (!cancelled) setIsAuthReady(true);
      });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !authSession) {
      setSupabaseUserId(null);
      return () => {};
    }

    let cancelled = false;
    const userId = authSession.user.id;
    setSupabaseUserId(userId);

    const channel = supabase
      .channel(`nutrio-live-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'education' }, (payload) => {
        setEducationContent((current) => {
          const changedRow = payload.eventType === 'DELETE' ? payload.old : payload.new;
          const rows = current.filter((topic) => topic.id !== changedRow.id);
          if (payload.eventType !== 'DELETE' && payload.new.is_published) {
            rows.push(mapEducationRow(payload.new));
          }
          return rows.sort((first, second) => (first.sortOrder || 0) - (second.sortOrder || 0));
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType !== 'DELETE' && payload.new) {
          setProfile((current) => ({ ...current, ...payload.new }));
        }
      })
      .subscribe((status) => {
        if (!cancelled) setSupabaseStatus(status === 'SUBSCRIBED' ? 'live' : 'offline');
      });

    const loadUserData = async () => {
      try {
        const [profileResult, educationResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('education').select('*').eq('is_published', true).order('sort_order'),
        ]);

        if (profileResult.error || educationResult.error) throw profileResult.error || educationResult.error;
        if (cancelled) return;
        if (profileResult.data) {
          setProfile((current) => ({ ...current, ...profileResult.data }));
          setProfileDraft((current) => ({ ...current, ...profileResult.data }));
        }
        if (educationResult.data?.length) {
          setEducationContent(educationResult.data.map(mapEducationRow));
        }
      } catch (error) {
        console.warn('Supabase profile/education sync unavailable:', error.message);
        if (!cancelled) setSupabaseStatus('offline');
      }
    };

    loadUserData();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [authSession]);

  useEffect(() => {
    if (activePage !== 'catalog') return undefined;

    let cancelled = false;
    const loadCatalog = async () => {
      if (!supabase) {
        setCatalogRows(indonesianMenuCatalog);
        setCatalogStatus('local');
        return;
      }

      setCatalogLoading(true);
      try {
        const { data, error } = await supabase
          .from('v_food_catalog')
          .select('*')
          .order('nutrition_score', { ascending: false });

        if (error) throw error;
        if (cancelled) return;

        if (data?.length) {
          setCatalogRows(data.map((row) => ({
            id: row.food_id,
            name: row.name,
            subtitle: row.subtitle || row.description || '',
            emoji: row.emoji,
            category: row.category_name || 'Menu',
            basePrice: Number(row.base_price || 0),
            nutritionScore: Number(row.nutrition_score || 0),
            ecoScore: Number(row.eco_score || 0),
            recommendation: row.recommendation || '',
            caloriesKcal: row.calories_kcal == null ? null : Number(row.calories_kcal),
            proteinG: row.protein_g == null ? null : Number(row.protein_g),
            fiberG: row.fiber_g == null ? null : Number(row.fiber_g),
            reviewCount: Number(row.review_count || 0),
            averageRating: row.average_rating == null ? null : Number(row.average_rating),
          })));
          setCatalogStatus('supabase');
        } else {
          setCatalogRows(indonesianMenuCatalog);
          setCatalogStatus('empty');
        }
      } catch (error) {
        console.warn('Catalog view unavailable:', error.message);
        if (!cancelled) {
          setCatalogRows(indonesianMenuCatalog);
          setCatalogStatus('fallback');
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    };

    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [activePage, catalogRefreshToken]);

  const selected = useMemo(
    () => menuOptions.find((item) => item.id === selectedMenu) ?? menuOptions[0],
    [selectedMenu]
  );

  const featured = menuOptions.slice(0, 3);
  const filteredCatalogRows = useMemo(() => {
    const query = catalogQuery.trim().toLocaleLowerCase('id-ID');
    if (!query) return catalogRows;
    return catalogRows.filter((item) =>
      `${item.name} ${item.subtitle} ${item.category}`.toLocaleLowerCase('id-ID').includes(query)
    );
  }, [catalogRows, catalogQuery]);

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

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (!supabase) {
      setAuthError('Login online belum tersedia. Gunakan mode demo atau atur kredensial Supabase.');
      return;
    }

    setIsAuthenticating(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { data: { full_name: authName.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          setAuthMessage('Akun berhasil dibuat. Periksa email untuk menyelesaikan verifikasi.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
      }
    } catch (error) {
      setAuthError(error.message || 'Autentikasi gagal. Silakan coba lagi.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const enterDemoMode = () => {
    const nextUser = { name: 'Alya Pradana', email: 'alya@nutrio.app' };
    localStorage.setItem('nutrio-demo-session', JSON.stringify(nextUser));
    setDemoUser(nextUser);
    setAuthError('');
  };

  const signOut = async () => {
    setAuthError('');
    if (supabase && authSession) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message || 'Tidak dapat keluar dari akun.');
        return;
      }
    }
    localStorage.removeItem('nutrio-demo-session');
    localStorage.removeItem('nutrio-profile');
    setProfile(defaultProfile);
    setProfileDraft(defaultProfile);
    setDemoUser(null);
    setActivePage('home');
  };

  const displayName = authSession?.user?.user_metadata?.full_name
    || authSession?.user?.email?.split('@')[0]
    || demoUser?.name
    || 'Nutrio User';

  const saveProfile = async (event) => {
    event.preventDefault();
    const nextProfile = {
      ...profileDraft,
      semester: profileDraft.semester ? Number(profileDraft.semester) : null,
    };
    setProfile(nextProfile);
    localStorage.setItem('nutrio-profile', JSON.stringify(nextProfile));
    setIsEditingProfile(false);

    if (!supabase || !supabaseUserId) {
      setSupabaseStatus(supabase ? 'offline' : 'setup');
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      user_id: supabaseUserId,
      full_name: nextProfile.full_name,
      university: nextProfile.university,
      faculty: nextProfile.faculty,
      semester: nextProfile.semester,
    });
    if (error) {
      console.warn('Profile sync failed:', error.message);
      setSupabaseStatus('offline');
    }
  };

  if (!isAuthReady) {
    return (
      <main className="auth-loading" aria-live="polite">
        <Leaf size={22} />
        <span>Menyiapkan Nutrio...</span>
      </main>
    );
  }

  if (!authSession && !demoUser) {
    return (
      <main className="auth-page">
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-brand">
            <span className="auth-brand-mark"><Leaf size={21} /></span>
            <span>Nutrio</span>
          </div>
          <p className="auth-eyebrow">NUTRISI INDONESIA, LEBIH TERARAH</p>
          <h1 id="auth-title">Mulai dari pilihan yang lebih baik.</h1>
          <p className="auth-intro">Masuk untuk melanjutkan perjalanan sehat dan melihat ringkasan Nutrio Anda.</p>

          <div className="auth-tabs" role="tablist" aria-label="Jenis autentikasi">
            <button
              className={authMode === 'login' ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={authMode === 'login'}
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); }}
            >
              Masuk
            </button>
            <button
              className={authMode === 'signup' ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={authMode === 'signup'}
              onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage(''); }}
            >
              Buat akun
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'signup' && (
              <label>
                Nama lengkap
                <input
                  autoComplete="name"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  placeholder="Nama Anda"
                  required
                />
              </label>
            )}
            <label>
              Email
              <span className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  autoComplete="email"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="nama@email.com"
                  required
                />
              </span>
            </label>
            <label>
              Kata sandi
              <span className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                />
              </span>
            </label>
            {authError && <p className="auth-feedback error" role="alert">{authError}</p>}
            {authMessage && <p className="auth-feedback success" role="status">{authMessage}</p>}
            <button className="auth-submit" type="submit" disabled={isAuthenticating || !supabase}>
              {isAuthenticating ? 'Memproses...' : authMode === 'signup' ? 'Buat akun' : 'Masuk ke Nutrio'}
              <LogIn size={17} />
            </button>
          </form>

          {!supabase && (
            <div className="auth-demo">
              <p>Supabase belum dikonfigurasi di environment ini. Coba aplikasi dengan akun demo.</p>
              <button className="auth-demo-button" type="button" onClick={enterDemoMode}>
                Masuk sebagai demo <ArrowRight size={16} />
              </button>
            </div>
          )}
          <p className="auth-footnote">Data demo tersimpan hanya di browser ini.</p>
        </section>
      </main>
    );
  }

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
          <div className={`live-status ${supabaseStatus}`} aria-live="polite">
            <CircleDot size={12} />
            <span className="sr-only">
              {supabaseStatus === 'live' ? 'Supabase live' : supabaseStatus === 'setup' ? 'Mode lokal' : 'Supabase offline'}
            </span>
          </div>
          <div className="pill">Skor nutrisi</div>
          <button className="topbar-signout" type="button" onClick={signOut} title={`Keluar dari ${displayName}`}>
            <LogOut size={17} />
            <span className="sr-only">Keluar dari akun</span>
          </button>
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
        ) : activePage === 'catalog' ? (
          <>
            <section className="catalog-heading">
              <div>
                <div className="eyebrow">
                  <HeartPulse size={15} />
                  <span>Menu database</span>
                </div>
                <h2>Menu &amp; gizi</h2>
                <p>Data menu dan nutrisi dari katalog Nutrio.</p>
              </div>
              <button
                type="button"
                className="catalog-refresh"
                aria-label="Muat ulang katalog"
                title="Muat ulang katalog"
                disabled={catalogLoading}
                onClick={() => setCatalogRefreshToken((token) => token + 1)}
              >
                <RefreshCw size={17} className={catalogLoading ? 'is-spinning' : ''} />
              </button>
            </section>

            <label className="catalog-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="Cari menu atau kategori"
                aria-label="Cari menu atau kategori"
              />
            </label>

            <p className="catalog-status" aria-live="polite">
              {catalogLoading
                ? 'Memuat katalog…'
                : catalogStatus === 'supabase'
                  ? `${filteredCatalogRows.length} menu dari Supabase`
                  : catalogStatus === 'empty'
                    ? 'Belum ada menu di Supabase; menampilkan katalog contoh.'
                    : catalogStatus === 'fallback'
                      ? 'Supabase tidak tersedia; menampilkan katalog contoh.'
                      : 'Katalog contoh lokal'}
            </p>

            {filteredCatalogRows.length ? (
              <section className="food-view-grid">
                {filteredCatalogRows.map((item) => (
                  <article className="food-view-item" key={item.id}>
                    <div className="food-view-top">
                      <span className="food-view-emoji" aria-hidden="true">{item.emoji || '🥗'}</span>
                      <span className="chip">{item.category}</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p className="food-view-subtitle">{item.subtitle}</p>
                    <div className="food-view-price">Rp{Number(item.basePrice || 0).toLocaleString('id-ID')}</div>
                    <div className="food-view-scores">
                      <span>Gizi <strong>{item.nutritionScore}%</strong></span>
                      <span>Bumi <strong>{item.ecoScore}%</strong></span>
                    </div>
                    {item.caloriesKcal != null && (
                      <div className="food-view-macros">
                        <span>{item.caloriesKcal} kcal</span>
                        {item.proteinG != null && <span>Protein {item.proteinG} g</span>}
                        {item.fiberG != null && <span>Serat {item.fiberG} g</span>}
                      </div>
                    )}
                    {item.averageRating != null && (
                      <p className="food-view-rating">Rating {item.averageRating} · {item.reviewCount} ulasan</p>
                    )}
                  </article>
                ))}
              </section>
            ) : (
              <p className="catalog-empty">Tidak ada menu yang cocok dengan pencarian.</p>
            )}
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
              {educationContent.map((topic) => {
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
                  <h3>{profile.full_name || 'Nutrio User'}</h3>
                    <p>{profile.faculty || 'Mahasiswa'}{profile.semester ? ` • Semester ${profile.semester}` : ''}</p>
                </div>
                <button type="button" className="secondary-btn small-btn" onClick={() => {
                  setProfileDraft(profile);
                  setIsEditingProfile((current) => !current);
                }}>
                  Edit profil
                </button>
              </div>

              {isEditingProfile && (
                <form className="profile-edit-form" onSubmit={saveProfile}>
                  <label>
                    Nama
                    <input
                      value={profileDraft.full_name || ''}
                      onChange={(event) => setProfileDraft({ ...profileDraft, full_name: event.target.value })}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label>
                    Universitas
                    <input
                      value={profileDraft.university || ''}
                      onChange={(event) => setProfileDraft({ ...profileDraft, university: event.target.value })}
                      maxLength={160}
                    />
                  </label>
                  <label>
                    Fakultas / program studi
                    <input
                      value={profileDraft.faculty || ''}
                      onChange={(event) => setProfileDraft({ ...profileDraft, faculty: event.target.value })}
                      maxLength={160}
                    />
                  </label>
                  <label>
                    Semester
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={profileDraft.semester || ''}
                      onChange={(event) => setProfileDraft({ ...profileDraft, semester: event.target.value })}
                    />
                  </label>
                  <div className="profile-form-actions">
                    <button type="button" className="secondary-btn small-btn" onClick={() => setIsEditingProfile(false)}>Batal</button>
                    <button type="submit" className="primary-btn small-btn">Simpan</button>
                  </div>
                </form>
              )}

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

              <div className="menu-groups-scroll">
                {carbonMenuGroups.map((group) => (
                  <section className={`menu-group ${group.tone}`} key={group.key}>
                    <div className="menu-group-heading">
                      <div>
                        <h4>{group.title}</h4>
                        <p>{group.description}</p>
                      </div>
                      <span className="menu-group-range">{group.range} · {group.items.length} menu</span>
                    </div>

                    <div className="menu-grid">
                      {group.items.map((menu) => (
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
        <button className={`nav-item ${activePage === 'catalog' ? 'active' : ''}`} type="button" onClick={() => setActivePage('catalog')}>
          <HeartPulse size={18} />
          <span>Menu &amp; gizi</span>
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
