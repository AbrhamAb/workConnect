package module

import (
	"database/sql"
	"os"
	"task-management-backend/internal/storage/persistence"
)

type Module struct {
	WorkConnect *WorkConnectModule
}

func New(db *sql.DB) *Module {
	store := persistence.NewStore(db)

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me"
	}

	return &Module{
		WorkConnect: NewWorkConnectModule(store, jwtSecret),
	}
}
