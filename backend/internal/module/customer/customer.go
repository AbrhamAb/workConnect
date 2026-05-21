package customer

import (
	"context"
	"fmt"
	"strings"
	"time"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	"task-management-backend/internal/storage/persistence"
)

type CustomerModule struct{ store persistence.Store }

func NewCustomerModule(store persistence.Store) *CustomerModule { return &CustomerModule{store: store} }

func (c *CustomerModule) CreateServiceRequest(ctx context.Context, customerID int64, req dto.CreateServiceRequest) (db.ServiceRequestView, error) {
	if err := req.Validate(); err != nil {
		return db.ServiceRequestView{}, err
	}
	sr := db.ServiceRequest{ReferenceCode: fmt.Sprintf("WC-%d", time.Now().UnixNano()), CustomerID: customerID, WorkerID: req.WorkerID, CategoryID: req.CategoryID, Title: strings.TrimSpace(req.Title), Description: strings.TrimSpace(req.Description), LocationAddress: strings.TrimSpace(req.LocationAddress), BudgetETB: req.BudgetETB, Status: db.RequestStatusPending}
	if strings.TrimSpace(req.PreferredAt) != "" {
		if parsed, err := time.Parse(time.RFC3339, req.PreferredAt); err == nil {
			sr.PreferredAt = &parsed
		}
	}
	created, err := c.store.CreateServiceRequest(ctx, sr)
	if err != nil {
		return db.ServiceRequestView{}, err
	}
	return c.store.GetServiceRequestViewByID(ctx, created.ID)
}

func (c *CustomerModule) ListCustomerRequests(ctx context.Context, customerID int64) ([]db.ServiceRequestView, error) {
	return c.store.ListCustomerRequests(ctx, customerID)
}

func (c *CustomerModule) SubmitReview(ctx context.Context, customerID, requestID int64, req dto.SubmitReviewRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}
	exists, err := c.store.RequestBelongsToCustomer(ctx, requestID, customerID)
	if err != nil {
		return err
	}
	if !exists {
		return apperrors.ErrForbidden
	}
	if err = c.store.CreateReview(ctx, requestID, customerID, req.Rating, req.Comment); err != nil {
		if persistence.IsNotFound(err) {
			return apperrors.ErrInvalidState
		}
		if persistence.IsUniqueViolation(err) {
			return apperrors.ErrRequestConflict
		}
		return err
	}
	return nil
}

func (c *CustomerModule) InitiatePayment(ctx context.Context, customerID, requestID int64, req dto.InitiatePaymentRequest) (db.Review, error) {
	if err := req.Validate(); err != nil {
		return db.Review{}, err
	}
	exists, err := c.store.RequestBelongsToCustomer(ctx, requestID, customerID)
	if err != nil {
		return db.Review{}, err
	}
	if !exists {
		return db.Review{}, apperrors.ErrForbidden
	}
	ref := persistence.BuildPaymentReference(req.Provider, requestID)
	return c.store.InitiatePayment(ctx, requestID, req.AmountETB, req.Provider, ref)
}

func (c *CustomerModule) CustomerDashboard(ctx context.Context, customerID int64) (db.CustomerDashboard, error) {
	return c.store.CustomerDashboard(ctx, customerID)
}
