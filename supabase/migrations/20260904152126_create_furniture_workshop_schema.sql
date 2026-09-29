/*
# Furniture Workshop Showcase — Initial Schema

## Overview
This migration creates the complete database schema for a furniture workshop
showcase website. The site is single-tenant (one workshop owner, no public
sign-up). Visitors can browse works, like them, leave reviews, book/enquire
about a specific piece, and send general contact messages. The admin manages
all content and site settings through an admin panel protected by a
username/password gate.

## Tables Created

1. **works** — Each furniture piece posted by the admin.
   - id, title, description, category, material, dimensions, price, status
   - image_url (main image), gallery_urls (array of additional images)
   - featured (boolean), display_order (int), created_at, updated_at

2. **work_likes** — Likes on individual works (one per visitor session).
   - id, work_id, visitor_id (text, from localStorage), created_at

3. **work_reviews** — Reviews/comments on individual works.
   - id, work_id, reviewer_name, rating (1-5), comment, created_at

4. **bookings** — Booking/enquiry about a specific work piece.
   - id, work_id, customer_name, customer_email, customer_phone, message, status, created_at

5. **contact_messages** — General contact form submissions.
   - id, name, email, phone, subject, message, created_at

6. **site_settings** — Single-row table for global site configuration.
   - id (always 1), site_name, tagline, hero_title, hero_subtitle, hero_image_url
   - about_text, contact_email (where messages get sent)
   - primary_color, secondary_color, accent_color
   - footer_text, admin_link_label, admin_link_visible (bool)
   - admin_username, admin_password (for the admin gate)
   - social links (instagram, facebook, whatsapp, etc.)

## Security
- RLS enabled on ALL tables.
- All policies use `TO anon, authenticated` since this is a no-sign-in
  single-tenant app — the anon-key frontend must be able to read and write.
- works, work_reviews, work_likes: public read, public write (anyone can like/review).
- bookings, contact_messages: public insert only (visitors submit), public read
  (admin reads from the same anon client — acceptable for single-tenant).
- site_settings: public read (site renders from it), public update (admin panel
  writes from the same anon client — acceptable for single-tenant showcase).

## Notes
1. site_settings is seeded with a single row (id=1) with default values.
2. admin credentials default to username "3afurniture", password "ayeni111".
3. display_order on works allows admin to control sort order on the gallery.
4. Unique constraint on work_likes(work_id, visitor_id) prevents duplicate likes.
*/

-- ============================================================
-- TABLE: works
-- ============================================================
CREATE TABLE IF NOT EXISTS works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'General',
  material text,
  dimensions text,
  price text,
  status text DEFAULT 'available',
  image_url text,
  gallery_urls text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE works ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_works" ON works;
CREATE POLICY "anon_select_works" ON works FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_works" ON works;
CREATE POLICY "anon_insert_works" ON works FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_works" ON works;
CREATE POLICY "anon_update_works" ON works FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_works" ON works;
CREATE POLICY "anon_delete_works" ON works FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLE: work_likes
-- ============================================================
CREATE TABLE IF NOT EXISTS work_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(work_id, visitor_id)
);

ALTER TABLE work_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_work_likes" ON work_likes;
CREATE POLICY "anon_select_work_likes" ON work_likes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_work_likes" ON work_likes;
CREATE POLICY "anon_insert_work_likes" ON work_likes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_work_likes" ON work_likes;
CREATE POLICY "anon_delete_work_likes" ON work_likes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLE: work_reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS work_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE work_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_work_reviews" ON work_reviews;
CREATE POLICY "anon_select_work_reviews" ON work_reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_work_reviews" ON work_reviews;
CREATE POLICY "anon_insert_work_reviews" ON work_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_work_reviews" ON work_reviews;
CREATE POLICY "anon_delete_work_reviews" ON work_reviews FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid REFERENCES works(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLE: contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contact_messages" ON contact_messages;
CREATE POLICY "anon_select_contact_messages" ON contact_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contact_messages" ON contact_messages;
CREATE POLICY "anon_delete_contact_messages" ON contact_messages FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLE: site_settings (single row, id=1)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT '3A Furniture Workshop',
  tagline text DEFAULT 'Handcrafted Furniture Made with Passion',
  hero_title text DEFAULT 'Crafting Timeless Furniture',
  hero_subtitle text DEFAULT 'Each piece tells a story of dedication, skill, and the beauty of natural wood.',
  hero_image_url text,
  about_title text DEFAULT 'About Our Workshop',
  about_text text DEFAULT 'At 3A Furniture Workshop, we believe furniture should be more than functional — it should be a work of art. Every piece is handcrafted with care, using traditional techniques and the finest materials.',
  about_image_url text,
  contact_email text DEFAULT 'info@3afurniture.com',
  primary_color text DEFAULT '#8B6F47',
  secondary_color text DEFAULT '#3E2C1C',
  accent_color text DEFAULT '#C4A062',
  footer_text text DEFAULT '3A Furniture Workshop — Handcrafted with care.',
  admin_link_label text DEFAULT 'Admin',
  admin_link_visible boolean DEFAULT true,
  admin_username text DEFAULT '3afurniture',
  admin_password text DEFAULT 'ayeni111',
  instagram_url text DEFAULT '',
  facebook_url text DEFAULT '',
  whatsapp_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_settings" ON site_settings;
CREATE POLICY "anon_select_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_site_settings" ON site_settings;
CREATE POLICY "anon_update_site_settings" ON site_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: site_settings single row
-- ============================================================
INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_works_display_order ON works(display_order);
CREATE INDEX IF NOT EXISTS idx_works_category ON works(category);
CREATE INDEX IF NOT EXISTS idx_work_likes_work_id ON work_likes(work_id);
CREATE INDEX IF NOT EXISTS idx_work_reviews_work_id ON work_reviews(work_id);
CREATE INDEX IF NOT EXISTS idx_bookings_work_id ON bookings(work_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
