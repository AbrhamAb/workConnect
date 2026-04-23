BEGIN;

INSERT INTO users (full_name, email, phone, role, is_active, email_verified, phone_verified, password_hash)
VALUES
  ('Admin One', 'admin@workconnect.demo', '+251900000001', 'admin', TRUE, TRUE, TRUE, '$2a$10$1XNNspdK0fT2gzx9o5/EvOIHNeRU5BeRobFzCzH8N5ZEy4TMsYrmu'),
  ('Sara Tadesse', 'sara.customer@workconnect.demo', '+251900000101', 'customer', TRUE, TRUE, TRUE, '$2a$10$1XNNspdK0fT2gzx9o5/EvOIHNeRU5BeRobFzCzH8N5ZEy4TMsYrmu'),
  ('Dawit Bekele', 'dawit.customer@workconnect.demo', '+251900000102', 'customer', TRUE, TRUE, TRUE, '$2a$10$1XNNspdK0fT2gzx9o5/EvOIHNeRU5BeRobFzCzH8N5ZEy4TMsYrmu'),
  ('Abel Mekonnen', 'abel.worker@workconnect.demo', '+251900000201', 'worker', TRUE, TRUE, TRUE, '$2a$10$1XNNspdK0fT2gzx9o5/EvOIHNeRU5BeRobFzCzH8N5ZEy4TMsYrmu'),
  ('Hanna Girma', 'hanna.worker@workconnect.demo', '+251900000202', 'worker', TRUE, TRUE, TRUE, '$2a$10$1XNNspdK0fT2gzx9o5/EvOIHNeRU5BeRobFzCzH8N5ZEy4TMsYrmu')
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified,
  phone_verified = EXCLUDED.phone_verified,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

INSERT INTO worker_profiles (
  user_id, headline, bio, city, subcity, profile_picture_url,
  experience_years, hourly_rate_etb, availability_status,
  is_verified, verification_status, onboarding_step, onboarding_completed,
  profile_strength_score, response_rate, reliability_score,
  rating_average, rating_count, completed_jobs
)
SELECT
  u.id,
  'Certified Electrician',
  'Residential and commercial electrical installation and maintenance specialist.',
  'Addis Ababa',
  'Bole',
  'https://images.workconnect.demo/workers/abel.jpg',
  8,
  850,
  'available',
  TRUE,
  'approved',
  5,
  TRUE,
  92,
  96.5,
  94.0,
  4.8,
  24,
  31
FROM users u
WHERE u.email = 'abel.worker@workconnect.demo'
ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  subcity = EXCLUDED.subcity,
  profile_picture_url = EXCLUDED.profile_picture_url,
  experience_years = EXCLUDED.experience_years,
  hourly_rate_etb = EXCLUDED.hourly_rate_etb,
  availability_status = EXCLUDED.availability_status,
  is_verified = EXCLUDED.is_verified,
  verification_status = EXCLUDED.verification_status,
  onboarding_step = EXCLUDED.onboarding_step,
  onboarding_completed = EXCLUDED.onboarding_completed,
  profile_strength_score = EXCLUDED.profile_strength_score,
  response_rate = EXCLUDED.response_rate,
  reliability_score = EXCLUDED.reliability_score,
  updated_at = NOW();

INSERT INTO worker_profiles (
  user_id, headline, bio, city, subcity, profile_picture_url,
  experience_years, hourly_rate_etb, availability_status,
  is_verified, verification_status, onboarding_step, onboarding_completed,
  profile_strength_score, response_rate, reliability_score,
  rating_average, rating_count, completed_jobs
)
SELECT
  u.id,
  'Expert Plumber',
  'Emergency plumbing, leak fixes, and bathroom installation services.',
  'Addis Ababa',
  'CMC',
  'https://images.workconnect.demo/workers/hanna.jpg',
  6,
  700,
  'busy',
  TRUE,
  'approved',
  5,
  TRUE,
  89,
  93.2,
  91.0,
  4.6,
  18,
  22
FROM users u
WHERE u.email = 'hanna.worker@workconnect.demo'
ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  subcity = EXCLUDED.subcity,
  profile_picture_url = EXCLUDED.profile_picture_url,
  experience_years = EXCLUDED.experience_years,
  hourly_rate_etb = EXCLUDED.hourly_rate_etb,
  availability_status = EXCLUDED.availability_status,
  is_verified = EXCLUDED.is_verified,
  verification_status = EXCLUDED.verification_status,
  onboarding_step = EXCLUDED.onboarding_step,
  onboarding_completed = EXCLUDED.onboarding_completed,
  profile_strength_score = EXCLUDED.profile_strength_score,
  response_rate = EXCLUDED.response_rate,
  reliability_score = EXCLUDED.reliability_score,
  updated_at = NOW();

INSERT INTO worker_skills (worker_id, category_id)
SELECT wp.id, sc.id
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
JOIN service_categories sc ON sc.slug IN ('electrician', 'handyman')
WHERE u.email = 'abel.worker@workconnect.demo'
ON CONFLICT DO NOTHING;

INSERT INTO worker_skills (worker_id, category_id)
SELECT wp.id, sc.id
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
JOIN service_categories sc ON sc.slug IN ('plumber', 'cleaner')
WHERE u.email = 'hanna.worker@workconnect.demo'
ON CONFLICT DO NOTHING;

INSERT INTO worker_verification_requests (worker_id, status, submitted_at, reviewed_at, reviewed_by, rejection_reason)
SELECT wp.id, 'approved', NOW() - INTERVAL '45 days', NOW() - INTERVAL '43 days', a.id, ''
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
JOIN users a ON a.email = 'admin@workconnect.demo'
WHERE u.email IN ('abel.worker@workconnect.demo', 'hanna.worker@workconnect.demo')
  AND NOT EXISTS (
    SELECT 1 FROM worker_verification_requests wvr WHERE wvr.worker_id = wp.id
  );

INSERT INTO worker_documents (worker_id, document_type, file_url, file_name, mime_type, file_size_bytes, status, review_notes)
SELECT wp.id, 'government_id', 'https://docs.workconnect.demo/abel-id.pdf', 'abel-id.pdf', 'application/pdf', 242000, 'approved', 'Identity verified'
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
WHERE u.email = 'abel.worker@workconnect.demo'
ON CONFLICT (worker_id, document_type) DO UPDATE SET
  file_url = EXCLUDED.file_url,
  file_name = EXCLUDED.file_name,
  mime_type = EXCLUDED.mime_type,
  file_size_bytes = EXCLUDED.file_size_bytes,
  status = EXCLUDED.status,
  review_notes = EXCLUDED.review_notes,
  updated_at = NOW();

INSERT INTO worker_documents (worker_id, document_type, file_url, file_name, mime_type, file_size_bytes, status, review_notes)
SELECT wp.id, 'professional_certificate', 'https://docs.workconnect.demo/hanna-cert.pdf', 'hanna-cert.pdf', 'application/pdf', 301000, 'approved', 'Professional certificate verified'
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
WHERE u.email = 'hanna.worker@workconnect.demo'
ON CONFLICT (worker_id, document_type) DO UPDATE SET
  file_url = EXCLUDED.file_url,
  file_name = EXCLUDED.file_name,
  mime_type = EXCLUDED.mime_type,
  file_size_bytes = EXCLUDED.file_size_bytes,
  status = EXCLUDED.status,
  review_notes = EXCLUDED.review_notes,
  updated_at = NOW();

INSERT INTO worker_portfolio_projects (worker_id, title, description, cover_image_url, city, completed_at, is_published)
SELECT wp.id, 'Apartment Rewiring Project', 'Full apartment rewiring and panel upgrade completed with safety checks.', 'https://images.workconnect.demo/projects/abel-rewiring-cover.jpg', 'Addis Ababa', NOW() - INTERVAL '120 days', TRUE
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
WHERE u.email = 'abel.worker@workconnect.demo'
  AND NOT EXISTS (
    SELECT 1 FROM worker_portfolio_projects p WHERE p.worker_id = wp.id AND p.title = 'Apartment Rewiring Project'
  );

INSERT INTO worker_portfolio_projects (worker_id, title, description, cover_image_url, city, completed_at, is_published)
SELECT wp.id, 'Commercial Pipe Replacement', 'Replaced aging pipe network for a small office building.', 'https://images.workconnect.demo/projects/hanna-pipes-cover.jpg', 'Addis Ababa', NOW() - INTERVAL '90 days', TRUE
FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
WHERE u.email = 'hanna.worker@workconnect.demo'
  AND NOT EXISTS (
    SELECT 1 FROM worker_portfolio_projects p WHERE p.worker_id = wp.id AND p.title = 'Commercial Pipe Replacement'
  );

INSERT INTO worker_portfolio_media (portfolio_project_id, media_url, media_type, display_order)
SELECT p.id, 'https://images.workconnect.demo/projects/abel-rewiring-1.jpg', 'image', 1
FROM worker_portfolio_projects p
JOIN worker_profiles wp ON wp.id = p.worker_id
JOIN users u ON u.id = wp.user_id
WHERE p.title = 'Apartment Rewiring Project'
  AND u.email = 'abel.worker@workconnect.demo'
  AND NOT EXISTS (
    SELECT 1 FROM worker_portfolio_media m WHERE m.portfolio_project_id = p.id AND m.media_url = 'https://images.workconnect.demo/projects/abel-rewiring-1.jpg'
  );

INSERT INTO worker_portfolio_media (portfolio_project_id, media_url, media_type, display_order)
SELECT p.id, 'https://images.workconnect.demo/projects/hanna-pipes-1.jpg', 'image', 1
FROM worker_portfolio_projects p
JOIN worker_profiles wp ON wp.id = p.worker_id
JOIN users u ON u.id = wp.user_id
WHERE p.title = 'Commercial Pipe Replacement'
  AND u.email = 'hanna.worker@workconnect.demo'
  AND NOT EXISTS (
    SELECT 1 FROM worker_portfolio_media m WHERE m.portfolio_project_id = p.id AND m.media_url = 'https://images.workconnect.demo/projects/hanna-pipes-1.jpg'
  );

INSERT INTO worker_notification_preferences (worker_id, receive_job_alerts, receive_marketing)
SELECT wp.id, TRUE, FALSE
FROM worker_profiles wp
ON CONFLICT (worker_id) DO UPDATE SET
  receive_job_alerts = EXCLUDED.receive_job_alerts,
  receive_marketing = EXCLUDED.receive_marketing,
  updated_at = NOW();

INSERT INTO service_requests (
  reference_code, customer_id, worker_id, category_id, title, description,
  location_address, preferred_at, budget_etb, status, worker_decision_at
)
SELECT
  'DEMO-REQ-1001', c.id, wp.id, sc.id,
  'Kitchen power socket installation',
  'Need two new power sockets in kitchen and one replacement for a damaged outlet.',
  'Bole Medhanialem, Addis Ababa',
  NOW() + INTERVAL '1 day',
  2200,
  'accepted',
  NOW() - INTERVAL '2 hours'
FROM users c
JOIN worker_profiles wp ON wp.user_id = (SELECT id FROM users WHERE email = 'abel.worker@workconnect.demo')
JOIN service_categories sc ON sc.slug = 'electrician'
WHERE c.email = 'sara.customer@workconnect.demo'
ON CONFLICT (reference_code) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  worker_id = EXCLUDED.worker_id,
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location_address = EXCLUDED.location_address,
  preferred_at = EXCLUDED.preferred_at,
  budget_etb = EXCLUDED.budget_etb,
  status = EXCLUDED.status,
  worker_decision_at = EXCLUDED.worker_decision_at,
  updated_at = NOW();

INSERT INTO service_requests (
  reference_code, customer_id, worker_id, category_id, title, description,
  location_address, preferred_at, budget_etb, status, worker_decision_at
)
SELECT
  'DEMO-REQ-1002', c.id, wp.id, sc.id,
  'Bathroom leak repair',
  'Continuous leak below sink and low pressure in shower line.',
  'CMC, Addis Ababa',
  NOW() - INTERVAL '10 days',
  1800,
  'completed',
  NOW() - INTERVAL '9 days'
FROM users c
JOIN worker_profiles wp ON wp.user_id = (SELECT id FROM users WHERE email = 'hanna.worker@workconnect.demo')
JOIN service_categories sc ON sc.slug = 'plumber'
WHERE c.email = 'dawit.customer@workconnect.demo'
ON CONFLICT (reference_code) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  worker_id = EXCLUDED.worker_id,
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location_address = EXCLUDED.location_address,
  preferred_at = EXCLUDED.preferred_at,
  budget_etb = EXCLUDED.budget_etb,
  status = EXCLUDED.status,
  worker_decision_at = EXCLUDED.worker_decision_at,
  updated_at = NOW();

INSERT INTO service_requests (
  reference_code, customer_id, worker_id, category_id, title, description,
  location_address, preferred_at, budget_etb, status
)
SELECT
  'DEMO-REQ-1003', c.id, wp.id, sc.id,
  'Office cleaning support',
  'Need deep cleaning for a 3-room office this weekend.',
  'Kazanchis, Addis Ababa',
  NOW() + INTERVAL '3 days',
  2500,
  'pending'
FROM users c
JOIN worker_profiles wp ON wp.user_id = (SELECT id FROM users WHERE email = 'hanna.worker@workconnect.demo')
JOIN service_categories sc ON sc.slug = 'cleaner'
WHERE c.email = 'sara.customer@workconnect.demo'
ON CONFLICT (reference_code) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  worker_id = EXCLUDED.worker_id,
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location_address = EXCLUDED.location_address,
  preferred_at = EXCLUDED.preferred_at,
  budget_etb = EXCLUDED.budget_etb,
  status = EXCLUDED.status,
  worker_decision_at = NULL,
  updated_at = NOW();

INSERT INTO reviews (request_id, customer_id, worker_id, rating, comment)
SELECT sr.id, sr.customer_id, sr.worker_id, 5, 'Very professional and completed the repair on time.'
FROM service_requests sr
WHERE sr.reference_code = 'DEMO-REQ-1002'
ON CONFLICT (request_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment;

INSERT INTO payments (request_id, amount_etb, currency, provider, provider_ref, status, paid_at)
SELECT sr.id, 1800, 'ETB', 'chapa', 'DEMO-PAY-1002', 'paid', NOW() - INTERVAL '8 days'
FROM service_requests sr
WHERE sr.reference_code = 'DEMO-REQ-1002'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.provider_ref = 'DEMO-PAY-1002');

INSERT INTO payments (request_id, amount_etb, currency, provider, provider_ref, status)
SELECT sr.id, 600, 'ETB', 'cash', 'DEMO-PAY-1001-ADV', 'pending'
FROM service_requests sr
WHERE sr.reference_code = 'DEMO-REQ-1001'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.provider_ref = 'DEMO-PAY-1001-ADV');

INSERT INTO message_conversations (request_id, customer_user_id, worker_user_id)
SELECT sr.id, sr.customer_id, wp.user_id
FROM service_requests sr
JOIN worker_profiles wp ON wp.id = sr.worker_id
WHERE sr.reference_code IN ('DEMO-REQ-1001', 'DEMO-REQ-1002')
ON CONFLICT (request_id) DO UPDATE SET
  customer_user_id = EXCLUDED.customer_user_id,
  worker_user_id = EXCLUDED.worker_user_id,
  updated_at = NOW();

INSERT INTO messages (conversation_id, request_id, sender_user_id, body, message_type)
SELECT mc.id, sr.id, cu.id, 'Hi, confirming if we are still on for tomorrow at 2 PM?', 'text'
FROM message_conversations mc
JOIN service_requests sr ON sr.id = mc.request_id
JOIN users cu ON cu.id = mc.customer_user_id
WHERE sr.reference_code = 'DEMO-REQ-1001'
  AND NOT EXISTS (
    SELECT 1 FROM messages m WHERE m.conversation_id = mc.id AND m.body = 'Hi, confirming if we are still on for tomorrow at 2 PM?'
  );

INSERT INTO messages (conversation_id, request_id, sender_user_id, body, message_type)
SELECT mc.id, sr.id, wu.id, 'Yes, schedule is confirmed. I will call you before arrival.', 'text'
FROM message_conversations mc
JOIN service_requests sr ON sr.id = mc.request_id
JOIN users wu ON wu.id = mc.worker_user_id
WHERE sr.reference_code = 'DEMO-REQ-1001'
  AND NOT EXISTS (
    SELECT 1 FROM messages m WHERE m.conversation_id = mc.id AND m.body = 'Yes, schedule is confirmed. I will call you before arrival.'
  );

INSERT INTO messages (conversation_id, request_id, sender_user_id, body, message_type)
SELECT mc.id, sr.id, cu.id, 'Thanks. I will keep the area clear for repair work.', 'text'
FROM message_conversations mc
JOIN service_requests sr ON sr.id = mc.request_id
JOIN users cu ON cu.id = mc.customer_user_id
WHERE sr.reference_code = 'DEMO-REQ-1001'
  AND NOT EXISTS (
    SELECT 1 FROM messages m WHERE m.conversation_id = mc.id AND m.body = 'Thanks. I will keep the area clear for repair work.'
  );

INSERT INTO message_conversation_reads (conversation_id, user_id, last_read_message_id, last_read_at)
SELECT mc.id, mc.customer_user_id, lm.id, NOW() - INTERVAL '10 minutes'
FROM message_conversations mc
JOIN LATERAL (
  SELECT id FROM messages WHERE conversation_id = mc.id ORDER BY id DESC LIMIT 1
) lm ON TRUE
ON CONFLICT (conversation_id, user_id) DO UPDATE SET
  last_read_message_id = EXCLUDED.last_read_message_id,
  last_read_at = EXCLUDED.last_read_at;

INSERT INTO message_conversation_reads (conversation_id, user_id, last_read_message_id, last_read_at)
SELECT mc.id, mc.worker_user_id, lm.id, NOW() - INTERVAL '2 minutes'
FROM message_conversations mc
JOIN LATERAL (
  SELECT id FROM messages WHERE conversation_id = mc.id ORDER BY id DESC LIMIT 1
) lm ON TRUE
ON CONFLICT (conversation_id, user_id) DO UPDATE SET
  last_read_message_id = EXCLUDED.last_read_message_id,
  last_read_at = EXCLUDED.last_read_at;

UPDATE worker_profiles wp
SET
  rating_average = COALESCE(stats.avg_rating, 0),
  rating_count = COALESCE(stats.rating_count, 0),
  completed_jobs = COALESCE(stats.completed_jobs, 0),
  updated_at = NOW()
FROM (
  SELECT
    wp2.id AS worker_profile_id,
    AVG(r.rating)::numeric(3,2) AS avg_rating,
    COUNT(r.id)::int AS rating_count,
    COUNT(sr.id) FILTER (WHERE sr.status = 'completed')::int AS completed_jobs
  FROM worker_profiles wp2
  LEFT JOIN reviews r ON r.worker_id = wp2.id
  LEFT JOIN service_requests sr ON sr.worker_id = wp2.id
  GROUP BY wp2.id
) stats
WHERE wp.id = stats.worker_profile_id;

COMMIT;
