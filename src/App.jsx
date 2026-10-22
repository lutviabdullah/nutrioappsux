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
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebaseClient';
import { indonesianMenuCatalog } from './foodCatalog';
import './styles.css';

function buildMenuOptions(rows) {
  return rows.map((row) => {
    const nutritionScore = Number(row.nutritionScore || 0);
    const ecoScore = Number(row.ecoScore || 0);
    return {
      ...row,
      basePriceMinor: Number(row.basePriceMinor ?? row.basePrice ?? 0),
      currencyCode: row.currencyCode || 'IDR',
      priceYear: Number(row.priceYear || 2026),
      nutritionScore,
      ecoScore,
      ecoLabel: ecoScore >= 80 ? 'Rendah karbon' : ecoScore >= 65 ? 'Sedang' : 'Tinggi karbon',
      tone: ecoScore >= 80 ? 'low' : ecoScore >= 65 ? 'medium' : 'high',
      servingLabel: '1 porsi standar',
    };
  });
}

function buildCarbonMenuGroups(menus) {
  return [
    {
      key: 'low',
      title: 'Jejak karbon rendah',
      description: 'Pilihan paling ramah lingkungan',
      range: 'Eco score 80+',
      tone: 'low',
      items: menus.filter((menu) => menu.ecoScore >= 80),
    },
    {
      key: 'medium',
      title: 'Jejak karbon sedang',
      description: 'Pilihan seimbang untuk sehari-hari',
      range: 'Eco score 65–79',
      tone: 'medium',
      items: menus.filter((menu) => menu.ecoScore >= 65 && menu.ecoScore < 80),
    },
    {
      key: 'high',
      title: 'Jejak karbon tinggi',
      description: 'Nikmati lebih jarang dan imbangi dengan menu hijau',
      range: 'Eco score di bawah 65',
      tone: 'high',
      items: menus.filter((menu) => menu.ecoScore < 65),
    },
  ];
}

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

function mapEducationRow(id, row) {
  return {
    id,
    sortOrder: row.sort_order || 0,
    title: row.title,
    icon: educationIcons[row.icon] || BookOpen,
    text: row.summary,
    action: row.action,
  };
}

function mapCatalogRow(id, row) {
  return {
    id,
    name: row.name,
    subtitle: row.subtitle || row.description || '',
    emoji: row.emoji,
    category: row.category_name || row.category || 'Menu',
    basePriceMinor: Number(row.base_price_minor ?? row.base_price ?? 0),
    currencyCode: row.currency_code || 'IDR',
    priceYear: Number(row.price_year || 2026),
    servingLabel: row.serving_label || '1 porsi standar',
    nutritionScore: Number(row.nutrition_score || 0),
    ecoScore: Number(row.eco_score || 0),
    recommendation: row.recommendation || '',
    caloriesKcal: row.calories_kcal == null ? null : Number(row.calories_kcal),
    proteinG: row.protein_g == null ? null : Number(row.protein_g),
    fiberG: row.fiber_g == null ? null : Number(row.fiber_g),
    reviewCount: Number(row.review_count || 0),
    averageRating: row.average_rating == null ? null : Number(row.average_rating),
  };
}

function formatCurrency(amountMinor, currencyCode = 'IDR') {
  const safeCode = /^[A-Z]{3}$/.test(currencyCode) ? currencyCode : 'IDR';
  const fractionDigits = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: safeCode,
  }).resolvedOptions().maximumFractionDigits;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: safeCode,
    maximumFractionDigits: fractionDigits,
  }).format(Number(amountMinor || 0) / (10 ** fractionDigits));
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
  const [authUser, setAuthUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(indonesianMenuCatalog[0].id);
  const [activeInsight, setActiveInsight] = useState('nutrition');
  const [selectedPeriod, setSelectedPeriod] = useState('minggu');
  const [profileHabits, setProfileHabits] = useState(initialProfileHabits);
  const [educationContent, setEducationContent] = useState(educationTopics);
  const [profile, setProfile] = useState(defaultProfile);
  const [profileDraft, setProfileDraft] = useState(defaultProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState('connecting');
  const [catalogRows, setCatalogRows] = useState(indonesianMenuCatalog);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogRefreshToken, setCatalogRefreshToken] = useState(0);
  const [catalogStatus, setCatalogStatus] = useState('local');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [nutritionSummary, setNutritionSummary] = useState(null);
  const [recordingFoodId, setRecordingFoodId] = useState('');
  const [mealLogMessage, setMealLogMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setFirebaseStatus('live');
      setIsAuthReady(true);
    }, (error) => {
      console.warn('Firebase auth state unavailable:', error.message);
      setFirebaseStatus('offline');
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser) {
      setNutritionSummary(null);
      return undefined;
    }

    const dayId = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const dailyLogsQuery = query(
      collection(db, 'users', authUser.uid, 'meal_logs'),
      where('day_id', '==', dayId)
    );
    return onSnapshot(dailyLogsQuery, (snapshot) => {
      const logs = snapshot.docs.map((mealDoc) => mealDoc.data());
      const spendByCurrency = {};
      logs.forEach((meal) => {
        spendByCurrency[meal.currency_code] = (spendByCurrency[meal.currency_code] || 0) + meal.amount_minor;
      });
      setNutritionSummary({
        meal_count: logs.reduce((count, meal) => count + meal.servings, 0),
        calories_kcal: logs.reduce((total, meal) => total + meal.calories_kcal, 0),
        protein_g: logs.reduce((total, meal) => total + meal.protein_g, 0),
        fiber_g: logs.reduce((total, meal) => total + meal.fiber_g, 0),
        spend_by_currency: spendByCurrency,
      });
    }, (error) => {
      console.warn('Firebase nutrition summary unavailable:', error.message);
    });
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setProfile(defaultProfile);
      setProfileDraft(defaultProfile);
      return undefined;
    }

    const profileRef = doc(db, 'profiles', authUser.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (snapshot) => {
      const remoteProfile = snapshot.exists()
        ? snapshot.data()
        : { ...defaultProfile, full_name: authUser.displayName || defaultProfile.full_name };
      const nextProfile = { ...defaultProfile, ...remoteProfile };
      setProfile(nextProfile);
      if (!isEditingProfile) setProfileDraft(nextProfile);
      setFirebaseStatus('live');
    }, (error) => {
      console.warn('Firebase profile sync unavailable:', error.message);
      setFirebaseStatus('offline');
    });

    const educationQuery = query(
      collection(db, 'education'),
      where('is_published', '==', true),
      orderBy('sort_order')
    );
    const unsubscribeEducation = onSnapshot(educationQuery, (snapshot) => {
      const rows = snapshot.docs.map((educationDoc) => mapEducationRow(educationDoc.id, educationDoc.data()));
      if (rows.length) setEducationContent(rows);
      setFirebaseStatus('live');
    }, (error) => {
      console.warn('Firebase education sync unavailable:', error.message);
      setFirebaseStatus('offline');
    });

    return () => {
      unsubscribeProfile();
      unsubscribeEducation();
    };
  }, [authUser, isEditingProfile]);

  useEffect(() => {
    if (!authUser) {
      setCatalogRows(indonesianMenuCatalog);
      setCatalogStatus('local');
      return undefined;
    }

    setCatalogLoading(true);
    const sourceQuery = query(collection(db, 'food_catalog'), orderBy('nutrition_score', 'desc'));
    return onSnapshot(sourceQuery, { includeMetadataChanges: true }, (snapshot) => {
      if (snapshot.empty) {
        setCatalogRows(indonesianMenuCatalog);
        setCatalogStatus('empty');
      } else {
        setCatalogRows(snapshot.docs.map((catalogDoc) => mapCatalogRow(catalogDoc.id, catalogDoc.data())));
        setCatalogStatus(snapshot.metadata.fromCache ? 'cached' : 'firestore');
      }
      setCatalogLoading(false);
    }, (error) => {
      console.warn('Firestore catalog unavailable:', error.message);
      setCatalogRows(indonesianMenuCatalog);
      setCatalogStatus('fallback');
      setCatalogLoading(false);
    });
  }, [authUser, catalogRefreshToken]);

  const menuOptions = useMemo(() => buildMenuOptions(catalogRows), [catalogRows]);
  const selected = useMemo(
    () => menuOptions.find((item) => item.id === selectedMenu) ?? menuOptions[0] ?? buildMenuOptions(indonesianMenuCatalog)[0],
    [menuOptions, selectedMenu]
  );
  const featured = useMemo(
    () => [...menuOptions].sort((first, second) => second.nutritionScore - first.nutritionScore).slice(0, 3),
    [menuOptions]
  );
  const carbonMenuGroups = useMemo(() => buildCarbonMenuGroups(menuOptions), [menuOptions]);
  const filteredCatalogRows = useMemo(() => {
    const query = catalogQuery.trim().toLocaleLowerCase('id-ID');
    if (!query) return menuOptions;
    return menuOptions.filter((item) =>
      `${item.name} ${item.subtitle} ${item.category}`.toLocaleLowerCase('id-ID').includes(query)
    );
  }, [menuOptions, catalogQuery]);

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

  const recordMealEntry = async (item) => {
    setMealLogMessage('');
    setRecordingFoodId(item.id);
    try {
      const foodRef = doc(db, 'food_catalog', item.id);
      const logRef = doc(collection(db, 'users', authUser.uid, 'meal_logs'));
      const dayId = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

      await runTransaction(db, async (transaction) => {
        const foodSnapshot = await transaction.get(foodRef);
        if (!foodSnapshot.exists()) {
          throw new Error('Menu tidak ditemukan di katalog Firestore. Muat ulang katalog dan coba lagi.');
        }

        const food = foodSnapshot.data();
        const currencyCode = food.currency_code || 'IDR';
        const unitPriceMinor = Number(food.base_price_minor ?? food.base_price);
        const nutrition = {
          caloriesKcal: Number(food.calories_kcal || 0),
          proteinG: Number(food.protein_g || 0),
          fiberG: Number(food.fiber_g || 0),
        };
        if (
          !Number.isSafeInteger(unitPriceMinor) || unitPriceMinor < 0
          || Object.values(nutrition).some((value) => !Number.isFinite(value) || value < 0)
          || !/^[A-Z]{3}$/.test(currencyCode)
        ) {
          throw new Error('Harga atau data gizi menu belum valid di katalog Firestore.');
        }

        transaction.set(logRef, {
          food_id: item.id,
          food_name: String(food.name || 'Menu Nutrio').slice(0, 150),
          servings: 1,
          calories_kcal: nutrition.caloriesKcal,
          protein_g: nutrition.proteinG,
          fiber_g: nutrition.fiberG,
          unit_price_minor: unitPriceMinor,
          amount_minor: unitPriceMinor,
          currency_code: currencyCode,
          day_id: dayId,
          created_at: serverTimestamp(),
        });
      });
      setMealLogMessage(`${item.name} dicatat. Ringkasan dihitung langsung dari log Firestore akun Anda.`);
    } catch (error) {
      console.error('Firebase meal log failed:', error);
      setMealLogMessage(error.message || 'Menu tidak dapat dicatat. Periksa koneksi dan aturan Firestore.');
    } finally {
      setRecordingFoodId('');
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setIsAuthenticating(true);
    try {
      if (authMode === 'signup') {
        const fullName = authName.trim();
        if (!fullName) {
          setAuthError('Nama lengkap wajib diisi.');
          return;
        }
        const credential = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        const newProfile = {
          full_name: fullName,
          university: '',
          faculty: '',
          semester: null,
        };
        setProfile(newProfile);
        setProfileDraft(newProfile);
        await updateProfile(credential.user, { displayName: fullName });
        await setDoc(doc(db, 'profiles', credential.user.uid), newProfile);
      } else {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      }
    } catch (error) {
      if (authMode === 'signup' && auth.currentUser) {
        setProfileSaveError('Akun berhasil dibuat, tetapi profil belum tersimpan. Edit dan simpan profil untuk mencoba lagi.');
        setActivePage('home');
      } else {
        setAuthError(error.message || 'Autentikasi gagal. Silakan coba lagi.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signOut = async () => {
    setAuthError('');
    try {
      await firebaseSignOut(auth);
      setProfile(defaultProfile);
      setProfileDraft(defaultProfile);
      setProfileSaveError('');
      setActivePage('home');
    } catch (error) {
      setAuthError(error.message || 'Tidak dapat keluar dari akun.');
    }
  };

  const displayName = authUser?.displayName
    || authUser?.email?.split('@')[0]
    || 'Nutrio User';

  const saveProfile = async (event) => {
    event.preventDefault();
    const nextProfile = {
      ...profileDraft,
      semester: profileDraft.semester ? Number(profileDraft.semester) : null,
    };
    setProfile(nextProfile);
    setIsEditingProfile(false);
    setProfileSaveError('');

    if (!authUser) {
      setProfileSaveError('Masuk kembali untuk menyimpan profil ke Firebase.');
      return;
    }

    try {
      await setDoc(doc(db, 'profiles', authUser.uid), {
        full_name: nextProfile.full_name,
        university: nextProfile.university,
        faculty: nextProfile.faculty,
        semester: nextProfile.semester,
      }, { merge: true });
      if (authUser.displayName !== nextProfile.full_name) {
        await updateProfile(authUser, { displayName: nextProfile.full_name });
      }
      setFirebaseStatus('live');
    } catch (error) {
      console.warn('Firebase profile sync failed:', error.message);
      setFirebaseStatus('offline');
      setProfileSaveError('Profil tidak dapat disimpan ke Firestore. Periksa koneksi dan aturan akses.');
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

  if (!authUser) {
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
            <button className="auth-submit" type="submit" disabled={isAuthenticating}>
              {isAuthenticating ? 'Memproses...' : authMode === 'signup' ? 'Buat akun' : 'Masuk ke Nutrio'}
              <LogIn size={17} />
            </button>
          </form>

          <p className="auth-footnote">Firebase Authentication mengelola kredensial; profil Nutrio disimpan terpisah dengan UID akun.</p>
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
          <div className={`live-status ${firebaseStatus}`} aria-live="polite">
            <CircleDot size={12} />
            <span className="sr-only">
              {firebaseStatus === 'live' ? 'Firebase live' : 'Firebase offline'}
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
                  <span>Halo, {displayName}</span>
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
              <button type="button" className="text-link" onClick={() => setActivePage('catalog')}>
                Semua menu
              </button>
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
                      <span className="featured-meta">
                        {menu.subtitle} · {formatCurrency(menu.basePriceMinor, menu.currencyCode)} / porsi · estimasi 2026
                      </span>
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
                <p>Daftar kanonis untuk semua fitur · estimasi kantin per porsi standar, dapat berbeda menurut lokasi.</p>
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
                : catalogStatus === 'firestore'
                  ? `${filteredCatalogRows.length} menu selaras dari Firestore · estimasi harga per porsi`
                  : catalogStatus === 'cached'
                    ? `${filteredCatalogRows.length} menu tersimpan di perangkat · mode offline`
                    : catalogStatus === 'empty'
                      ? 'Belum ada menu di Firestore; menampilkan estimasi katalog contoh tahun 2026.'
                      : catalogStatus === 'fallback'
                        ? 'Firestore tidak tersedia; menampilkan estimasi katalog contoh tahun 2026.'
                        : 'Katalog contoh · estimasi tahun 2026'}
            </p>

            {nutritionSummary && (
              <section className="meal-summary-card" aria-live="polite">
                <div>
                  <span>Catatan makan hari ini</span>
                  <strong>{nutritionSummary.meal_count || 0} menu</strong>
                </div>
                <div>
                  <span>Energi</span>
                  <strong>{Math.round(nutritionSummary.calories_kcal || 0)} kcal</strong>
                </div>
                <div>
                  <span>Protein</span>
                  <strong>{Number(nutritionSummary.protein_g || 0).toFixed(1)} g</strong>
                </div>
                {Object.entries(nutritionSummary.spend_by_currency || {}).map(([code, amount]) => (
                  <div key={code}>
                    <span>Estimasi belanja</span>
                    <strong>{formatCurrency(amount, code)}</strong>
                  </div>
                ))}
              </section>
            )}
            {mealLogMessage && <p className="meal-log-feedback" role="status">{mealLogMessage}</p>}

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
                    <div className="food-view-price">{formatCurrency(item.basePriceMinor, item.currencyCode)}</div>
                    <p className="food-view-serving">{item.servingLabel} · estimasi {item.priceYear}</p>
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
                    {catalogStatus === 'firestore' && (
                      <button
                        className="meal-log-button"
                        type="button"
                        disabled={recordingFoodId === item.id}
                        onClick={() => recordMealEntry(item)}
                      >
                        {recordingFoodId === item.id ? 'Mencatat…' : 'Catat menu'}
                      </button>
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
                <h3>Menu pilihan untuk belajar gizi</h3>
                <button type="button" className="text-link" onClick={() => setActivePage('catalog')}>
                  Semua menu
                </button>
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
                      <span className="featured-meta">
                        Skor gizi {menu.nutritionScore}% · {formatCurrency(menu.basePriceMinor, menu.currencyCode)} / porsi · estimasi 2026
                      </span>
                    </div>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
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

              {profileSaveError && <p className="auth-feedback error" role="alert">{profileSaveError}</p>}

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

            <section className="panel profile-menu-link">
              <div>
                <p className="eyebrow">Menu &amp; gizi</p>
                <h3>{nutritionSummary ? `${nutritionSummary.meal_count || 0} menu tercatat hari ini` : 'Mulai catat menu harianmu'}</h3>
                <p>
                  {nutritionSummary
                    ? `${Math.round(nutritionSummary.calories_kcal || 0)} kcal dan ${Number(nutritionSummary.protein_g || 0).toFixed(1)} g protein tercatat dari menu yang dipilih.`
                    : `Lihat rekomendasi menu yang sama dengan NutriCalc. Harga ditampilkan per porsi standar, estimasi 2026.`}
                </p>
              </div>
              <button type="button" className="secondary-btn small-btn" onClick={() => setActivePage('catalog')}>
                Lihat menu
              </button>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>Rekomendasi gizi dari katalog Nutrio</h3>
                <button type="button" className="text-link" onClick={() => setActivePage('catalog')}>
                  Semua menu
                </button>
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
                      <span className="featured-meta">
                        Gizi {menu.nutritionScore}% · {formatCurrency(menu.basePriceMinor, menu.currencyCode)} / porsi · estimasi {menu.priceYear}
                      </span>
                    </div>
                    <ArrowRight size={18} />
                  </button>
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
                    <span>NutriCalc • {menuOptions.length} menu dari katalog yang sama</span>
                  </div>
                  <h3>Pilih menu favoritmu</h3>
                  <p>Daftar, skor gizi, dan estimasi harga per porsi 2026 sama dengan halaman Menu &amp; gizi.</p>
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
                            <span className="menu-price">{formatCurrency(menu.basePriceMinor, menu.currencyCode)}</span>
                          </div>
                          <h4>{menu.name}</h4>
                          <p>{menu.subtitle}</p>
                          <div className="chip-row">
                            <span className="chip">{menu.servingLabel}</span>
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
                    <span>{formatCurrency(selected.basePriceMinor, selected.currencyCode)} / porsi standar</span>
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
