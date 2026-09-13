package initializer

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadEnvFile_PopulatesVariables(t *testing.T) {
	tempDir := t.TempDir()
	envPath := filepath.Join(tempDir, ".env")
	content := []byte("DATABASE_URL=postgres://example.test/db\nJWT_SECRET=super-secret\n")

	if err := os.WriteFile(envPath, content, 0o600); err != nil {
		t.Fatalf("write env file: %v", err)
	}

	oldDB, hadDB := os.LookupEnv("DATABASE_URL")
	oldJWT, hadJWT := os.LookupEnv("JWT_SECRET")
	defer func() {
		if hadDB {
			_ = os.Setenv("DATABASE_URL", oldDB)
		} else {
			_ = os.Unsetenv("DATABASE_URL")
		}
		if hadJWT {
			_ = os.Setenv("JWT_SECRET", oldJWT)
		} else {
			_ = os.Unsetenv("JWT_SECRET")
		}
	}()

	if err := os.Unsetenv("DATABASE_URL"); err != nil {
		t.Fatalf("unset DATABASE_URL: %v", err)
	}
	if err := os.Unsetenv("JWT_SECRET"); err != nil {
		t.Fatalf("unset JWT_SECRET: %v", err)
	}

	if err := loadEnvFile(envPath); err != nil {
		t.Fatalf("load env file: %v", err)
	}

	if got := os.Getenv("DATABASE_URL"); got != "postgres://example.test/db" {
		t.Fatalf("expected DATABASE_URL to be loaded, got %q", got)
	}

	if got := os.Getenv("JWT_SECRET"); got != "super-secret" {
		t.Fatalf("expected JWT_SECRET to be loaded, got %q", got)
	}
}
