package auth

import (
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"

	"github.com/go-chi/chi/v5"
)

func RegisterAuthRoutes(r chi.Router, handler rest.Handler) {
	authMiddleware := middleware.Auth(handler.Module().WorkConnect)

	r.Post("/register", handler.Register)
	r.Post("/login", handler.Login)
	r.With(authMiddleware).Get("/me", handler.Me)
}
