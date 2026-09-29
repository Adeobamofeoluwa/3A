/*
# Create Storage Bucket for Work Images

1. Storage
- Creates a public bucket named `work-images` for storing furniture piece photos, gallery images, hero/about images, and any other site imagery uploaded via the admin panel.
- The bucket is public so visitors can view images without authentication.

2. Policies
- Allows anyone (anon + authenticated) to SELECT (read) images — the site is public.
- Allows anyone (anon + authenticated) to INSERT (upload) images — the admin panel uses the anon key.
- Allows anyone (anon + authenticated) to UPDATE and DELETE images — admin panel manages its own uploads.
- NOTE: This is a single-tenant app with no sign-in, so public CRUD on the bucket is intentional. The admin link is protected by a username/password gate in the app layer, and only the admin uploads images.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('work-images', 'work-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_work_images" ON storage.objects;
CREATE POLICY "public_read_work_images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'work-images');

DROP POLICY IF EXISTS "public_upload_work_images" ON storage.objects;
CREATE POLICY "public_upload_work_images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'work-images');

DROP POLICY IF EXISTS "public_update_work_images" ON storage.objects;
CREATE POLICY "public_update_work_images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'work-images')
WITH CHECK (bucket_id = 'work-images');

DROP POLICY IF EXISTS "public_delete_work_images" ON storage.objects;
CREATE POLICY "public_delete_work_images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'work-images');
