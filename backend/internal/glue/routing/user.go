package routing

import (
	adminroutes "task-management-backend/internal/glue/routing/admin"
	authroutes "task-management-backend/internal/glue/routing/auth"
	customerroutes "task-management-backend/internal/glue/routing/customer"
	messageroutes "task-management-backend/internal/glue/routing/messages"
	publicroutes "task-management-backend/internal/glue/routing/public"
	workerroutes "task-management-backend/internal/glue/routing/worker"
	"task-management-backend/internal/handler/rest"

	"github.com/go-chi/chi/v5"
)

func RegisterWorkConnectRoutes(r chi.Router, handler rest.Handler) {
	publicroutes.RegisterPublicRoutes(r, handler)
	authroutes.RegisterAuthRoutes(r, handler)
	customerroutes.RegisterCustomerRoutes(r, handler)
	workerroutes.RegisterWorkerRoutes(r, handler)
	messageroutes.RegisterMessageRoutes(r, handler)
	adminroutes.RegisterAdminRoutes(r, handler)
}
