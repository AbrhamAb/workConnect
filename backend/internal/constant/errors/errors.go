package errors

import (
	"errors"
	"net/http"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserAlreadyExists  = errors.New("user with this email already exists")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
	ErrNotFound           = errors.New("resource not found")
	ErrInvalidRole        = errors.New("invalid role")
	ErrInvalidState       = errors.New("invalid state transition")
	ErrRequestConflict    = errors.New("request conflict")
	ErrWorkerNotVerified  = errors.New("worker is not verified")
	ErrValidation         = errors.New("validation failed")
)

var ErrorMap = map[error]int{
	ErrInvalidCredentials: http.StatusBadRequest,
	ErrUserAlreadyExists:  http.StatusConflict,
	ErrUnauthorized:       http.StatusUnauthorized,
	ErrForbidden:          http.StatusForbidden,
	ErrNotFound:           http.StatusNotFound,
	ErrInvalidRole:        http.StatusBadRequest,
	ErrInvalidState:       http.StatusBadRequest,
	ErrRequestConflict:    http.StatusConflict,
	ErrWorkerNotVerified:  http.StatusForbidden,
	ErrValidation:         http.StatusBadRequest,
}
