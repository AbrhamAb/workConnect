package base

import (
	"context"
	"net/http"
	"strconv"

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

func (b *Base) WriteError(w http.ResponseWriter, r *http.Request, err error) {
	if err == nil {
		return
	}

	response.SendErrorResponse(w, r, err)
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
