package module

import (
	"context"
	"database/sql"
	"os"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	userpersistence "task-management-backend/internal/storage/persistence/user"
	user "task-management-backend/internal/module/user"
)

type Module struct {
	WorkConnect WorkConnectService
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
	ParseToken(tokenString string) (user.AuthPrincipal, error)
}

func New(db *sql.DB) *Module {
	store := userpersistence.NewStore(db)

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me"
	}

	return &Module{
		WorkConnect: user.NewWorkConnectModule(store, jwtSecret),
	}
}
