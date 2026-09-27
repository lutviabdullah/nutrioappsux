CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  operation CHAR(1) NOT NULL CHECK (operation IN ('I', 'U', 'D')),
  old_row JSONB,
  new_row JSONB,
  actor_id TEXT,
  request_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS gender_options (
  code VARCHAR(30) PRIMARY KEY,
  label VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS activity_levels (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS dietary_goals (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS meal_types (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredient_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS education_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(80) NOT NULL UNIQUE,
  full_name VARCHAR(120),
  age INTEGER,
  gender VARCHAR(30),
  height_cm INTEGER,
  weight_kg DECIMAL(5, 2),
  activity_level VARCHAR(40),
  dietary_goal VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_users_gender FOREIGN KEY (gender) REFERENCES gender_options(code) ON DELETE SET NULL,
  CONSTRAINT fk_users_activity_level FOREIGN KEY (activity_level) REFERENCES activity_levels(code) ON DELETE SET NULL,
  CONSTRAINT fk_users_dietary_goal FOREIGN KEY (dietary_goal) REFERENCES dietary_goals(code) ON DELETE SET NULL,
  CONSTRAINT ck_users_age CHECK (age IS NULL OR age BETWEEN 13 AND 130),
  CONSTRAINT ck_users_height CHECK (height_cm IS NULL OR height_cm BETWEEN 50 AND 275),
  CONSTRAINT ck_users_weight CHECK (weight_kg IS NULL OR weight_kg BETWEEN 2 AND 700)
);

CREATE TABLE IF NOT EXISTS food_categories (
  id TEXT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_items (
  id TEXT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  subtitle VARCHAR(255),
  emoji VARCHAR(20),
  category_id TEXT,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  nutrition_score SMALLINT NOT NULL CHECK (nutrition_score BETWEEN 0 AND 100),
  eco_score SMALLINT NOT NULL CHECK (eco_score BETWEEN 0 AND 100),
  recommendation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_food_items_price CHECK (base_price >= 0),
  CONSTRAINT fk_food_items_category
    FOREIGN KEY (category_id)
    REFERENCES food_categories(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS nutrients (
  id TEXT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_nutrients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  food_id TEXT NOT NULL,
  nutrient_id TEXT NOT NULL,
  value DECIMAL(8, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_food_nutrients_food
    FOREIGN KEY (food_id)
    REFERENCES food_items(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_food_nutrients_nutrient
    FOREIGN KEY (nutrient_id)
    REFERENCES nutrients(id)
    ON DELETE CASCADE,
  CONSTRAINT uk_food_nutrients UNIQUE (food_id, nutrient_id),
  CONSTRAINT ck_food_nutrients_value CHECK (value >= 0)
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  category_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_ingredients_category FOREIGN KEY (category_id)
    REFERENCES ingredient_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS food_ingredients (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL,
  quantity_g DECIMAL(6, 2),
  notes TEXT,
  CONSTRAINT fk_food_ingredients_food
    FOREIGN KEY (food_id)
    REFERENCES food_items(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_food_ingredients_ingredient
    FOREIGN KEY (ingredient_id)
    REFERENCES ingredients(id)
    ON DELETE CASCADE,
  CONSTRAINT uk_food_ingredients UNIQUE (food_id, ingredient_id),
  CONSTRAINT ck_food_ingredients_quantity CHECK (quantity_g IS NULL OR quantity_g > 0)
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  meal_type VARCHAR(40) NOT NULL,
  portion_size DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  servings DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_meal_logs_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_meal_logs_type FOREIGN KEY (meal_type)
    REFERENCES meal_types(code) ON DELETE RESTRICT,
  CONSTRAINT ck_meal_logs_portions CHECK (portion_size > 0 AND servings > 0),
  CONSTRAINT fk_meal_logs_food
    FOREIGN KEY (food_id)
    REFERENCES food_items(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS nutrition_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  meal_log_id TEXT NOT NULL UNIQUE,
  food_id TEXT NOT NULL,
  servings DECIMAL(8, 2) NOT NULL CHECK (servings > 0),
  calories_kcal DECIMAL(12, 2) NOT NULL CHECK (calories_kcal >= 0),
  protein_g DECIMAL(12, 2) NOT NULL CHECK (protein_g >= 0),
  fiber_g DECIMAL(12, 2) NOT NULL CHECK (fiber_g >= 0),
  occurred_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  previous_hash BYTEA,
  entry_hash BYTEA NOT NULL UNIQUE,
  CONSTRAINT fk_ledger_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ledger_meal FOREIGN KEY (meal_log_id) REFERENCES meal_logs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ledger_food FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_meal_plans_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meal_plan_items (
  id TEXT PRIMARY KEY,
  meal_plan_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  day_of_week VARCHAR(20),
  meal_type VARCHAR(40),
  target_servings DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  CONSTRAINT fk_meal_plan_items_meal_plan
    FOREIGN KEY (meal_plan_id)
    REFERENCES meal_plans(id)
    ON DELETE CASCADE,
  CONSTRAINT ck_meal_plan_items_servings CHECK (target_servings > 0),
  CONSTRAINT fk_meal_plan_items_food
    FOREIGN KEY (food_id)
    REFERENCES food_items(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_meal_plan_items_type FOREIGN KEY (meal_type)
    REFERENCES meal_types(code) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  preference_name VARCHAR(80) NOT NULL,
  preference_value VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user_preferences_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT uk_user_preferences UNIQUE (user_id, preference_name)
);

CREATE TABLE IF NOT EXISTS food_reviews (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL,
  reviewer_name VARCHAR(120) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_food_reviews_food
    FOREIGN KEY (food_id)
    REFERENCES food_items(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_nutrients_food ON food_nutrients(food_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_time ON meal_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan_day ON meal_plan_items(meal_plan_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_food_items_active_score ON food_items(nutrition_score DESC, id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_food_nutrients_nutrient_food ON food_nutrients(nutrient_id, food_id);
CREATE INDEX IF NOT EXISTS idx_food_ingredients_ingredient ON food_ingredients(ingredient_id, food_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_food_time ON meal_logs(user_id, food_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_dates ON meal_plans(user_id, start_date DESC, end_date);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_food ON meal_plan_items(food_id, meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_food_reviews_food_time ON food_reviews(food_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_user_time ON nutrition_ledger_entries(user_id, occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table_row_time ON audit_events(table_name, row_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION write_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_old_row JSONB;
  v_new_row JSONB;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_old_row := to_jsonb(OLD);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_new_row := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_events (table_name, row_id, operation, old_row, new_row, actor_id, request_id)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(v_new_row->>'id', v_old_row->>'id'),
    substr(TG_OP, 1, 1),
    v_old_row,
    v_new_row,
    NULLIF(current_setting('app.user_id', true), ''),
    NULLIF(current_setting('app.request_id', true), '')
  );
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP <> 'INSERT' OR COALESCE(current_setting('app.ledger_write', true), '') <> 'on' THEN
    RAISE EXCEPTION 'nutrition ledger is append-only';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_food_items_updated_at ON food_items;
CREATE TRIGGER trg_food_items_updated_at
BEFORE UPDATE ON food_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION write_audit_event();

DROP TRIGGER IF EXISTS trg_audit_food_items ON food_items;
CREATE TRIGGER trg_audit_food_items
AFTER INSERT OR UPDATE OR DELETE ON food_items
FOR EACH ROW EXECUTE FUNCTION write_audit_event();

DROP TRIGGER IF EXISTS trg_audit_meal_logs ON meal_logs;
CREATE TRIGGER trg_audit_meal_logs
AFTER INSERT OR UPDATE OR DELETE ON meal_logs
FOR EACH ROW EXECUTE FUNCTION write_audit_event();

DROP TRIGGER IF EXISTS trg_audit_meal_plans ON meal_plans;
CREATE TRIGGER trg_audit_meal_plans
AFTER INSERT OR UPDATE OR DELETE ON meal_plans
FOR EACH ROW EXECUTE FUNCTION write_audit_event();

DROP TRIGGER IF EXISTS trg_ledger_append_only ON nutrition_ledger_entries;
CREATE TRIGGER trg_ledger_append_only
BEFORE INSERT OR UPDATE OR DELETE ON nutrition_ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

CREATE OR REPLACE FUNCTION log_meal_with_ledger(
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
  v_food_id TEXT;
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

  SELECT id INTO STRICT v_food_id
  FROM food_items
  WHERE id = p_food_id AND is_active;

  SELECT
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'CAL'), 0),
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'PROTEIN'), 0),
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'FIBER'), 0)
  INTO v_calories_kcal, v_protein_g, v_fiber_g
  FROM food_nutrients AS fn
  JOIN nutrients AS nutrient ON nutrient.id = fn.nutrient_id
  WHERE fn.food_id = v_food_id;

  v_meal_id := gen_random_uuid()::TEXT;
  INSERT INTO meal_logs (id, user_id, food_id, meal_type, portion_size, servings, logged_at)
  VALUES (v_meal_id, p_user_id, p_food_id, p_meal_type, 1.00, p_servings, p_logged_at);

  SELECT entry_hash INTO v_previous_hash
  FROM nutrition_ledger_entries
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
  INSERT INTO nutrition_ledger_entries (
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

REVOKE UPDATE, DELETE ON nutrition_ledger_entries FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON audit_events FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION log_meal_with_ledger(TEXT, TEXT, VARCHAR, DECIMAL, TIMESTAMPTZ) FROM PUBLIC;

CREATE OR REPLACE VIEW v_food_catalog AS
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
FROM food_items AS food
LEFT JOIN food_categories AS category ON category.id = food.category_id
LEFT JOIN LATERAL (
  SELECT
    MAX(fn.value) FILTER (WHERE nutrient.code = 'CAL') AS calories_kcal,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'PROTEIN') AS protein_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'CARBS') AS carbs_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'FAT') AS fat_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'FIBER') AS fiber_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'SUGAR') AS sugar_g,
    MAX(fn.value) FILTER (WHERE nutrient.code = 'SODIUM') AS sodium_mg
  FROM food_nutrients AS fn
  JOIN nutrients AS nutrient ON nutrient.id = fn.nutrient_id
  WHERE fn.food_id = food.id
) AS nutrition ON TRUE
LEFT JOIN (
  SELECT food_id, COUNT(*) AS review_count, ROUND(AVG(rating)::NUMERIC, 2) AS average_rating
  FROM food_reviews
  GROUP BY food_id
) AS reviews ON reviews.food_id = food.id
WHERE food.is_active;

CREATE OR REPLACE VIEW v_user_daily_nutrition AS
SELECT
  user_id,
  (occurred_at AT TIME ZONE 'UTC')::DATE AS nutrition_date,
  COUNT(*) AS meal_count,
  SUM(servings) AS total_servings,
  SUM(calories_kcal) AS calories_kcal,
  SUM(protein_g) AS protein_g,
  SUM(fiber_g) AS fiber_g
FROM nutrition_ledger_entries
GROUP BY user_id, (occurred_at AT TIME ZONE 'UTC')::DATE;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_daily_nutrition AS
SELECT * FROM v_user_daily_nutrition;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_daily_nutrition_user_date
  ON mv_user_daily_nutrition(user_id, nutrition_date);

CREATE OR REPLACE PROCEDURE refresh_nutrition_analytics()
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_daily_nutrition;
END;
$$;

REVOKE ALL ON mv_user_daily_nutrition FROM PUBLIC;
REVOKE ALL ON v_user_daily_nutrition FROM PUBLIC;

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Nutrio User',
  university TEXT NOT NULL DEFAULT '',
  faculty TEXT NOT NULL DEFAULT '',
  semester SMALLINT CHECK (semester IS NULL OR semester BETWEEN 1 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  category_id UUID NOT NULL REFERENCES public.education_categories(id) ON DELETE RESTRICT,
  summary TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT '',
  icon VARCHAR(40) NOT NULL DEFAULT 'book-open',
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
END;
$$;

CREATE INDEX IF NOT EXISTS idx_education_published_order
  ON public.education(sort_order, title)
  WHERE is_published;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.education TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS education_read_published ON public.education;
CREATE POLICY education_read_published
  ON public.education FOR SELECT
  TO anon, authenticated
  USING (is_published);

DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
CREATE POLICY profiles_read_own
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_education_updated_at ON public.education;
CREATE TRIGGER trg_education_updated_at
BEFORE UPDATE ON public.education
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.education_categories (slug, name)
VALUES
  ('nutrisi', 'Nutrisi'),
  ('keberlanjutan', 'Keberlanjutan'),
  ('kebiasaan', 'Kebiasaan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.education (slug, title, category_id, summary, action, icon, sort_order)
VALUES
  ('piring-seimbang', 'Piring seimbang', (SELECT id FROM public.education_categories WHERE slug = 'nutrisi'), 'Isi piring dengan karbohidrat kompleks, protein, sayur, buah, dan lemak baik agar energi lebih stabil.', 'Target cepat: setengah piring sayur dan buah, lalu lengkapi dengan protein serta sumber karbohidrat.', 'utensils', 1),
  ('protein-rendah-jejak', 'Protein rendah jejak', (SELECT id FROM public.education_categories WHERE slug = 'keberlanjutan'), 'Tempe, tahu, kacang merah, edamame, dan telur bisa membantu memenuhi protein tanpa emisi setinggi daging merah.', 'Mulai dari 2-3 kali makan berbasis protein nabati per minggu.', 'leaf', 2),
  ('porsi-anti-mubazir', 'Porsi anti mubazir', (SELECT id FROM public.education_categories WHERE slug = 'kebiasaan'), 'Mengambil porsi sesuai lapar, membawa kotak makan, dan menghabiskan sisa makanan membantu menekan sampah pangan.', 'Pilih porsi kecil dulu, tambah bila masih lapar.', 'recycle', 3)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category_id = EXCLUDED.category_id,
  summary = EXCLUDED.summary,
  action = EXCLUDED.action,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_published = TRUE,
  updated_at = NOW();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'education'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.education;
    END IF;
  END IF;
END;
$$;

DO $$
DECLARE
  v_table RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOR v_table IN
      SELECT c.relname
      FROM pg_class AS c
      JOIN pg_namespace AS n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind IN ('r', 'p')
    LOOP
      IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = v_table.relname
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', v_table.relname);
      END IF;
    END LOOP;
  END IF;
END;
$$;
