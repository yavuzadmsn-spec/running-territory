-- City scoping for leaderboard filters
ALTER TABLE clubs    ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Existing data is Bursa-based (Season 01 Bursa Warzone)
UPDATE clubs    SET city = 'Bursa' WHERE city IS NULL;
UPDATE profiles SET city = 'Bursa' WHERE city IS NULL;

CREATE INDEX IF NOT EXISTS idx_clubs_city    ON clubs(city);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
