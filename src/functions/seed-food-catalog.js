import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { indonesianMenuCatalog } from '../foodCatalog.js';

const projectId = process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  throw new Error('Set FIREBASE_PROJECT_ID before seeding the food catalog.');
}

const app = initializeApp({ projectId });
const db = getFirestore(app, 'nutrio');

const batch = db.batch();
indonesianMenuCatalog.forEach((item) => {
  batch.set(db.collection('food_catalog').doc(item.id), {
    name: item.name,
    subtitle: item.subtitle,
    emoji: item.emoji,
    category_name: item.category,
    base_price_minor: item.basePrice,
    currency_code: 'IDR',
    price_year: 2026,
    nutrition_score: item.nutritionScore,
    eco_score: item.ecoScore,
    recommendation: item.recommendation,
    serving_label: '1 porsi standar',
    is_published: true,
  }, { merge: true });
});

await batch.commit();
console.log(`Published ${indonesianMenuCatalog.length} food catalog items to ${projectId}/nutrio.`);
