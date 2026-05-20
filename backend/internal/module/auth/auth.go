package auth

import (
	"context"
	"database/sql"
	stderrs "errors"
	"strings"
	"time"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	user "task-management-backend/internal/module/user"
	"task-management-backend/internal/storage/persistence"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthModule struct {
	store     persistence.Store
	jwtSecret []byte
}

func NewAuthModule(store persistence.Store, jwtSecret string) *AuthModule {
	return &AuthModule{store: store, jwtSecret: []byte(jwtSecret)}
}

func (a *AuthModule) Register(ctx context.Context, req dto.RegisterRequest) (string, db.User, error) {
	if err := req.Validate(); err != nil {
		return "", db.User{}, err
	}

	req.Role = strings.ToLower(strings.TrimSpace(req.Role))
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", db.User{}, err
	}

	user, err := a.store.CreateUser(ctx, req.FullName, strings.ToLower(req.Email), req.Phone, req.Role, string(hash))
	if err != nil {
		if persistence.IsUniqueViolation(err) {
			return "", db.User{}, apperrors.ErrUserAlreadyExists
		}
		return "", db.User{}, err
	}

	if user.Role == db.RoleWorker {
		if err = a.store.CreateWorkerProfile(ctx, user.ID); err != nil {
			return "", db.User{}, err
		}
	}

	token, err := a.generateToken(user.ID, user.FullName, user.Role)
	if err != nil {
		return "", db.User{}, err
	}

	user.PasswordHash = ""
	return token, user, nil
}

func (a *AuthModule) Login(ctx context.Context, req dto.LoginRequest) (*dto.UserLoginResponse, error) {
	user, err := a.store.GetUserByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		if stderrs.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrInvalidCredentials
		}
		return nil, err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperrors.ErrInvalidCredentials
	}

	token, err := a.generateToken(user.ID, user.FullName, user.Role)
	if err != nil {
		return nil, apperrors.ErrInvalidCredentials
	}

	return &dto.UserLoginResponse{ID: user.ID, FullName: user.FullName, Role: user.Role, Token: token}, nil
}

func (a *AuthModule) generateToken(userID int64, fullName, role string) (string, error) {
	claims := user.AuthClaims{
		UserID:   userID,
		FullName: fullName,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(5 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(a.jwtSecret)
}
