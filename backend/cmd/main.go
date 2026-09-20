package main

import (
	"log"
	"task-management-backend/internal/initializer"
)

func main() {
	if err := initializer.Run(); err != nil {
		log.Fatalf("application failed: %v", err)
	}
}
