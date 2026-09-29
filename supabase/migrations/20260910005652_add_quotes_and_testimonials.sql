/*
# Add Quote Requests and Testimonials

## Overview
Adds two new tables to support a "Request a Quote" form and a testimonials display,
matching features found in a reference furniture workshop site.

## New Tables

1. **quote_requests** — Quote enquiries from visitors with project details.
   - id, name, email, phone, project_type, budget_range, description, status, created_at
   - project_type: e.g. "Custom Furniture", "Interior Design", "Exhibition Booth", "Ceiling & Interiors"
   - budget_range: e.g. "Under ₦500k", "₦500k - ₦1M", "₦1M - ₦3M", "₦3M - ₦5M", "Above ₦5M"
   - status: pending / contacted / completed

2. **testimonials** — Client testimonials managed by admin, displayed on homepage.
   - id, client_name, client_role, quote, rating, display_order, created_at

## Security
- RLS enabled on both tables.
- quote_requests: public insert (visitors submit), public read/update/delete (single-tenant admin).
- testimonials: public read (shown on homepage), public insert/update/delete (single-tenant admin).
- All policies use TO anon, authenticated (no-auth single-tenant app).
*/

-- ============================================================
-- TABLE: quote_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  project_type text NOT NULL DEFAULT 'Custom Furniture',
  budget_range text,
  description text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quote_requests" ON quote_requests;
CREATE POLICY "anon_select_quote_requests" ON quote_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quote_requests" ON quote_requests;
CREATE POLICY "anon_insert_quote_requests" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quote_requests" ON quote_requests;
CREATE POLICY "anon_update_quote_requests" ON quote_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quote_requests" ON quote_requests;
CREATE POLICY "anon_delete_quote_requests" ON quote_requests FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABLE: testimonials
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_role text,
  quote text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_testimonials" ON testimonials;
CREATE POLICY "anon_insert_testimonials" ON testimonials FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_testimonials" ON testimonials;
CREATE POLICY "anon_update_testimonials" ON testimonials FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_testimonials" ON testimonials;
CREATE POLICY "anon_delete_testimonials" ON testimonials FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);