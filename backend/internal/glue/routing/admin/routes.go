package admin

import (
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterAdminRoutes(r chi.Router, handler rest.Handler) {
	authMiddleware := middleware.Auth(handler.Module().WorkConnect)
	r.Use(authMiddleware)
	r.Use(middleware.RequireRoles(db.RoleAdmin))

	r.Get("/dashboard", handler.AdminDashboard)
	r.Get("/workers/pending-verification", handler.PendingWorkers)
	r.Patch("/workers/{workerID}/verify", handler.VerifyWorker)
}
