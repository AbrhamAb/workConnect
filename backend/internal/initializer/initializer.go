package initializer

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"task-management-backend/internal/glue/routing"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/module"
	"task-management-backend/platform/database"
	"task-management-backend/platform/logger"

	"go.uber.org/zap"
)

func loadEnvFile(path string) error {
	file, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	defer func() { _ = file.Close() }()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		line = strings.TrimPrefix(line, "export ")
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		if key == "" {
			continue
		}

		if _, exists := os.LookupEnv(key); exists {
			continue
		}

		value = strings.Trim(value, `"'`)
		if err = os.Setenv(key, value); err != nil {
			return err
		}
	}

	return scanner.Err()
}

func Run() error {
	appLogger, err := logger.New()
	if err != nil {
		return fmt.Errorf("init logger: %w", err)
	}
	defer func() { _ = appLogger.Sync() }()

	if err = loadEnvFile(".env"); err != nil {
		return fmt.Errorf("load env file: %w", err)
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	dbConn, err := database.Connect(dbURL)
	if err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	defer dbConn.Close()

	modules := module.New(dbConn)
	handlers := rest.New(modules)
	router := routing.NewRouter(handlers)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("starting server on port %s", port)
	appLogger.Info("server started", zap.String("port", port))

	if err = http.ListenAndServe(":"+port, router); err != nil {
		return fmt.Errorf("start server: %w", err)
	}

	return nil
}
