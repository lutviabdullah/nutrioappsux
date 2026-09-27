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
  calories_kcal INTEGER,
  protein_g DECIMAL(5, 2),
  carbs_g DECIMAL(5, 2),
  fat_g DECIMAL(5, 2),
  fiber_g DECIMAL(5, 2),
  sugar_g DECIMAL(5, 2),
  sodium_mg INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_food_items_price CHECK (base_price >= 0),
  CONSTRAINT ck_food_items_nutrition_values CHECK (
    (calories_kcal IS NULL OR calories_kcal >= 0) AND
    (protein_g IS NULL OR protein_g >= 0) AND
    (carbs_g IS NULL OR carbs_g >= 0) AND
    (fat_g IS NULL OR fat_g >= 0) AND
    (fiber_g IS NULL OR fiber_g >= 0) AND
    (sugar_g IS NULL OR sugar_g >= 0) AND
    (sodium_mg IS NULL OR sodium_mg >= 0)
  ),
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
  id TEXT PRIMARY KEY,
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
  category VARCHAR(80),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    ON DELETE RESTRICT
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
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_food food_items%ROWTYPE;
  v_meal_id TEXT;
  v_ledger_id UUID := gen_random_uuid();
  v_previous_hash BYTEA;
  v_entry_hash BYTEA;
BEGIN
  IF p_servings IS NULL OR p_servings <= 0 THEN
    RAISE EXCEPTION 'servings must be greater than zero';
  END IF;

  PERFORM set_config('app.user_id', p_user_id, true);
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO STRICT v_food
  FROM food_items
  WHERE id = p_food_id AND is_active;

  v_meal_id := gen_random_uuid()::TEXT;
  INSERT INTO meal_logs (id, user_id, food_id, meal_type, portion_size, servings, logged_at)
  VALUES (v_meal_id, p_user_id, p_food_id, p_meal_type, p_servings, p_servings, p_logged_at);

  SELECT entry_hash INTO v_previous_hash
  FROM nutrition_ledger_entries
  WHERE user_id = p_user_id
  ORDER BY recorded_at DESC, id DESC
  LIMIT 1;

  v_entry_hash := digest(
    concat_ws('|', v_ledger_id, p_user_id, v_meal_id, p_food_id, p_servings,
      COALESCE(v_food.calories_kcal, 0) * p_servings,
      COALESCE(v_food.protein_g, 0) * p_servings,
      COALESCE(v_food.fiber_g, 0) * p_servings,
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
    COALESCE(v_food.calories_kcal, 0) * p_servings,
    COALESCE(v_food.protein_g, 0) * p_servings,
    COALESCE(v_food.fiber_g, 0) * p_servings,
    p_logged_at, v_previous_hash, v_entry_hash
  );

  RETURN QUERY SELECT v_meal_id, v_ledger_id,
    COALESCE(v_food.calories_kcal, 0) * p_servings,
    COALESCE(v_food.protein_g, 0) * p_servings,
    COALESCE(v_food.fiber_g, 0) * p_servings;
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
  food.calories_kcal,
  food.protein_g,
  food.carbs_g,
  food.fat_g,
  food.fiber_g,
  food.sugar_g,
  food.sodium_mg,
  COALESCE(reviews.review_count, 0) AS review_count,
  reviews.average_rating
FROM food_items AS food
LEFT JOIN food_categories AS category ON category.id = food.category_id
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
