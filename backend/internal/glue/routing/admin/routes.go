package admin

import (
	"task-management-backend/internal/handler/middleware"
	handler "task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterAdminRoutes(r chi.Router, h handler.Handler) {
	r.Use(middleware.Auth(h.Module().WorkConnect))
	r.Use(middleware.RequireRoles(db.RoleAdmin))

	r.Get("/dashboard", h.AdminDashboard)
	r.Get("/workers/pending-verification", h.PendingWorkers)
	r.Patch("/workers/{workerID}/verify", h.VerifyWorker)
}
