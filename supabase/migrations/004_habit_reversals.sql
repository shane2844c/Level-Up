-- Level-Up: Secure habit activity reversals with audit trail

-- =============================================================================
-- XP TRANSACTIONS: REVERSAL FIELDS
-- =============================================================================

ALTER TABLE xp_transactions
  ADD COLUMN IF NOT EXISTS reversal_of uuid REFERENCES xp_transactions(id),
  ADD COLUMN IF NOT EXISTS reversed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reversed_by_transaction_id uuid REFERENCES xp_transactions(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_transactions_unique_reversal_of
  ON xp_transactions(reversal_of)
  WHERE reversal_of IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_xp_transactions_reversed_at
  ON xp_transactions(reversed_at)
  WHERE reversed_at IS NOT NULL;

ALTER TABLE xp_transactions DROP CONSTRAINT IF EXISTS xp_transactions_transaction_type_check;
ALTER TABLE xp_transactions ADD CONSTRAINT xp_transactions_transaction_type_check
  CHECK (
    transaction_type IN (
      'good_habit',
      'bad_habit',
      'reward_redemption',
      'manual_adjustment',
      'habit_reversal'
    )
  );

-- =============================================================================
-- REBUILD LEVEL EVENTS FOR ONE CATEGORY (excludes reversed originals)
-- =============================================================================

CREATE OR REPLACE FUNCTION rebuild_category_level_events_for_category(
  p_user_id uuid,
  p_category_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tx RECORD;
  v_cumulative integer;
  v_prev integer;
  v_level integer;
  v_threshold integer;
BEGIN
  DELETE FROM category_level_events
  WHERE user_id = p_user_id
    AND category_id = p_category_id;

  v_cumulative := 0;

  FOR tx IN
    SELECT id, category_xp_change, created_at
    FROM xp_transactions
    WHERE user_id = p_user_id
      AND category_id = p_category_id
      AND reversed_at IS NULL
      AND category_xp_change != 0
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
          p_user_id,
          p_category_id,
          v_level,
          tx.id,
          tx.created_at
        )
        ON CONFLICT (user_id, category_id, level) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- =============================================================================
-- REBUILD ALL LEVEL EVENTS (updated to ignore reversed originals)
-- =============================================================================

CREATE OR REPLACE FUNCTION rebuild_category_level_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cat RECORD;
BEGIN
  DELETE FROM category_level_events;

  FOR cat IN
    SELECT DISTINCT user_id, category_id
    FROM xp_transactions
    WHERE category_id IS NOT NULL
      AND reversed_at IS NULL
      AND category_xp_change != 0
    ORDER BY user_id, category_id
  LOOP
    PERFORM rebuild_category_level_events_for_category(cat.user_id, cat.category_id);
  END LOOP;
END;
$$;

-- =============================================================================
-- RPC: reverse_habit_transaction
-- =============================================================================

CREATE OR REPLACE FUNCTION reverse_habit_transaction(p_transaction_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_original xp_transactions%ROWTYPE;
  v_reversal xp_transactions%ROWTYPE;
  v_bank_balance integer;
  v_category_xp integer;
  v_habit_name text;
  v_description text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_original
  FROM xp_transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_original.user_id != v_user_id THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_original.transaction_type NOT IN ('good_habit', 'bad_habit') THEN
    RAISE EXCEPTION 'Only habit activities can be removed';
  END IF;

  IF v_original.reversed_at IS NOT NULL THEN
    RAISE EXCEPTION 'This activity has already been removed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM xp_transactions WHERE reversal_of = p_transaction_id
  ) THEN
    RAISE EXCEPTION 'This activity has already been removed';
  END IF;

  IF v_original.habit_id IS NOT NULL THEN
    SELECT name INTO v_habit_name FROM habits WHERE id = v_original.habit_id;
  END IF;

  v_habit_name := COALESCE(v_habit_name, trim(split_part(v_original.description, ' (', 1)));
  v_description := 'Removed: ' || v_habit_name;

  INSERT INTO xp_transactions (
    user_id,
    category_id,
    habit_id,
    transaction_type,
    description,
    bank_xp_change,
    category_xp_change,
    reversal_of
  ) VALUES (
    v_user_id,
    v_original.category_id,
    v_original.habit_id,
    'habit_reversal',
    v_description,
    -v_original.bank_xp_change,
    -v_original.category_xp_change,
    p_transaction_id
  )
  RETURNING * INTO v_reversal;

  UPDATE xp_transactions
  SET
    reversed_at = now(),
    reversed_by_transaction_id = v_reversal.id
  WHERE id = p_transaction_id;

  IF v_original.category_id IS NOT NULL AND v_original.category_xp_change != 0 THEN
    PERFORM rebuild_category_level_events_for_category(
      v_user_id,
      v_original.category_id
    );
  END IF;

  v_bank_balance := get_bank_balance(v_user_id);

  IF v_original.category_id IS NOT NULL THEN
    SELECT COALESCE(SUM(category_xp_change), 0)::integer INTO v_category_xp
    FROM xp_transactions
    WHERE user_id = v_user_id
      AND category_id = v_original.category_id
      AND reversed_at IS NULL;
  ELSE
    v_category_xp := 0;
  END IF;

  RETURN json_build_object(
    'reversal', row_to_json(v_reversal),
    'original', row_to_json(v_original),
    'bank_balance', v_bank_balance,
    'category_id', v_original.category_id,
    'category_xp', v_category_xp
  );
END;
$$;

GRANT EXECUTE ON FUNCTION reverse_habit_transaction(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION rebuild_category_level_events_for_category(uuid, uuid) TO authenticated;
