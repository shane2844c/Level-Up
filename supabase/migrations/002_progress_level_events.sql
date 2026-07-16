-- Level-Up: Progress analytics — category level events and updated log_habit

-- =============================================================================
-- CATEGORY LEVEL EVENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS category_level_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level BETWEEN 2 AND 10),
  transaction_id uuid NOT NULL REFERENCES xp_transactions(id) ON DELETE CASCADE,
  reached_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, level)
);

CREATE INDEX IF NOT EXISTS idx_category_level_events_user_reached
  ON category_level_events(user_id, reached_at DESC);

CREATE INDEX IF NOT EXISTS idx_category_level_events_category_reached
  ON category_level_events(category_id, reached_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_habit_created
  ON xp_transactions(user_id, habit_id, created_at DESC);

-- Composite indexes (may already exist from 001; safe to re-create with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_created
  ON xp_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_category_created
  ON xp_transactions(user_id, category_id, created_at DESC);

ALTER TABLE category_level_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own level events"
  ON category_level_events FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies — writes only via SECURITY DEFINER functions

-- =============================================================================
-- HELPER: Level threshold XP
-- =============================================================================

CREATE OR REPLACE FUNCTION get_level_threshold(p_level integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_level
    WHEN 1 THEN 0
    WHEN 2 THEN 100
    WHEN 3 THEN 250
    WHEN 4 THEN 500
    WHEN 5 THEN 900
    WHEN 6 THEN 1400
    WHEN 7 THEN 2000
    WHEN 8 THEN 2750
    WHEN 9 THEN 3650
    WHEN 10 THEN 5000
    ELSE 0
  END;
$$;

-- =============================================================================
-- HELPER: Record level-up events after a good-habit transaction
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
        transaction_id
      ) VALUES (
        p_user_id,
        p_category_id,
        v_level,
        p_transaction_id
      )
      ON CONFLICT (user_id, category_id, level) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- =============================================================================
-- UPDATED RPC: log_habit (with level-up event tracking)
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
    'bank_balance', v_bank_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION record_category_level_events(uuid, uuid, integer, integer, uuid) TO authenticated;
