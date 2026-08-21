package module

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateTokenUsesApproximatelyOneHourExpiry(t *testing.T) {
	module := NewWorkConnectModule(nil, "test-secret")

	tokenString, err := module.generateToken(42, "Ada", "customer")
	if err != nil {
		t.Fatalf("generateToken returned error: %v", err)
	}

	token, err := jwt.ParseWithClaims(tokenString, &AuthClaims{}, func(token *jwt.Token) (any, error) {
		return []byte("test-secret"), nil
	})
	if err != nil {
		t.Fatalf("parse token error: %v", err)
	}

	claims, ok := token.Claims.(*AuthClaims)
	if !ok || claims.ExpiresAt == nil {
		t.Fatal("token claims missing expiry")
	}

	duration := time.Until(claims.ExpiresAt.Time)
	if duration < 50*time.Minute || duration > 70*time.Minute {
		t.Fatalf("expected token expiry around 1 hour, got %v", duration)
	}
}
