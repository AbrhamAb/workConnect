-- Destructive demo reset: removes all existing users and dependent user data.
-- Shared password for every seeded account: WorkConnect2026!
BEGIN;

DELETE FROM users;

INSERT INTO users (
  full_name, email, phone, role, is_active, email_verified, phone_verified,
  password_hash, profile_image_url
)
VALUES
  ('Mekdes Alemu', 'mekdes.customer@workconnect.demo', '+251911000001', 'customer', TRUE, TRUE, TRUE,
  '$2a$10$7cYANPiI/Nt0QMDVCiM2KeSNPo897PRBEefHz4uhR4rXkcEBnJ7S6',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'),
  ('Tadesse Haile', 'tadesse.worker@workconnect.demo', '+251911000101', 'worker', TRUE, TRUE, TRUE,
  '$2a$10$7cYANPiI/Nt0QMDVCiM2KeSNPo897PRBEefHz4uhR4rXkcEBnJ7S6',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'),
  ('Liya Gebre', 'liya.worker@workconnect.demo', '+251911000102', 'worker', TRUE, TRUE, TRUE,
  '$2a$10$7cYANPiI/Nt0QMDVCiM2KeSNPo897PRBEefHz4uhR4rXkcEBnJ7S6',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
  ('Yonas Tesfaye', 'yonas.worker@workconnect.demo', '+251911000103', 'worker', TRUE, TRUE, TRUE,
  '$2a$10$7cYANPiI/Nt0QMDVCiM2KeSNPo897PRBEefHz4uhR4rXkcEBnJ7S6',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'),
  ('Selamawit Bekele', 'selamawit.worker@workconnect.demo', '+251911000104', 'worker', TRUE, TRUE, TRUE,
  '$2a$10$7cYANPiI/Nt0QMDVCiM2KeSNPo897PRBEefHz4uhR4rXkcEBnJ7S6',
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'),
  ('Abebe Mengistu', 'abebe.worker@workconnect.demo', '+251911000105', 'worker', TRUE, TRUE, TRUE,
  '$2a$10$7cYANPiI/Nt0QMDVCiM2KeSNPo897PRBEefHz4uhR4rXkcEBnJ7S6',
   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80'),
  ('Hailu Worku', 'hailu.admin@workconnect.demo', '+251911000999', 'admin', TRUE, TRUE, TRUE,
  '$2a$10$7cYANPiI/Nt0QMDVCiM2KeSNPo897PRBEefHz4uhR4rXkcEBnJ7S6',
   'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80');

INSERT INTO worker_profiles (
  user_id, headline, bio, city, subcity, profile_picture_url,
  experience_years, hourly_rate_etb, availability_status, is_verified,
  verification_status, onboarding_step, onboarding_completed,
  profile_strength_score, response_rate, reliability_score,
  rating_average, rating_count, completed_jobs
)
SELECT u.id, v.headline, v.bio, v.city, v.subcity, v.picture,
       v.experience_years, v.hourly_rate_etb, v.availability_status, TRUE,
       'approved', 5, TRUE, v.profile_strength_score, v.response_rate,
       v.reliability_score, v.rating_average, v.rating_count, v.completed_jobs
FROM (VALUES
  ('tadesse.worker@workconnect.demo', 'Master Electrician', 'Residential wiring, panel upgrades, lighting installation, and electrical safety inspections.', 'Addis Ababa', 'Bole', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=512&q=80', 11, 900, 'available', 96, 98.0, 97.0, 4.9, 42, 58),
  ('liya.worker@workconnect.demo', 'Professional Plumber', 'Reliable plumbing repairs, leak detection, bathroom fittings, and water line installation.', 'Addis Ababa', 'Yeka', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=512&q=80', 8, 750, 'available', 93, 95.0, 94.0, 4.8, 35, 47),
  ('yonas.worker@workconnect.demo', 'Carpentry Specialist', 'Custom furniture, kitchen cabinetry, doors, and detailed wood finishing for homes and offices.', 'Addis Ababa', 'Kirkos', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=512&q=80', 9, 800, 'busy', 91, 92.0, 95.0, 4.7, 29, 39),
  ('selamawit.worker@workconnect.demo', 'Expert House Cleaner', 'Careful residential and office cleaning with deep-clean, move-in, and recurring service options.', 'Addis Ababa', 'Kazanchis', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=512&q=80', 6, 500, 'available', 90, 96.0, 92.0, 4.9, 38, 64),
  ('abebe.worker@workconnect.demo', 'Automotive Mechanic', 'Diagnostics, routine maintenance, brake service, and dependable vehicle repairs.', 'Addis Ababa', 'Nifas Silk', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=512&q=80', 13, 1000, 'available', 95, 94.0, 96.0, 4.8, 51, 73)
) AS v(email, headline, bio, city, subcity, picture, experience_years, hourly_rate_etb, availability_status, profile_strength_score, response_rate, reliability_score, rating_average, rating_count, completed_jobs)
JOIN users u ON u.email = v.email;

INSERT INTO worker_skills (worker_id, category_id)
SELECT wp.id, sc.id
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
JOIN service_categories sc ON sc.slug = ANY (CASE u.email
  WHEN 'tadesse.worker@workconnect.demo' THEN ARRAY['electrician', 'handyman']
  WHEN 'liya.worker@workconnect.demo' THEN ARRAY['plumber', 'handyman']
  WHEN 'yonas.worker@workconnect.demo' THEN ARRAY['carpenter', 'painter']
  WHEN 'selamawit.worker@workconnect.demo' THEN ARRAY['cleaner']
  WHEN 'abebe.worker@workconnect.demo' THEN ARRAY['mechanic']
END)
ON CONFLICT DO NOTHING;

INSERT INTO worker_notification_preferences (worker_id, receive_job_alerts, receive_marketing)
SELECT id, TRUE, FALSE FROM worker_profiles
ON CONFLICT (worker_id) DO UPDATE SET
  receive_job_alerts = EXCLUDED.receive_job_alerts,
  receive_marketing = EXCLUDED.receive_marketing,
  updated_at = NOW();

COMMIT;
