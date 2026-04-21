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
)

type User struct {
	ID           int64     `json:"id"`
	FullName     string    `json:"fullName"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	Role         string    `json:"role"`
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
