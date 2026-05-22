package worker

import (
	"task-management-backend/internal/handler/middleware"
	handler "task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterWorkerRoutes(r chi.Router, h handler.Handler) {
	r.Use(middleware.Auth(h.Module().WorkConnect))
	r.Use(middleware.RequireRoles(db.RoleWorker))

	r.Get("/requests", h.ListWorkerRequests)
	r.Patch("/requests/{requestID}/decision", h.WorkerDecision)
	r.Patch("/requests/{requestID}/complete", h.CompleteWorkerRequest)
	r.Patch("/availability", h.WorkerAvailability)
	r.Get("/dashboard", h.WorkerDashboard)
}
