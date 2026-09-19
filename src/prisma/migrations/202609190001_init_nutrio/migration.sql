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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  CONSTRAINT uk_food_nutrients UNIQUE (food_id, nutrient_id)
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
  CONSTRAINT uk_food_ingredients UNIQUE (food_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  meal_type VARCHAR(40) NOT NULL,
  portion_size DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  servings DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_meal_logs_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_meal_logs_food
    FOREIGN KEY (food_id)
    REFERENCES food_items(id)
    ON DELETE RESTRICT
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
