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
 		-- Merged schema: users absorbs worker_profiles and worker_notification_preferences
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
 			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

 			-- worker/profile fields (nullable for non-workers)
 			headline VARCHAR(120) DEFAULT 'Verified Professional',
 			bio TEXT DEFAULT '',
 			city VARCHAR(100) DEFAULT 'Addis Ababa',
 			subcity VARCHAR(100) DEFAULT '',
 			profile_picture_url TEXT DEFAULT '',
 			experience_years INT DEFAULT 0,
 			hourly_rate_etb NUMERIC(12,2) DEFAULT 0,
 			availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy')),
 			is_verified BOOLEAN DEFAULT FALSE,
 			verification_status VARCHAR(20) DEFAULT 'not_submitted',
 			onboarding_step SMALLINT DEFAULT 1,
 			onboarding_completed BOOLEAN DEFAULT FALSE,
 			profile_strength_score SMALLINT DEFAULT 0 CHECK (profile_strength_score BETWEEN 0 AND 100),
 			response_rate NUMERIC(5,2) DEFAULT 0,
 			reliability_score NUMERIC(5,2) DEFAULT 0,
 			rating_average NUMERIC(3,2) DEFAULT 0,
 			rating_count INT DEFAULT 0,
 			completed_jobs INT DEFAULT 0,

 			-- notification prefs (merged), renamed timestamp to avoid clash
 			receive_job_alerts BOOLEAN DEFAULT TRUE,
 			receive_marketing BOOLEAN DEFAULT FALSE,
 			notification_updated_at TIMESTAMPTZ
 		);

		-- service categories (unchanged)
		CREATE TABLE IF NOT EXISTS service_categories (
			id BIGSERIAL PRIMARY KEY,
			name VARCHAR(100) UNIQUE NOT NULL,
			slug VARCHAR(100) UNIQUE NOT NULL,
			description TEXT NOT NULL DEFAULT ''
		);

		-- worker_skills now references users(id)
		CREATE TABLE IF NOT EXISTS worker_skills (
			worker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			category_id BIGINT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
			PRIMARY KEY (worker_id, category_id)
		);

		-- worker verification requests
		CREATE TABLE IF NOT EXISTS worker_verification (
			id BIGSERIAL PRIMARY KEY,
			worker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
			submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			reviewed_at TIMESTAMPTZ,
			reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
			rejection_reason TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		-- verification document metadata
		CREATE TABLE IF NOT EXISTS worker_documents (
			id BIGSERIAL PRIMARY KEY,
			verification_id BIGINT NOT NULL REFERENCES worker_verification(id) ON DELETE CASCADE,
			document_type VARCHAR(50) NOT NULL,
			file_url TEXT NOT NULL,
			file_name VARCHAR(255) NOT NULL,
			mime_type VARCHAR(100),
			file_size_bytes BIGINT,
			doc_status VARCHAR(20) NOT NULL DEFAULT 'pending',
			review_notes TEXT NOT NULL DEFAULT '',
			uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE (verification_id, document_type)
		);

		-- merged worker_portfolio (projects + media)
		CREATE TABLE IF NOT EXISTS worker_portfolio (
			id BIGSERIAL PRIMARY KEY,
			worker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(140) NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			cover_image_url TEXT NOT NULL DEFAULT '',
			city VARCHAR(100) NOT NULL DEFAULT '',
			completed_at TIMESTAMPTZ,
			is_published BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

			-- media fields (denormalized into portfolio row)
			media_url TEXT,
			media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
			display_order INT DEFAULT 0
		);

		-- service requests: worker_id now references users(id)
		CREATE TABLE IF NOT EXISTS service_requests (
			id BIGSERIAL PRIMARY KEY,
			reference_code VARCHAR(30) UNIQUE NOT NULL,
			customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			worker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

		-- reviews absorbs payments columns (payments become nullable fields on reviews)
		CREATE TABLE IF NOT EXISTS reviews (
			id BIGSERIAL PRIMARY KEY,
			request_id BIGINT UNIQUE NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
			customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			worker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
			comment TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

			-- payments (nullable, merged)
			payment_id BIGINT,
			amount_etb NUMERIC(12,2),
			currency VARCHAR(10),
			provider VARCHAR(20),
			provider_ref VARCHAR(50),
			payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed')),
			paid_at TIMESTAMPTZ,
			payment_created_at TIMESTAMPTZ,
			payment_updated_at TIMESTAMPTZ
		);

		-- conversations (message_conversations + message_conversation_reads merged)
		CREATE TABLE IF NOT EXISTS conversations (
			id BIGSERIAL PRIMARY KEY,
			request_id BIGINT NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,
			customer_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			worker_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			last_message_preview VARCHAR(180) NOT NULL DEFAULT '',
			last_message_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CHECK (customer_user_id <> worker_user_id),

			-- denormalized read cursors (no FK yet; FK added after messages table exists)
			customer_last_read_message_id BIGINT,
			customer_last_read_at TIMESTAMPTZ,
			worker_last_read_message_id BIGINT,
			worker_last_read_at TIMESTAMPTZ
		);

		-- messages remains a child table of conversations
		CREATE TABLE IF NOT EXISTS messages (
			id BIGSERIAL PRIMARY KEY,
			conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
			request_id BIGINT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
			sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			body TEXT NOT NULL,
			message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text')),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		-- after messages exists, add FK constraints linking conversations' last_read_message_id columns to messages
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_constraint WHERE conname = 'conversations_customer_last_read_fk'
			) THEN
				ALTER TABLE conversations
					ADD CONSTRAINT conversations_customer_last_read_fk
					FOREIGN KEY (customer_last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;
			END IF;
		END
		$$;

		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_constraint WHERE conname = 'conversations_worker_last_read_fk'
			) THEN
				ALTER TABLE conversations
					ADD CONSTRAINT conversations_worker_last_read_fk
					FOREIGN KEY (worker_last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;
			END IF;
		END
		$$;

		-- trigger functions updated to use conversations/messages
		CREATE OR REPLACE FUNCTION validate_message_conversation() RETURNS TRIGGER AS $$
		DECLARE
			request_customer_id BIGINT;
			request_worker_user_id BIGINT;
			request_status TEXT;
		BEGIN
			SELECT sr.customer_id, sr.worker_id, sr.status
			INTO request_customer_id, request_worker_user_id, request_status
			FROM service_requests sr
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
			FROM conversations c
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
			UPDATE conversations
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
				BEFORE INSERT OR UPDATE ON conversations
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

		-- Indexes updated to new table/column names
		CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
		CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
		CREATE INDEX IF NOT EXISTS idx_users_city_availability ON users(city, availability_status);
		CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id);
		CREATE INDEX IF NOT EXISTS idx_service_requests_worker_id ON service_requests(worker_id);
		CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
		CREATE INDEX IF NOT EXISTS idx_worker_verification_worker_id ON worker_verification(worker_id);
		CREATE INDEX IF NOT EXISTS idx_worker_verification_status ON worker_verification(status);
		CREATE INDEX IF NOT EXISTS idx_worker_documents_verification_id ON worker_documents(verification_id);
		CREATE INDEX IF NOT EXISTS idx_worker_documents_document_type ON worker_documents(document_type);
		CREATE INDEX IF NOT EXISTS idx_worker_documents_doc_status ON worker_documents(doc_status);
		CREATE INDEX IF NOT EXISTS idx_worker_portfolio_worker_id ON worker_portfolio(worker_id);
		CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_user_id);
		CREATE INDEX IF NOT EXISTS idx_conversations_worker ON conversations(worker_user_id);
		CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
		CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);

		-- Keep users columns idempotent
		ALTER TABLE users
			ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
			ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

		-- Add verification_status check constraint on users (preserve original check)
		ALTER TABLE users
			DROP CONSTRAINT IF EXISTS users_verification_status_check;

		ALTER TABLE users
			ADD CONSTRAINT users_verification_status_check
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
