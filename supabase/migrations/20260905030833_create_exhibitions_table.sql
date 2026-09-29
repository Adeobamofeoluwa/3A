/*
# Create Exhibitions Table

Stores exhibitions, booths, and events the workshop participates in.
Each exhibition has a title, description, location, date, optional end date,
optional image, and a status (upcoming / ongoing / past).

RLS: public read, public CRUD (single-tenant no-auth app, same pattern as works).
*/

CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  start_date date NOT NULL,
  end_date date,
  image_url text,
  status text DEFAULT 'upcoming',
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_exhibitions" ON exhibitions;
CREATE POLICY "anon_select_exhibitions" ON exhibitions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_exhibitions" ON exhibitions;
CREATE POLICY "anon_insert_exhibitions" ON exhibitions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_exhibitions" ON exhibitions;
CREATE POLICY "anon_update_exhibitions" ON exhibitions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_exhibitions" ON exhibitions;
CREATE POLICY "anon_delete_exhibitions" ON exhibitions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_exhibitions_start_date ON exhibitions(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_exhibitions_display_order ON exhibitions(display_order);
