-- Level-Up: Harder XP curve, habit XP limits, level event rebuild

-- =============================================================================
-- HABIT XP RANGE (5–50)
-- =============================================================================

UPDATE habits
SET xp_amount = LEAST(50, GREATEST(5, xp_amount))
WHERE xp_amount < 5 OR xp_amount > 50;

ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_xp_amount_check;
ALTER TABLE habits ADD CONSTRAINT habits_xp_amount_check
  CHECK (xp_amount >= 5 AND xp_amount <= 50);

-- =============================================================================
-- UPDATED LEVEL THRESHOLDS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_level_threshold(p_level integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_level
    WHEN 1 THEN 0
    WHEN 2 THEN 150
    WHEN 3 THEN 400
    WHEN 4 THEN 750
    WHEN 5 THEN 1250
    WHEN 6 THEN 1900
    WHEN 7 THEN 2750
    WHEN 8 THEN 3850
    WHEN 9 THEN 5200
    WHEN 10 THEN 7000
    ELSE 0
  END;
$$;

-- =============================================================================
-- RECORD LEVEL EVENTS (unchanged logic, new thresholds via get_level_threshold)
-- =============================================================================

CREATE OR REPLACE FUNCTION record_category_level_events(
  p_user_id uuid,
  p_category_id uuid,
  p_xp_before integer,
  p_xp_after integer,
  p_transaction_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_level integer;
  v_threshold integer;
BEGIN
  FOR v_level IN 2..10 LOOP
    v_threshold := get_level_threshold(v_level);
    IF p_xp_before < v_threshold AND p_xp_after >= v_threshold THEN
      INSERT INTO category_level_events (
        user_id,
        category_id,
        level,
        transaction_id,
        reached_at
      )
      SELECT
        p_user_id,
        p_category_id,
        v_level,
        p_transaction_id,
        t.created_at
      FROM xp_transactions t
      WHERE t.id = p_transaction_id
      ON CONFLICT (user_id, category_id, level) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- =============================================================================
-- REBUILD LEVEL EVENTS FROM TRANSACTION HISTORY
-- =============================================================================

CREATE OR REPLACE FUNCTION rebuild_category_level_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cat RECORD;
  tx RECORD;
  v_cumulative integer;
  v_prev integer;
  v_level integer;
  v_threshold integer;
BEGIN
  DELETE FROM category_level_events;

  FOR cat IN
    SELECT DISTINCT user_id, category_id
    FROM xp_transactions
    WHERE transaction_type = 'good_habit'
      AND category_xp_change > 0
      AND category_id IS NOT NULL
    ORDER BY user_id, category_id
  LOOP
    v_cumulative := 0;

    FOR tx IN
      SELECT id, category_xp_change, created_at
      FROM xp_transactions
      WHERE user_id = cat.user_id
        AND category_id = cat.category_id
        AND transaction_type = 'good_habit'
        AND category_xp_change > 0
      ORDER BY created_at ASC
    LOOP
      v_prev := v_cumulative;
      v_cumulative := v_cumulative + tx.category_xp_change;

      FOR v_level IN 2..10 LOOP
        v_threshold := get_level_threshold(v_level);
        IF v_prev < v_threshold AND v_cumulative >= v_threshold THEN
          INSERT INTO category_level_events (
            user_id,
            category_id,
            level,
            transaction_id,
            reached_at
          ) VALUES (
            cat.user_id,
            cat.category_id,
            v_level,
            tx.id,
            tx.created_at
          )
          ON CONFLICT (user_id, category_id, level) DO NOTHING;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;

-- Run rebuild now so existing users match the new thresholds
SELECT rebuild_category_level_events();

-- =============================================================================
-- UPDATED RPC: log_habit
-- =============================================================================

CREATE OR REPLACE FUNCTION log_habit(p_habit_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_habit habits%ROWTYPE;
  v_bank_xp_change integer;
  v_category_xp_change integer;
  v_description text;
  v_transaction xp_transactions%ROWTYPE;
  v_bank_balance integer;
  v_transaction_type text;
  v_xp_before integer;
  v_xp_after integer;
  v_level integer;
  v_threshold integer;
  v_level_ups integer[] := ARRAY[]::integer[];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_habit
  FROM habits
  WHERE id = p_habit_id
    AND user_id = v_user_id
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Habit not found or inactive';
  END IF;

  IF v_habit.xp_amount < 5 OR v_habit.xp_amount > 50 THEN
    RAISE EXCEPTION 'Habit XP must be between 5 and 50';
  END IF;

  IF v_habit.habit_type = 'good' THEN
    v_bank_xp_change := v_habit.xp_amount;
    v_category_xp_change := v_habit.xp_amount;
    v_transaction_type := 'good_habit';
    v_description := v_habit.name || ' (+' || v_habit.xp_amount || ' XP)';

    SELECT COALESCE(SUM(category_xp_change), 0)::integer INTO v_xp_before
    FROM xp_transactions
    WHERE user_id = v_user_id
      AND category_id = v_habit.category_id;

    v_xp_after := v_xp_before + v_category_xp_change;

    FOR v_level IN 2..10 LOOP
      v_threshold := get_level_threshold(v_level);
      IF v_xp_before < v_threshold AND v_xp_after >= v_threshold THEN
        v_level_ups := array_append(v_level_ups, v_level);
      END IF;
    END LOOP;
  ELSE
    v_bank_xp_change := -v_habit.xp_amount;
    v_category_xp_change := 0;
    v_transaction_type := 'bad_habit';
    v_description := v_habit.name || ' (-' || v_habit.xp_amount || ' XP)';
    v_xp_before := 0;
    v_xp_after := 0;
  END IF;

  INSERT INTO xp_transactions (
    user_id,
    category_id,
    habit_id,
    transaction_type,
    description,
    bank_xp_change,
    category_xp_change
  ) VALUES (
    v_user_id,
    v_habit.category_id,
    p_habit_id,
    v_transaction_type,
    v_description,
    v_bank_xp_change,
    v_category_xp_change
  )
  RETURNING * INTO v_transaction;

  IF v_habit.habit_type = 'good' THEN
    PERFORM record_category_level_events(
      v_user_id,
      v_habit.category_id,
      v_xp_before,
      v_xp_after,
      v_transaction.id
    );
  END IF;

  v_bank_balance := get_bank_balance(v_user_id);

  RETURN json_build_object(
    'transaction', row_to_json(v_transaction),
    'bank_balance', v_bank_balance,
    'level_ups', to_json(v_level_ups),
    'category_xp_before', v_xp_before
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rebuild_category_level_events() TO authenticated;
