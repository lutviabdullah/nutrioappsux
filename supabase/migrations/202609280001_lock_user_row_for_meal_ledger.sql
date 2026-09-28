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
  v_locked_user_id TEXT;
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

  SELECT id INTO STRICT v_locked_user_id
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  SELECT id INTO STRICT v_food_id
  FROM public.food_items
  WHERE id = p_food_id AND is_active;

  SELECT
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'CAL'), 0),
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'PROTEIN'), 0),
    COALESCE(MAX(fn.value) FILTER (WHERE nutrient.code = 'FIBER'), 0)
  INTO v_calories_kcal, v_protein_g, v_fiber_g
  FROM public.food_nutrients AS fn
  JOIN public.nutrients AS nutrient ON nutrient.id = fn.nutrient_id
  WHERE fn.food_id = v_food_id;

  v_meal_id := gen_random_uuid()::TEXT;
  INSERT INTO public.meal_logs (id, user_id, food_id, meal_type, portion_size, servings, logged_at)
  VALUES (v_meal_id, p_user_id, v_food_id, p_meal_type, 1.00, p_servings, p_logged_at);

  SELECT entry_hash INTO v_previous_hash
  FROM public.nutrition_ledger_entries
  WHERE user_id = p_user_id
  ORDER BY recorded_at DESC, id DESC
  LIMIT 1;

  v_entry_hash := digest(
    concat_ws('|', v_ledger_id, p_user_id, v_meal_id, v_food_id, p_servings,
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
    v_ledger_id, p_user_id, v_meal_id, v_food_id, p_servings,
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