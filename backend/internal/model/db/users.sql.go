package db

const (
	InsertUserQuery = `
		INSERT INTO users (full_name, email, phone, role, password_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, full_name, email, phone, role, is_active, email_verified, phone_verified, password_hash, created_at, updated_at
	`
)
