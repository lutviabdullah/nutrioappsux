INSERT INTO food_categories (id, slug, name, description) VALUES
  ('cat_daily', 'harian', 'Harian', 'Menu sehat untuk kebutuhan energi harian.'),
  ('cat_vegan', 'vegan', 'Vegan', 'Pilihan berbasis plant-based dan tinggi serat.'),
  ('cat_traditional', 'tradisional', 'Tradisional', 'Masakan khas Nusantara dengan cita rasa lokal.'),
  ('cat_seafood', 'seafood', 'Seafood', 'Pilihan protein laut yang kaya nutrisi.'),
  ('cat_drink', 'minuman', 'Minuman', 'Minuman segar dan tentu menjaga hidrasi.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_items (
  id, slug, name, subtitle, emoji, category_id, description, base_price, nutrition_score, eco_score,
  recommendation, calories_kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, is_active
) VALUES
  ('food_nasi_goreng', 'nasi-goreng-kampung', 'Nasi Goreng Kampung', 'Nasi, telur, sayur, bawang, rempah lokal', '🍛', 'cat_daily', 'Menu klasik yang tetap cocok untuk kebutuhan energi harian.', 15000, 74, 68, 'Cocok untuk kebutuhan energi harian saat ditambah sayuran berlimpah.', 520, 18.00, 70.00, 19.00, 5.50, 4.80, 420, TRUE),
  ('food_gado_gado', 'gado-gado-nusantara', 'Gado-Gado Nusantara', 'Sayur segar, tahu, tempe, kacang, sambal', '🥗', 'cat_vegan', 'Kaya serat, protein nabati, dan kandungan sayur.', 12000, 91, 89, 'Pilihan paling kuat untuk pola makan seimbang.', 430, 20.00, 45.00, 18.00, 10.00, 5.00, 310, TRUE),
  ('food_soto_ayam', 'soto-ayam-sehat', 'Soto Ayam Sehat', 'Kaldu ringan, ayam fillet, wortel, daun seledri', '🍲', 'cat_traditional', 'Rendah kalori dan cocok untuk kebutuhan protein harian.', 16500, 72, 71, 'Pilihan ringan untuk protein yang tetap mengenyangkan.', 360, 24.00, 30.00, 10.00, 4.50, 3.20, 390, TRUE),
  ('food_pecel', 'pecel-sayur', 'Pecel Sayur', 'Lontong, sayur rebus, kacang, sambal', '🥬', 'cat_vegan', 'Sangat cocok untuk menu siang yang ringan namun kaya serat.', 14000, 85, 80, 'Menu seimbang untuk asupan serat yang tinggi.', 390, 16.00, 52.00, 13.00, 9.00, 3.40, 280, TRUE),
  ('food_pempek', 'pempek-palembang', 'Pempek Palembang', 'Ikan giling, mie, cuko, sayur mentimun', '🐟', 'cat_seafood', 'Sumber protein baik untuk variasi harian.', 19000, 79, 73, 'Cocok untuk protein yang lezat dan kaya rasa.', 480, 22.00, 58.00, 15.00, 4.00, 2.90, 510, TRUE),
  ('food_lontong_sayur', 'lontong-sayur', 'Lontong Sayur', 'Lontong, sayur santan, tahu, tempe', '🥥', 'cat_traditional', 'Menu ramah kantong dan kaya serat.', 13000, 82, 81, 'Pilihan sehat untuk konsumsi rutin dengan nilai serat yang tinggi.', 360, 17.00, 42.00, 12.00, 8.50, 4.20, 260, TRUE),
  ('food_ikan_bakar', 'ikan-bakar-segar', 'Ikan Bakar Segar', 'Ikan nila, sambal, kemangi, jeruk nipis', '🐠', 'cat_seafood', 'Pilihannya kaya protein dan cocok untuk pola makan sehat.', 24000, 89, 76, 'Menu kaya protein dengan rasa yang tetap ringan.', 410, 30.00, 18.00, 15.00, 3.50, 2.00, 330, TRUE),
  ('food_es_teh', 'es-teh-segar', 'Es Teh Segar', 'Teh, lemon, irisan mentimun, es batu', '🧊', 'cat_drink', 'Minuman ringan untuk menjaga hidrasi.', 7000, 55, 88, 'Tepat untuk hidrasi yang menyegarkan.', 80, 1.20, 18.00, 0.20, 0.80, 16.00, 15, TRUE)
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
