package module

import (
	"context"
	"database/sql"
	"os"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	"task-management-backend/internal/storage/persistence"
)

type WorkConnectRepository interface {
	CreateUser(ctx context.Context, fullName, email, phone, role, passwordHash string) (db.User, error)
	GetUserByEmail(ctx context.Context, email string) (db.User, error)
	GetUserByID(ctx context.Context, userID int64) (db.User, error)
	CreateWorkerProfile(ctx context.Context, userID int64) error
	ListWorkers(ctx context.Context, category, city, qTerm, sort string) ([]db.WorkerCard, error)
	GetWorkerDetails(ctx context.Context, workerID int64) (db.WorkerDetails, error)
	CreateServiceRequest(ctx context.Context, request db.ServiceRequest) (db.ServiceRequest, error)
	GetServiceRequestViewByID(ctx context.Context, requestID int64) (db.ServiceRequestView, error)
	ListCustomerRequests(ctx context.Context, customerID int64) ([]db.ServiceRequestView, error)
	ListWorkerRequests(ctx context.Context, workerUserID int64) ([]db.ServiceRequestView, error)
	UpdateServiceRequestStatusByWorker(ctx context.Context, workerUserID, requestID int64, status string) (db.ServiceRequestView, error)
	MarkServiceRequestCompletedByWorker(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error)
	SetWorkerAvailability(ctx context.Context, workerUserID int64, availability string) error
	CreateReview(ctx context.Context, requestID, customerID int64, rating int, comment string) error
	InitiatePayment(ctx context.Context, requestID int64, amount float64, provider, providerRef string) (db.Payment, error)
	GetRequestMessagingParticipants(ctx context.Context, requestID int64) (int64, int64, string, error)
	UpsertMessageConversation(ctx context.Context, requestID, customerUserID, workerUserID int64) (int64, error)
	ListMessageConversations(ctx context.Context, userID int64) ([]db.MessageConversation, error)
	CreateMessage(ctx context.Context, conversationID, requestID, senderUserID int64, body, messageType string) (db.Message, error)
	ListMessages(ctx context.Context, conversationID int64, limit int, beforeID int64) ([]db.Message, error)
	MarkConversationRead(ctx context.Context, conversationID, userID int64) error
	CustomerDashboard(ctx context.Context, customerID int64) (db.CustomerDashboard, error)
	WorkerDashboard(ctx context.Context, workerUserID int64) (db.WorkerDashboard, error)
	AdminDashboard(ctx context.Context) (db.AdminDashboard, error)
	PendingWorkerVerifications(ctx context.Context) ([]db.WorkerCard, error)
	VerifyWorker(ctx context.Context, workerID int64, verified bool) error
	WorkerProfileByUserID(ctx context.Context, userID int64) (int64, bool, error)
	RequestBelongsToCustomer(ctx context.Context, requestID, customerID int64) (bool, error)
}

type WorkConnectService interface {
	Register(ctx context.Context, req dto.RegisterRequest) (string, db.User, error)
	Login(ctx context.Context, req dto.LoginRequest) (*dto.UserLoginResponse, error)
	GetProfile(ctx context.Context, userID int64) (db.User, error)
	GetWorkerProfileInfo(ctx context.Context, userID int64) (int64, bool, error)
	ListWorkers(ctx context.Context, query dto.WorkerSearchQuery) ([]db.WorkerCard, error)
	GetWorkerDetails(ctx context.Context, workerID int64) (db.WorkerDetails, error)
	CreateServiceRequest(ctx context.Context, customerID int64, req dto.CreateServiceRequest) (db.ServiceRequestView, error)
	ListCustomerRequests(ctx context.Context, customerID int64) ([]db.ServiceRequestView, error)
	ListWorkerRequests(ctx context.Context, workerUserID int64) ([]db.ServiceRequestView, error)
	WorkerDecision(ctx context.Context, workerUserID, requestID int64, req dto.WorkerDecisionRequest) (db.ServiceRequestView, error)
	CompleteWorkerRequest(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error)
	UpdateWorkerAvailability(ctx context.Context, workerUserID int64, req dto.UpdateAvailabilityRequest) error
	SubmitReview(ctx context.Context, customerID, requestID int64, req dto.SubmitReviewRequest) error
	InitiatePayment(ctx context.Context, customerID, requestID int64, req dto.InitiatePaymentRequest) (db.Payment, error)
	CustomerDashboard(ctx context.Context, customerID int64) (db.CustomerDashboard, error)
	WorkerDashboard(ctx context.Context, workerUserID int64) (db.WorkerDashboard, error)
	AdminDashboard(ctx context.Context) (db.AdminDashboard, error)
	PendingWorkerVerifications(ctx context.Context) ([]db.WorkerCard, error)
	VerifyWorker(ctx context.Context, workerID int64, verified bool) error
	ListMessageConversations(ctx context.Context, userID int64) ([]db.MessageConversation, error)
	ListMessagesByRequest(ctx context.Context, userID, requestID int64, query dto.ListMessagesQuery) ([]db.Message, error)
	SendMessage(ctx context.Context, userID, requestID int64, req dto.SendMessageRequest) (db.Message, error)
	ParseToken(tokenString string) (AuthPrincipal, error)
}

type Module struct {
	WorkConnect WorkConnectService
}

func New(db *sql.DB) *Module {
	store := persistence.NewStore(db)

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me"
	}

	return &Module{
		WorkConnect: NewWorkConnectModule(store, jwtSecret),
	}
}
