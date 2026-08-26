package dto

type RegisterRequest struct {
	FullName     string   `json:"fullName"`
	Email        string   `json:"email"`
	Phone        string   `json:"phone"`
	Role         string   `json:"role"`
	Password     string   `json:"password"`
	PrimarySkill string   `json:"primarySkill"`
	Skills       []string `json:"skills"`
	Experience   string   `json:"experience"`
	City         string   `json:"city"`
	Bio          string   `json:"bio"`
	ProfileImage string   `json:"profileImage"`
}

type ReviewWorkerRequest struct {
	Verified        bool   `json:"verified"`
	RejectionReason string `json:"rejectionReason"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserLoginResponse struct {
	ID              int64  `json:"id"`
	FullName        string `json:"fullName"`
	Role            string `json:"role"`
	Token           string `json:"token"`
	WorkerProfileID *int64 `json:"workerProfileId,omitempty"`
}
type WorkerSearchQuery struct {
	Category string `json:"category"`
	City     string `json:"city"`
	Q        string `json:"q"`
	Sort     string `json:"sort"`
}

type CreateServiceRequest struct {
	WorkerID        int64   `json:"workerId"`
	CategoryID      int64   `json:"categoryId"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	LocationAddress string  `json:"locationAddress"`
	PreferredAt     string  `json:"preferredAt"`
	BudgetETB       float64 `json:"budgetEtb"`
}

type RequestPhotoRequest struct {
	PhotoURL string `json:"photoUrl"`
}

type WorkerDecisionRequest struct {
	Decision string `json:"decision"`
}

type UpdateAvailabilityRequest struct {
	AvailabilityStatus string `json:"availabilityStatus"`
}

type UpdateProfileImageRequest struct {
	ProfileImage string `json:"profileImage"`
}

type UpdateWorkerProfileRequest struct {
	City         string   `json:"city"`
	Headline     string   `json:"headline"`
	Bio          string   `json:"bio"`
	Experience   int      `json:"experience"`
	HourlyRate   float64  `json:"hourlyRate"`
	Availability string   `json:"availability"`
	Skills       []string `json:"skills"`
}

type PortfolioItemRequest struct {
	Image       string `json:"image"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type SubmitReviewRequest struct {
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

type InitiatePaymentRequest struct {
	Provider  string  `json:"provider"`
	AmountETB float64 `json:"amountEtb"`
}

type SendMessageRequest struct {
	Body        string `json:"body"`
	MessageType string `json:"messageType"`
}

type ListMessagesQuery struct {
	Limit    int   `json:"limit"`
	BeforeID int64 `json:"beforeId"`
}

type SubmitVerificationRequest struct {
	Documents []VerificationDocument `json:"documents"`
}

type VerificationDocument struct {
	Type    string `json:"type"`    // government_id, professional_certificate, business_license, other
	FileURL string `json:"fileUrl"` // URL to document file
}
