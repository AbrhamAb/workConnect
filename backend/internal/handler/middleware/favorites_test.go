package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"task-management-backend/internal/module"
	user "task-management-backend/internal/module/user"
)

type favoriteAuthStub struct {
	module.WorkConnectService
	principal user.AuthPrincipal
	err       error
}

func (stub favoriteAuthStub) ParseToken(string) (user.AuthPrincipal, error) {
	return stub.principal, stub.err
}

func TestFavoritesRequireAuthentication(t *testing.T) {
	handler := Auth(favoriteAuthStub{})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/customer/favorites", nil)

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestFavoritesRequireCustomerRole(t *testing.T) {
	handler := RequireRoles("customer")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/customer/favorites/7", nil)
	request = request.WithContext(context.WithValue(request.Context(), principalCtxKey, user.AuthPrincipal{UserID: 4, Role: "worker"}))

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected %d, got %d", http.StatusForbidden, recorder.Code)
	}
}
