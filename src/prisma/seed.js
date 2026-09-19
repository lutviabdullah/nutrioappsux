import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'harian', name: 'Harian', description: 'Menu sehat untuk kebutuhan energi harian.' },
  { slug: 'vegan', name: 'Vegan', description: 'Pilihan berbasis plant-based dan tinggi serat.' },
  { slug: 'tradisional', name: 'Tradisional', description: 'Masakan khas Nusantara dengan cita rasa lokal.' },
  { slug: 'seafood', name: 'Seafood', description: 'Pilihan protein laut yang kaya nutrisi.' },
  { slug: 'minuman', name: 'Minuman', description: 'Minuman segar dan menjaga hidrasi.' },
];

const foods = [
  {
    slug: 'nasi-goreng-kampung',
    name: 'Nasi Goreng Kampung',
    subtitle: 'Nasi, telur, sayur, bawang, rempah lokal',
    emoji: '🍛',
    category: 'harian',
    description: 'Menu klasik yang tetap cocok untuk kebutuhan energi harian.',
    basePrice: 15000,
    nutritionScore: 74,
    ecoScore: 68,
    recommendation: 'Cocok untuk kebutuhan energi harian saat ditambah sayuran berlimpah.',
    caloriesKcal: 520,
    proteinG: 18,
    carbsG: 70,
    fatG: 19,
    fiberG: 5.5,
    sugarG: 4.8,
    sodiumMg: 420,
  },
  {
    slug: 'gado-gado-nusantara',
    name: 'Gado-Gado Nusantara',
    subtitle: 'Sayur segar, tahu, tempe, kacang, sambal',
    emoji: '🥗',
    category: 'vegan',
    description: 'Kaya serat, protein nabati, dan kandungan sayur.',
    basePrice: 12000,
    nutritionScore: 91,
    ecoScore: 89,
    recommendation: 'Pilihan paling kuat untuk pola makan seimbang.',
    caloriesKcal: 430,
    proteinG: 20,
    carbsG: 45,
    fatG: 18,
    fiberG: 10,
    sugarG: 5,
    sodiumMg: 310,
  },
  {
    slug: 'soto-ayam-sehat',
    name: 'Soto Ayam Sehat',
    subtitle: 'Kaldu ringan, ayam fillet, wortel, daun seledri',
    emoji: '🍲',
    category: 'tradisional',
    description: 'Rendah kalori dan cocok untuk kebutuhan protein harian.',
    basePrice: 16500,
    nutritionScore: 72,
    ecoScore: 71,
    recommendation: 'Pilihan ringan untuk protein yang tetap mengenyangkan.',
    caloriesKcal: 360,
    proteinG: 24,
    carbsG: 30,
    fatG: 10,
    fiberG: 4.5,
    sugarG: 3.2,
    sodiumMg: 390,
  },
  {
    slug: 'pecel-sayur',
    name: 'Pecel Sayur',
    subtitle: 'Lontong, sayur rebus, kacang, sambal',
    emoji: '🥬',
    category: 'vegan',
    description: 'Sangat cocok untuk menu siang yang ringan namun kaya serat.',
    basePrice: 14000,
    nutritionScore: 85,
    ecoScore: 80,
    recommendation: 'Menu seimbang untuk asupan serat yang tinggi.',
    caloriesKcal: 390,
    proteinG: 16,
    carbsG: 52,
    fatG: 13,
    fiberG: 9,
    sugarG: 3.4,
    sodiumMg: 280,
  },
  {
    slug: 'pempek-palembang',
    name: 'Pempek Palembang',
    subtitle: 'Ikan giling, mie, cuko, sayur mentimun',
    emoji: '🐟',
    category: 'seafood',
    description: 'Sumber protein baik untuk variasi harian.',
    basePrice: 19000,
    nutritionScore: 79,
    ecoScore: 73,
    recommendation: 'Cocok untuk protein yang lezat dan kaya rasa.',
    caloriesKcal: 480,
    proteinG: 22,
    carbsG: 58,
    fatG: 15,
    fiberG: 4,
    sugarG: 2.9,
    sodiumMg: 510,
  },
  {
    slug: 'lontong-sayur',
    name: 'Lontong Sayur',
    subtitle: 'Lontong, sayur santan, tahu, tempe',
    emoji: '🥥',
    category: 'tradisional',
    description: 'Menu ramah kantong dan kaya serat.',
    basePrice: 13000,
    nutritionScore: 82,
    ecoScore: 81,
    recommendation: 'Pilihan sehat untuk konsumsi rutin dengan nilai serat tinggi.',
    caloriesKcal: 360,
    proteinG: 17,
    carbsG: 42,
    fatG: 12,
    fiberG: 8.5,
    sugarG: 4.2,
    sodiumMg: 260,
  },
  {
    slug: 'ikan-bakar-segar',
    name: 'Ikan Bakar Segar',
    subtitle: 'Ikan nila, sambal, kemangi, jeruk nipis',
    emoji: '🐠',
    category: 'seafood',
    description: 'Pilihan kaya protein dan cocok untuk pola makan sehat.',
    basePrice: 24000,
    nutritionScore: 89,
    ecoScore: 76,
    recommendation: 'Menu kaya protein dengan rasa yang tetap ringan.',
    caloriesKcal: 410,
    proteinG: 30,
    carbsG: 18,
    fatG: 15,
    fiberG: 3.5,
    sugarG: 2,
    sodiumMg: 330,
  },
  {
    slug: 'es-teh-segar',
    name: 'Es Teh Segar',
    subtitle: 'Teh, lemon, irisan mentimun, es batu',
    emoji: '🧊',
    category: 'minuman',
    description: 'Minuman ringan untuk menjaga hidrasi.',
    basePrice: 7000,
    nutritionScore: 55,
    ecoScore: 88,
    recommendation: 'Tepat untuk hidrasi yang menyegarkan.',
    caloriesKcal: 80,
    proteinG: 1.2,
    carbsG: 18,
    fatG: 0.2,
    fiberG: 0.8,
    sugarG: 16,
    sodiumMg: 15,
  },
];

const nutrients = [
  { code: 'CAL', name: 'Calories', unit: 'kcal', description: 'Total energy per serving.' },
  { code: 'PROTEIN', name: 'Protein', unit: 'g', description: 'Protein content in grams.' },
  { code: 'CARBS', name: 'Carbohydrates', unit: 'g', description: 'Carbohydrate amount.' },
  { code: 'FAT', name: 'Fat', unit: 'g', description: 'Total fat amount.' },
  { code: 'FIBER', name: 'Fiber', unit: 'g', description: 'Dietary fiber.' },
  { code: 'SUGAR', name: 'Sugar', unit: 'g', description: 'Total sugar amount.' },
  { code: 'SODIUM', name: 'Sodium', unit: 'mg', description: 'Sodium level in milligrams.' },
];

async function main() {
  await prisma.foodNutrient.deleteMany();
  await prisma.foodIngredient.deleteMany();
  await prisma.foodReview.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.mealPlanItem.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.foodCategory.deleteMany();
  await prisma.nutrient.deleteMany();

  for (const category of categories) {
    await prisma.foodCategory.create({ data: category });
  }

  for (const nutrient of nutrients) {
    await prisma.nutrient.create({ data: nutrient });
  }

  for (const food of foods) {
    const category = await prisma.foodCategory.findUnique({ where: { slug: food.category } });

    const created = await prisma.foodItem.create({
      data: {
        slug: food.slug,
        name: food.name,
        subtitle: food.subtitle,
        emoji: food.emoji,
        categoryId: category.id,
        description: food.description,
        basePrice: food.basePrice,
        nutritionScore: food.nutritionScore,
        ecoScore: food.ecoScore,
        recommendation: food.recommendation,
        caloriesKcal: food.caloriesKcal,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        fiberG: food.fiberG,
        sugarG: food.sugarG,
        sodiumMg: food.sodiumMg,
      },
    });

    const nutrientMap = {
      CAL: created.caloriesKcal,
      PROTEIN: created.proteinG,
      CARBS: created.carbsG,
      FAT: created.fatG,
      FIBER: created.fiberG,
      SUGAR: created.sugarG,
      SODIUM: created.sodiumMg,
    };

    for (const nutrient of nutrients) {
      const value = nutrientMap[nutrient.code];
      if (value !== null && value !== undefined) {
        await prisma.foodNutrient.create({
          data: {
            foodId: created.id,
            nutrientId: (await prisma.nutrient.findUnique({ where: { code: nutrient.code } })).id,
            value,
          },
        });
      }
    }
  }

  console.log('Seeded Nutrio menu categories and food items.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
