package routing

import (
	"net/http"

	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

type Route struct {
	Method      string
	Path        string
	Handler     http.HandlerFunc
	Middlewares []func(http.Handler) http.Handler
}

func RegisterRoutes(r chi.Router, routes []Route) {
	for _, route := range routes {
		handler := http.Handler(route.Handler)
		for i := len(route.Middlewares) - 1; i >= 0; i-- {
			handler = route.Middlewares[i](handler)
		}

		r.Method(route.Method, route.Path, handler)
	}
}

func NewRouter(handler rest.Handler) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.CORS)
	r.Use(chimiddleware.StripSlashes)

	r.Route("/api", func(api chi.Router) {
		api.Route("/v1", func(v1 chi.Router) {
			RegisterWorkConnectRoutes(v1, handler)
		})
	})

	return r
}
