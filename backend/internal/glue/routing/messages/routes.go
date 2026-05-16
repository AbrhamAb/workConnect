package messages

import (
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/model/db"

	"github.com/go-chi/chi/v5"
)

func RegisterMessageRoutes(r chi.Router, handler rest.Handler) {
	authMiddleware := middleware.Auth(handler.Module().WorkConnect)
	r.Use(authMiddleware)
	r.Use(middleware.RequireRoles(db.RoleCustomer, db.RoleWorker))

	r.Get("/conversations", handler.ListMessageConversations)
	r.Get("/requests/{requestID}", handler.ListMessagesByRequest)
	r.Post("/requests/{requestID}", handler.SendMessage)
}
