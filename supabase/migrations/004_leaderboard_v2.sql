-- Gender support for individual leaderboard filters
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));

-- Track which user last conquered each cell (for individual rankings)
ALTER TABLE territory_cells
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cells_user ON territory_cells(user_id);

-- Backfill: derive user_id from latest conquest in conquest_history
UPDATE territory_cells tc
SET user_id = sub.user_id
FROM (
  SELECT DISTINCT ON (ch.cell_id) ch.cell_id, a.user_id
  FROM conquest_history ch
  JOIN activities a ON a.id = ch.activity_id
  ORDER BY ch.cell_id, ch.conquered_at DESC
) sub
WHERE tc.cell_id = sub.cell_id AND tc.user_id IS NULL;
