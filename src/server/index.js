import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 4000;
const sessions = new Map();

const fallbackMenu = [
  {
    id: 'nasi-goreng-kampung',
    name: 'Nasi Goreng Kampung',
    subtitle: 'Nasi, telur, sayur, bawang, rempah lokal',
    emoji: '🍛',
    category: 'Harian',
    basePrice: 15000,
    nutritionScore: 82,
    ecoScore: 75,
    recommendation: 'Balanced energy meal with a strong plant-based component.',
    caloriesKcal: 520,
    proteinG: 24,
    fiberG: 6,
  },
  {
    id: 'gado-gado-nusantara',
    name: 'Gado-Gado Nusantara',
    subtitle: 'Sayur segar, tahu, tempe, kacang, sambal',
    emoji: '🥗',
    category: 'Vegan',
    basePrice: 12000,
    nutritionScore: 92,
    ecoScore: 89,
    recommendation: 'Excellent plant protein and fiber for sustainable nutrition.',
    caloriesKcal: 420,
    proteinG: 26,
    fiberG: 11,
  },
  {
    id: 'soto-ayam-sehat',
    name: 'Soto Ayam Sehat',
    subtitle: 'Kaldu ringan, ayam fillet, wortel, daun seledri',
    emoji: '🍲',
    category: 'Tradisional',
    basePrice: 16500,
    nutritionScore: 77,
    ecoScore: 72,
    recommendation: 'A lighter meal that still supports daily protein intake.',
    caloriesKcal: 360,
    proteinG: 28,
    fiberG: 5,
  },
  {
    id: 'pecel-sayur',
    name: 'Pecel Sayur',
    subtitle: 'Lontong, sayur rebus, kacang, sambal',
    emoji: '🥬',
    category: 'Sehat',
    basePrice: 14000,
    nutritionScore: 88,
    ecoScore: 83,
    recommendation: 'High-fiber lunch option with strong micronutrient density.',
    caloriesKcal: 390,
    proteinG: 18,
    fiberG: 9,
  },
  {
    id: 'pempek-palembang',
    name: 'Pempek Palembang',
    subtitle: 'Ikan giling, mie, cuko, sayur mentimun',
    emoji: '🐟',
    category: 'Seafood',
    basePrice: 19000,
    nutritionScore: 80,
    ecoScore: 74,
    recommendation: 'High protein seafood meal with a good balance of flavor and nutrients.',
    caloriesKcal: 470,
    proteinG: 22,
    fiberG: 4,
  },
  {
    id: 'es-teh-segar',
    name: 'Es Teh Segar',
    subtitle: 'Teh, lemon, irisan mentimun, es batu',
    emoji: '🧊',
    category: 'Minuman',
    basePrice: 7000,
    nutritionScore: 60,
    ecoScore: 90,
    recommendation: 'Hydration-focused drink with minimal environmental footprint.',
    caloriesKcal: 80,
    proteinG: 1,
    fiberG: 1,
  },
];

const fallbackAnalytics = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  values: [72, 81, 74, 88, 90, 84],
};

const fallbackUser = {
  id: 'demo-user',
  name: 'Alya Pradana',
  username: 'alya_pradana',
  email: 'alya@nutrio.app',
};

function normalizeMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    subtitle: item.subtitle,
    emoji: item.emoji,
    category: item.category || 'General',
    basePrice: Number(item.basePrice || item.price || 0),
    nutritionScore: Number(item.nutritionScore || 75),
    ecoScore: Number(item.ecoScore || 70),
    recommendation: item.recommendation || 'A strong nutrition-forward choice.',
    caloriesKcal: Number(item.caloriesKcal || 400),
    proteinG: Number(item.proteinG || 18),
    fiberG: Number(item.fiberG || 5),
  };
}

async function getMenuFromDb() {
  const hasDb = Boolean(process.env.DATABASE_URL);
  if (!hasDb) return fallbackMenu;

  try {
    const items = await prisma.foodItem.findMany({
      include: { category: true },
      orderBy: { nutritionScore: 'desc' },
    });

    return items.map((item) => normalizeMenuItem({
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      emoji: item.emoji,
      category: item.category?.name || 'General',
      basePrice: Number(item.basePrice),
      nutritionScore: Number(item.nutritionScore),
      ecoScore: Number(item.ecoScore),
      recommendation: item.recommendation,
      caloriesKcal: item.caloriesKcal || 400,
      proteinG: Number(item.proteinG || 18),
      fiberG: Number(item.fiberG || 5),
    }));
  } catch (error) {
    console.warn('Falling back to in-memory data:', error.message);
    return fallbackMenu;
  }
}

async function getDashboardData(user) {
  const menu = await getMenuFromDb();
  const summary = {
    calories: 1820,
    protein: 82,
    hydration: 2.3,
    score: 86,
    balance: 78,
    ecoScore: 88,
  };

  const recentMeals = [
    { id: 'meal-1', name: 'Gado-Gado Nusantara', mealType: 'Lunch', calories: 420 },
    { id: 'meal-2', name: 'Soto Ayam Sehat', mealType: 'Dinner', calories: 360 },
    { id: 'meal-3', name: 'Es Teh Segar', mealType: 'Hydration', calories: 80 },
  ];

  return {
    user,
    menu,
    summary,
    analytics: fallbackAnalytics,
    recentMeals,
  };
}

function getSession(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  if (!token) return null;
  return sessions.get(token) || null;
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ ok: true, message: 'Nutrio API is live' });
});

app.post('/api/auth/login', async (req, res) => {
  const { name, email } = req.body || {};
  const cleanName = String(name || 'Nutrio User').trim() || 'Nutrio User';
  const cleanEmail = String(email || 'demo@nutrio.app').trim() || 'demo@nutrio.app';

  try {
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: { fullName: cleanName, username: cleanEmail.split('@')[0] },
      create: {
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        fullName: cleanName,
      },
    });

    const token = `nutrio_${Math.random().toString(36).slice(2, 12)}`;
    sessions.set(token, { user: { ...user, name: user.fullName || user.username } });

    return res.json({
      token,
      user: { ...user, name: user.fullName || user.username },
    });
  } catch (error) {
    const token = `nutrio_${Math.random().toString(36).slice(2, 12)}`;
    const demoUser = { ...fallbackUser, name: cleanName, email: cleanEmail };
    sessions.set(token, { user: demoUser });

    return res.json({ token, user: demoUser });
  }
});

app.get('/api/menu', async (_, res) => {
  const menu = await getMenuFromDb();
  res.json({ menu });
});

app.get('/api/dashboard', async (req, res) => {
  const session = getSession(req);
  const user = session?.user || fallbackUser;
  const payload = await getDashboardData(user);
  res.json(payload);
});

app.post('/api/meals/log', async (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { foodId, mealType = 'Lunch', servings = 1 } = req.body || {};
  const food = (await getMenuFromDb()).find((item) => item.id === foodId);

  if (!food) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  const result = {
    id: `meal-${Date.now()}`,
    name: food.name,
    mealType,
    calories: Math.round(food.caloriesKcal * Number(servings || 1)),
    protein: Math.round(food.proteinG * Number(servings || 1)),
    loggedAt: new Date().toISOString(),
  };

  if (process.env.DATABASE_URL) {
    try {
      const primaryUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (primaryUser) {
        await prisma.mealLog.create({
          data: {
            userId: primaryUser.id,
            foodId: food.id,
            mealType,
            portionSize: Number(servings || 1),
            servings: Number(servings || 1),
          },
        });
      }
    } catch (error) {
      console.warn('Meal logging DB fallback activated:', error.message);
    }
  }

  return res.json({ ok: true, meal: result });
});

app.listen(PORT, () => {
  console.log(`Nutrio API running on http://localhost:${PORT}`);
});
