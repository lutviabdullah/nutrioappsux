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
  v_food food_items%ROWTYPE;
  v_meal_id TEXT;
  v_ledger_id UUID := gen_random_uuid();
  v_previous_hash BYTEA;
  v_entry_hash BYTEA;
BEGIN
  IF p_servings IS NULL OR p_servings <= 0 OR p_servings > 999.99 THEN
    RAISE EXCEPTION 'servings must be between 0 and 999.99';
  END IF;

  PERFORM set_config('app.user_id', p_user_id, true);
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO STRICT v_food
  FROM food_items
  WHERE id = p_food_id AND is_active;

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