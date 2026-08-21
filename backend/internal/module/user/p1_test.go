package module

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	persistence "task-management-backend/internal/storage/persistence"

	"github.com/golang-jwt/jwt/v5"
)

type p1StoreStub struct {
	persistence.Store
	request         db.ServiceRequestView
	belongs         bool
	payment         db.Payment
	verification    db.VerificationRequest
	customerDash    db.CustomerDashboard
	workerDash      db.WorkerDashboard
	reviewErr       error
	paymentErr      error
	verificationErr error
	transitionErr   error
	portfolio       db.PortfolioItem
	portfolioItems  []db.PortfolioItem
	portfolioErr    error
	portfolioWorker int64
	portfolioItemID int64
}

func (s *p1StoreStub) GetServiceRequestViewByID(context.Context, int64) (db.ServiceRequestView, error) {
	return s.request, nil
}

func (s *p1StoreStub) RequestBelongsToCustomer(context.Context, int64, int64) (bool, error) {
	return s.belongs, nil
}

func (s *p1StoreStub) InitiatePayment(context.Context, int64, float64, string, string) (db.Payment, error) {
	return s.payment, s.paymentErr
}

func (s *p1StoreStub) CreateReview(context.Context, int64, int64, int, string) error {
	return s.reviewErr
}

func (s *p1StoreStub) UpdateServiceRequestStatusByWorker(context.Context, int64, int64, string) (db.ServiceRequestView, error) {
	return s.request, s.transitionErr
}

func (s *p1StoreStub) StartServiceRequestByWorker(context.Context, int64, int64) (db.ServiceRequestView, error) {
	return s.request, s.transitionErr
}

func (s *p1StoreStub) MarkServiceRequestCompletedByWorker(context.Context, int64, int64) (db.ServiceRequestView, error) {
	return s.request, s.transitionErr
}

func (s *p1StoreStub) ConfirmServiceRequestByCustomer(context.Context, int64, int64) (db.ServiceRequestView, error) {
	return s.request, s.transitionErr
}

func (s *p1StoreStub) SubmitVerificationRequest(context.Context, int64, []db.WorkerDocument) (db.VerificationRequest, error) {
	return s.verification, s.verificationErr
}

func (s *p1StoreStub) CustomerDashboard(context.Context, int64) (db.CustomerDashboard, error) {
	return s.customerDash, nil
}

func (s *p1StoreStub) WorkerDashboard(context.Context, int64) (db.WorkerDashboard, error) {
	return s.workerDash, nil
}

func (s *p1StoreStub) ListPortfolioItems(context.Context, int64) ([]db.PortfolioItem, error) {
	return s.portfolioItems, s.portfolioErr
}

func (s *p1StoreStub) CreatePortfolioItem(_ context.Context, workerID int64, item db.PortfolioItem) (db.PortfolioItem, error) {
	s.portfolioWorker = workerID
	return s.portfolio, s.portfolioErr
}

func (s *p1StoreStub) UpdatePortfolioItem(_ context.Context, workerID, itemID int64, item db.PortfolioItem) (db.PortfolioItem, error) {
	s.portfolioWorker = workerID
	s.portfolioItemID = itemID
	return s.portfolio, s.portfolioErr
}

func (s *p1StoreStub) DeletePortfolioItem(_ context.Context, workerID, itemID int64) error {
	s.portfolioWorker = workerID
	s.portfolioItemID = itemID
	return s.portfolioErr
}

func TestParseTokenRejectsInvalidAndExpiredTokens(t *testing.T) {
	workConnect := NewWorkConnectModule(nil, "test-secret")

	if _, err := workConnect.ParseToken("not-a-jwt"); err == nil {
		t.Fatal("expected invalid token to be rejected")
	}

	expiredClaims := AuthClaims{
		UserID: 42,
		Role:   "customer",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
		},
	}
	expiredToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims).SignedString([]byte("test-secret"))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workConnect.ParseToken(expiredToken); err == nil {
		t.Fatal("expected expired token to be rejected")
	}
}

func TestPaymentRequiresOwnedCompletedRequest(t *testing.T) {
	store := &p1StoreStub{
		request: db.ServiceRequestView{ServiceRequest: db.ServiceRequest{Status: db.RequestStatusCompleted}},
		belongs: true,
		payment: db.Payment{Status: "pending"},
	}
	workConnect := NewWorkConnectModule(store, "test-secret")

	payment, err := workConnect.InitiatePayment(context.Background(), 7, 9, dto.InitiatePaymentRequest{
		Provider:  "cash",
		AmountETB: 100,
	})
	if err != nil || payment.Status != "pending" {
		t.Fatalf("expected owned completed request payment, got payment=%+v err=%v", payment, err)
	}

	store.belongs = false
	if _, err = workConnect.InitiatePayment(context.Background(), 8, 9, dto.InitiatePaymentRequest{
		Provider:  "cash",
		AmountETB: 100,
	}); !errors.Is(err, apperrors.ErrForbidden) {
		t.Fatalf("expected wrong customer to be forbidden, got %v", err)
	}
}

func TestPaymentRejectsIneligibleRequest(t *testing.T) {
	store := &p1StoreStub{
		request: db.ServiceRequestView{ServiceRequest: db.ServiceRequest{Status: db.RequestStatusPending}},
		belongs: true,
	}
	workConnect := NewWorkConnectModule(store, "test-secret")

	if _, err := workConnect.InitiatePayment(context.Background(), 7, 9, dto.InitiatePaymentRequest{
		Provider:  "cash",
		AmountETB: 100,
	}); !errors.Is(err, apperrors.ErrInvalidState) {
		t.Fatalf("expected ineligible request to be rejected, got %v", err)
	}
}

func TestRequestLifecycleMapsInvalidTransitions(t *testing.T) {
	store := &p1StoreStub{transitionErr: sql.ErrNoRows}
	workConnect := NewWorkConnectModule(store, "test-secret")

	checks := []struct {
		name string
		call func() error
	}{
		{"accept", func() error {
			_, err := workConnect.WorkerDecision(context.Background(), 2, 3, dto.WorkerDecisionRequest{Decision: "accept"})
			return err
		}},
		{"start", func() error {
			_, err := workConnect.StartWorkerRequest(context.Background(), 2, 3)
			return err
		}},
		{"complete", func() error {
			_, err := workConnect.CompleteWorkerRequest(context.Background(), 2, 3)
			return err
		}},
		{"confirm", func() error {
			_, err := workConnect.ConfirmCustomerRequest(context.Background(), 2, 3)
			return err
		}},
	}

	for _, check := range checks {
		t.Run(check.name, func(t *testing.T) {
			if err := check.call(); !errors.Is(err, apperrors.ErrInvalidState) {
				t.Fatalf("expected invalid transition, got %v", err)
			}
		})
	}
}

func TestReviewRequiresOwnershipAndDatabaseState(t *testing.T) {
	store := &p1StoreStub{belongs: false}
	workConnect := NewWorkConnectModule(store, "test-secret")
	review := dto.SubmitReviewRequest{Rating: 5, Comment: "Great"}

	if err := workConnect.SubmitReview(context.Background(), 8, 9, review); !errors.Is(err, apperrors.ErrForbidden) {
		t.Fatalf("expected wrong customer to be forbidden, got %v", err)
	}

	store.belongs = true
	store.reviewErr = sql.ErrNoRows
	if err := workConnect.SubmitReview(context.Background(), 7, 9, review); !errors.Is(err, apperrors.ErrInvalidState) {
		t.Fatalf("expected review before confirmation to be rejected, got %v", err)
	}

	store.reviewErr = errors.New("duplicate key value violates unique constraint")
	if err := workConnect.SubmitReview(context.Background(), 7, 9, review); !errors.Is(err, apperrors.ErrRequestConflict) {
		t.Fatalf("expected duplicate review conflict, got %v", err)
	}
}

func TestVerificationSubmissionAndDashboardCounts(t *testing.T) {
	store := &p1StoreStub{
		verification: db.VerificationRequest{Status: "pending"},
		customerDash: db.CustomerDashboard{CompletedRequests: 2, ConfirmedRequests: 1},
		workerDash:   db.WorkerDashboard{CompletedJobs: 3, ConfirmedJobs: 4},
	}
	workConnect := NewWorkConnectModule(store, "test-secret")

	verification, err := workConnect.SubmitVerificationRequest(context.Background(), 4, dto.SubmitVerificationRequest{
		Documents: []dto.VerificationDocument{{Type: "government_id", FileURL: "data:image/png;base64,abc"}},
	})
	if err != nil || verification.Status != "pending" {
		t.Fatalf("expected pending verification, got verification=%+v err=%v", verification, err)
	}

	customer, err := workConnect.CustomerDashboard(context.Background(), 7)
	if err != nil || customer.CompletedRequests == customer.ConfirmedRequests {
		t.Fatalf("expected separate customer counts, got %+v err=%v", customer, err)
	}
	worker, err := workConnect.WorkerDashboard(context.Background(), 8)
	if err != nil || worker.CompletedJobs == worker.ConfirmedJobs {
		t.Fatalf("expected separate worker counts, got %+v err=%v", worker, err)
	}
}

func TestPortfolioCRUDUsesAuthenticatedWorkerOwnership(t *testing.T) {
	store := &p1StoreStub{
		portfolio:      db.PortfolioItem{ID: 12, WorkerID: 7, Image: "https://example.com/work.jpg", Title: "Project"},
		portfolioItems: []db.PortfolioItem{{ID: 12, WorkerID: 7}},
	}
	workConnect := NewWorkConnectModule(store, "test-secret")
	req := dto.PortfolioItemRequest{Image: "https://example.com/work.jpg", Title: "Project"}

	items, err := workConnect.ListPortfolioItems(context.Background(), 7)
	if err != nil || len(items) != 1 || items[0].WorkerID != 7 {
		t.Fatalf("expected portfolio retrieval for worker, got items=%+v err=%v", items, err)
	}

	if _, err = workConnect.CreatePortfolioItem(context.Background(), 7, req); err != nil || store.portfolioWorker != 7 {
		t.Fatalf("expected create to use authenticated worker, worker=%d err=%v", store.portfolioWorker, err)
	}

	if _, err = workConnect.UpdatePortfolioItem(context.Background(), 7, 12, req); err != nil || store.portfolioWorker != 7 || store.portfolioItemID != 12 {
		t.Fatalf("expected update ownership context, worker=%d item=%d err=%v", store.portfolioWorker, store.portfolioItemID, err)
	}

	if err = workConnect.DeletePortfolioItem(context.Background(), 7, 12); err != nil || store.portfolioWorker != 7 || store.portfolioItemID != 12 {
		t.Fatalf("expected delete ownership context, worker=%d item=%d err=%v", store.portfolioWorker, store.portfolioItemID, err)
	}
}

func TestPortfolioModificationErrorsPropagateAsNotFound(t *testing.T) {
	store := &p1StoreStub{portfolioErr: sql.ErrNoRows}
	workConnect := NewWorkConnectModule(store, "test-secret")
	req := dto.PortfolioItemRequest{Image: "https://example.com/work.jpg", Title: "Project"}

	if _, err := workConnect.UpdatePortfolioItem(context.Background(), 7, 12, req); !errors.Is(err, apperrors.ErrNotFound) {
		t.Fatalf("expected update of another/missing worker item to be not found, got %v", err)
	}
	if err := workConnect.DeletePortfolioItem(context.Background(), 7, 12); !errors.Is(err, apperrors.ErrNotFound) {
		t.Fatalf("expected delete of another/missing worker item to be not found, got %v", err)
	}
}
