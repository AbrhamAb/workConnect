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
	persistence "task-management-backend/internal/storage/persistence"
	userpersistence "task-management-backend/internal/storage/persistence/user"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type WorkConnectModule struct {
	store     persistence.Store
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

func NewWorkConnectModule(store persistence.Store, jwtSecret string) *WorkConnectModule {
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
		if userpersistence.IsUniqueViolation(err) {
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

func (m *WorkConnectModule) Login(ctx context.Context, req dto.LoginRequest) (*dto.UserLoginResponse, error) { // login response should be pointer to avoid unnecessary copying and i have changed dto response type
	// if err := req.Validate(); err != nil {
	// 	return "", db.User{}, err
	// }

	// we must not validate on service logic we must finish on handler

	user, err := m.store.GetUserByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		if stderrs.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrInvalidCredentials
		}
		return nil, err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperrors.ErrInvalidCredentials
	}

	token, err := m.generateToken(user.ID, user.FullName, user.Role)
	if err != nil {
		return nil, apperrors.ErrInvalidCredentials
	}

	response := &dto.UserLoginResponse{
		ID:       user.ID,
		FullName: user.FullName,
		Role:     user.Role,
		Token:    token,
	}
	if user.Role == db.RoleWorker {
		workerProfileID, isWorker, profileErr := m.store.WorkerProfileByUserID(ctx, user.ID)
		if profileErr != nil {
			return nil, profileErr
		}
		if isWorker {
			response.WorkerProfileID = &workerProfileID
		}
	}

	return response, nil
}

func (m *WorkConnectModule) GetProfile(ctx context.Context, userID int64) (db.User, error) {
	user, err := m.store.GetUserByID(ctx, userID)
	if err != nil {
		return db.User{}, err
	}
	user.PasswordHash = ""
	return user, nil
}

func (m *WorkConnectModule) UpdateUserProfileImage(ctx context.Context, userID int64, profileImage string) (db.User, error) {
	user, err := m.store.UpdateUserProfileImage(ctx, userID, profileImage)
	if err != nil {
		return db.User{}, err
	}
	user.PasswordHash = ""
	return user, nil
}

func (m *WorkConnectModule) GetUserByID(ctx context.Context, userID int64) (db.User, error) {
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
	if userpersistence.IsNotFound(err) {
		return db.WorkerDetails{}, apperrors.ErrNotFound
	}
	return worker, err
}

func (m *WorkConnectModule) GetWorkerReviews(ctx context.Context, workerID int64) (db.WorkerReviewResponse, error) {
	reviews, err := m.store.GetWorkerReviews(ctx, workerID)
	if userpersistence.IsNotFound(err) {
		return db.WorkerReviewResponse{}, apperrors.ErrNotFound
	}
	return reviews, err
}

func (m *WorkConnectModule) ListPortfolioItems(ctx context.Context, workerID int64) ([]db.PortfolioItem, error) {
	return m.store.ListPortfolioItems(ctx, workerID)
}

func (m *WorkConnectModule) CreatePortfolioItem(ctx context.Context, workerID int64, req dto.PortfolioItemRequest) (db.PortfolioItem, error) {
	if err := req.Validate(); err != nil {
		return db.PortfolioItem{}, err
	}
	return m.store.CreatePortfolioItem(ctx, workerID, db.PortfolioItem{
		WorkerID: workerID, Image: req.Image, Title: req.Title, Description: req.Description,
	})
}

func (m *WorkConnectModule) UpdatePortfolioItem(ctx context.Context, workerID, itemID int64, req dto.PortfolioItemRequest) (db.PortfolioItem, error) {
	if err := req.Validate(); err != nil {
		return db.PortfolioItem{}, err
	}
	item, err := m.store.UpdatePortfolioItem(ctx, workerID, itemID, db.PortfolioItem{
		WorkerID: workerID, ID: itemID, Image: req.Image, Title: req.Title, Description: req.Description,
	})
	if userpersistence.IsNotFound(err) {
		return db.PortfolioItem{}, apperrors.ErrNotFound
	}
	return item, err
}

func (m *WorkConnectModule) DeletePortfolioItem(ctx context.Context, workerID, itemID int64) error {
	err := m.store.DeletePortfolioItem(ctx, workerID, itemID)
	if userpersistence.IsNotFound(err) {
		return apperrors.ErrNotFound
	}
	return err
}

func (m *WorkConnectModule) UpdateWorkerProfile(ctx context.Context, workerID int64, req dto.UpdateWorkerProfileRequest) (db.WorkerProfile, error) {
	update := db.WorkerProfileUpdate{
		City:               stringPtr(req.City),
		Headline:           stringPtr(req.Headline),
		Bio:                stringPtr(req.Bio),
		ExperienceYears:    intPtr(req.Experience),
		HourlyRateETB:      float64Ptr(req.HourlyRate),
		AvailabilityStatus: stringPtr(req.Availability),
		Skills:             req.Skills,
	}

	profile, err := m.store.UpdateWorkerProfile(ctx, workerID, update)
	if userpersistence.IsNotFound(err) {
		return db.WorkerProfile{}, apperrors.ErrNotFound
	}
	return profile, err
}

func stringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func intPtr(i int) *int {
	if i == 0 {
		return nil
	}
	return &i
}

func float64Ptr(f float64) *float64 {
	if f == 0 {
		return nil
	}
	return &f
}

func (m *WorkConnectModule) SubmitVerificationRequest(ctx context.Context, workerID int64, req dto.SubmitVerificationRequest) (db.VerificationRequest, error) {
	if len(req.Documents) == 0 {
		return db.VerificationRequest{}, fmt.Errorf("at least one document is required")
	}

	// Convert DTO documents to model documents
	documents := make([]db.WorkerDocument, len(req.Documents))
	for i, doc := range req.Documents {
		if doc.Type == "" || doc.FileURL == "" {
			return db.VerificationRequest{}, fmt.Errorf("document type and file URL are required")
		}
		documents[i] = db.WorkerDocument{
			DocumentType: doc.Type,
			FileURL:      doc.FileURL,
		}
	}

	verReq, err := m.store.SubmitVerificationRequest(ctx, workerID, documents)
	if err != nil {
		if strings.Contains(err.Error(), "worker not found") {
			return db.VerificationRequest{}, apperrors.ErrNotFound
		}
		return db.VerificationRequest{}, err
	}

	return verReq, nil
}

func (m *WorkConnectModule) GetVerificationStatus(ctx context.Context, workerID int64) (db.VerificationRequest, error) {
	verReq, err := m.store.GetVerificationStatus(ctx, workerID)
	if userpersistence.IsNotFound(err) {
		return db.VerificationRequest{}, apperrors.ErrNotFound
	}
	return verReq, err
}

func (m *WorkConnectModule) CreateServiceRequest(ctx context.Context, customerID int64, req dto.CreateServiceRequest) (db.ServiceRequestView, error) {
	if err := req.Validate(); err != nil {
		return db.ServiceRequestView{}, err
	}

	if req.CategoryID == 0 {
		categoryID, err := m.store.GetWorkerPrimaryCategoryID(ctx, req.WorkerID)
		if err != nil {
			return db.ServiceRequestView{}, err
		}
		req.CategoryID = categoryID
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

func (m *WorkConnectModule) GetServiceRequestByID(ctx context.Context, requestID int64) (db.ServiceRequestView, error) {
	return m.store.GetServiceRequestViewByID(ctx, requestID)
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
	if userpersistence.IsNotFound(err) {
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

func (m *WorkConnectModule) StartWorkerRequest(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error) {
	item, err := m.store.StartServiceRequestByWorker(ctx, workerUserID, requestID)
	if userpersistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	return item, err
}

func (m *WorkConnectModule) CompleteWorkerRequest(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error) {
	item, err := m.store.MarkServiceRequestCompletedByWorker(ctx, workerUserID, requestID)
	if userpersistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	return item, err
}

func (m *WorkConnectModule) ConfirmCustomerRequest(ctx context.Context, customerID, requestID int64) (db.ServiceRequestView, error) {
	item, err := m.store.ConfirmServiceRequestByCustomer(ctx, customerID, requestID)
	if userpersistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	return item, err
}

func (m *WorkConnectModule) CancelCustomerRequest(ctx context.Context, customerID, requestID int64) (db.ServiceRequestView, error) {
	item, err := m.store.CancelServiceRequestByCustomer(ctx, customerID, requestID)
	if userpersistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	return item, err
}

func (m *WorkConnectModule) UpdateWorkerAvailability(ctx context.Context, workerUserID int64, req dto.UpdateAvailabilityRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}
	if err := m.store.SetWorkerAvailability(ctx, workerUserID, req.AvailabilityStatus); err != nil {
		if userpersistence.IsNotFound(err) {
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
		if userpersistence.IsNotFound(err) {
			return apperrors.ErrInvalidState
		}
		if userpersistence.IsUniqueViolation(err) {
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
	request, err := m.store.GetServiceRequestViewByID(ctx, requestID)
	if err != nil {
		return db.Payment{}, err
	}
	if request.Status != db.RequestStatusCompleted && request.Status != db.RequestStatusConfirmed {
		return db.Payment{}, apperrors.ErrInvalidState
	}
	exists, err := m.store.RequestBelongsToCustomer(ctx, requestID, customerID)
	if err != nil {
		return db.Payment{}, err
	}
	if !exists {
		return db.Payment{}, apperrors.ErrForbidden
	}

	ref := userpersistence.BuildPaymentReference(req.Provider, requestID)
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
		if userpersistence.IsNotFound(err) {
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
		if userpersistence.IsNotFound(err) {
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
		if userpersistence.IsNotFound(err) {
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
	return status == db.RequestStatusAccepted || status == db.RequestStatusInProgress || status == db.RequestStatusCompleted || status == db.RequestStatusConfirmed
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
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.jwtSecret)
}
