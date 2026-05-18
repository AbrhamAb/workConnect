package base

import (
	"context"
	"net/http"
	"strconv"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/response"
	"task-management-backend/internal/module"
)

type Base struct {
	module *module.Module
}

func New(modules *module.Module) *Base {
	return &Base{module: modules}
}

func (b *Base) Module() *module.Module {
	return b.module
}

func (b *Base) ParseIDParam(r *http.Request, paramName string) (int64, error) {
	return strconv.ParseInt(r.PathValue(paramName), 10, 64)
}

func (b *Base) WriteError(w http.ResponseWriter, err error) {
	switch {
	case err == nil:
		return
	case err == apperrors.ErrUserAlreadyExists, err == apperrors.ErrRequestConflict:
		response.Error(w, http.StatusConflict, err.Error())
	case err == apperrors.ErrInvalidCredentials, err == apperrors.ErrUnauthorized:
		response.Error(w, http.StatusUnauthorized, err.Error())
	case err == apperrors.ErrForbidden:
		response.Error(w, http.StatusForbidden, err.Error())
	case err == apperrors.ErrNotFound:
		response.Error(w, http.StatusNotFound, err.Error())
	case err == apperrors.ErrInvalidState:
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
	default:
		response.Error(w, http.StatusBadRequest, err.Error())
	}
}

func (b *Base) AuthResponse(ctx context.Context, token string, user db.User) response.AuthResponse {
	resp := response.AuthResponse{Token: token, User: user}
	if user.Role == db.RoleWorker {
		if workerProfileID, _, err := b.module.WorkConnect.GetWorkerProfileInfo(ctx, user.ID); err == nil {
			resp.WorkerProfileID = &workerProfileID
		}
	}
	return resp
}
