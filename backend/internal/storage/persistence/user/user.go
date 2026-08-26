package persistence

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"task-management-backend/internal/model/db"
	persistence "task-management-backend/internal/storage/persistence"
	"time"
)

type sqlStore struct {
	db *sql.DB
}

func NewStore(dbConn *sql.DB) persistence.Store {
	return &sqlStore{db: dbConn}
}

func (s *sqlStore) DB() db.DBTX {
	return s.db
}

func (s *sqlStore) CreateUser(ctx context.Context, fullName, email, phone, role, passwordHash string) (db.User, error) {
	q := `
		INSERT INTO users (full_name, email, phone, role, password_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, full_name, email, phone, role, profile_image, is_active, password_hash, created_at, updated_at
	`

	var user db.User
	err := s.db.QueryRowContext(ctx, q, fullName, email, phone, role, passwordHash).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.ProfileImage,
		&user.IsActive,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	return user, err
}

func (s *sqlStore) RegisterWorker(ctx context.Context, registration db.WorkerRegistration) (db.User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return db.User{}, err
	}
	defer tx.Rollback()

	var user db.User
	err = tx.QueryRowContext(ctx, `
		INSERT INTO users (full_name, email, phone, role, profile_image, password_hash)
		VALUES ($1, $2, $3, 'worker', $4, $5)
		RETURNING id, full_name, email, phone, role, profile_image, is_active, password_hash, created_at, updated_at
	`, registration.FullName, registration.Email, registration.Phone, registration.ProfileImage, registration.PasswordHash).Scan(
		&user.ID, &user.FullName, &user.Email, &user.Phone, &user.Role, &user.ProfileImage,
		&user.IsActive, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return db.User{}, err
	}

	var workerID int64
	err = tx.QueryRowContext(ctx, `
		INSERT INTO worker_profiles (
			user_id, headline, bio, city, profile_picture_url,
			experience_years, availability_status, verification_status
		)
		VALUES ($1, $2, $3, $4, $5, $6, 'available', 'not_submitted')
		RETURNING id
	`, user.ID, registration.Headline, registration.Bio, registration.City, registration.ProfileImage, registration.ExperienceYears).Scan(&workerID)
	if err != nil {
		return db.User{}, err
	}

	seen := make(map[string]struct{}, len(registration.Skills))
	for _, rawSkill := range registration.Skills {
		skill := normalizeRegistrationSkill(rawSkill)
		if skill == "" {
			continue
		}
		if _, exists := seen[skill]; exists {
			continue
		}
		seen[skill] = struct{}{}

		var categoryID int64
		if err = tx.QueryRowContext(ctx, `SELECT id FROM service_categories WHERE LOWER(name) = LOWER($1)`, skill).Scan(&categoryID); err != nil {
			if err == sql.ErrNoRows {
				return db.User{}, fmt.Errorf("unsupported worker skill: %s", rawSkill)
			}
			return db.User{}, err
		}
		if _, err = tx.ExecContext(ctx, `INSERT INTO worker_skills (worker_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, workerID, categoryID); err != nil {
			return db.User{}, err
		}
	}

	if err = tx.Commit(); err != nil {
		return db.User{}, err
	}
	return user, nil
}

func normalizeRegistrationSkill(skill string) string {
	switch strings.ToLower(strings.TrimSpace(skill)) {
	case "plumbing":
		return "Plumber"
	case "electrical":
		return "Electrician"
	case "carpentry":
		return "Carpenter"
	case "painting":
		return "Painter"
	case "cleaning":
		return "Cleaner"
	case "welding":
		return "Welder"
	default:
		return strings.TrimSpace(skill)
	}
}

func (s *sqlStore) GetUserByEmail(ctx context.Context, email string) (db.User, error) {
	query := `
		SELECT id, full_name, email, phone, role, profile_image, is_active, password_hash, created_at, updated_at
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
		&user.ProfileImage,
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

func (s *sqlStore) GetUserByID(ctx context.Context, userID int64) (db.User, error) {
	q := `
		SELECT id, full_name, email, phone, role, profile_image, is_active, password_hash, created_at, updated_at
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
		&user.ProfileImage,
		&user.IsActive,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	return user, err
}

func (s *sqlStore) UpdateUserProfileImage(ctx context.Context, userID int64, profileImage string) (db.User, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return db.User{}, err
	}
	defer tx.Rollback()

	var user db.User
	err = tx.QueryRowContext(ctx, `
		UPDATE users
		SET profile_image = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, full_name, email, phone, role, profile_image, is_active, password_hash, created_at, updated_at
	`, profileImage, userID).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.ProfileImage,
		&user.IsActive,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return db.User{}, err
	}
	if _, err = tx.ExecContext(ctx, `
		UPDATE worker_profiles
		SET profile_picture_url = $1, updated_at = NOW()
		WHERE user_id = $2
	`, profileImage, userID); err != nil {
		return db.User{}, err
	}
	if err = tx.Commit(); err != nil {
		return db.User{}, err
	}
	return user, err
}

func (s *sqlStore) CreateWorkerProfile(ctx context.Context, userID int64) error {
	q := `
		INSERT INTO worker_profiles (user_id, headline, bio, city, experience_years, hourly_rate_etb, availability_status)
		VALUES ($1, 'Verified Professional', '', 'Addis Ababa', 0, 0, 'available')
		ON CONFLICT (user_id) DO NOTHING
	`
	_, err := s.db.ExecContext(ctx, q, userID)
	return err
}

func (s *sqlStore) ListWorkers(ctx context.Context, category, city, qTerm, sort string) ([]db.WorkerCard, error) {
	base := `
		SELECT
			wp.id,
			wp.user_id,
			u.full_name,
			u.profile_image,
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
			&worker.ProfileImage,
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

func (s *sqlStore) GetWorkerDetails(ctx context.Context, workerID int64) (db.WorkerDetails, error) {
	q := `
		SELECT
			wp.id,
			wp.user_id,
			u.full_name,
			u.profile_image,
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
		&details.Worker.ProfileImage,
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

func (s *sqlStore) GetWorkerReviews(ctx context.Context, workerID int64) (db.WorkerReviewResponse, error) {
	var rating db.WorkerReviewSummary
	if err := s.db.QueryRowContext(ctx, `
		SELECT rating_average, rating_count
		FROM worker_profiles
		WHERE id = $1
	`, workerID).Scan(&rating.Rating, &rating.TotalReviews); err != nil {
		return db.WorkerReviewResponse{}, err
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT
			r.id,
			r.request_id,
			r.worker_id,
			r.customer_id,
			COALESCE(cu.full_name, 'Verified Customer') AS customer_name,
			COALESCE(SUBSTRING(cu.full_name, 1, 1), 'V') || COALESCE(SUBSTRING(cu.full_name FROM POSITION(' ' IN cu.full_name) + 1 FOR 1), '') AS customer_initials,
			COALESCE(cu.profile_image, '') AS customer_profile_image,
			r.rating,
			COALESCE(r.comment, '') AS comment,
			r.created_at
		FROM reviews r
		LEFT JOIN users cu ON cu.id = r.customer_id
		WHERE r.worker_id = $1
		ORDER BY r.created_at DESC
	`, workerID)
	if err != nil {
		return db.WorkerReviewResponse{}, err
	}
	defer rows.Close()

	reviews := make([]db.Review, 0)
	for rows.Next() {
		var item db.Review
		if err = rows.Scan(
			&item.ID,
			&item.RequestID,
			&item.WorkerID,
			&item.CustomerID,
			&item.CustomerName,
			&item.CustomerInitials,
			&item.CustomerProfileImage,
			&item.Rating,
			&item.Comment,
			&item.CreatedAt,
		); err != nil {
			return db.WorkerReviewResponse{}, err
		}
		reviews = append(reviews, item)
	}

	return db.WorkerReviewResponse{Rating: rating, Reviews: reviews}, rows.Err()
}

const favoriteSelect = `
	SELECT f.id, f.customer_id, f.worker_id, u.full_name, wp.headline, wp.city,
	       u.profile_image, COALESCE(category.name, ''), wp.rating_average, wp.rating_count,
	       wp.is_verified, f.created_at
	FROM customer_favorites f
	INNER JOIN worker_profiles wp ON wp.id = f.worker_id
	INNER JOIN users u ON u.id = wp.user_id
	LEFT JOIN LATERAL (
		SELECT sc.name
		FROM worker_skills ws
		INNER JOIN service_categories sc ON sc.id = ws.category_id
		WHERE ws.worker_id = wp.id
		ORDER BY sc.name ASC
		LIMIT 1
	) category ON TRUE
`

func scanFavorite(scanner interface{ Scan(...any) error }) (db.Favorite, error) {
	var favorite db.Favorite
	err := scanner.Scan(
		&favorite.ID,
		&favorite.CustomerID,
		&favorite.WorkerID,
		&favorite.FullName,
		&favorite.Headline,
		&favorite.City,
		&favorite.ProfileImage,
		&favorite.PrimaryCategoryName,
		&favorite.RatingAverage,
		&favorite.RatingCount,
		&favorite.IsVerified,
		&favorite.CreatedAt,
	)
	return favorite, err
}

func (s *sqlStore) ListCustomerFavorites(ctx context.Context, customerID int64) ([]db.Favorite, error) {
	rows, err := s.db.QueryContext(ctx, favoriteSelect+` WHERE f.customer_id = $1 ORDER BY f.created_at DESC`, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	favorites := make([]db.Favorite, 0)
	for rows.Next() {
		favorite, err := scanFavorite(rows)
		if err != nil {
			return nil, err
		}
		favorites = append(favorites, favorite)
	}
	return favorites, rows.Err()
}

func (s *sqlStore) GetCustomerFavorite(ctx context.Context, customerID, workerID int64) (db.Favorite, error) {
	return scanFavorite(s.db.QueryRowContext(ctx, favoriteSelect+` WHERE f.customer_id = $1 AND f.worker_id = $2`, customerID, workerID))
}

func (s *sqlStore) AddCustomerFavorite(ctx context.Context, customerID, workerID int64) (db.Favorite, error) {
	result, err := s.db.ExecContext(ctx, `
		INSERT INTO customer_favorites (customer_id, worker_id)
		SELECT $1, id FROM worker_profiles WHERE id = $2
		ON CONFLICT (customer_id, worker_id) DO NOTHING
	`, customerID, workerID)
	if err != nil {
		return db.Favorite{}, err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return db.Favorite{}, err
	}
	if rows == 0 {
		if _, err := s.GetCustomerFavorite(ctx, customerID, workerID); errors.Is(err, sql.ErrNoRows) {
			return db.Favorite{}, sql.ErrNoRows
		}
	}
	return s.GetCustomerFavorite(ctx, customerID, workerID)
}

func (s *sqlStore) RemoveCustomerFavorite(ctx context.Context, customerID, workerID int64) error {
	result, err := s.db.ExecContext(ctx, `
		DELETE FROM customer_favorites
		WHERE customer_id = $1 AND worker_id = $2
	`, customerID, workerID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *sqlStore) ListPortfolioItems(ctx context.Context, workerID int64) ([]db.PortfolioItem, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT p.id, p.worker_id,
		       COALESCE(NULLIF(media.media_url, ''), p.cover_image_url),
		       p.title, p.description, p.created_at, p.updated_at
		FROM worker_portfolio_projects p
		LEFT JOIN LATERAL (
			SELECT media_url
			FROM worker_portfolio_media
			WHERE portfolio_project_id = p.id AND media_type = 'image'
			ORDER BY display_order ASC, id ASC
			LIMIT 1
		) media ON TRUE
		WHERE p.worker_id = $1 AND p.is_published = TRUE
		ORDER BY p.created_at DESC
	`, workerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]db.PortfolioItem, 0)
	for rows.Next() {
		var item db.PortfolioItem
		if err := rows.Scan(&item.ID, &item.WorkerID, &item.Image, &item.Title, &item.Description, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *sqlStore) CreatePortfolioItem(ctx context.Context, workerID int64, item db.PortfolioItem) (db.PortfolioItem, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return db.PortfolioItem{}, err
	}
	defer tx.Rollback()

	var created db.PortfolioItem
	err = tx.QueryRowContext(ctx, `
		INSERT INTO worker_portfolio_projects (worker_id, title, description, cover_image_url)
		VALUES ($1, $2, $3, $4)
		RETURNING id, worker_id, title, description, cover_image_url, created_at, updated_at
	`, workerID, item.Title, item.Description, item.Image).Scan(
		&created.ID, &created.WorkerID, &created.Title, &created.Description,
		&created.Image, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return db.PortfolioItem{}, err
	}

	if _, err = tx.ExecContext(ctx, `
		INSERT INTO worker_portfolio_media (portfolio_project_id, media_url, media_type, display_order)
		VALUES ($1, $2, 'image', 0)
	`, created.ID, item.Image); err != nil {
		return db.PortfolioItem{}, err
	}

	if err = tx.Commit(); err != nil {
		return db.PortfolioItem{}, err
	}
	return created, nil
}

func (s *sqlStore) UpdatePortfolioItem(ctx context.Context, workerID, itemID int64, item db.PortfolioItem) (db.PortfolioItem, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return db.PortfolioItem{}, err
	}
	defer tx.Rollback()

	var updated db.PortfolioItem
	err = tx.QueryRowContext(ctx, `
		UPDATE worker_portfolio_projects
		SET title = $1, description = $2, cover_image_url = $3, updated_at = NOW()
		WHERE id = $4 AND worker_id = $5
		RETURNING id, worker_id, title, description, cover_image_url, created_at, updated_at
	`, item.Title, item.Description, item.Image, itemID, workerID).Scan(
		&updated.ID, &updated.WorkerID, &updated.Title, &updated.Description,
		&updated.Image, &updated.CreatedAt, &updated.UpdatedAt,
	)
	if err != nil {
		return db.PortfolioItem{}, err
	}

	if _, err = tx.ExecContext(ctx, `
		UPDATE worker_portfolio_media
		SET media_url = $1
		WHERE portfolio_project_id = $2 AND media_type = 'image'
	`, item.Image, itemID); err != nil {
		return db.PortfolioItem{}, err
	}

	if err = tx.Commit(); err != nil {
		return db.PortfolioItem{}, err
	}
	return updated, nil
}

func (s *sqlStore) DeletePortfolioItem(ctx context.Context, workerID, itemID int64) error {
	result, err := s.db.ExecContext(ctx, `
		DELETE FROM worker_portfolio_projects
		WHERE id = $1 AND worker_id = $2
	`, itemID, workerID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *sqlStore) UpdateWorkerProfile(ctx context.Context, workerID int64, updates db.WorkerProfileUpdate) (db.WorkerProfile, error) {
	q := `
		UPDATE worker_profiles
		SET
			headline = COALESCE($1, headline),
			bio = COALESCE($2, bio),
			city = COALESCE($3, city),
			experience_years = COALESCE($4, experience_years),
			hourly_rate_etb = COALESCE($5, hourly_rate_etb),
			availability_status = COALESCE($6, availability_status),
			updated_at = NOW()
		WHERE id = $7
		RETURNING
			id, user_id, headline, bio, city, experience_years, hourly_rate_etb,
			availability_status, is_verified, rating_average, rating_count, completed_jobs,
			created_at, updated_at
	`

	var profile db.WorkerProfile
	err := s.db.QueryRowContext(ctx, q,
		updates.Headline, updates.Bio, updates.City, updates.ExperienceYears,
		updates.HourlyRateETB, updates.AvailabilityStatus, workerID,
	).Scan(
		&profile.ID, &profile.UserID, &profile.Headline, &profile.Bio, &profile.City,
		&profile.ExperienceYears, &profile.HourlyRateETB, &profile.AvailabilityStatus,
		&profile.IsVerified, &profile.RatingAverage, &profile.RatingCount,
		&profile.CompletedJobs, &profile.CreatedAt, &profile.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return db.WorkerProfile{}, fmt.Errorf("worker profile not found")
		}
		return db.WorkerProfile{}, err
	}

	if len(updates.Skills) > 0 {
		if err = s.updateWorkerSkills(ctx, workerID, updates.Skills); err != nil {
			return db.WorkerProfile{}, err
		}
	}

	return profile, nil
}

func (s *sqlStore) updateWorkerSkills(ctx context.Context, workerID int64, skills []string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err = tx.ExecContext(ctx, `DELETE FROM worker_skills WHERE worker_id = $1`, workerID); err != nil {
		return err
	}

	if len(skills) > 0 {
		for _, skillName := range skills {
			var categoryID int64
			err = tx.QueryRowContext(ctx,
				`SELECT id FROM service_categories WHERE LOWER(name) = LOWER($1)`,
				skillName,
			).Scan(&categoryID)
			if err != nil {
				if err == sql.ErrNoRows {
					continue
				}
				return err
			}

			if _, err = tx.ExecContext(ctx,
				`INSERT INTO worker_skills (worker_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
				workerID, categoryID,
			); err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (s *sqlStore) GetWorkerPrimaryCategoryID(ctx context.Context, workerID int64) (int64, error) {
	q := `
		SELECT category_id
		FROM worker_skills
		WHERE worker_id = $1
		ORDER BY category_id
		LIMIT 1
	`

	var categoryID int64
	err := s.db.QueryRowContext(ctx, q, workerID).Scan(&categoryID)
	return categoryID, err
}

func (s *sqlStore) CreateServiceRequest(ctx context.Context, request db.ServiceRequest) (db.ServiceRequest, error) {
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

func (s *sqlStore) GetServiceRequestViewByID(ctx context.Context, requestID int64) (db.ServiceRequestView, error) {
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

func (s *sqlStore) ListRequestPhotos(ctx context.Context, requestID int64) ([]db.RequestPhoto, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, request_id, photo_url, created_at
		FROM request_photos
		WHERE request_id = $1
		ORDER BY created_at ASC, id ASC
	`, requestID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	photos := make([]db.RequestPhoto, 0)
	for rows.Next() {
		var photo db.RequestPhoto
		if err := rows.Scan(&photo.ID, &photo.RequestID, &photo.PhotoURL, &photo.CreatedAt); err != nil {
			return nil, err
		}
		photos = append(photos, photo)
	}
	return photos, rows.Err()
}

func (s *sqlStore) CreateRequestPhoto(ctx context.Context, requestID int64, photoURL string) (db.RequestPhoto, error) {
	var photo db.RequestPhoto
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO request_photos (request_id, photo_url)
		SELECT id, $2 FROM service_requests WHERE id = $1
		RETURNING id, request_id, photo_url, created_at
	`, requestID, photoURL).Scan(&photo.ID, &photo.RequestID, &photo.PhotoURL, &photo.CreatedAt)
	return photo, err
}

func (s *sqlStore) DeleteRequestPhoto(ctx context.Context, requestID, photoID int64) error {
	result, err := s.db.ExecContext(ctx, `
		DELETE FROM request_photos
		WHERE id = $1 AND request_id = $2
	`, photoID, requestID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *sqlStore) ListCustomerRequests(ctx context.Context, customerID int64) ([]db.ServiceRequestView, error) {
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

func (s *sqlStore) ListWorkerRequests(ctx context.Context, workerUserID int64) ([]db.ServiceRequestView, error) {
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

func (s *sqlStore) UpdateServiceRequestStatusByWorker(ctx context.Context, workerUserID, requestID int64, status string) (db.ServiceRequestView, error) {
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

func (s *sqlStore) StartServiceRequestByWorker(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error) {
	q := `
		UPDATE service_requests sr
		SET status = 'in_progress', updated_at = NOW()
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

func (s *sqlStore) ConfirmServiceRequestByCustomer(ctx context.Context, customerID, requestID int64) (db.ServiceRequestView, error) {
	// Customer explicitly confirms that work is complete.
	// Only the customer who owns the request can confirm.
	// Confirmation is only allowed when status = 'completed'.
	// Once confirmed, the request is terminal.
	q := `
		UPDATE service_requests
		SET status = 'confirmed', updated_at = NOW()
		WHERE id = $1
		  AND customer_id = $2
		  AND status = 'completed'
		RETURNING id
	`

	var updatedID int64
	err := s.db.QueryRowContext(ctx, q, requestID, customerID).Scan(&updatedID)
	if err != nil {
		return db.ServiceRequestView{}, err
	}

	return s.GetServiceRequestViewByID(ctx, updatedID)
}

func (s *sqlStore) CancelServiceRequestByCustomer(ctx context.Context, customerID, requestID int64) (db.ServiceRequestView, error) {
	q := `
				UPDATE service_requests
				SET status = 'cancelled', updated_at = NOW()
				WHERE id = $1
					AND customer_id = $2
					AND status IN ('pending', 'accepted', 'in_progress')
				RETURNING id
		`

	var updatedID int64
	err := s.db.QueryRowContext(ctx, q, requestID, customerID).Scan(&updatedID)
	if err != nil {
		return db.ServiceRequestView{}, err
	}

	return s.GetServiceRequestViewByID(ctx, updatedID)
}

func (s *sqlStore) MarkServiceRequestCompletedByWorker(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error) {
	q := `
		UPDATE service_requests sr
		SET status = 'completed', updated_at = NOW()
		FROM worker_profiles wp
		WHERE sr.id = $1
		  AND sr.worker_id = wp.id
		  AND wp.user_id = $2
					AND sr.status = 'in_progress'
		RETURNING sr.id
	`

	var updatedID int64
	err := s.db.QueryRowContext(ctx, q, requestID, workerUserID).Scan(&updatedID)
	if err != nil {
		return db.ServiceRequestView{}, err
	}

	return s.GetServiceRequestViewByID(ctx, updatedID)
}

func (s *sqlStore) SetWorkerAvailability(ctx context.Context, workerUserID int64, availability string) error {
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

func (s *sqlStore) CreateReview(ctx context.Context, requestID, customerID int64, rating int, comment string) error {
	q := `
		INSERT INTO reviews (request_id, customer_id, worker_id, rating, comment)
		SELECT sr.id, sr.customer_id, sr.worker_id, $3, $4
		FROM service_requests sr
		WHERE sr.id = $1 AND sr.customer_id = $2 AND sr.status = 'confirmed'
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

func (s *sqlStore) RefreshWorkerRating(ctx context.Context, requestID int64) error {
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

func (s *sqlStore) InitiatePayment(ctx context.Context, requestID int64, amount float64, provider, providerRef string) (db.Payment, error) {
	var existing db.Payment
	err := s.db.QueryRowContext(ctx, `
		SELECT id, request_id, amount_etb, currency, provider, provider_ref, status, paid_at, created_at, updated_at
		FROM payments
		WHERE request_id = $1 AND status IN ('pending', 'paid')
		ORDER BY id DESC
		LIMIT 1
	`, requestID).Scan(
		&existing.ID,
		&existing.RequestID,
		&existing.AmountETB,
		&existing.Currency,
		&existing.Provider,
		&existing.ProviderRef,
		&existing.Status,
		&existing.PaidAt,
		&existing.CreatedAt,
		&existing.UpdatedAt,
	)
	if err == nil {
		return existing, nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return db.Payment{}, err
	}

	q := `
		INSERT INTO payments (request_id, amount_etb, provider, provider_ref, status)
		VALUES ($1, $2, $3, $4, 'pending')
		RETURNING id, request_id, amount_etb, currency, provider, provider_ref, status, paid_at, created_at, updated_at
	`

	var payment db.Payment
	err = s.db.QueryRowContext(ctx, q, requestID, amount, provider, providerRef).Scan(
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

func (s *sqlStore) GetRequestMessagingParticipants(ctx context.Context, requestID int64) (int64, int64, string, error) {
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

func (s *sqlStore) UpsertMessageConversation(ctx context.Context, requestID, customerUserID, workerUserID int64) (int64, error) {
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

func (s *sqlStore) ListMessageConversations(ctx context.Context, userID int64) ([]db.MessageConversation, error) {
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

func (s *sqlStore) CreateMessage(ctx context.Context, conversationID, requestID, senderUserID int64, body, messageType string) (db.Message, error) {
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

func (s *sqlStore) ListMessages(ctx context.Context, conversationID int64, limit int, beforeID int64) ([]db.Message, error) {
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

func (s *sqlStore) MarkConversationRead(ctx context.Context, conversationID, userID int64) error {
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

func (s *sqlStore) CustomerDashboard(ctx context.Context, customerID int64) (db.CustomerDashboard, error) {
	q := `
		SELECT
			COUNT(*)::int AS total_requests,
			COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_requests,
			COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted_requests,
			COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress_requests,
			COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_requests,
			COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed_requests
		FROM service_requests
		WHERE customer_id = $1
	`

	var out db.CustomerDashboard
	err := s.db.QueryRowContext(ctx, q, customerID).Scan(
		&out.TotalRequests,
		&out.PendingRequests,
		&out.AcceptedRequests,
		&out.InProgressRequests,
		&out.CompletedRequests,
		&out.ConfirmedRequests,
	)
	return out, err
}

func (s *sqlStore) WorkerDashboard(ctx context.Context, workerUserID int64) (db.WorkerDashboard, error) {
	q := `
		SELECT
			COUNT(*) FILTER (WHERE sr.status = 'pending')::int AS incoming_pending,
			COUNT(*) FILTER (WHERE sr.status = 'accepted')::int AS accepted_requests,
			COUNT(*) FILTER (WHERE sr.status = 'in_progress')::int AS in_progress_jobs,
			COUNT(*) FILTER (WHERE sr.status = 'completed')::int AS completed_jobs,
			COUNT(*) FILTER (WHERE sr.status = 'confirmed')::int AS confirmed_jobs,
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
		&out.InProgressJobs,
		&out.CompletedJobs,
		&out.ConfirmedJobs,
		&out.EstimatedEarningsETB,
	)
	return out, err
}

func (s *sqlStore) AdminDashboard(ctx context.Context) (db.AdminDashboard, error) {
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

func (s *sqlStore) PendingWorkerVerifications(ctx context.Context) ([]db.WorkerCard, error) {
	q := `
		SELECT
			wp.id,
			wp.user_id,
			u.full_name,
			u.profile_image,
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
			&worker.ProfileImage,
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

func (s *sqlStore) VerifyWorker(ctx context.Context, workerID int64, verified bool) error {
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

func (s *sqlStore) WorkerProfileByUserID(ctx context.Context, userID int64) (int64, bool, error) {
	q := `SELECT id, is_verified FROM worker_profiles WHERE user_id = $1`
	var workerID int64
	var verified bool
	err := s.db.QueryRowContext(ctx, q, userID).Scan(&workerID, &verified)
	if err != nil {
		return 0, false, err
	}
	return workerID, verified, nil
}

func (s *sqlStore) RequestBelongsToCustomer(ctx context.Context, requestID, customerID int64) (bool, error) {
	q := `SELECT EXISTS(SELECT 1 FROM service_requests WHERE id = $1 AND customer_id = $2)`
	var exists bool
	err := s.db.QueryRowContext(ctx, q, requestID, customerID).Scan(&exists)
	return exists, err
}

func (s *sqlStore) scanServiceRequests(ctx context.Context, q string, arg any) ([]db.ServiceRequestView, error) {
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

func (s *sqlStore) SubmitVerificationRequest(ctx context.Context, workerID int64, documents []db.WorkerDocument) (db.VerificationRequest, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return db.VerificationRequest{}, err
	}
	defer tx.Rollback()

	// Check if worker exists
	var exists bool
	err = tx.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM worker_profiles WHERE id = $1)", workerID).Scan(&exists)
	if err != nil {
		return db.VerificationRequest{}, err
	}
	if !exists {
		return db.VerificationRequest{}, fmt.Errorf("worker not found")
	}

	// Delete existing documents for this worker
	_, err = tx.ExecContext(ctx, "DELETE FROM worker_documents WHERE worker_id = $1", workerID)
	if err != nil {
		return db.VerificationRequest{}, err
	}

	// Insert new documents
	for _, doc := range documents {
		result, err := tx.ExecContext(ctx, `
			UPDATE worker_documents
			SET file_url = $1, file_name = $2, mime_type = $3, status = 'pending', updated_at = NOW()
			WHERE worker_id = $4 AND document_type = $5
		`, doc.FileURL, doc.FileName, doc.MimeType, workerID, doc.DocumentType)
		if err != nil {
			return db.VerificationRequest{}, err
		}
		rows, err := result.RowsAffected()
		if err != nil {
			return db.VerificationRequest{}, err
		}
		if rows == 0 {
			_, err = tx.ExecContext(ctx, `
				INSERT INTO worker_documents (worker_id, document_type, file_url, file_name, mime_type, status)
				VALUES ($1, $2, $3, $4, $5, 'pending')
			`, workerID, doc.DocumentType, doc.FileURL, doc.FileName, doc.MimeType)
		}
		if err != nil {
			return db.VerificationRequest{}, err
		}
	}

	// Create or update verification request
	var verReq db.VerificationRequest
	result, err := tx.ExecContext(ctx, `
		UPDATE worker_verification_requests
		SET status = 'pending', submitted_at = NOW(), updated_at = NOW()
		WHERE worker_id = $1
	`, workerID)
	if err != nil {
		return db.VerificationRequest{}, err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return db.VerificationRequest{}, err
	}
	if rows == 0 {
		err = tx.QueryRowContext(ctx, `
			INSERT INTO worker_verification_requests (worker_id, status)
			VALUES ($1, 'pending')
			RETURNING id, worker_id, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, created_at, updated_at
		`, workerID).Scan(
			&verReq.ID, &verReq.WorkerID, &verReq.Status, &verReq.SubmittedAt,
			&verReq.ReviewedAt, &verReq.ReviewedBy, &verReq.RejectionReason,
			&verReq.CreatedAt, &verReq.UpdatedAt,
		)
		if err != nil {
			return db.VerificationRequest{}, err
		}
	} else {
		err = tx.QueryRowContext(ctx, `
			SELECT id, worker_id, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, created_at, updated_at
			FROM worker_verification_requests
			WHERE worker_id = $1
		`, workerID).Scan(
			&verReq.ID, &verReq.WorkerID, &verReq.Status, &verReq.SubmittedAt,
			&verReq.ReviewedAt, &verReq.ReviewedBy, &verReq.RejectionReason,
			&verReq.CreatedAt, &verReq.UpdatedAt,
		)
		if err != nil {
			return db.VerificationRequest{}, err
		}
	}

	if _, err = tx.ExecContext(ctx, `
		UPDATE worker_profiles
		SET is_verified = FALSE, verification_status = 'pending', updated_at = NOW()
		WHERE id = $1
	`, workerID); err != nil {
		return db.VerificationRequest{}, err
	}

	if err = tx.Commit(); err != nil {
		return db.VerificationRequest{}, err
	}

	return verReq, nil
}

func (s *sqlStore) ReviewWorkerVerification(ctx context.Context, workerID, reviewerID int64, verified bool, rejectionReason string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	status := "rejected"
	profileStatus := "rejected"
	if verified {
		status = "approved"
		profileStatus = "approved"
		rejectionReason = ""
	}

	result, err := tx.ExecContext(ctx, `
		UPDATE worker_profiles
		SET is_verified = $1, verification_status = $2, updated_at = NOW()
		WHERE id = $3
	`, verified, profileStatus, workerID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}

	result, err = tx.ExecContext(ctx, `
		UPDATE worker_verification_requests
		SET status = $1, reviewed_at = NOW(), reviewed_by = $2, rejection_reason = $3, updated_at = NOW()
		WHERE worker_id = $4
	`, status, reviewerID, rejectionReason, workerID)
	if err != nil {
		return err
	}
	rows, err = result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}

	return tx.Commit()
}

func (s *sqlStore) GetVerificationStatus(ctx context.Context, workerID int64) (db.VerificationRequest, error) {
	var verReq db.VerificationRequest
	err := s.db.QueryRowContext(ctx,
		`SELECT id, worker_id, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, created_at, updated_at
		 FROM worker_verification_requests
		 WHERE worker_id = $1`,
		workerID,
	).Scan(
		&verReq.ID, &verReq.WorkerID, &verReq.Status, &verReq.SubmittedAt,
		&verReq.ReviewedAt, &verReq.ReviewedBy, &verReq.RejectionReason,
		&verReq.CreatedAt, &verReq.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return db.VerificationRequest{}, fmt.Errorf("verification request not found")
		}
		return db.VerificationRequest{}, err
	}

	return verReq, nil
}

func IsNotFound(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}

func BuildPaymentReference(provider string, requestID int64) string {
	return fmt.Sprintf("%s-%d-%d", strings.ToUpper(provider), requestID, time.Now().Unix())
}
