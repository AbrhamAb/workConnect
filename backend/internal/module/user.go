package module

import (
	"context"
	"database/sql"
	stderrs "errors"
	"fmt"
	"strings"
	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	"task-management-backend/internal/storage/persistence"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type WorkConnectModule struct {
	store     *persistence.Store
	jwtSecret []byte
}

type AuthClaims struct {
	UserID   int64  `json:"userId"`
	FullName string `json:"fullName"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type AuthPrincipal struct {
	UserID   int64
	FullName string
	Role     string
}

func NewWorkConnectModule(store *persistence.Store, jwtSecret string) *WorkConnectModule {
	return &WorkConnectModule{store: store, jwtSecret: []byte(jwtSecret)}
}

func (m *WorkConnectModule) Register(ctx context.Context, req dto.RegisterRequest) (string, db.User, error) {
	if err := req.Validate(); err != nil {
		return "", db.User{}, err
	}

	req.Role = strings.ToLower(strings.TrimSpace(req.Role))
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", db.User{}, err
	}

	user, err := m.store.CreateUser(ctx, req.FullName, strings.ToLower(req.Email), req.Phone, req.Role, string(hash))
	if err != nil {
		if persistence.IsUniqueViolation(err) {
			return "", db.User{}, apperrors.ErrUserAlreadyExists
		}
		return "", db.User{}, err
	}

	if user.Role == db.RoleWorker {
		if err = m.store.CreateWorkerProfile(ctx, user.ID); err != nil {
			return "", db.User{}, err
		}
	}

	token, err := m.generateToken(user.ID, user.FullName, user.Role)
	if err != nil {
		return "", db.User{}, err
	}

	user.PasswordHash = ""
	return token, user, nil
}

func (m *WorkConnectModule) Login(ctx context.Context, req dto.LoginRequest) (string, db.User, error) {
	// if err := req.Validate(); err != nil {
	// 	return "", db.User{}, err
	// }

	user, err := m.store.GetUserByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		if stderrs.Is(err, sql.ErrNoRows) {
			return "", db.User{}, apperrors.ErrInvalidCredentials
		}
		return "", db.User{}, err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return "", db.User{}, apperrors.ErrInvalidCredentials
	}

	token, err := m.generateToken(user.ID, user.FullName, user.Role)
	if err != nil {
		return "", db.User{}, err
	}

	user.PasswordHash = ""
	return token, user, nil
}

func (m *WorkConnectModule) GetProfile(ctx context.Context, userID int64) (db.User, error) {
	user, err := m.store.GetUserByID(ctx, userID)
	if err != nil {
		return db.User{}, err
	}
	user.PasswordHash = ""
	return user, nil
}

func (m *WorkConnectModule) GetWorkerProfileInfo(ctx context.Context, userID int64) (int64, bool, error) {
	return m.store.WorkerProfileByUserID(ctx, userID)
}

func (m *WorkConnectModule) ListWorkers(ctx context.Context, query dto.WorkerSearchQuery) ([]db.WorkerCard, error) {
	return m.store.ListWorkers(ctx, query.Category, query.City, query.Q, query.Sort)
}

func (m *WorkConnectModule) GetWorkerDetails(ctx context.Context, workerID int64) (db.WorkerDetails, error) {
	worker, err := m.store.GetWorkerDetails(ctx, workerID)
	if persistence.IsNotFound(err) {
		return db.WorkerDetails{}, apperrors.ErrNotFound
	}
	return worker, err
}

func (m *WorkConnectModule) CreateServiceRequest(ctx context.Context, customerID int64, req dto.CreateServiceRequest) (db.ServiceRequestView, error) {
	if err := req.Validate(); err != nil {
		return db.ServiceRequestView{}, err
	}

	sr := db.ServiceRequest{
		ReferenceCode:   fmt.Sprintf("WC-%d", time.Now().UnixNano()),
		CustomerID:      customerID,
		WorkerID:        req.WorkerID,
		CategoryID:      req.CategoryID,
		Title:           strings.TrimSpace(req.Title),
		Description:     strings.TrimSpace(req.Description),
		LocationAddress: strings.TrimSpace(req.LocationAddress),
		BudgetETB:       req.BudgetETB,
		Status:          db.RequestStatusPending,
	}

	if strings.TrimSpace(req.PreferredAt) != "" {
		if parsed, err := time.Parse(time.RFC3339, req.PreferredAt); err == nil {
			sr.PreferredAt = &parsed
		}
	}

	created, err := m.store.CreateServiceRequest(ctx, sr)
	if err != nil {
		return db.ServiceRequestView{}, err
	}

	return m.store.GetServiceRequestViewByID(ctx, created.ID)
}

func (m *WorkConnectModule) ListCustomerRequests(ctx context.Context, customerID int64) ([]db.ServiceRequestView, error) {
	return m.store.ListCustomerRequests(ctx, customerID)
}

func (m *WorkConnectModule) ListWorkerRequests(ctx context.Context, workerUserID int64) ([]db.ServiceRequestView, error) {
	return m.store.ListWorkerRequests(ctx, workerUserID)
}

func (m *WorkConnectModule) WorkerDecision(ctx context.Context, workerUserID, requestID int64, req dto.WorkerDecisionRequest) (db.ServiceRequestView, error) {
	if err := req.Validate(); err != nil {
		return db.ServiceRequestView{}, err
	}

	status := db.RequestStatusRejected
	if req.Decision == "accept" {
		status = db.RequestStatusAccepted
	}

	item, err := m.store.UpdateServiceRequestStatusByWorker(ctx, workerUserID, requestID, status)
	if persistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	if err == nil && status == db.RequestStatusAccepted {
		customerUserID, assignedWorkerUserID, requestStatus, accessErr := m.store.GetRequestMessagingParticipants(ctx, requestID)
		if accessErr == nil && messagingAllowedRequestStatus(requestStatus) {
			_, _ = m.store.UpsertMessageConversation(ctx, requestID, customerUserID, assignedWorkerUserID)
		}
	}
	return item, err
}

func (m *WorkConnectModule) CompleteWorkerRequest(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error) {
	item, err := m.store.MarkServiceRequestCompletedByWorker(ctx, workerUserID, requestID)
	if persistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	return item, err
}

func (m *WorkConnectModule) UpdateWorkerAvailability(ctx context.Context, workerUserID int64, req dto.UpdateAvailabilityRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}
	if err := m.store.SetWorkerAvailability(ctx, workerUserID, req.AvailabilityStatus); err != nil {
		if persistence.IsNotFound(err) {
			return apperrors.ErrNotFound
		}
		return err
	}
	return nil
}

func (m *WorkConnectModule) SubmitReview(ctx context.Context, customerID, requestID int64, req dto.SubmitReviewRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}

	exists, err := m.store.RequestBelongsToCustomer(ctx, requestID, customerID)
	if err != nil {
		return err
	}
	if !exists {
		return apperrors.ErrForbidden
	}

	if err = m.store.CreateReview(ctx, requestID, customerID, req.Rating, req.Comment); err != nil {
		if persistence.IsNotFound(err) {
			return apperrors.ErrInvalidState
		}
		if persistence.IsUniqueViolation(err) {
			return apperrors.ErrRequestConflict
		}
		return err
	}
	return nil
}

func (m *WorkConnectModule) InitiatePayment(ctx context.Context, customerID, requestID int64, req dto.InitiatePaymentRequest) (db.Payment, error) {
	if err := req.Validate(); err != nil {
		return db.Payment{}, err
	}
	exists, err := m.store.RequestBelongsToCustomer(ctx, requestID, customerID)
	if err != nil {
		return db.Payment{}, err
	}
	if !exists {
		return db.Payment{}, apperrors.ErrForbidden
	}

	ref := persistence.BuildPaymentReference(req.Provider, requestID)
	return m.store.InitiatePayment(ctx, requestID, req.AmountETB, req.Provider, ref)
}

func (m *WorkConnectModule) CustomerDashboard(ctx context.Context, customerID int64) (db.CustomerDashboard, error) {
	return m.store.CustomerDashboard(ctx, customerID)
}

func (m *WorkConnectModule) WorkerDashboard(ctx context.Context, workerUserID int64) (db.WorkerDashboard, error) {
	return m.store.WorkerDashboard(ctx, workerUserID)
}

func (m *WorkConnectModule) AdminDashboard(ctx context.Context) (db.AdminDashboard, error) {
	return m.store.AdminDashboard(ctx)
}

func (m *WorkConnectModule) PendingWorkerVerifications(ctx context.Context) ([]db.WorkerCard, error) {
	return m.store.PendingWorkerVerifications(ctx)
}

func (m *WorkConnectModule) VerifyWorker(ctx context.Context, workerID int64, verified bool) error {
	if err := m.store.VerifyWorker(ctx, workerID, verified); err != nil {
		if persistence.IsNotFound(err) {
			return apperrors.ErrNotFound
		}
		return err
	}
	return nil
}

func (m *WorkConnectModule) ListMessageConversations(ctx context.Context, userID int64) ([]db.MessageConversation, error) {
	return m.store.ListMessageConversations(ctx, userID)
}

func (m *WorkConnectModule) ListMessagesByRequest(ctx context.Context, userID, requestID int64, query dto.ListMessagesQuery) ([]db.Message, error) {
	if query.Limit == 0 {
		query.Limit = 50
	}
	if err := query.Validate(); err != nil {
		return nil, err
	}

	customerUserID, workerUserID, status, err := m.store.GetRequestMessagingParticipants(ctx, requestID)
	if err != nil {
		if persistence.IsNotFound(err) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	if userID != customerUserID && userID != workerUserID {
		return nil, apperrors.ErrForbidden
	}

	if !messagingAllowedRequestStatus(status) {
		return nil, apperrors.ErrInvalidState
	}

	conversationID, err := m.store.UpsertMessageConversation(ctx, requestID, customerUserID, workerUserID)
	if err != nil {
		return nil, err
	}

	items, err := m.store.ListMessages(ctx, conversationID, query.Limit, query.BeforeID)
	if err != nil {
		return nil, err
	}

	_ = m.store.MarkConversationRead(ctx, conversationID, userID)
	return items, nil
}

func (m *WorkConnectModule) SendMessage(ctx context.Context, userID, requestID int64, req dto.SendMessageRequest) (db.Message, error) {
	if err := req.Validate(); err != nil {
		return db.Message{}, err
	}

	customerUserID, workerUserID, status, err := m.store.GetRequestMessagingParticipants(ctx, requestID)
	if err != nil {
		if persistence.IsNotFound(err) {
			return db.Message{}, apperrors.ErrNotFound
		}
		return db.Message{}, err
	}

	if userID != customerUserID && userID != workerUserID {
		return db.Message{}, apperrors.ErrForbidden
	}

	if !messagingAllowedRequestStatus(status) {
		return db.Message{}, apperrors.ErrInvalidState
	}

	convoID, err := m.store.UpsertMessageConversation(ctx, requestID, customerUserID, workerUserID)
	if err != nil {
		return db.Message{}, err
	}

	messageType := strings.TrimSpace(req.MessageType)
	if messageType == "" {
		messageType = db.MessageTypeText
	}

	item, err := m.store.CreateMessage(ctx, convoID, requestID, userID, strings.TrimSpace(req.Body), messageType)
	if err != nil {
		return db.Message{}, err
	}

	_ = m.store.MarkConversationRead(ctx, convoID, userID)
	return item, nil
}

func messagingAllowedRequestStatus(status string) bool {
	return status == db.RequestStatusAccepted || status == db.RequestStatusCompleted
}

func (m *WorkConnectModule) ParseToken(tokenString string) (AuthPrincipal, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AuthClaims{}, func(token *jwt.Token) (any, error) {
		return m.jwtSecret, nil
	})
	if err != nil {
		return AuthPrincipal{}, err
	}

	claims, ok := token.Claims.(*AuthClaims)
	if !ok || !token.Valid {
		return AuthPrincipal{}, apperrors.ErrUnauthorized
	}

	return AuthPrincipal{
		UserID:   claims.UserID,
		FullName: claims.FullName,
		Role:     claims.Role,
	}, nil
}

func (m *WorkConnectModule) generateToken(userID int64, fullName, role string) (string, error) {
	claims := AuthClaims{
		UserID:   userID,
		FullName: fullName,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.jwtSecret)
}
