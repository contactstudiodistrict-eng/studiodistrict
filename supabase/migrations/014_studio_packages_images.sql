-- Add images column to studio_packages for optional package photos (Cloudinary URLs)
ALTER TABLE studio_packages
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
