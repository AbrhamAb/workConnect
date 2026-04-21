package dto

type RegisterRequest struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Role     string `json:"role"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
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

type WorkerDecisionRequest struct {
	Decision string `json:"decision"`
}

type UpdateAvailabilityRequest struct {
	AvailabilityStatus string `json:"availabilityStatus"`
}

type SubmitReviewRequest struct {
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

type InitiatePaymentRequest struct {
	Provider  string  `json:"provider"`
	AmountETB float64 `json:"amountEtb"`
}
