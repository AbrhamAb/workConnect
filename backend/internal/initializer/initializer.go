package initializer

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"task-management-backend/internal/glue/routing"
	"task-management-backend/internal/handler/rest"
	"task-management-backend/internal/module"
	"task-management-backend/platform/database"
	"task-management-backend/platform/logger"

	"go.uber.org/zap"
)

func Run() error {
	appLogger, err := logger.New()
	if err != nil {
		return fmt.Errorf("init logger: %w", err)
	}
	defer func() { _ = appLogger.Sync() }()

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
	router := routing.NewRouter(*handlers)

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
