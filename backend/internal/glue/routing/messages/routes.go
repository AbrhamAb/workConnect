package messages

import (
	"task-management-backend/internal/handler/middleware"
	handler "task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterMessageRoutes(r chi.Router, h handler.Handler) {
	r.Use(middleware.Auth(h.Module().WorkConnect))
	r.Use(middleware.RequireRoles(db.RoleCustomer, db.RoleWorker))

	r.Get("/conversations", h.ListMessageConversations)
	r.Get("/requests/{requestID}", h.ListMessagesByRequest)
	r.Post("/requests/{requestID}", h.SendMessage)
}
