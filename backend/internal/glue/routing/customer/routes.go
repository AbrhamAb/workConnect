package customer

import (
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterCustomerRoutes(r chi.Router, h rest.Handler) {
	r.Use(middleware.Auth(h.Module().WorkConnect))
	r.Use(middleware.RequireRoles(db.RoleCustomer))

	r.Get("/dashboard", h.CustomerDashboard)
	r.Post("/requests", h.CreateCustomerRequest)
	r.Get("/requests", h.ListCustomerRequests)
	r.Post("/requests/{requestID}/review", h.SubmitCustomerReview)
	r.Post("/requests/{requestID}/payments/initiate", h.InitiateCustomerPayment)
}
