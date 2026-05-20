package shared

import (
	"context"
	"strings"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	user "task-management-backend/internal/module/user"
	"task-management-backend/internal/storage/persistence"

	"github.com/golang-jwt/jwt/v5"
)

type SharedModule struct {
	store     persistence.Store
	jwtSecret []byte
}

func NewSharedModule(store persistence.Store, jwtSecret string) *SharedModule {
	return &SharedModule{store: store, jwtSecret: []byte(jwtSecret)}
}

func (s *SharedModule) GetProfile(ctx context.Context, userID int64) (db.User, error) {
	usr, err := s.store.GetUserByID(ctx, userID)
	if err != nil {
		return db.User{}, err
	}
	usr.PasswordHash = ""
	return usr, nil
}

func (s *SharedModule) ListWorkers(ctx context.Context, category, city, q, sort string) ([]db.WorkerCard, error) {
	return s.store.ListWorkers(ctx, category, city, q, sort)
}

func (s *SharedModule) GetWorkerDetails(ctx context.Context, workerID int64) (db.WorkerDetails, error) {
	worker, err := s.store.GetWorkerDetails(ctx, workerID)
	if persistence.IsNotFound(err) {
		return db.WorkerDetails{}, apperrors.ErrNotFound
	}
	return worker, err
}

func (s *SharedModule) ListMessageConversations(ctx context.Context, userID int64) ([]db.MessageConversation, error) {
	return s.store.ListMessageConversations(ctx, userID)
}

func (s *SharedModule) ListMessagesByRequest(ctx context.Context, userID, requestID int64, query dto.ListMessagesQuery) ([]db.Message, error) {
	if query.Limit == 0 {
		query.Limit = 50
	}

	customerUserID, workerUserID, status, err := s.store.GetRequestMessagingParticipants(ctx, requestID)
	if err != nil {
		if persistence.IsNotFound(err) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	if userID != customerUserID && userID != workerUserID {
		return nil, apperrors.ErrForbidden
	}

	if !AllowedRequestStatus(status) {
		return nil, apperrors.ErrInvalidState
	}

	conversationID, err := s.store.UpsertMessageConversation(ctx, requestID, customerUserID, workerUserID)
	if err != nil {
		return nil, err
	}

	items, err := s.store.ListMessages(ctx, conversationID, query.Limit, query.BeforeID)
	if err != nil {
		return nil, err
	}

	_ = s.store.MarkConversationRead(ctx, conversationID, userID)
	return items, nil
}

func (s *SharedModule) SendMessage(ctx context.Context, userID, requestID int64, req dto.SendMessageRequest) (db.Message, error) {
	customerUserID, workerUserID, status, err := s.store.GetRequestMessagingParticipants(ctx, requestID)
	if err != nil {
		if persistence.IsNotFound(err) {
			return db.Message{}, apperrors.ErrNotFound
		}
		return db.Message{}, err
	}

	if userID != customerUserID && userID != workerUserID {
		return db.Message{}, apperrors.ErrForbidden
	}

	if !AllowedRequestStatus(status) {
		return db.Message{}, apperrors.ErrInvalidState
	}

	convoID, err := s.store.UpsertMessageConversation(ctx, requestID, customerUserID, workerUserID)
	if err != nil {
		return db.Message{}, err
	}

	messageType := strings.TrimSpace(req.MessageType)
	if messageType == "" {
		messageType = db.MessageTypeText
	}

	item, err := s.store.CreateMessage(ctx, convoID, requestID, userID, strings.TrimSpace(req.Body), messageType)
	if err != nil {
		return db.Message{}, err
	}

	_ = s.store.MarkConversationRead(ctx, convoID, userID)
	return item, nil
}

func (s *SharedModule) ParseToken(tokenString string) (user.AuthPrincipal, error) {
	token, err := jwt.ParseWithClaims(tokenString, &user.AuthClaims{}, func(token *jwt.Token) (any, error) {
		return s.jwtSecret, nil
	})
	if err != nil {
		return user.AuthPrincipal{}, err
	}

	claims, ok := token.Claims.(*user.AuthClaims)
	if !ok || !token.Valid {
		return user.AuthPrincipal{}, apperrors.ErrUnauthorized
	}

	return user.AuthPrincipal{UserID: claims.UserID, FullName: claims.FullName, Role: claims.Role}, nil
}

func AllowedRequestStatus(status string) bool {
	return status == db.RequestStatusAccepted || status == db.RequestStatusCompleted
}
