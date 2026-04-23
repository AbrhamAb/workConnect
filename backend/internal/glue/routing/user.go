package routing

import (
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterWorkConnectRoutes(r chi.Router, handler *rest.Handler) {
	r.Route("/auth", func(auth chi.Router) {
		auth.Post("/register", handler.Register)
		auth.Post("/login", handler.Login)
		auth.With(middleware.Auth(handler.Module().WorkConnect)).Get("/me", handler.Me)
	})

	r.Get("/workers", handler.ListWorkers)
	r.Get("/workers/{workerID}", handler.GetWorkerProfile)

	r.Route("/customer", func(customer chi.Router) {
		customer.Use(middleware.Auth(handler.Module().WorkConnect))
		customer.Use(middleware.RequireRoles(db.RoleCustomer))
		customer.Post("/requests", handler.CreateCustomerRequest)
		customer.Get("/requests", handler.ListCustomerRequests)
		customer.Post("/requests/{requestID}/review", handler.SubmitCustomerReview)
		customer.Post("/requests/{requestID}/payments/initiate", handler.InitiateCustomerPayment)
		customer.Get("/dashboard", handler.CustomerDashboard)
	})

	r.Route("/worker", func(worker chi.Router) {
		worker.Use(middleware.Auth(handler.Module().WorkConnect))
		worker.Use(middleware.RequireRoles(db.RoleWorker))
		worker.Get("/requests", handler.ListWorkerRequests)
		worker.Patch("/requests/{requestID}/decision", handler.WorkerDecision)
		worker.Patch("/availability", handler.WorkerAvailability)
		worker.Get("/dashboard", handler.WorkerDashboard)
	})

	r.Route("/messages", func(messages chi.Router) {
		messages.Use(middleware.Auth(handler.Module().WorkConnect))
		messages.Use(middleware.RequireRoles(db.RoleCustomer, db.RoleWorker))
		messages.Get("/conversations", handler.ListMessageConversations)
		messages.Get("/requests/{requestID}", handler.ListMessagesByRequest)
		messages.Post("/requests/{requestID}", handler.SendMessage)
	})

	r.Route("/admin", func(admin chi.Router) {
		admin.Use(middleware.Auth(handler.Module().WorkConnect))
		admin.Use(middleware.RequireRoles(db.RoleAdmin))
		admin.Get("/dashboard", handler.AdminDashboard)
		admin.Get("/workers/pending-verification", handler.PendingWorkers)
		admin.Patch("/workers/{workerID}/verify", handler.VerifyWorker)
	})
}
