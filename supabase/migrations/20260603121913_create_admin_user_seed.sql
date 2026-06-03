/*
  # Seed admin user for testing

  1. Note: This migration creates seed data for testing admin panel.
     In production, use a proper admin management system.
*/

-- Admin user profile (ID: admin@maissaude.com - will be used as lookup)
-- The actual auth user should be created through Supabase Auth panel or programmatically
-- This is just to demonstrate the admin panel structure

-- Example: After creating user with email admin@maissaude.com via Supabase Auth,
-- run this to populate their profile:
/*
INSERT INTO profiles (id, full_name, avatar_key, substance_target, goal_type, motivation, experience_tier, total_points)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@maissaude.com' LIMIT 1),
  'Administrador',
  'shield',
  'both',
  'reduce',
  'Gerenciar plataforma',
  'advanced',
  0
)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Administrador',
  avatar_key = 'shield',
  experience_tier = 'advanced'
WHERE profiles.id = (SELECT id FROM auth.users WHERE email = 'admin@maissaude.com' LIMIT 1);
*/
