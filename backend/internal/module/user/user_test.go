package module

import (
	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"testing"
)

func TestEnsureUserIsActive_AllowsActiveUsers(t *testing.T) {
	if err := ensureUserIsActive(db.User{IsActive: true}); err != nil {
		t.Fatalf("expected active user to be allowed, got error: %v", err)
	}
}

func TestEnsureUserIsActive_RejectsInactiveUsers(t *testing.T) {
	err := ensureUserIsActive(db.User{IsActive: false})
	if err == nil {
		t.Fatal("expected inactive user to be rejected")
	}
	if err != apperrors.ErrUnauthorized {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}
