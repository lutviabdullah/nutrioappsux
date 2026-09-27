BEGIN;

CREATE TABLE IF NOT EXISTS public.gender_options (
  code VARCHAR(30) PRIMARY KEY,
  label VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.activity_levels (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dietary_goals (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.meal_types (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ingredient_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.education_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL UNIQUE
);

INSERT INTO public.gender_options (code, label)
SELECT DISTINCT gender, gender FROM public.users WHERE gender IS NOT NULL
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.activity_levels (code, label)
SELECT DISTINCT activity_level, activity_level FROM public.users WHERE activity_level IS NOT NULL
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.dietary_goals (code, label)
SELECT DISTINCT dietary_goal, dietary_goal FROM public.users WHERE dietary_goal IS NOT NULL
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.meal_types (code, label)
SELECT meal_type, meal_type
FROM (
  SELECT meal_type FROM public.meal_logs
  UNION
  SELECT meal_type FROM public.meal_plan_items WHERE meal_type IS NOT NULL
) AS existing_meal_types
WHERE meal_type IS NOT NULL
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.ingredient_categories (name)
SELECT DISTINCT btrim(category)
FROM public.ingredients
WHERE category IS NOT NULL AND btrim(category) <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.education_categories (slug, name)
SELECT DISTINCT
  trim(BOTH '-' FROM regexp_replace(lower(btrim(category)), '[^a-z0-9]+', '-', 'g')),
  btrim(category)
FROM public.education
WHERE category IS NOT NULL AND btrim(category) <> ''
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.meal_types (code, label) VALUES
  ('Breakfast', 'Breakfast'),
  ('Lunch', 'Lunch'),
  ('Dinner', 'Dinner'),
  ('Snack', 'Snack'),
  ('Hydration', 'Hydration')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.education_categories (slug, name) VALUES
  ('nutrisi', 'Nutrisi'),
  ('keberlanjutan', 'Keberlanjutan'),
  ('kebiasaan', 'Kebiasaan')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS category_id UUID;
UPDATE public.ingredients AS ingredient
SET category_id = category_ref.id
FROM public.ingredient_categories AS category_ref
WHERE ingredient.category_id IS NULL
  AND btrim(ingredient.category) = category_ref.name;

ALTER TABLE public.education ADD COLUMN IF NOT EXISTS category_id UUID;
UPDATE public.education AS article
SET category_id = category_ref.id
FROM public.education_categories AS category_ref
WHERE article.category_id IS NULL
  AND lower(btrim(article.category)) = lower(category_ref.name);

ALTER TABLE public.education ALTER COLUMN category_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ingredients_category') THEN
    ALTER TABLE public.ingredients ADD CONSTRAINT fk_ingredients_category
      FOREIGN KEY (category_id) REFERENCES public.ingredient_categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_education_category') THEN
    ALTER TABLE public.education ADD CONSTRAINT fk_education_category
      FOREIGN KEY (category_id) REFERENCES public.education_categories(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_gender') THEN
    ALTER TABLE public.users ADD CONSTRAINT fk_users_gender
      FOREIGN KEY (gender) REFERENCES public.gender_options(code) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_activity_level') THEN
    ALTER TABLE public.users ADD CONSTRAINT fk_users_activity_level
      FOREIGN KEY (activity_level) REFERENCES public.activity_levels(code) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_dietary_goal') THEN
    ALTER TABLE public.users ADD CONSTRAINT fk_users_dietary_goal
      FOREIGN KEY (dietary_goal) REFERENCES public.dietary_goals(code) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_meal_logs_type') THEN
    ALTER TABLE public.meal_logs ADD CONSTRAINT fk_meal_logs_type
      FOREIGN KEY (meal_type) REFERENCES public.meal_types(code) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_meal_plan_items_type') THEN
    ALTER TABLE public.meal_plan_items ADD CONSTRAINT fk_meal_plan_items_type
      FOREIGN KEY (meal_type) REFERENCES public.meal_types(code) ON DELETE RESTRICT;
  END IF;
END;
$$;

INSERT INTO public.nutrients (id, code, name, unit, description) VALUES
  ('nut_cal', 'CAL', 'Calories', 'kcal', 'Total energy per serving.'),
  ('nut_protein', 'PROTEIN', 'Protein', 'g', 'Protein content in grams.'),
  ('nut_carbs', 'CARBS', 'Carbohydrates', 'g', 'Carbohydrate amount.'),
  ('nut_fat', 'FAT', 'Fat', 'g', 'Total fat amount.'),
  ('nut_fiber', 'FIBER', 'Fiber', 'g', 'Dietary fiber.'),
  ('nut_sugar', 'SUGAR', 'Sugar', 'g', 'Total sugar amount.'),
  ('nut_sodium', 'SODIUM', 'Sodium', 'mg', 'Sodium level in milligrams.')
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.food_nutrients
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

INSERT INTO public.food_nutrients (food_id, nutrient_id, value)
SELECT food.id, nutrient.id, values_by_code.amount
FROM public.food_items AS food
CROSS JOIN LATERAL (VALUES
  ('CAL', food.calories_kcal::NUMERIC),
  ('PROTEIN', food.protein_g::NUMERIC),
  ('CARBS', food.carbs_g::NUMERIC),
  ('FAT', food.fat_g::NUMERIC),
  ('FIBER', food.fiber_g::NUMERIC),
  ('SUGAR', food.sugar_g::NUMERIC),
  ('SODIUM', food.sodium_mg::NUMERIC)
) AS values_by_code(code, amount)
JOIN public.nutrients AS nutrient ON nutrient.code = values_by_code.code
WHERE values_by_code.amount IS NOT NULL
ON CONFLICT (food_id, nutrient_id) DO UPDATE SET value = EXCLUDED.value;

DROP VIEW IF EXISTS public.v_food_catalog;
ALTER TABLE public.food_items DROP CONSTRAINT IF EXISTS ck_food_items_nutrition_values;
ALTER TABLE public.food_items
  DROP COLUMN IF EXISTS calories_kcal,
  DROP COLUMN IF EXISTS protein_g,
  DROP COLUMN IF EXISTS carbs_g,
  DROP COLUMN IF EXISTS fat_g,
  DROP COLUMN IF EXISTS fiber_g,
  DROP COLUMN IF EXISTS sugar_g,
  DROP COLUMN IF EXISTS sodium_mg;
ALTER TABLE public.ingredients DROP COLUMN IF EXISTS category;
ALTER TABLE public.education DROP COLUMN IF EXISTS category;

CREATE INDEX IF NOT EXISTS idx_food_nutrients_nutrient_food
  ON public.food_nutrients(nutrient_id, food_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_category
  ON public.ingredients(category_id);
CREATE INDEX IF NOT EXISTS idx_education_category
  ON public.education(category_id);

CREATE OR REPLACE FUNCTION public.log_meal_with_ledger(
  p_user_id TEXT,
  p_food_id TEXT,
  p_meal_type VARCHAR(40),
  p_servings DECIMAL(8, 2) DEFAULT 1.00,
  p_logged_at TIMESTAMPTZ DEFAULT clock_timestamp()
)
RETURNS TABLE (meal_id TEXT, ledger_id UUID, calories_kcal DECIMAL, protein_g DECIMAL, fiber_g DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_food public.food_items%ROWTYPE;
  v_meal_id TEXT;
  v_ledger_id UUID := gen_random_uuid();
  v_previous_hash BYTEA;
  v_entry_hash BYTEA;
  v_calories_kcal NUMERIC(12, 2);
  v_protein_g NUMERIC(12, 2);
  v_fiber_g NUMERIC(12, 2);
BEGIN
  IF p_servings IS NULL OR p_servings <= 0 OR p_servings > 999.99 THEN
    RAISE EXCEPTION 'servings must be between 0 and 999.99';
  END IF;

  PERFORM set_config('app.user_id', p_user_id, true);
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO STRICT v_food
  FROM public.food_items
  WHERE id = p_food_id AND is_active;

  SELECT
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'CAL'), 0),
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'PROTEIN'), 0),
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'FIBER'), 0)
  INTO v_calories_kcal, v_protein_g, v_fiber_g
  FROM public.food_nutrients AS fn
  JOIN public.nutrients AS nutrient ON nutrient.id = fn.nutrient_id
  WHERE fn.food_id = p_food_id;

  v_meal_id := gen_random_uuid()::TEXT;
  INSERT INTO public.meal_logs (id, user_id, food_id, meal_type, portion_size, servings, logged_at)
  VALUES (v_meal_id, p_user_id, p_food_id, p_meal_type, 1.00, p_servings, p_logged_at);

  SELECT entry_hash INTO v_previous_hash
  FROM public.nutrition_ledger_entries
  WHERE user_id = p_user_id
  ORDER BY recorded_at DESC, id DESC
  LIMIT 1;

  v_entry_hash := digest(
    concat_ws('|', v_ledger_id, p_user_id, v_meal_id, p_food_id, p_servings,
      v_calories_kcal * p_servings,
      v_protein_g * p_servings,
      v_fiber_g * p_servings,
      p_logged_at, encode(COALESCE(v_previous_hash, ''::BYTEA), 'hex')),
    'sha256'
  );

  PERFORM set_config('app.ledger_write', 'on', true);
  INSERT INTO public.nutrition_ledger_entries (
    id, user_id, meal_log_id, food_id, servings, calories_kcal, protein_g, fiber_g,
    occurred_at, previous_hash, entry_hash
  )
  VALUES (
    v_ledger_id, p_user_id, v_meal_id, p_food_id, p_servings,
    v_calories_kcal * p_servings,
    v_protein_g * p_servings,
    v_fiber_g * p_servings,
    p_logged_at, v_previous_hash, v_entry_hash
  );

  RETURN QUERY SELECT v_meal_id, v_ledger_id,
    v_calories_kcal * p_servings,
    v_protein_g * p_servings,
    v_fiber_g * p_servings;
END;
$$;

CREATE OR REPLACE VIEW public.v_food_catalog AS
SELECT
  food.id AS food_id,
  food.slug,
  food.name,
  food.subtitle,
  food.emoji,
  category.name AS category_name,
  food.description,
  food.base_price,
  food.nutrition_score,
  food.eco_score,
  food.recommendation,
  nutrition.calories_kcal,
  nutrition.protein_g,
  nutrition.carbs_g,
  nutrition.fat_g,
  nutrition.fiber_g,
  nutrition.sugar_g,
  nutrition.sodium_mg,
  COALESCE(reviews.review_count, 0) AS review_count,
  reviews.average_rating
FROM public.food_items AS food
LEFT JOIN public.food_categories AS category ON category.id = food.category_id
LEFT JOIN LATERAL (
  SELECT
    MAX(fn.value) FILTER (WHERE nutrient.code = 'CAL') AS calories_kcal,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'PROTEIN') AS protein_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'CARBS') AS carbs_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'FAT') AS fat_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'FIBER') AS fiber_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'SUGAR') AS sugar_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'SODIUM') AS sodium_mg
  FROM public.food_nutrients AS fn
  JOIN public.nutrients AS nutrient ON nutrient.id = fn.nutrient_id
  WHERE fn.food_id = food.id
) AS nutrition ON TRUE
LEFT JOIN (
  SELECT food_id, COUNT(*) AS review_count, ROUND(AVG(rating)::NUMERIC, 2) AS average_rating
  FROM public.food_reviews
  GROUP BY food_id
) AS reviews ON reviews.food_id = food.id
WHERE food.is_active;

DO $$
DECLARE
  v_table_name TEXT;
BEGIN
  FOREACH v_table_name IN ARRAY ARRAY[
    'gender_options',
    'activity_levels',
    'dietary_goals',
    'meal_types',
    'ingredient_categories',
    'education_categories'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table_name);
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', v_table_name);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = v_table_name AND policyname = 'reference_data_read'
    ) THEN
      EXECUTE format(
        'CREATE POLICY reference_data_read ON public.%I FOR SELECT TO anon, authenticated USING (TRUE)',
        v_table_name
      );
    END IF;
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH v_table_name IN ARRAY ARRAY[
      'gender_options',
      'activity_levels',
      'dietary_goals',
      'meal_types',
      'ingredient_categories',
      'education_categories'
    ] LOOP
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = v_table_name
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', v_table_name);
      END IF;
    END LOOP;
  END IF;
END;
$$;

COMMIT;