package public

import (
	"task-management-backend/internal/handler/rest"

	"github.com/go-chi/chi/v5"
)

func RegisterPublicRoutes(r chi.Router, handler rest.Handler) {
	r.Get("/Healthcheck", handler.HealthCheck)
	r.Get("/workers", handler.ListWorkers)
	r.Get("/workers/{workerID}", handler.GetWorkerProfile)
}
