-- Level-Up: Initial schema, RLS policies, and secure RPC functions

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  accent_color text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  description text,
  habit_type text NOT NULL CHECK (habit_type IN ('good', 'bad')),
  xp_amount integer NOT NULL CHECK (xp_amount > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  xp_cost integer NOT NULL CHECK (xp_cost > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  habit_id uuid REFERENCES habits(id),
  reward_id uuid REFERENCES rewards(id),
  transaction_type text NOT NULL CHECK (
    transaction_type IN (
      'good_habit',
      'bad_habit',
      'reward_redemption',
      'manual_adjustment'
    )
  ),
  description text NOT NULL,
  bank_xp_change integer NOT NULL,
  category_xp_change integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES rewards(id),
  xp_cost integer NOT NULL CHECK (xp_cost > 0),
  transaction_id uuid NOT NULL REFERENCES xp_transactions(id),
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_active ON categories(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_category_id ON habits(category_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_active ON rewards(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_category_id ON xp_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_habit_id ON xp_transactions(habit_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_reward_id ON xp_transactions(reward_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_created ON xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_type ON xp_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habits
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Rewards
CREATE POLICY "Users can view own rewards"
  ON rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards"
  ON rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON rewards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- XP Transactions: read-only for users (writes via RPC only)
CREATE POLICY "Users can view own transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Reward Redemptions: read-only for users (writes via RPC only)
CREATE POLICY "Users can view own redemptions"
  ON reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================================================
-- HELPER: Get current bank balance
-- =============================================================================

CREATE OR REPLACE FUNCTION get_bank_balance(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(bank_xp_change), 0)::integer
  FROM xp_transactions
  WHERE user_id = p_user_id;
$$;

-- =============================================================================
-- RPC: log_habit
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
  ELSE
    v_bank_xp_change := -v_habit.xp_amount;
    v_category_xp_change := 0;
    v_transaction_type := 'bad_habit';
    v_description := v_habit.name || ' (-' || v_habit.xp_amount || ' XP)';
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

  v_bank_balance := get_bank_balance(v_user_id);

  RETURN json_build_object(
    'transaction', row_to_json(v_transaction),
    'bank_balance', v_bank_balance
  );
END;
$$;

-- =============================================================================
-- RPC: redeem_reward
-- =============================================================================

CREATE OR REPLACE FUNCTION redeem_reward(p_reward_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_reward rewards%ROWTYPE;
  v_bank_balance integer;
  v_transaction xp_transactions%ROWTYPE;
  v_redemption reward_redemptions%ROWTYPE;
  v_description text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_reward
  FROM rewards
  WHERE id = p_reward_id
    AND user_id = v_user_id
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;

  v_bank_balance := get_bank_balance(v_user_id);

  IF v_bank_balance < v_reward.xp_cost THEN
    RAISE EXCEPTION 'Insufficient XP. Need % more XP.', (v_reward.xp_cost - v_bank_balance);
  END IF;

  v_description := 'Redeemed: ' || v_reward.name || ' (-' || v_reward.xp_cost || ' XP)';

  INSERT INTO xp_transactions (
    user_id,
    reward_id,
    transaction_type,
    description,
    bank_xp_change,
    category_xp_change
  ) VALUES (
    v_user_id,
    p_reward_id,
    'reward_redemption',
    v_description,
    -v_reward.xp_cost,
    0
  )
  RETURNING * INTO v_transaction;

  INSERT INTO reward_redemptions (
    user_id,
    reward_id,
    xp_cost,
    transaction_id
  ) VALUES (
    v_user_id,
    p_reward_id,
    v_reward.xp_cost,
    v_transaction.id
  )
  RETURNING * INTO v_redemption;

  v_bank_balance := get_bank_balance(v_user_id);

  RETURN json_build_object(
    'redemption', row_to_json(v_redemption),
    'transaction', row_to_json(v_transaction),
    'bank_balance', v_bank_balance
  );
END;
$$;

-- Grant execute on RPC functions to authenticated users
GRANT EXECUTE ON FUNCTION log_habit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bank_balance(uuid) TO authenticated;
