package routing

import (
	"net/http"

	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterWorkConnectRoutes(r chi.Router, handler rest.Handler) {
	authMiddleware := middleware.Auth(handler.Module().WorkConnect)

	RegisterRoutes(r, []Route{
		{
			Method:  http.MethodGet,
			Path:    "/Healthcheck",
			Handler: handler.HealthCheck,
		},
		{
			Method:  http.MethodGet,
			Path:    "/workers",
			Handler: handler.ListWorkers,
		},
		{
			Method:  http.MethodGet,
			Path:    "/workers/{workerID}",
			Handler: handler.GetWorkerProfile,
		},
	})

	r.Route("/auth", func(auth chi.Router) {
		RegisterRoutes(auth, []Route{
			{
				Method:  http.MethodPost,
				Path:    "/register",
				Handler: handler.Register,
			},
			{
				Method:  http.MethodPost,
				Path:    "/login",
				Handler: handler.Login,
			},
			{
				Method:  http.MethodGet,
				Path:    "/me",
				Handler: handler.Me,
				Middlewares: []func(http.Handler) http.Handler{
					authMiddleware,
				},
			},
		})
	})

	r.Route("/customer", func(customer chi.Router) {
		protected := []func(http.Handler) http.Handler{
			authMiddleware,
			middleware.RequireRoles(db.RoleCustomer),
		}

		RegisterRoutes(customer, []Route{
			{
				Method:      http.MethodPost,
				Path:        "/requests",
				Handler:     handler.CreateCustomerRequest,
				Middlewares: protected,
			},
			{
				Method:      http.MethodGet,
				Path:        "/requests",
				Handler:     handler.ListCustomerRequests,
				Middlewares: protected,
			},
			{
				Method:      http.MethodPost,
				Path:        "/requests/{requestID}/review",
				Handler:     handler.SubmitCustomerReview,
				Middlewares: protected,
			},
			{
				Method:      http.MethodPost,
				Path:        "/requests/{requestID}/payments/initiate",
				Handler:     handler.InitiateCustomerPayment,
				Middlewares: protected,
			},
			{
				Method:      http.MethodGet,
				Path:        "/dashboard",
				Handler:     handler.CustomerDashboard,
				Middlewares: protected,
			},
		})
	})

	r.Route("/worker", func(worker chi.Router) {
		protected := []func(http.Handler) http.Handler{
			authMiddleware,
			middleware.RequireRoles(db.RoleWorker),
		}

		RegisterRoutes(worker, []Route{
			{
				Method:      http.MethodGet,
				Path:        "/requests",
				Handler:     handler.ListWorkerRequests,
				Middlewares: protected,
			},
			{
				Method:      http.MethodPatch,
				Path:        "/requests/{requestID}/decision",
				Handler:     handler.WorkerDecision,
				Middlewares: protected,
			},
			{
				Method:      http.MethodPatch,
				Path:        "/requests/{requestID}/complete",
				Handler:     handler.CompleteWorkerRequest,
				Middlewares: protected,
			},
			{
				Method:      http.MethodPatch,
				Path:        "/availability",
				Handler:     handler.WorkerAvailability,
				Middlewares: protected,
			},
			{
				Method:      http.MethodGet,
				Path:        "/dashboard",
				Handler:     handler.WorkerDashboard,
				Middlewares: protected,
			},
		})
	})

	r.Route("/messages", func(messages chi.Router) {
		protected := []func(http.Handler) http.Handler{
			authMiddleware,
			middleware.RequireRoles(db.RoleCustomer, db.RoleWorker),
		}

		RegisterRoutes(messages, []Route{
			{
				Method:      http.MethodGet,
				Path:        "/conversations",
				Handler:     handler.ListMessageConversations,
				Middlewares: protected,
			},
			{
				Method:      http.MethodGet,
				Path:        "/requests/{requestID}",
				Handler:     handler.ListMessagesByRequest,
				Middlewares: protected,
			},
			{
				Method:      http.MethodPost,
				Path:        "/requests/{requestID}",
				Handler:     handler.SendMessage,
				Middlewares: protected,
			},
		})
	})

	r.Route("/admin", func(admin chi.Router) {
		protected := []func(http.Handler) http.Handler{
			authMiddleware,
			middleware.RequireRoles(db.RoleAdmin),
		}

		RegisterRoutes(admin, []Route{
			{
				Method:      http.MethodGet,
				Path:        "/dashboard",
				Handler:     handler.AdminDashboard,
				Middlewares: protected,
			},
			{
				Method:      http.MethodGet,
				Path:        "/workers/pending-verification",
				Handler:     handler.PendingWorkers,
				Middlewares: protected,
			},
			{
				Method:      http.MethodPatch,
				Path:        "/workers/{workerID}/verify",
				Handler:     handler.VerifyWorker,
				Middlewares: protected,
			},
		})
	})
}
