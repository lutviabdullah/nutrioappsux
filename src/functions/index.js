import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as functionsV1 from 'firebase-functions/v1';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'asia-southeast1' });

const app = initializeApp();
const db = getFirestore(app, 'nutrio');

function getIndonesiaDayId(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function validCurrencyCode(value) {
  if (typeof value !== 'string' || !/^[A-Z]{3}$/.test(value)) return false;
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency: value });
    return true;
  } catch {
    return false;
  }
}

export const provisionProfile = functionsV1.region('asia-southeast1').auth.user().onCreate(async (user) => {
  const profileRef = db.collection('profiles').doc(user.uid);
  await db.runTransaction(async (transaction) => {
    const profile = await transaction.get(profileRef);
    if (profile.exists) return;

    transaction.create(profileRef, {
      full_name: user.displayName || user.email?.split('@')[0] || 'Nutrio User',
      university: '',
      faculty: '',
      semester: null,
    });
  });
});

export const recordMeal = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Masuk untuk mencatat menu.');
  }

  const { foodId, requestId, servings = 1 } = request.data || {};
  if (
    typeof foodId !== 'string' || foodId.length < 1 || foodId.length > 150
    || typeof requestId !== 'string' || !/^[\w-]{1,80}$/.test(requestId)
    || !Number.isInteger(servings) || servings < 1 || servings > 10
  ) {
    throw new HttpsError('invalid-argument', 'Data menu atau jumlah porsi tidak valid.');
  }

  const userId = request.auth.uid;
  const foodRef = db.collection('food_catalog').doc(foodId);
  const logRef = db.collection('users').doc(userId).collection('meal_logs').doc(requestId);

  return db.runTransaction(async (transaction) => {
    const [existingLog, foodSnapshot] = await Promise.all([
      transaction.get(logRef),
      transaction.get(foodRef),
    ]);

    if (existingLog.exists) {
      if (existingLog.data().food_id !== foodId) {
        throw new HttpsError('already-exists', 'ID permintaan sudah digunakan untuk menu lain.');
      }
      return { recorded: true, duplicate: true };
    }
    if (!foodSnapshot.exists) {
      throw new HttpsError('not-found', 'Menu tidak ditemukan di katalog Nutrio.');
    }

    const food = foodSnapshot.data();
    const currencyCode = food.currency_code || 'IDR';
    const unitPriceMinor = Number(food.base_price_minor ?? food.base_price);
    if (!validCurrencyCode(currencyCode) || !Number.isSafeInteger(unitPriceMinor) || unitPriceMinor < 0) {
      throw new HttpsError('failed-precondition', 'Harga atau mata uang menu belum valid.');
    }

    const nutritionPerServing = {
      caloriesKcal: Number(food.calories_kcal ?? 0),
      proteinG: Number(food.protein_g ?? 0),
      fiberG: Number(food.fiber_g ?? 0),
    };
    if (Object.values(nutritionPerServing).some((value) => !Number.isFinite(value) || value < 0)) {
      throw new HttpsError('failed-precondition', 'Informasi gizi menu belum valid.');
    }

    const priceMinor = unitPriceMinor * servings;
    if (!Number.isSafeInteger(priceMinor)) {
      throw new HttpsError('failed-precondition', 'Nilai transaksi menu terlalu besar.');
    }

    transaction.create(logRef, {
      food_id: foodId,
      food_name: String(food.name || 'Menu Nutrio').slice(0, 150),
      servings,
      calories_kcal: nutritionPerServing.caloriesKcal * servings,
      protein_g: nutritionPerServing.proteinG * servings,
      fiber_g: nutritionPerServing.fiberG * servings,
      unit_price_minor: unitPriceMinor,
      amount_minor: priceMinor,
      currency_code: currencyCode,
      day_id: getIndonesiaDayId(),
      created_at: FieldValue.serverTimestamp(),
    });
    return { recorded: true, duplicate: false };
  });
});

export const aggregateMealLog = onDocumentCreated(
  { document: 'users/{userId}/meal_logs/{logId}', database: 'nutrio', retry: true },
  async (event) => {
    const { userId } = event.params;
    const meal = event.data?.data();
    if (!meal) return;

    const dayId = meal.day_id;
    if (typeof dayId !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dayId)) {
      throw new Error('Catatan menu memiliki day_id yang tidak valid.');
    }

    const userRef = db.collection('users').doc(userId);
    const summaryRef = userRef.collection('nutrition_days').doc(dayId);
    const eventRef = userRef.collection('processed_meal_events').doc(event.id);

    await db.runTransaction(async (transaction) => {
      const [processed, summarySnapshot] = await Promise.all([
        transaction.get(eventRef),
        transaction.get(summaryRef),
      ]);
      if (processed.exists) return;

      const summary = summarySnapshot.data() || {};
      const spendByCurrency = { ...(summary.spend_by_currency || {}) };
      const code = meal.currency_code;
      if (!validCurrencyCode(code) || !Number.isSafeInteger(meal.amount_minor)) {
        throw new Error('Catatan menu memiliki nilai mata uang yang tidak valid.');
      }
      spendByCurrency[code] = (spendByCurrency[code] || 0) + meal.amount_minor;

      transaction.set(summaryRef, {
        day_id: dayId,
        meal_count: (summary.meal_count || 0) + 1,
        calories_kcal: (summary.calories_kcal || 0) + meal.calories_kcal,
        protein_g: (summary.protein_g || 0) + meal.protein_g,
        fiber_g: (summary.fiber_g || 0) + meal.fiber_g,
        spend_by_currency: spendByCurrency,
        updated_at: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.create(eventRef, {
        log_id: event.params.logId,
        processed_at: FieldValue.serverTimestamp(),
      });
    });
  }
);

export const syncNutritionMenuView = onDocumentWritten(
  { document: 'food_catalog/{foodId}', database: 'nutrio', retry: true },
  async (event) => {
    const { foodId } = event.params;
    const viewRef = db.collection('nutrition_menu_views').doc(foodId);
    const after = event.data?.after;
    if (!after?.exists) {
      await viewRef.delete();
      return;
    }

    const food = after.data();
    await viewRef.set({
      name: String(food.name || 'Menu Nutrio').slice(0, 150),
      subtitle: food.subtitle || food.description || '',
      emoji: food.emoji || '🥗',
      category_name: food.category_name || food.category || 'Menu',
      base_price_minor: Number(food.base_price_minor ?? food.base_price ?? 0),
      currency_code: food.currency_code || 'IDR',
      price_year: Number(food.price_year || 2026),
      nutrition_score: Number(food.nutrition_score || 0),
      eco_score: Number(food.eco_score || 0),
      recommendation: food.recommendation || '',
      calories_kcal: Number(food.calories_kcal || 0),
      protein_g: Number(food.protein_g || 0),
      fiber_g: Number(food.fiber_g || 0),
      review_count: Number(food.review_count || 0),
      average_rating: food.average_rating == null ? null : Number(food.average_rating),
      is_published: food.is_published !== false,
      source_updated_at: FieldValue.serverTimestamp(),
    });
  }
);
