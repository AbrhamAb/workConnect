package db

import "time"

const (
	RoleCustomer = "customer"
	RoleWorker   = "worker"
	RoleAdmin    = "admin"

	AvailabilityAvailable = "available"
	AvailabilityBusy      = "busy"

	RequestStatusPending   = "pending"
	RequestStatusAccepted  = "accepted"
	RequestStatusRejected  = "rejected"
	RequestStatusCompleted = "completed"
	RequestStatusCancelled = "cancelled"

	PaymentStatusPending = "pending"
	PaymentStatusPaid    = "paid"
	PaymentStatusFailed  = "failed"

	MessageTypeText = "text"
)

type User struct {
	ID            int64     `db:"id"`
	FullName      string    `db:"full_name"`
	Email         string    `db:"email"`
	Phone         string    `db:"phone"`
	Role          string    `db:"role"`
	IsActive      bool      `db:"is_active"`
	EmailVerified bool      `db:"email_verified"`
	PhoneVerified bool      `db:"phone_verified"`
	PasswordHash  string    `db:"password_hash"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
	// Worker profile fields (nil for customer/admin roles)
	Headline             *string  `db:"headline"`
	Bio                  *string  `db:"bio"`
	City                 *string  `db:"city"`
	Subcity              *string  `db:"subcity"`
	ProfilePictureURL    *string  `db:"profile_picture_url"`
	ExperienceYears      *int     `db:"experience_years"`
	HourlyRateETB        *float64 `db:"hourly_rate_etb"`
	AvailabilityStatus   *string  `db:"availability_status"`
	IsVerified           *bool    `db:"is_verified"`
	VerificationStatus   *string  `db:"verification_status"`
	OnboardingStep       *int     `db:"onboarding_step"`
	OnboardingCompleted  *bool    `db:"onboarding_completed"`
	ProfileStrengthScore *int     `db:"profile_strength_score"`
	ResponseRate         *float64 `db:"response_rate"`
	ReliabilityScore     *float64 `db:"reliability_score"`
	RatingAverage        *float64 `db:"rating_average"`
	RatingCount          *int     `db:"rating_count"`
	CompletedJobs        *int     `db:"completed_jobs"`
	// Notification preferences (nil for customer/admin roles)
	ReceiveJobAlerts      *bool      `db:"receive_job_alerts"`
	ReceiveMarketing      *bool      `db:"receive_marketing"`
	NotificationUpdatedAt *time.Time `db:"notification_updated_at"`
}

type WorkerCard struct {
	WorkerID            int64   `json:"workerId"`
	UserID              int64   `json:"userId"`
	FullName            string  `json:"fullName"`
	Headline            string  `json:"headline"`
	City                string  `json:"city"`
	HourlyRateETB       float64 `json:"hourlyRateEtb"`
	RatingAverage       float64 `json:"ratingAverage"`
	RatingCount         int     `json:"ratingCount"`
	AvailabilityStatus  string  `json:"availabilityStatus"`
	IsVerified          bool    `json:"isVerified"`
	CompletedJobs       int     `json:"completedJobs"`
	PrimaryCategoryName string  `json:"primaryCategoryName"`
}

type WorkerDetails struct {
	Worker WorkerCard `json:"worker"`
	Bio    string     `json:"bio"`
	Phone  string     `json:"phone"`
	Email  string     `json:"email"`
	Skills []string   `json:"skills"`
}

type ServiceCategory struct {
	ID          int64  `db:"id"`
	Name        string `db:"name"`
	Slug        string `db:"slug"`
	Description string `db:"description"`
}

type WorkerSkill struct {
	WorkerID   int64 `db:"worker_id"`
	CategoryID int64 `db:"category_id"`
}

type ServiceRequest struct {
	ID               int64      `db:"id"`
	ReferenceCode    string     `db:"reference_code"`
	CustomerID       int64      `db:"customer_id"`
	WorkerID         int64      `db:"worker_id"`
	CategoryID       int64      `db:"category_id"`
	Title            string     `db:"title"`
	Description      string     `db:"description"`
	LocationAddress  string     `db:"location_address"`
	PreferredAt      *time.Time `db:"preferred_at"`
	BudgetETB        float64    `db:"budget_etb"`
	Status           string     `db:"status"`
	WorkerDecisionAt *time.Time `db:"worker_decision_at"`
	CreatedAt        time.Time  `db:"created_at"`
	UpdatedAt        time.Time  `db:"updated_at"`
}

type ServiceRequestView struct {
	ServiceRequest
	CategoryName  string `json:"categoryName"`
	WorkerName    string `json:"workerName"`
	CustomerName  string `json:"customerName"`
	CustomerPhone string `json:"customerPhone"`
}

type CustomerDashboard struct {
	TotalRequests     int `json:"totalRequests"`
	PendingRequests   int `json:"pendingRequests"`
	CompletedRequests int `json:"completedRequests"`
}

type WorkerDashboard struct {
	IncomingPendingRequests int     `json:"incomingPendingRequests"`
	AcceptedRequests        int     `json:"acceptedRequests"`
	CompletedJobs           int     `json:"completedJobs"`
	EstimatedEarningsETB    float64 `json:"estimatedEarningsEtb"`
}

type AdminDashboard struct {
	TotalUsers           int `json:"totalUsers"`
	TotalWorkers         int `json:"totalWorkers"`
	PendingVerifications int `json:"pendingVerifications"`
	TotalRequests        int `json:"totalRequests"`
	OpenRequests         int `json:"openRequests"`
}

// WorkerVerification (merged verification requests + documents)
type WorkerVerification struct {
	ID       int64 `db:"id"`
	WorkerID int64 `db:"worker_id"`
	// Verification request fields
	Status          string     `db:"status"`
	SubmittedAt     time.Time  `db:"submitted_at"`
	ReviewedAt      *time.Time `db:"reviewed_at"`
	ReviewedBy      *int64     `db:"reviewed_by"`
	RejectionReason string     `db:"rejection_reason"`
	CreatedAt       time.Time  `db:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at"`
	// Document fields (nullable)
	DocumentType  *string    `db:"document_type"`
	FileURL       *string    `db:"file_url"`
	FileName      *string    `db:"file_name"`
	MimeType      *string    `db:"mime_type"`
	FileSizeBytes *int64     `db:"file_size_bytes"`
	DocStatus     *string    `db:"doc_status"`
	ReviewNotes   *string    `db:"review_notes"`
	UploadedAt    *time.Time `db:"uploaded_at"`
}

// WorkerPortfolio (merged projects + media)
type WorkerPortfolio struct {
	ID       int64 `db:"id"`
	WorkerID int64 `db:"worker_id"`
	// Project fields
	Title         string     `db:"title"`
	Description   string     `db:"description"`
	CoverImageURL string     `db:"cover_image_url"`
	City          string     `db:"city"`
	CompletedAt   *time.Time `db:"completed_at"`
	IsPublished   bool       `db:"is_published"`
	CreatedAt     time.Time  `db:"created_at"`
	UpdatedAt     time.Time  `db:"updated_at"`
	// Media fields (nullable)
	MediaURL     *string `db:"media_url"`
	MediaType    *string `db:"media_type"`
	DisplayOrder *int    `db:"display_order"`
}

// Review (merged with payments)
type Review struct {
	ID         int64     `db:"id"`
	RequestID  int64     `db:"request_id"`
	CustomerID int64     `db:"customer_id"`
	WorkerID   int64     `db:"worker_id"`
	Rating     int       `db:"rating"`
	Comment    string    `db:"comment"`
	CreatedAt  time.Time `db:"created_at"`
	// Absorbed payment fields (nullable)
	PaymentID        *int64     `db:"payment_id"`
	AmountETB        *float64   `db:"amount_etb"`
	Currency         *string    `db:"currency"`
	Provider         *string    `db:"provider"`
	ProviderRef      *string    `db:"provider_ref"`
	PaymentStatus    *string    `db:"payment_status"`
	PaidAt           *time.Time `db:"paid_at"`
	PaymentCreatedAt *time.Time `db:"payment_created_at"`
	PaymentUpdatedAt *time.Time `db:"payment_updated_at"`
}

// Conversation (merged conversations + read-tracking)
type Conversation struct {
	ID                        int64      `db:"id"`
	RequestID                 int64      `db:"request_id"`
	CustomerUserID            int64      `db:"customer_user_id"`
	WorkerUserID              int64      `db:"worker_user_id"`
	LastMessagePreview        string     `db:"last_message_preview"`
	LastMessageAt             *time.Time `db:"last_message_at"`
	CreatedAt                 time.Time  `db:"created_at"`
	UpdatedAt                 time.Time  `db:"updated_at"`
	CustomerLastReadMessageID *int64     `db:"customer_last_read_message_id"`
	CustomerLastReadAt        *time.Time `db:"customer_last_read_at"`
	WorkerLastReadMessageID   *int64     `db:"worker_last_read_message_id"`
	WorkerLastReadAt          *time.Time `db:"worker_last_read_at"`
}

type Message struct {
	ID             int64     `db:"id"`
	ConversationID int64     `db:"conversation_id"`
	RequestID      int64     `db:"request_id"`
	SenderUserID   int64     `db:"sender_user_id"`
	Body           string    `db:"body"`
	MessageType    string    `db:"message_type"`
	CreatedAt      time.Time `db:"created_at"`
}
