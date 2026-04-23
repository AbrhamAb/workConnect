package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

func Connect(connectionString string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, err
	}

	db.SetConnMaxIdleTime(5 * time.Minute)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}

	if err = migrate(ctx, db); err != nil {
		_ = db.Close()
		return nil, err
	}

	return db, nil
}

func migrate(ctx context.Context, db *sql.DB) error {
	schema := `
		CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			full_name VARCHAR(100) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			phone VARCHAR(20) NOT NULL,
			role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
				email_verified BOOLEAN NOT NULL DEFAULT FALSE,
				phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS worker_profiles (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
			headline VARCHAR(120) NOT NULL DEFAULT 'Verified Professional',
			bio TEXT NOT NULL DEFAULT '',
			city VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
				subcity VARCHAR(100) NOT NULL DEFAULT '',
				profile_picture_url TEXT NOT NULL DEFAULT '',
			experience_years INT NOT NULL DEFAULT 0,
			hourly_rate_etb NUMERIC(12,2) NOT NULL DEFAULT 0,
			availability_status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy')),
			is_verified BOOLEAN NOT NULL DEFAULT FALSE,
				verification_status VARCHAR(20) NOT NULL DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
				onboarding_step SMALLINT NOT NULL DEFAULT 1,
				onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
				profile_strength_score SMALLINT NOT NULL DEFAULT 0 CHECK (profile_strength_score BETWEEN 0 AND 100),
				response_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
				reliability_score NUMERIC(5,2) NOT NULL DEFAULT 0,
			rating_average NUMERIC(3,2) NOT NULL DEFAULT 0,
			rating_count INT NOT NULL DEFAULT 0,
			completed_jobs INT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS service_categories (
			id BIGSERIAL PRIMARY KEY,
			name VARCHAR(100) UNIQUE NOT NULL,
			slug VARCHAR(100) UNIQUE NOT NULL,
			description TEXT NOT NULL DEFAULT ''
		);

		CREATE TABLE IF NOT EXISTS worker_skills (
			worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
			category_id BIGINT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
			PRIMARY KEY (worker_id, category_id)
		);

			CREATE TABLE IF NOT EXISTS worker_verification_requests (
				id BIGSERIAL PRIMARY KEY,
				worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
				status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
				submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				reviewed_at TIMESTAMPTZ,
				reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
				rejection_reason TEXT NOT NULL DEFAULT '',
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);

			CREATE TABLE IF NOT EXISTS worker_documents (
				id BIGSERIAL PRIMARY KEY,
				worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
				document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('government_id', 'professional_certificate', 'business_license', 'other')),
				file_url TEXT NOT NULL,
				file_name VARCHAR(255) NOT NULL DEFAULT '',
				mime_type VARCHAR(100) NOT NULL DEFAULT '',
				file_size_bytes BIGINT NOT NULL DEFAULT 0,
				status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
				review_notes TEXT NOT NULL DEFAULT '',
				uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				UNIQUE (worker_id, document_type)
			);

			CREATE TABLE IF NOT EXISTS worker_portfolio_projects (
				id BIGSERIAL PRIMARY KEY,
				worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
				title VARCHAR(140) NOT NULL,
				description TEXT NOT NULL DEFAULT '',
				cover_image_url TEXT NOT NULL DEFAULT '',
				city VARCHAR(100) NOT NULL DEFAULT '',
				completed_at TIMESTAMPTZ,
				is_published BOOLEAN NOT NULL DEFAULT TRUE,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);

			CREATE TABLE IF NOT EXISTS worker_portfolio_media (
				id BIGSERIAL PRIMARY KEY,
				portfolio_project_id BIGINT NOT NULL REFERENCES worker_portfolio_projects(id) ON DELETE CASCADE,
				media_url TEXT NOT NULL,
				media_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
				display_order INT NOT NULL DEFAULT 0,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);

			CREATE TABLE IF NOT EXISTS worker_notification_preferences (
				worker_id BIGINT PRIMARY KEY REFERENCES worker_profiles(id) ON DELETE CASCADE,
				receive_job_alerts BOOLEAN NOT NULL DEFAULT TRUE,
				receive_marketing BOOLEAN NOT NULL DEFAULT FALSE,
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);

		CREATE TABLE IF NOT EXISTS service_requests (
			id BIGSERIAL PRIMARY KEY,
			reference_code VARCHAR(30) UNIQUE NOT NULL,
			customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
			category_id BIGINT NOT NULL REFERENCES service_categories(id),
			title VARCHAR(120) NOT NULL,
			description TEXT NOT NULL,
			location_address VARCHAR(255) NOT NULL,
			preferred_at TIMESTAMPTZ,
			budget_etb NUMERIC(12,2) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
			worker_decision_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS reviews (
			id BIGSERIAL PRIMARY KEY,
			request_id BIGINT UNIQUE NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
			customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
			rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
			comment TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS payments (
			id BIGSERIAL PRIMARY KEY,
			request_id BIGINT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
			amount_etb NUMERIC(12,2) NOT NULL,
			currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
			provider VARCHAR(20) NOT NULL,
			provider_ref VARCHAR(50) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
			paid_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS message_conversations (
			id BIGSERIAL PRIMARY KEY,
			request_id BIGINT NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,
			customer_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			worker_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			last_message_preview VARCHAR(180) NOT NULL DEFAULT '',
			last_message_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CHECK (customer_user_id <> worker_user_id)
		);

		CREATE TABLE IF NOT EXISTS messages (
			id BIGSERIAL PRIMARY KEY,
			conversation_id BIGINT NOT NULL REFERENCES message_conversations(id) ON DELETE CASCADE,
			request_id BIGINT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
			sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			body TEXT NOT NULL,
			message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text')),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS message_conversation_reads (
			conversation_id BIGINT NOT NULL REFERENCES message_conversations(id) ON DELETE CASCADE,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			last_read_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL,
			last_read_at TIMESTAMPTZ,
			PRIMARY KEY (conversation_id, user_id)
		);

		CREATE OR REPLACE FUNCTION validate_message_conversation() RETURNS TRIGGER AS $$
		DECLARE
			request_customer_id BIGINT;
			request_worker_user_id BIGINT;
			request_status TEXT;
		BEGIN
			SELECT sr.customer_id, wp.user_id, sr.status
			INTO request_customer_id, request_worker_user_id, request_status
			FROM service_requests sr
			INNER JOIN worker_profiles wp ON wp.id = sr.worker_id
			WHERE sr.id = NEW.request_id;

			IF request_status IS NULL THEN
				RAISE EXCEPTION 'service request % not found', NEW.request_id;
			END IF;

			IF request_status NOT IN ('accepted', 'completed') THEN
				RAISE EXCEPTION 'messaging allowed only for accepted or completed requests';
			END IF;

			IF NEW.customer_user_id <> request_customer_id OR NEW.worker_user_id <> request_worker_user_id THEN
				RAISE EXCEPTION 'conversation participants must match request participants';
			END IF;

			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;

		CREATE OR REPLACE FUNCTION validate_message_sender() RETURNS TRIGGER AS $$
		DECLARE
			conversation_customer_id BIGINT;
			conversation_worker_id BIGINT;
			conversation_request_id BIGINT;
		BEGIN
			SELECT c.customer_user_id, c.worker_user_id, c.request_id
			INTO conversation_customer_id, conversation_worker_id, conversation_request_id
			FROM message_conversations c
			WHERE c.id = NEW.conversation_id;

			IF conversation_request_id IS NULL THEN
				RAISE EXCEPTION 'conversation % not found', NEW.conversation_id;
			END IF;

			IF NEW.request_id <> conversation_request_id THEN
				RAISE EXCEPTION 'message request_id must match conversation request_id';
			END IF;

			IF NEW.sender_user_id <> conversation_customer_id AND NEW.sender_user_id <> conversation_worker_id THEN
				RAISE EXCEPTION 'sender is not part of this conversation';
			END IF;

			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;

		CREATE OR REPLACE FUNCTION sync_conversation_last_message() RETURNS TRIGGER AS $$
		BEGIN
			UPDATE message_conversations
			SET last_message_preview = LEFT(NEW.body, 180),
				last_message_at = NEW.created_at,
				updated_at = NOW()
			WHERE id = NEW.conversation_id;

			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;

		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1
				FROM pg_trigger
				WHERE tgname = 'trg_validate_message_conversation'
			) THEN
				CREATE TRIGGER trg_validate_message_conversation
				BEFORE INSERT OR UPDATE ON message_conversations
				FOR EACH ROW
				EXECUTE FUNCTION validate_message_conversation();
			END IF;
		END
		$$;

		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1
				FROM pg_trigger
				WHERE tgname = 'trg_validate_message_sender'
			) THEN
				CREATE TRIGGER trg_validate_message_sender
				BEFORE INSERT ON messages
				FOR EACH ROW
				EXECUTE FUNCTION validate_message_sender();
			END IF;
		END
		$$;

		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1
				FROM pg_trigger
				WHERE tgname = 'trg_sync_conversation_last_message'
			) THEN
				CREATE TRIGGER trg_sync_conversation_last_message
				AFTER INSERT ON messages
				FOR EACH ROW
				EXECUTE FUNCTION sync_conversation_last_message();
			END IF;
		END
		$$;

		CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
		CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON worker_profiles(user_id);
			CREATE INDEX IF NOT EXISTS idx_worker_profiles_verification_status ON worker_profiles(verification_status);
			CREATE INDEX IF NOT EXISTS idx_worker_profiles_city_availability ON worker_profiles(city, availability_status);
		CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id);
		CREATE INDEX IF NOT EXISTS idx_service_requests_worker_id ON service_requests(worker_id);
		CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
			CREATE INDEX IF NOT EXISTS idx_worker_verification_requests_worker_id ON worker_verification_requests(worker_id);
			CREATE INDEX IF NOT EXISTS idx_worker_verification_requests_status ON worker_verification_requests(status);
			CREATE INDEX IF NOT EXISTS idx_worker_documents_worker_id ON worker_documents(worker_id);
			CREATE INDEX IF NOT EXISTS idx_worker_portfolio_projects_worker_id ON worker_portfolio_projects(worker_id);
			CREATE INDEX IF NOT EXISTS idx_message_conversations_customer ON message_conversations(customer_user_id);
			CREATE INDEX IF NOT EXISTS idx_message_conversations_worker ON message_conversations(worker_user_id);
			CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
			CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);

			ALTER TABLE users
				ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
				ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

			ALTER TABLE worker_profiles
				ADD COLUMN IF NOT EXISTS subcity VARCHAR(100) NOT NULL DEFAULT '',
				ADD COLUMN IF NOT EXISTS profile_picture_url TEXT NOT NULL DEFAULT '',
				ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'not_submitted',
				ADD COLUMN IF NOT EXISTS onboarding_step SMALLINT NOT NULL DEFAULT 1,
				ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
				ADD COLUMN IF NOT EXISTS profile_strength_score SMALLINT NOT NULL DEFAULT 0,
				ADD COLUMN IF NOT EXISTS response_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
				ADD COLUMN IF NOT EXISTS reliability_score NUMERIC(5,2) NOT NULL DEFAULT 0;

			ALTER TABLE worker_profiles
				DROP CONSTRAINT IF EXISTS worker_profiles_verification_status_check;

			ALTER TABLE worker_profiles
				ADD CONSTRAINT worker_profiles_verification_status_check
				CHECK (verification_status IN ('not_submitted', 'pending', 'approved', 'rejected'));

		INSERT INTO service_categories (name, slug, description)
		SELECT * FROM (VALUES
			('Electrician', 'electrician', 'Electrical installation and repair'),
			('Plumber', 'plumber', 'Pipe installation and maintenance'),
			('Carpenter', 'carpenter', 'Furniture and woodwork services'),
			('Mechanic', 'mechanic', 'Automotive repair and maintenance'),
				('Cleaner', 'cleaner', 'Residential and office cleaning'),
				('Painter', 'painter', 'Interior and exterior painting'),
				('Gardener', 'gardener', 'Garden care and landscaping'),
				('Handyman', 'handyman', 'General repair and maintenance services')
		) AS seed(name, slug, description)
		ON CONFLICT (slug) DO NOTHING;
	`

	if _, err := db.ExecContext(ctx, schema); err != nil {
		return fmt.Errorf("migrate schema: %w", err)
	}

	return nil
}
