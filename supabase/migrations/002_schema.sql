CREATE TABLE clubs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL DEFAULT '#3B82F6',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE club_members (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id  UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role     TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

CREATE TABLE strava_tokens (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at    BIGINT NOT NULL
);

CREATE TABLE activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id       UUID NOT NULL REFERENCES clubs(id),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  strava_id     BIGINT UNIQUE,
  name          TEXT,
  distance_m    FLOAT,
  route         GEOMETRY(LineString, 4326),
  recorded_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activities_route ON activities USING GIST(route);

CREATE TABLE territory_cells (
  cell_id           TEXT PRIMARY KEY,
  club_id           UUID REFERENCES clubs(id) ON DELETE SET NULL,
  defense_score     INT NOT NULL DEFAULT 1 CHECK (defense_score BETWEEN 1 AND 5),
  last_conquered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cells_club ON territory_cells(club_id);

CREATE TABLE conquest_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id      TEXT NOT NULL,
  from_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  to_club_id   UUID REFERENCES clubs(id) ON DELETE SET NULL,
  activity_id  UUID REFERENCES activities(id),
  conquered_at TIMESTAMPTZ DEFAULT NOW()
);
