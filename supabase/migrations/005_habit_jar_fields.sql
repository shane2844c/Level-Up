-- Habit Jar: optional display fields on habits (completions still via xp_transactions)

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS identity_statement text,
  ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS target_completions integer;

ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_frequency_check;
ALTER TABLE habits ADD CONSTRAINT habits_frequency_check
  CHECK (frequency IS NULL OR frequency IN ('daily', 'weekly', 'custom'));
