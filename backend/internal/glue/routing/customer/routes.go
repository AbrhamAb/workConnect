package customer

import (
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterCustomerRoutes(r chi.Router, handler rest.Handler) {
	authMiddleware := middleware.Auth(handler.Module().WorkConnect)
	r.Use(authMiddleware)
	r.Use(middleware.RequireRoles(db.RoleCustomer))

	r.Post("/requests", handler.CreateCustomerRequest)
	r.Get("/requests", handler.ListCustomerRequests)
	r.Post("/requests/{requestID}/review", handler.SubmitCustomerReview)
	r.Post("/requests/{requestID}/payments/initiate", handler.InitiateCustomerPayment)
	r.Get("/dashboard", handler.CustomerDashboard)
}
