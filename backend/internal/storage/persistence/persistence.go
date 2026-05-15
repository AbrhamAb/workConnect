package persistence

import (
	"context"
	"task-management-backend/internal/model/db"
)

type Store interface {
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
	RefreshWorkerRating(ctx context.Context, requestID int64) error
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
	DB() db.DBTX
}
