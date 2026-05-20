package worker

import (
	"context"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	shared "task-management-backend/internal/module/shared"
	"task-management-backend/internal/storage/persistence"
)

type WorkerModule struct{ store persistence.Store }

func NewWorkerModule(store persistence.Store) *WorkerModule { return &WorkerModule{store: store} }

func (w *WorkerModule) GetWorkerProfileInfo(ctx context.Context, userID int64) (int64, bool, error) {
	return w.store.WorkerProfileByUserID(ctx, userID)
}
func (w *WorkerModule) ListWorkerRequests(ctx context.Context, workerUserID int64) ([]db.ServiceRequestView, error) {
	return w.store.ListWorkerRequests(ctx, workerUserID)
}

func (w *WorkerModule) WorkerDecision(ctx context.Context, workerUserID, requestID int64, req dto.WorkerDecisionRequest) (db.ServiceRequestView, error) {
	if err := req.Validate(); err != nil {
		return db.ServiceRequestView{}, err
	}
	status := db.RequestStatusRejected
	if req.Decision == "accept" {
		status = db.RequestStatusAccepted
	}
	item, err := w.store.UpdateServiceRequestStatusByWorker(ctx, workerUserID, requestID, status)
	if persistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	if err == nil && status == db.RequestStatusAccepted {
		customerUserID, assignedWorkerUserID, requestStatus, accessErr := w.store.GetRequestMessagingParticipants(ctx, requestID)
		if accessErr == nil && shared.AllowedRequestStatus(requestStatus) {
			_, _ = w.store.UpsertMessageConversation(ctx, requestID, customerUserID, assignedWorkerUserID)
		}
	}
	return item, err
}

func (w *WorkerModule) CompleteWorkerRequest(ctx context.Context, workerUserID, requestID int64) (db.ServiceRequestView, error) {
	item, err := w.store.MarkServiceRequestCompletedByWorker(ctx, workerUserID, requestID)
	if persistence.IsNotFound(err) {
		return db.ServiceRequestView{}, apperrors.ErrInvalidState
	}
	return item, err
}

func (w *WorkerModule) UpdateWorkerAvailability(ctx context.Context, workerUserID int64, req dto.UpdateAvailabilityRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}
	if err := w.store.SetWorkerAvailability(ctx, workerUserID, req.AvailabilityStatus); err != nil {
		if persistence.IsNotFound(err) {
			return apperrors.ErrNotFound
		}
		return err
	}
	return nil
}

func (w *WorkerModule) WorkerDashboard(ctx context.Context, workerUserID int64) (db.WorkerDashboard, error) {
	return w.store.WorkerDashboard(ctx, workerUserID)
}
