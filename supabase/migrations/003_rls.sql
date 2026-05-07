ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE strava_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs_public_read" ON clubs FOR SELECT USING (true);
CREATE POLICY "clubs_auth_insert" ON clubs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "members_public_read" ON club_members FOR SELECT USING (true);
CREATE POLICY "members_self_insert" ON club_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cells_public_read" ON territory_cells FOR SELECT USING (true);
CREATE POLICY "cells_service_write" ON territory_cells FOR ALL USING (true);

CREATE POLICY "history_public_read" ON conquest_history FOR SELECT USING (true);
CREATE POLICY "history_service_write" ON conquest_history FOR ALL USING (true);

CREATE POLICY "activities_owner_read" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activities_service_write" ON activities FOR ALL USING (true);

CREATE POLICY "strava_owner_read" ON strava_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "strava_owner_write" ON strava_tokens FOR ALL USING (auth.uid() = user_id);
