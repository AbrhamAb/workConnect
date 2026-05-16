package worker

import (
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterWorkerRoutes(r chi.Router, handler rest.Handler) {
	authMiddleware := middleware.Auth(handler.Module().WorkConnect)
	r.Use(authMiddleware)
	r.Use(middleware.RequireRoles(db.RoleWorker))

	r.Get("/requests", handler.ListWorkerRequests)
	r.Patch("/requests/{requestID}/decision", handler.WorkerDecision)
	r.Patch("/requests/{requestID}/complete", handler.CompleteWorkerRequest)
	r.Patch("/availability", handler.WorkerAvailability)
	r.Get("/dashboard", handler.WorkerDashboard)
}
