package middleware

import (
	"context"
	"net/http"
	"strings"
	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/response"
	"task-management-backend/internal/module"
)

type ctxKey string

const principalCtxKey ctxKey = "principal"

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func Auth(workconnectModule *module.WorkConnectModule) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Error(w, http.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
				return
			}

			split := strings.SplitN(authHeader, " ", 2)
			if len(split) != 2 || !strings.EqualFold(split[0], "Bearer") {
				response.Error(w, http.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
				return
			}

			principal, err := workconnectModule.ParseToken(split[1])
			if err != nil {
				response.Error(w, http.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
				return
			}

			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), principalCtxKey, principal)))
		})
	}
}

func RequireRoles(roles ...string) func(next http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		allowed[strings.ToLower(strings.TrimSpace(role))] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			principal, ok := PrincipalFromContext(r.Context())
			if !ok {
				response.Error(w, http.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
				return
			}

			if _, isAllowed := allowed[strings.ToLower(principal.Role)]; !isAllowed {
				response.Error(w, http.StatusForbidden, apperrors.ErrForbidden.Error())
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func PrincipalFromContext(ctx context.Context) (module.AuthPrincipal, bool) {
	principal, ok := ctx.Value(principalCtxKey).(module.AuthPrincipal)
	return principal, ok
}
