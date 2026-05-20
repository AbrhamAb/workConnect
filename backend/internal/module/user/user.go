package user

import (
	"github.com/golang-jwt/jwt/v5"
)

// AuthClaims defines JWT claims for authentication
type AuthClaims struct {
	UserID   int64  `json:"userId"`
	FullName string `json:"fullName"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// AuthPrincipal represents an authenticated user
type AuthPrincipal struct {
	UserID   int64
	FullName string
	Role     string
}
