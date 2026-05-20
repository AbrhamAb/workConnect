package admin

import (
	"context"
	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/storage/persistence"
)

// AdminModule handles all admin-related operations
type AdminModule struct {
	store persistence.Store
}

func NewAdminModule(store persistence.Store) *AdminModule {
	return &AdminModule{store: store}
}

// PendingWorkerVerifications lists all workers pending verification
func (a *AdminModule) PendingWorkerVerifications(ctx context.Context) ([]db.WorkerCard, error) {
	return a.store.PendingWorkerVerifications(ctx)
}

// VerifyWorker verifies or denies a worker account
func (a *AdminModule) VerifyWorker(ctx context.Context, workerID int64, verified bool) error {
	if err := a.store.VerifyWorker(ctx, workerID, verified); err != nil {
		if persistence.IsNotFound(err) {
			return apperrors.ErrNotFound
		}
		return err
	}
	return nil
}

// AdminDashboard returns admin dashboard data (platform stats, pending verifications)
func (a *AdminModule) AdminDashboard(ctx context.Context) (db.AdminDashboard, error) {
	return a.store.AdminDashboard(ctx)
}
