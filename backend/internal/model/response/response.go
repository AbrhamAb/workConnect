package response

import (
	"encoding/json"
	stderrs "errors"
	"net/http"

	projectErrors "task-management-backend/internal/constant/errors"
)

func SendSuccessResponse(w http.ResponseWriter, r *http.Request, statusCode int, message string, data any, meta ...any) {
	resp := Response{
		Status:  statusCode,
		Message: message,
		Data:    data,
	}

	if len(meta) > 0 && meta[0] != nil {
		resp.Meta = meta[0]
	}

	writeJSON(w, statusCode, resp)
}

func SendErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	statusCode := http.StatusBadRequest
	message := http.StatusText(statusCode)

	switch {
	case err == nil:
		err = stderrs.New(message)
	case stderrs.Is(err, projectErrors.ErrInvalidCredentials):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrInvalidCredentials]
	case stderrs.Is(err, projectErrors.ErrUserAlreadyExists):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrUserAlreadyExists]
	case stderrs.Is(err, projectErrors.ErrUnauthorized):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrUnauthorized]
	case stderrs.Is(err, projectErrors.ErrForbidden):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrForbidden]
	case stderrs.Is(err, projectErrors.ErrNotFound):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrNotFound]
	case stderrs.Is(err, projectErrors.ErrInvalidRole):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrInvalidRole]
	case stderrs.Is(err, projectErrors.ErrInvalidState):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrInvalidState]
	case stderrs.Is(err, projectErrors.ErrRequestConflict):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrRequestConflict]
	case stderrs.Is(err, projectErrors.ErrWorkerNotVerified):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrWorkerNotVerified]
	case stderrs.Is(err, projectErrors.ErrValidation):
		statusCode = projectErrors.ErrorMap[projectErrors.ErrValidation]
	}

	message = err.Error()
	writeJSON(w, statusCode, Response{
		Error: &ErrorResponse{
			Message:    message,
			StatusCode: statusCode,
		},
	})
}

func writeJSON(w http.ResponseWriter, statusCode int, payload any) {
	body, err := json.Marshal(payload)
	if err != nil {
		fallbackStatus := http.StatusInternalServerError
		fallbackBody, _ := json.Marshal(Response{
			Error: &ErrorResponse{
				Message:    http.StatusText(fallbackStatus),
				StatusCode: fallbackStatus,
			},
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(fallbackStatus)
		_, _ = w.Write(fallbackBody)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_, _ = w.Write(body)
}
