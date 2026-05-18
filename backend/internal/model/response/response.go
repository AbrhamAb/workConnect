package response

import (
	"encoding/json"
	"net/http"
	apperrors "task-management-backend/internal/constant/errors"
)

func JSON(w http.ResponseWriter, statusCode int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}

func Error(w http.ResponseWriter, statusCode int, message string) {
	JSON(w, statusCode, map[string]string{"message": message})
}

func SendErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	statusCode := http.StatusInternalServerError
	message := err.Error()

	switch err {
	case apperrors.ErrUnauthorized:
		statusCode = http.StatusUnauthorized
	case apperrors.ErrForbidden:
		statusCode = http.StatusForbidden
	case apperrors.ErrNotFound:
		statusCode = http.StatusNotFound
	case apperrors.ErrInvalidCredentials:
		statusCode = http.StatusUnauthorized
	case apperrors.ErrUserAlreadyExists:
		statusCode = http.StatusConflict
	case apperrors.ErrRequestConflict:
		statusCode = http.StatusConflict
	case apperrors.ErrInvalidState:
		statusCode = http.StatusBadRequest
	}

	JSON(w, statusCode, map[string]string{"message": message})
}
