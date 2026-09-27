BEGIN;

INSERT INTO gender_options (code, label) VALUES
  ('female', 'Female'),
  ('male', 'Male'),
  ('non-binary', 'Non-binary'),
  ('prefer-not-to-say', 'Prefer not to say')
ON CONFLICT (code) DO NOTHING;

INSERT INTO activity_levels (code, label) VALUES
  ('sedentary', 'Sedentary'),
  ('light', 'Light'),
  ('moderate', 'Moderate'),
  ('active', 'Active'),
  ('very_active', 'Very active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO dietary_goals (code, label) VALUES
  ('balanced', 'Balanced'),
  ('weight_loss', 'Weight loss'),
  ('maintenance', 'Maintenance'),
  ('muscle_gain', 'Muscle gain')
ON CONFLICT (code) DO NOTHING;

INSERT INTO meal_types (code, label) VALUES
  ('Breakfast', 'Breakfast'),
  ('Lunch', 'Lunch'),
  ('Dinner', 'Dinner'),
  ('Snack', 'Snack'),
  ('Hydration', 'Hydration')
ON CONFLICT (code) DO NOTHING;

INSERT INTO education_categories (slug, name) VALUES
  ('nutrisi', 'Nutrisi'),
  ('keberlanjutan', 'Keberlanjutan'),
  ('kebiasaan', 'Kebiasaan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_categories (id, slug, name, description) VALUES
  ('cat_daily', 'harian', 'Harian', 'Menu sehat untuk kebutuhan energi harian.'),
  ('cat_vegan', 'vegan', 'Vegan', 'Pilihan berbasis plant-based dan tinggi serat.'),
  ('cat_traditional', 'tradisional', 'Tradisional', 'Masakan khas Nusantara dengan cita rasa lokal.'),
  ('cat_seafood', 'seafood', 'Seafood', 'Pilihan protein laut yang kaya nutrisi.'),
  ('cat_drink', 'minuman', 'Minuman', 'Minuman segar dan tentu menjaga hidrasi.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_items (
  id, slug, name, subtitle, emoji, category_id, description, base_price, nutrition_score, eco_score,
  recommendation, is_active
) VALUES
  ('food_nasi_goreng', 'nasi-goreng-kampung', 'Nasi Goreng Kampung', 'Nasi, telur, sayur, bawang, rempah lokal', '🍛', 'cat_daily', 'Menu klasik yang tetap cocok untuk kebutuhan energi harian.', 15000, 74, 68, 'Cocok untuk kebutuhan energi harian saat ditambah sayuran berlimpah.', TRUE),
  ('food_gado_gado', 'gado-gado-nusantara', 'Gado-Gado Nusantara', 'Sayur segar, tahu, tempe, kacang, sambal', '🥗', 'cat_vegan', 'Kaya serat, protein nabati, dan kandungan sayur.', 12000, 91, 89, 'Pilihan paling kuat untuk pola makan seimbang.', TRUE),
  ('food_soto_ayam', 'soto-ayam-sehat', 'Soto Ayam Sehat', 'Kaldu ringan, ayam fillet, wortel, daun seledri', '🍲', 'cat_traditional', 'Rendah kalori dan cocok untuk kebutuhan protein harian.', 16500, 72, 71, 'Pilihan ringan untuk protein yang tetap mengenyangkan.', TRUE),
  ('food_pecel', 'pecel-sayur', 'Pecel Sayur', 'Lontong, sayur rebus, kacang, sambal', '🥬', 'cat_vegan', 'Sangat cocok untuk menu siang yang ringan namun kaya serat.', 14000, 85, 80, 'Menu seimbang untuk asupan serat yang tinggi.', TRUE),
  ('food_pempek', 'pempek-palembang', 'Pempek Palembang', 'Ikan giling, mie, cuko, sayur mentimun', '🐟', 'cat_seafood', 'Sumber protein baik untuk variasi harian.', 19000, 79, 73, 'Cocok untuk protein yang lezat dan kaya rasa.', TRUE),
  ('food_lontong_sayur', 'lontong-sayur', 'Lontong Sayur', 'Lontong, sayur santan, tahu, tempe', '🥥', 'cat_traditional', 'Menu ramah kantong dan kaya serat.', 13000, 82, 81, 'Pilihan sehat untuk konsumsi rutin dengan nilai serat yang tinggi.', TRUE),
  ('food_ikan_bakar', 'ikan-bakar-segar', 'Ikan Bakar Segar', 'Ikan nila, sambal, kemangi, jeruk nipis', '🐠', 'cat_seafood', 'Pilihannya kaya protein dan cocok untuk pola makan sehat.', 24000, 89, 76, 'Menu kaya protein dengan rasa yang tetap ringan.', TRUE),
  ('food_es_teh', 'es-teh-segar', 'Es Teh Segar', 'Teh, lemon, irisan mentimun, es batu', '🧊', 'cat_drink', 'Minuman ringan untuk menjaga hidrasi.', 7000, 55, 88, 'Tepat untuk hidrasi yang menyegarkan.', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO nutrients (id, code, name, unit, description) VALUES
  ('nut_cal', 'CAL', 'Calories', 'kcal', 'Total energy per serving.'),
  ('nut_protein', 'PROTEIN', 'Protein', 'g', 'Protein content in grams.'),
  ('nut_carbs', 'CARBS', 'Carbohydrates', 'g', 'Daily carbohydrate value.'),
  ('nut_fat', 'FAT', 'Fat', 'g', 'Total fat amount.'),
  ('nut_fiber', 'FIBER', 'Fiber', 'g', 'Dietary fiber content.'),
  ('nut_sugar', 'SUGAR', 'Sugar', 'g', 'Total sugar amount.'),
  ('nut_sodium', 'SODIUM', 'Sodium', 'mg', 'Sodium level in milligrams.')
ON CONFLICT (code) DO NOTHING;

WITH nutrition_seed(slug, calories, protein, carbs, fat, fiber, sugar, sodium) AS (
  VALUES
    ('nasi-goreng-kampung', 520.00, 18.00, 70.00, 19.00, 5.50, 4.80, 420.00),
    ('gado-gado-nusantara', 430.00, 20.00, 45.00, 18.00, 10.00, 5.00, 310.00),
    ('soto-ayam-sehat', 360.00, 24.00, 30.00, 10.00, 4.50, 3.20, 390.00),
    ('pecel-sayur', 390.00, 16.00, 52.00, 13.00, 9.00, 3.40, 280.00),
    ('pempek-palembang', 480.00, 22.00, 58.00, 15.00, 4.00, 2.90, 510.00),
    ('lontong-sayur', 360.00, 17.00, 42.00, 12.00, 8.50, 4.20, 260.00),
    ('ikan-bakar-segar', 410.00, 30.00, 18.00, 15.00, 3.50, 2.00, 330.00),
    ('es-teh-segar', 80.00, 1.20, 18.00, 0.20, 0.80, 16.00, 15.00)
), normalized_values AS (
  SELECT food.slug, value.code, value.amount
  FROM nutrition_seed AS food
  CROSS JOIN LATERAL (VALUES
    ('CAL', food.calories),
    ('PROTEIN', food.protein),
    ('CARBS', food.carbs),
    ('FAT', food.fat),
    ('FIBER', food.fiber),
    ('SUGAR', food.sugar),
    ('SODIUM', food.sodium)
  ) AS value(code, amount)
)
INSERT INTO food_nutrients (food_id, nutrient_id, value)
SELECT food.id, nutrient.id, normalized_values.amount
FROM normalized_values
JOIN food_items AS food ON food.slug = normalized_values.slug
JOIN nutrients AS nutrient ON nutrient.code = normalized_values.code
ON CONFLICT (food_id, nutrient_id) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
