package db

import "time"

const (
	RoleCustomer = "customer"
	RoleWorker   = "worker"
	RoleAdmin    = "admin"

	AvailabilityAvailable = "available"
	AvailabilityBusy      = "busy"

	RequestStatusPending    = "pending"
	RequestStatusAccepted   = "accepted"
	RequestStatusInProgress = "in_progress"
	RequestStatusCompleted  = "completed"
	RequestStatusConfirmed  = "confirmed"
	RequestStatusRejected   = "rejected"
	RequestStatusCancelled  = "cancelled"

	PaymentStatusPending = "pending"
	PaymentStatusPaid    = "paid"
	PaymentStatusFailed  = "failed"

	MessageTypeText = "text"
)

type User struct {
	ID           int64     `json:"id"`
	FullName     string    `json:"fullName"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	Role         string    `json:"role"`
	ProfileImage string    `json:"profileImage"`
	IsActive     bool      `json:"isActive"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type WorkerProfile struct {
	ID                 int64     `json:"id"`
	UserID             int64     `json:"userId"`
	Headline           string    `json:"headline"`
	Bio                string    `json:"bio"`
	City               string    `json:"city"`
	ExperienceYears    int       `json:"experienceYears"`
	HourlyRateETB      float64   `json:"hourlyRateEtb"`
	AvailabilityStatus string    `json:"availabilityStatus"`
	IsVerified         bool      `json:"isVerified"`
	RatingAverage      float64   `json:"ratingAverage"`
	RatingCount        int       `json:"ratingCount"`
	CompletedJobs      int       `json:"completedJobs"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

type WorkerProfileUpdate struct {
	City               *string
	Headline           *string
	Bio                *string
	ExperienceYears    *int
	HourlyRateETB      *float64
	AvailabilityStatus *string
	Skills             []string
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

type PortfolioItem struct {
	ID          int64     `json:"id"`
	WorkerID    int64     `json:"workerId"`
	Image       string    `json:"image"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Review struct {
	ID                   int64     `json:"id"`
	RequestID            int64     `json:"requestId"`
	WorkerID             int64     `json:"workerId"`
	CustomerID           int64     `json:"customerId"`
	CustomerName         string    `json:"customerName"`
	CustomerInitials     string    `json:"customerInitials"`
	CustomerProfileImage string    `json:"customerProfileImage"`
	Rating               int       `json:"rating"`
	Comment              string    `json:"comment"`
	CreatedAt            time.Time `json:"createdAt"`
}

type WorkerReviewSummary struct {
	Rating       float64 `json:"rating"`
	TotalReviews int     `json:"totalReviews"`
}

type WorkerReviewResponse struct {
	Rating  WorkerReviewSummary `json:"rating"`
	Reviews []Review            `json:"reviews"`
}

type ServiceRequest struct {
	ID               int64      `json:"id"`
	ReferenceCode    string     `json:"referenceCode"`
	CustomerID       int64      `json:"customerId"`
	WorkerID         int64      `json:"workerId"`
	CategoryID       int64      `json:"categoryId"`
	Title            string     `json:"title"`
	Description      string     `json:"description"`
	LocationAddress  string     `json:"locationAddress"`
	PreferredAt      *time.Time `json:"preferredAt,omitempty"`
	BudgetETB        float64    `json:"budgetEtb"`
	Status           string     `json:"status"`
	WorkerDecisionAt *time.Time `json:"workerDecisionAt,omitempty"`
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
}

type ServiceRequestView struct {
	ServiceRequest
	CategoryName  string `json:"categoryName"`
	WorkerName    string `json:"workerName"`
	CustomerName  string `json:"customerName"`
	CustomerPhone string `json:"customerPhone"`
}

type Payment struct {
	ID          int64      `json:"id"`
	RequestID   int64      `json:"requestId"`
	AmountETB   float64    `json:"amountEtb"`
	Currency    string     `json:"currency"`
	Provider    string     `json:"provider"`
	ProviderRef string     `json:"providerRef"`
	Status      string     `json:"status"`
	PaidAt      *time.Time `json:"paidAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type CustomerDashboard struct {
	TotalRequests      int `json:"totalRequests"`
	PendingRequests    int `json:"pendingRequests"`
	AcceptedRequests   int `json:"acceptedRequests"`
	InProgressRequests int `json:"inProgressRequests"`
	CompletedRequests  int `json:"completedRequests"` // awaiting customer confirmation
	ConfirmedRequests  int `json:"confirmedRequests"` // customer confirmed/completed
}

type WorkerDashboard struct {
	IncomingPendingRequests int     `json:"incomingPendingRequests"`
	AcceptedRequests        int     `json:"acceptedRequests"`
	InProgressJobs          int     `json:"inProgressJobs"`
	CompletedJobs           int     `json:"completedJobs"` // awaiting customer confirmation
	ConfirmedJobs           int     `json:"confirmedJobs"` // customer confirmed/completed
	EstimatedEarningsETB    float64 `json:"estimatedEarningsEtb"`
}

type AdminDashboard struct {
	TotalUsers           int `json:"totalUsers"`
	TotalWorkers         int `json:"totalWorkers"`
	PendingVerifications int `json:"pendingVerifications"`
	TotalRequests        int `json:"totalRequests"`
	OpenRequests         int `json:"openRequests"`
}

type MessageConversation struct {
	ID                 int64      `json:"id"`
	RequestID          int64      `json:"requestId"`
	OtherPartyUserID   int64      `json:"otherPartyUserId"`
	OtherPartyName     string     `json:"otherPartyName"`
	LastMessagePreview string     `json:"lastMessagePreview"`
	LastMessageAt      *time.Time `json:"lastMessageAt,omitempty"`
	UnreadCount        int        `json:"unreadCount"`
}

type Message struct {
	ID             int64     `json:"id"`
	ConversationID int64     `json:"conversationId"`
	RequestID      int64     `json:"requestId"`
	SenderUserID   int64     `json:"senderUserId"`
	SenderName     string    `json:"senderName"`
	Body           string    `json:"body"`
	MessageType    string    `json:"messageType"`
	CreatedAt      time.Time `json:"createdAt"`
}

type VerificationRequest struct {
	ID              int64      `json:"id"`
	WorkerID        int64      `json:"workerId"`
	Status          string     `json:"status"` // pending, in_review, approved, rejected
	SubmittedAt     time.Time  `json:"submittedAt"`
	ReviewedAt      *time.Time `json:"reviewedAt,omitempty"`
	ReviewedBy      *int64     `json:"reviewedBy,omitempty"`
	RejectionReason string     `json:"rejectionReason"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type WorkerDocument struct {
	ID            int64     `json:"id"`
	WorkerID      int64     `json:"workerId"`
	DocumentType  string    `json:"documentType"` // government_id, professional_certificate, business_license, other
	FileURL       string    `json:"fileUrl"`
	FileName      string    `json:"fileName"`
	MimeType      string    `json:"mimeType"`
	FileSizeBytes int64     `json:"fileSizeBytes"`
	Status        string    `json:"status"` // pending, approved, rejected
	ReviewNotes   string    `json:"reviewNotes"`
	UploadedAt    time.Time `json:"uploadedAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
