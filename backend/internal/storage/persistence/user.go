package persistence

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"task-management-backend/internal/model/db"
	"time"
)

func (s *Store) CreateUser(ctx context.Context, fullName, email, phone, role, passwordHash string) (db.User, error) {
	q := `
		INSERT INTO users (full_name, email, phone, role, password_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, full_name, email, phone, role, is_active, password_hash, created_at, updated_at
	`

	var user db.User
	err := s.db.QueryRowContext(ctx, q, fullName, email, phone, role, passwordHash).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.IsActive,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	return user, err
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (db.User, error) {
	query := `
		SELECT id, full_name, email, phone, role, is_active, password_hash, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user db.User

	err := s.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.IsActive,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	// u forget to check if user not found error and return custom error message
	if err != nil {
		if err == sql.ErrNoRows {
			return user, fmt.Errorf("user not found")
		}
		return user, err
	}

	return user, nil
}

func (s *Store) GetUserByID(ctx context.Context, userID int64) (db.User, error) {
	q := `
		SELECT id, full_name, email, phone, role, is_active, password_hash, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user db.User
	err := s.db.QueryRowContext(ctx, q, userID).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.IsActive,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	return user, err
}

func (s *Store) CreateWorkerProfile(ctx context.Context, userID int64) error {
	q := `
		INSERT INTO worker_profiles (user_id, headline, bio, city, experience_years, hourly_rate_etb, availability_status)
		VALUES ($1, 'Verified Professional', '', 'Addis Ababa', 0, 0, 'available')
		ON CONFLICT (user_id) DO NOTHING
	`
	_, err := s.db.ExecContext(ctx, q, userID)
	return err
}

func (s *Store) ListWorkers(ctx context.Context, category, city, qTerm, sort string) ([]db.WorkerCard, error) {
	base := `
		SELECT
			wp.id,
			wp.user_id,
			u.full_name,
			wp.headline,
			wp.city,
			wp.hourly_rate_etb,
			wp.rating_average,
			wp.rating_count,
			wp.availability_status,
			wp.is_verified,
			wp.completed_jobs,
			COALESCE(sc.name, '') AS category_name
		FROM worker_profiles wp
		INNER JOIN users u ON u.id = wp.user_id
		LEFT JOIN worker_skills ws ON ws.worker_id = wp.id
		LEFT JOIN service_categories sc ON sc.id = ws.category_id
		WHERE u.role = 'worker' AND u.is_active = TRUE AND wp.is_verified = TRUE
	`

	args := make([]any, 0)
	argPos := 1

	if category != "" {
		base += fmt.Sprintf(" AND EXISTS (SELECT 1 FROM worker_skills ws2 INNER JOIN service_categories sc2 ON sc2.id = ws2.category_id WHERE ws2.worker_id = wp.id AND sc2.slug = $%d)", argPos)
		args = append(args, strings.ToLower(strings.TrimSpace(category)))
		argPos++
	}

	if city != "" {
		base += fmt.Sprintf(" AND wp.city ILIKE $%d", argPos)
		args = append(args, "%"+strings.TrimSpace(city)+"%")
		argPos++
	}

	if qTerm != "" {
		base += fmt.Sprintf(" AND (u.full_name ILIKE $%d OR wp.headline ILIKE $%d)", argPos, argPos)
		args = append(args, "%"+strings.TrimSpace(qTerm)+"%")
		argPos++
	}

	switch sort {
	case "price_asc":
		base += " ORDER BY wp.hourly_rate_etb ASC, wp.rating_average DESC"
	case "price_desc":
		base += " ORDER BY wp.hourly_rate_etb DESC, wp.rating_average DESC"
	case "rating":
		base += " ORDER BY wp.rating_average DESC, wp.rating_count DESC"
	default:
		base += " ORDER BY wp.completed_jobs DESC, wp.rating_average DESC"
	}

	rows, err := s.db.QueryContext(ctx, base, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	workers := make([]db.WorkerCard, 0)
	for rows.Next() {
		var worker db.WorkerCard
		if err = rows.Scan(
			&worker.WorkerID,
			&worker.UserID,
			&worker.FullName,
			&worker.Headline,
			&worker.City,
			&worker.HourlyRateETB,
			&worker.RatingAverage,
			&worker.RatingCount,
			&worker.AvailabilityStatus,
			&worker.IsVerified,
			&worker.CompletedJobs,
			&worker.PrimaryCategoryName,
		); err != nil {
			return nil, err
		}
		workers = append(workers, worker)
	}

	return workers, rows.Err()
}

func (s *Store) GetWorkerDetails(ctx context.Context, workerID int64) (db.WorkerDetails, error) {
	q := `
		SELECT
			wp.id,
			wp.user_id,
			u.full_name,
			wp.headline,
			wp.city,
			wp.hourly_rate_etb,
			wp.rating_average,
			wp.rating_count,
			wp.availability_status,
			wp.is_verified,
			wp.completed_jobs,
			COALESCE(sc.name, '') AS category_name,
			wp.bio,
			u.phone,
			u.email
		FROM worker_profiles wp
		INNER JOIN users u ON u.id = wp.user_id
		LEFT JOIN worker_skills ws ON ws.worker_id = wp.id
		LEFT JOIN service_categories sc ON sc.id = ws.category_id
		WHERE wp.id = $1
		LIMIT 1
	`

	var details db.WorkerDetails
	err := s.db.QueryRowContext(ctx, q, workerID).Scan(
		&details.Worker.WorkerID,
		&details.Worker.UserID,
		&details.Worker.FullName,
		&details.Worker.Headline,
		&details.Worker.City,
		&details.Worker.HourlyRateETB,
		&details.Worker.RatingAverage,
		&details.Worker.RatingCount,
		&details.Worker.AvailabilityStatus,
		&details.Worker.IsVerified,
		&details.Worker.CompletedJobs,
		&details.Worker.PrimaryCategoryName,
		&details.Bio,
		&details.Phone,
		&details.Email,
	)
	if err != nil {
		return db.WorkerDetails{}, err
	}

	skillsQ := `
		SELECT sc.name
		FROM worker_skills ws
		INNER JOIN service_categories sc ON sc.id = ws.category_id
		WHERE ws.worker_id = $1
		ORDER BY sc.name
	`
	rows, err := s.db.QueryContext(ctx, skillsQ, workerID)
	if err != nil {
		return db.WorkerDetails{}, err
	}
	defer rows.Close()

	details.Skills = make([]string, 0)
	for rows.Next() {
		var skill string
		if err = rows.Scan(&skill); err != nil {
			return db.WorkerDetails{}, err
		}
		details.Skills = append(details.Skills, skill)
	}

	return details, rows.Err()
}

func (s *Store) CreateServiceRequest(ctx context.Context, request db.ServiceRequest) (db.ServiceRequest, error) {
	q := `
		INSERT INTO service_requests (
			reference_code,
			customer_id,
			worker_id,
			category_id,
			title,
			description,
			location_address,
			preferred_at,
			budget_etb,
			status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, reference_code, customer_id, worker_id, category_id, title, description, location_address, preferred_at, budget_etb, status, worker_decision_at, created_at, updated_at
	`

	var out db.ServiceRequest
	err := s.db.QueryRowContext(
		ctx,
		q,
		request.ReferenceCode,
		request.CustomerID,
		request.WorkerID,
		request.CategoryID,
		request.Title,
		request.Description,
		request.LocationAddress,
		request.PreferredAt,
		request.BudgetETB,
		request.Status,
	).Scan(
		&out.ID,
		&out.ReferenceCode,
		&out.CustomerID,
		&out.WorkerID,
		&out.CategoryID,
		&out.Title,
		&out.Description,
		&out.LocationAddress,
		&out.PreferredAt,
		&out.BudgetETB,
		&out.Status,
		&out.WorkerDecisionAt,
		&out.CreatedAt,
		&out.UpdatedAt,
	)
	return out, err
}

func (s *Store) GetServiceRequestViewByID(ctx context.Context, requestID int64) (db.ServiceRequestView, error) {
	q := `
		SELECT
			sr.id,
			sr.reference_code,
			sr.customer_id,
			sr.worker_id,
			sr.category_id,
			sr.title,
			sr.description,
			sr.location_address,
			sr.preferred_at,
			sr.budget_etb,
			sr.status,
			sr.worker_decision_at,
			sr.created_at,
			sr.updated_at,
			sc.name,
			wu.full_name AS worker_name,
			cu.full_name AS customer_name,
			cu.phone AS customer_phone
		FROM service_requests sr
		INNER JOIN service_categories sc ON sc.id = sr.category_id
		INNER JOIN worker_profiles wp ON wp.id = sr.worker_id
		INNER JOIN users wu ON wu.id = wp.user_id
		INNER JOIN users cu ON cu.id = sr.customer_id
		WHERE sr.id = $1
	`

	var item db.ServiceRequestView
	err := s.db.QueryRowContext(ctx, q, requestID).Scan(
		&item.ID,
		&item.ReferenceCode,
		&item.CustomerID,
		&item.WorkerID,
		&item.CategoryID,
		&item.Title,
		&item.Description,
		&item.LocationAddress,
		&item.PreferredAt,
		&item.BudgetETB,
		&item.Status,
		&item.WorkerDecisionAt,
		&item.CreatedAt,
		&item.UpdatedAt,
		&item.CategoryName,
		&item.WorkerName,
		&item.CustomerName,
		&item.CustomerPhone,
	)
	return item, err
}

func (s *Store) ListCustomerRequests(ctx context.Context, customerID int64) ([]db.ServiceRequestView, error) {
	q := `
		SELECT
			sr.id,
			sr.reference_code,
			sr.customer_id,
			sr.worker_id,
			sr.category_id,
			sr.title,
			sr.description,
			sr.location_address,
			sr.preferred_at,
			sr.budget_etb,
			sr.status,
			sr.worker_decision_at,
			sr.created_at,
			sr.updated_at,
			sc.name,
			wu.full_name AS worker_name,
			cu.full_name AS customer_name,
			cu.phone AS customer_phone
		FROM service_requests sr
		INNER JOIN service_categories sc ON sc.id = sr.category_id
		INNER JOIN worker_profiles wp ON wp.id = sr.worker_id
		INNER JOIN users wu ON wu.id = wp.user_id
		INNER JOIN users cu ON cu.id = sr.customer_id
		WHERE sr.customer_id = $1
		ORDER BY sr.created_at DESC
	`

	return s.scanServiceRequests(ctx, q, customerID)
}

func (s *Store) ListWorkerRequests(ctx context.Context, workerUserID int64) ([]db.ServiceRequestView, error) {
	q := `
		SELECT
			sr.id,
			sr.reference_code,
			sr.customer_id,
			sr.worker_id,
			sr.category_id,
			sr.title,
			sr.description,
			sr.location_address,
			sr.preferred_at,
			sr.budget_etb,
			sr.status,
			sr.worker_decision_at,
			sr.created_at,
			sr.updated_at,
			sc.name,
			wu.full_name AS worker_name,
			cu.full_name AS customer_name,
			cu.phone AS customer_phone
		FROM service_requests sr
		INNER JOIN service_categories sc ON sc.id = sr.category_id
		INNER JOIN worker_profiles wp ON wp.id = sr.worker_id
		INNER JOIN users wu ON wu.id = wp.user_id
		INNER JOIN users cu ON cu.id = sr.customer_id
		WHERE wp.user_id = $1
		ORDER BY CASE sr.status WHEN 'pending' THEN 1 WHEN 'accepted' THEN 2 ELSE 3 END, sr.created_at DESC
	`

	return s.scanServiceRequests(ctx, q, workerUserID)
}

func (s *Store) UpdateServiceRequestStatusByWorker(ctx context.Context, workerUserID, requestID int64, status string) (db.ServiceRequestView, error) {
	q := `
		UPDATE service_requests sr
		SET status = $1, worker_decision_at = NOW(), updated_at = NOW()
		FROM worker_profiles wp
		WHERE sr.id = $2
		  AND sr.worker_id = wp.id
		  AND wp.user_id = $3
		  AND sr.status = 'pending'
		RETURNING sr.id
	`

	var updatedID int64
	err := s.db.QueryRowContext(ctx, q, status, requestID, workerUserID).Scan(&updatedID)
	if err != nil {
		return db.ServiceRequestView{}, err
	}

	return s.GetServiceRequestViewByID(ctx, updatedID)
}

func (s *Store) MarkServiceRequestCompletedByWorker(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error) {
	q := `
		UPDATE service_requests sr
		SET status = 'completed', updated_at = NOW()
		FROM worker_profiles wp
		WHERE sr.id = $1
		  AND sr.worker_id = wp.id
		  AND wp.user_id = $2
		  AND sr.status = 'accepted'
		RETURNING sr.id
	`

	var updatedID int64
	err := s.db.QueryRowContext(ctx, q, requestID, workerUserID).Scan(&updatedID)
	if err != nil {
		return db.ServiceRequestView{}, err
	}

	return s.GetServiceRequestViewByID(ctx, updatedID)
}

func (s *Store) SetWorkerAvailability(ctx context.Context, workerUserID int64, availability string) error {
	q := `
		UPDATE worker_profiles
		SET availability_status = $1, updated_at = NOW()
		WHERE user_id = $2
	`
	res, err := s.db.ExecContext(ctx, q, availability, workerUserID)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *Store) CreateReview(ctx context.Context, requestID, customerID int64, rating int, comment string) error {
	q := `
		INSERT INTO reviews (request_id, customer_id, worker_id, rating, comment)
		SELECT sr.id, sr.customer_id, sr.worker_id, $3, $4
		FROM service_requests sr
		WHERE sr.id = $1 AND sr.customer_id = $2 AND sr.status = 'completed'
	`
	res, err := s.db.ExecContext(ctx, q, requestID, customerID, rating, comment)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return s.RefreshWorkerRating(ctx, requestID)
}

func (s *Store) RefreshWorkerRating(ctx context.Context, requestID int64) error {
	q := `
		UPDATE worker_profiles wp
		SET
			rating_average = COALESCE(stats.avg_rating, 0),
			rating_count = COALESCE(stats.rating_count, 0),
			updated_at = NOW()
		FROM (
			SELECT r.worker_id, AVG(r.rating)::numeric(3,2) AS avg_rating, COUNT(*)::int AS rating_count
			FROM reviews r
			GROUP BY r.worker_id
		) stats
		WHERE wp.id = stats.worker_id
		  AND wp.id = (SELECT worker_id FROM service_requests WHERE id = $1)
	`
	_, err := s.db.ExecContext(ctx, q, requestID)
	return err
}

func (s *Store) InitiatePayment(ctx context.Context, requestID int64, amount float64, provider, providerRef string) (db.Payment, error) {
	q := `
		INSERT INTO payments (request_id, amount_etb, provider, provider_ref, status)
		VALUES ($1, $2, $3, $4, 'pending')
		RETURNING id, request_id, amount_etb, currency, provider, provider_ref, status, paid_at, created_at, updated_at
	`

	var payment db.Payment
	err := s.db.QueryRowContext(ctx, q, requestID, amount, provider, providerRef).Scan(
		&payment.ID,
		&payment.RequestID,
		&payment.AmountETB,
		&payment.Currency,
		&payment.Provider,
		&payment.ProviderRef,
		&payment.Status,
		&payment.PaidAt,
		&payment.CreatedAt,
		&payment.UpdatedAt,
	)
	return payment, err
}

func (s *Store) GetRequestMessagingParticipants(ctx context.Context, requestID int64) (int64, int64, string, error) {
	q := `
		SELECT sr.customer_id, wp.user_id, sr.status
		FROM service_requests sr
		INNER JOIN worker_profiles wp ON wp.id = sr.worker_id
		WHERE sr.id = $1
	`

	var customerUserID, workerUserID int64
	var status string
	err := s.db.QueryRowContext(ctx, q, requestID).Scan(&customerUserID, &workerUserID, &status)
	if err != nil {
		return 0, 0, "", err
	}

	return customerUserID, workerUserID, status, nil
}

func (s *Store) UpsertMessageConversation(ctx context.Context, requestID, customerUserID, workerUserID int64) (int64, error) {
	q := `
		INSERT INTO message_conversations (request_id, customer_user_id, worker_user_id, updated_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (request_id)
		DO UPDATE SET customer_user_id = EXCLUDED.customer_user_id,
		              worker_user_id = EXCLUDED.worker_user_id,
		              updated_at = NOW()
		RETURNING id
	`

	var conversationID int64
	if err := s.db.QueryRowContext(ctx, q, requestID, customerUserID, workerUserID).Scan(&conversationID); err != nil {
		return 0, err
	}

	qRead := `
		INSERT INTO message_conversation_reads (conversation_id, user_id, last_read_at)
		VALUES ($1, $2, NOW()), ($1, $3, NOW())
		ON CONFLICT (conversation_id, user_id) DO NOTHING
	`
	if _, err := s.db.ExecContext(ctx, qRead, conversationID, customerUserID, workerUserID); err != nil {
		return 0, err
	}

	return conversationID, nil
}

func (s *Store) ListMessageConversations(ctx context.Context, userID int64) ([]db.MessageConversation, error) {
	q := `
		SELECT
			c.id,
			c.request_id,
			CASE WHEN c.customer_user_id = $1 THEN c.worker_user_id ELSE c.customer_user_id END AS other_party_user_id,
			u.full_name AS other_party_name,
			c.last_message_preview,
			c.last_message_at,
			COALESCE((
				SELECT COUNT(*)::int
				FROM messages m
				LEFT JOIN message_conversation_reads r
					ON r.conversation_id = c.id AND r.user_id = $1
				WHERE m.conversation_id = c.id
				  AND m.sender_user_id <> $1
				  AND (r.last_read_message_id IS NULL OR m.id > r.last_read_message_id)
			), 0) AS unread_count
		FROM message_conversations c
		INNER JOIN users u
			ON u.id = CASE WHEN c.customer_user_id = $1 THEN c.worker_user_id ELSE c.customer_user_id END
		WHERE c.customer_user_id = $1 OR c.worker_user_id = $1
		ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
	`

	rows, err := s.db.QueryContext(ctx, q, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]db.MessageConversation, 0)
	for rows.Next() {
		var item db.MessageConversation
		if err = rows.Scan(
			&item.ID,
			&item.RequestID,
			&item.OtherPartyUserID,
			&item.OtherPartyName,
			&item.LastMessagePreview,
			&item.LastMessageAt,
			&item.UnreadCount,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *Store) CreateMessage(ctx context.Context, conversationID, requestID, senderUserID int64, body, messageType string) (db.Message, error) {
	q := `
		WITH inserted AS (
			INSERT INTO messages (conversation_id, request_id, sender_user_id, body, message_type)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, conversation_id, request_id, sender_user_id, body, message_type, created_at
		)
		SELECT i.id, i.conversation_id, i.request_id, i.sender_user_id, u.full_name, i.body, i.message_type, i.created_at
		FROM inserted i
		INNER JOIN users u ON u.id = i.sender_user_id
	`

	var item db.Message
	err := s.db.QueryRowContext(ctx, q, conversationID, requestID, senderUserID, body, messageType).Scan(
		&item.ID,
		&item.ConversationID,
		&item.RequestID,
		&item.SenderUserID,
		&item.SenderName,
		&item.Body,
		&item.MessageType,
		&item.CreatedAt,
	)
	return item, err
}

func (s *Store) ListMessages(ctx context.Context, conversationID int64, limit int, beforeID int64) ([]db.Message, error) {
	q := `
		SELECT m.id, m.conversation_id, m.request_id, m.sender_user_id, u.full_name, m.body, m.message_type, m.created_at
		FROM messages m
		INNER JOIN users u ON u.id = m.sender_user_id
		WHERE m.conversation_id = $1
		  AND ($2 = 0 OR m.id < $2)
		ORDER BY m.id DESC
		LIMIT $3
	`

	rows, err := s.db.QueryContext(ctx, q, conversationID, beforeID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]db.Message, 0)
	for rows.Next() {
		var item db.Message
		if err = rows.Scan(
			&item.ID,
			&item.ConversationID,
			&item.RequestID,
			&item.SenderUserID,
			&item.SenderName,
			&item.Body,
			&item.MessageType,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	for i, j := 0, len(items)-1; i < j; i, j = i+1, j-1 {
		items[i], items[j] = items[j], items[i]
	}

	return items, nil
}

func (s *Store) MarkConversationRead(ctx context.Context, conversationID, userID int64) error {
	q := `
		WITH latest AS (
			SELECT id
			FROM messages
			WHERE conversation_id = $1
			ORDER BY id DESC
			LIMIT 1
		)
		INSERT INTO message_conversation_reads (conversation_id, user_id, last_read_message_id, last_read_at)
		VALUES ($1, $2, (SELECT id FROM latest), NOW())
		ON CONFLICT (conversation_id, user_id)
		DO UPDATE SET last_read_message_id = EXCLUDED.last_read_message_id,
		              last_read_at = NOW()
	`

	_, err := s.db.ExecContext(ctx, q, conversationID, userID)
	return err
}

func (s *Store) CustomerDashboard(ctx context.Context, customerID int64) (db.CustomerDashboard, error) {
	q := `
		SELECT
			COUNT(*)::int AS total_requests,
			COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_requests,
			COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_requests
		FROM service_requests
		WHERE customer_id = $1
	`

	var out db.CustomerDashboard
	err := s.db.QueryRowContext(ctx, q, customerID).Scan(&out.TotalRequests, &out.PendingRequests, &out.CompletedRequests)
	return out, err
}

func (s *Store) WorkerDashboard(ctx context.Context, workerUserID int64) (db.WorkerDashboard, error) {
	q := `
		SELECT
			COUNT(*) FILTER (WHERE sr.status = 'pending')::int AS incoming_pending,
			COUNT(*) FILTER (WHERE sr.status = 'accepted')::int AS accepted_requests,
			COUNT(*) FILTER (WHERE sr.status = 'completed')::int AS completed_jobs,
			COALESCE(SUM(p.amount_etb) FILTER (WHERE p.status = 'paid'), 0)::numeric(12,2) AS earnings
		FROM service_requests sr
		INNER JOIN worker_profiles wp ON wp.id = sr.worker_id
		LEFT JOIN payments p ON p.request_id = sr.id
		WHERE wp.user_id = $1
	`

	var out db.WorkerDashboard
	err := s.db.QueryRowContext(ctx, q, workerUserID).Scan(
		&out.IncomingPendingRequests,
		&out.AcceptedRequests,
		&out.CompletedJobs,
		&out.EstimatedEarningsETB,
	)
	return out, err
}

func (s *Store) AdminDashboard(ctx context.Context) (db.AdminDashboard, error) {
	q := `
		SELECT
			(SELECT COUNT(*)::int FROM users),
			(SELECT COUNT(*)::int FROM users WHERE role = 'worker'),
			(SELECT COUNT(*)::int FROM worker_profiles WHERE is_verified = FALSE),
			(SELECT COUNT(*)::int FROM service_requests),
			(SELECT COUNT(*)::int FROM service_requests WHERE status IN ('pending', 'accepted'))
	`

	var out db.AdminDashboard
	err := s.db.QueryRowContext(ctx, q).Scan(
		&out.TotalUsers,
		&out.TotalWorkers,
		&out.PendingVerifications,
		&out.TotalRequests,
		&out.OpenRequests,
	)
	return out, err
}

func (s *Store) PendingWorkerVerifications(ctx context.Context) ([]db.WorkerCard, error) {
	q := `
		SELECT
			wp.id,
			wp.user_id,
			u.full_name,
			wp.headline,
			wp.city,
			wp.hourly_rate_etb,
			wp.rating_average,
			wp.rating_count,
			wp.availability_status,
			wp.is_verified,
			wp.completed_jobs,
			'' AS category_name
		FROM worker_profiles wp
		INNER JOIN users u ON u.id = wp.user_id
		WHERE wp.is_verified = FALSE
		ORDER BY wp.created_at ASC
	`

	rows, err := s.db.QueryContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	workers := make([]db.WorkerCard, 0)
	for rows.Next() {
		var worker db.WorkerCard
		if err = rows.Scan(
			&worker.WorkerID,
			&worker.UserID,
			&worker.FullName,
			&worker.Headline,
			&worker.City,
			&worker.HourlyRateETB,
			&worker.RatingAverage,
			&worker.RatingCount,
			&worker.AvailabilityStatus,
			&worker.IsVerified,
			&worker.CompletedJobs,
			&worker.PrimaryCategoryName,
		); err != nil {
			return nil, err
		}
		workers = append(workers, worker)
	}

	return workers, rows.Err()
}

func (s *Store) VerifyWorker(ctx context.Context, workerID int64, verified bool) error {
	q := `
		UPDATE worker_profiles
		SET is_verified = $1, updated_at = NOW()
		WHERE id = $2
	`
	res, err := s.db.ExecContext(ctx, q, verified, workerID)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *Store) WorkerProfileByUserID(ctx context.Context, userID int64) (int64, bool, error) {
	q := `SELECT id, is_verified FROM worker_profiles WHERE user_id = $1`
	var workerID int64
	var verified bool
	err := s.db.QueryRowContext(ctx, q, userID).Scan(&workerID, &verified)
	if err != nil {
		return 0, false, err
	}
	return workerID, verified, nil
}

func (s *Store) RequestBelongsToCustomer(ctx context.Context, requestID, customerID int64) (bool, error) {
	q := `SELECT EXISTS(SELECT 1 FROM service_requests WHERE id = $1 AND customer_id = $2)`
	var exists bool
	err := s.db.QueryRowContext(ctx, q, requestID, customerID).Scan(&exists)
	return exists, err
}

func (s *Store) scanServiceRequests(ctx context.Context, q string, arg any) ([]db.ServiceRequestView, error) {
	rows, err := s.db.QueryContext(ctx, q, arg)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]db.ServiceRequestView, 0)
	for rows.Next() {
		var item db.ServiceRequestView
		if err = rows.Scan(
			&item.ID,
			&item.ReferenceCode,
			&item.CustomerID,
			&item.WorkerID,
			&item.CategoryID,
			&item.Title,
			&item.Description,
			&item.LocationAddress,
			&item.PreferredAt,
			&item.BudgetETB,
			&item.Status,
			&item.WorkerDecisionAt,
			&item.CreatedAt,
			&item.UpdatedAt,
			&item.CategoryName,
			&item.WorkerName,
			&item.CustomerName,
			&item.CustomerPhone,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func IsUniqueViolation(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "duplicate key value")
}

func IsNotFound(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}

func BuildPaymentReference(provider string, requestID int64) string {
	return fmt.Sprintf("%s-%d-%d", strings.ToUpper(provider), requestID, time.Now().Unix())
}
