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
	request          db.ServiceRequestView
	belongs          bool
	payment          db.Payment
	verification     db.VerificationRequest
	customerDash     db.CustomerDashboard
	workerDash       db.WorkerDashboard
	reviewErr        error
	paymentErr       error
	verificationErr  error
	transitionErr    error
	portfolio        db.PortfolioItem
	portfolioItems   []db.PortfolioItem
	portfolioErr     error
	portfolioWorker  int64
	portfolioItemID  int64
	favorite         db.Favorite
	favorites        []db.Favorite
	favoriteErr      error
	favoriteCustomer int64
	favoriteWorker   int64
	photo            db.RequestPhoto
	photos           []db.RequestPhoto
	photoErr         error
	photoRequestID   int64
	photoID          int64
	registration     db.WorkerRegistration
	reviewWorkerID   int64
	reviewerID       int64
	reviewVerified   bool
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

func (s *p1StoreStub) ListCustomerFavorites(context.Context, int64) ([]db.Favorite, error) {
	return s.favorites, s.favoriteErr
}

func (s *p1StoreStub) GetCustomerFavorite(context.Context, int64, int64) (db.Favorite, error) {
	return s.favorite, s.favoriteErr
}

func (s *p1StoreStub) AddCustomerFavorite(_ context.Context, customerID, workerID int64) (db.Favorite, error) {
	s.favoriteCustomer = customerID
	s.favoriteWorker = workerID
	return s.favorite, s.favoriteErr
}

func (s *p1StoreStub) RemoveCustomerFavorite(_ context.Context, customerID, workerID int64) error {
	s.favoriteCustomer = customerID
	s.favoriteWorker = workerID
	return s.favoriteErr
}

func (s *p1StoreStub) ListRequestPhotos(context.Context, int64) ([]db.RequestPhoto, error) {
	return s.photos, s.photoErr
}

func (s *p1StoreStub) CreateRequestPhoto(_ context.Context, requestID int64, _ string) (db.RequestPhoto, error) {
	s.photoRequestID = requestID
	return s.photo, s.photoErr
}

func (s *p1StoreStub) DeleteRequestPhoto(_ context.Context, requestID, photoID int64) error {
	s.photoRequestID = requestID
	s.photoID = photoID
	return s.photoErr
}

func (s *p1StoreStub) RegisterWorker(_ context.Context, registration db.WorkerRegistration) (db.User, error) {
	s.registration = registration
	return db.User{ID: 41, FullName: registration.FullName, Role: db.RoleWorker}, nil
}

func (s *p1StoreStub) ReviewWorkerVerification(_ context.Context, workerID, reviewerID int64, verified bool, _ string) error {
	s.reviewWorkerID = workerID
	s.reviewerID = reviewerID
	s.reviewVerified = verified
	return nil
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

func TestFavoritesUseAuthenticatedCustomerOwnership(t *testing.T) {
	store := &p1StoreStub{
		favorite:  db.Favorite{ID: 3, CustomerID: 10, WorkerID: 7},
		favorites: []db.Favorite{{ID: 3, CustomerID: 10, WorkerID: 7}},
	}
	workConnect := NewWorkConnectModule(store, "test-secret")

	favorites, err := workConnect.ListCustomerFavorites(context.Background(), 10)
	if err != nil || len(favorites) != 1 || favorites[0].CustomerID != 10 {
		t.Fatalf("expected customer's own favorites, got favorites=%+v err=%v", favorites, err)
	}

	if _, err = workConnect.AddCustomerFavorite(context.Background(), 10, 7); err != nil || store.favoriteCustomer != 10 || store.favoriteWorker != 7 {
		t.Fatalf("expected add ownership context, customer=%d worker=%d err=%v", store.favoriteCustomer, store.favoriteWorker, err)
	}

	if err = workConnect.RemoveCustomerFavorite(context.Background(), 10, 7); err != nil || store.favoriteCustomer != 10 || store.favoriteWorker != 7 {
		t.Fatalf("expected remove ownership context, customer=%d worker=%d err=%v", store.favoriteCustomer, store.favoriteWorker, err)
	}
}

func TestFavoritesMissingRemovalMapsToNotFound(t *testing.T) {
	store := &p1StoreStub{favoriteErr: sql.ErrNoRows}
	workConnect := NewWorkConnectModule(store, "test-secret")

	if err := workConnect.RemoveCustomerFavorite(context.Background(), 10, 7); !errors.Is(err, apperrors.ErrNotFound) {
		t.Fatalf("expected missing favorite to be not found, got %v", err)
	}
}

func TestRequestPhotosUseRequestOwnershipContext(t *testing.T) {
	store := &p1StoreStub{
		photo:  db.RequestPhoto{ID: 22, RequestID: 9, PhotoURL: "data:image/png;base64,abc"},
		photos: []db.RequestPhoto{{ID: 22, RequestID: 9}},
	}
	workConnect := NewWorkConnectModule(store, "test-secret")

	photos, err := workConnect.ListRequestPhotos(context.Background(), 9)
	if err != nil || len(photos) != 1 || photos[0].RequestID != 9 {
		t.Fatalf("expected request photo retrieval, got photos=%+v err=%v", photos, err)
	}

	if _, err = workConnect.CreateRequestPhoto(context.Background(), 9, dto.RequestPhotoRequest{PhotoURL: "data:image/png;base64,abc"}); err != nil || store.photoRequestID != 9 {
		t.Fatalf("expected photo creation for request, request=%d err=%v", store.photoRequestID, err)
	}

	if err = workConnect.DeleteRequestPhoto(context.Background(), 9, 22); err != nil || store.photoRequestID != 9 || store.photoID != 22 {
		t.Fatalf("expected photo deletion for request, request=%d photo=%d err=%v", store.photoRequestID, store.photoID, err)
	}
}

func TestRequestPhotoMissingDeleteMapsToNotFound(t *testing.T) {
	store := &p1StoreStub{photoErr: sql.ErrNoRows}
	workConnect := NewWorkConnectModule(store, "test-secret")

	if err := workConnect.DeleteRequestPhoto(context.Background(), 9, 22); !errors.Is(err, apperrors.ErrNotFound) {
		t.Fatalf("expected missing photo to be not found, got %v", err)
	}
}

func TestWorkerRegistrationPassesProfileAndSkillsToAtomicStore(t *testing.T) {
	store := &p1StoreStub{}
	workConnect := NewWorkConnectModule(store, "test-secret")

	_, user, err := workConnect.Register(context.Background(), dto.RegisterRequest{
		FullName: "Worker Example", Email: "worker@example.com", Phone: "123456789", Role: "worker",
		Password: "password123", PrimarySkill: "Plumber", Skills: []string{"Plumbing"},
		Experience: "3 - 5 years", City: "Addis Ababa", Bio: "Experienced plumbing professional with field service history.",
	})
	if err != nil || user.Role != db.RoleWorker {
		t.Fatalf("expected worker registration, user=%+v err=%v", user, err)
	}
	if store.registration.ExperienceYears != 3 || store.registration.City != "Addis Ababa" || len(store.registration.Skills) != 2 {
		t.Fatalf("expected registration profile fields, got %+v", store.registration)
	}
}

func TestWorkerVerificationReviewPassesAtomicDecision(t *testing.T) {
	store := &p1StoreStub{}
	workConnect := NewWorkConnectModule(store, "test-secret")

	if err := workConnect.ReviewWorkerVerification(context.Background(), 7, 99, dto.ReviewWorkerRequest{Verified: true}); err != nil {
		t.Fatal(err)
	}
	if store.reviewWorkerID != 7 || store.reviewerID != 99 || !store.reviewVerified {
		t.Fatalf("expected approval context, worker=%d reviewer=%d verified=%v", store.reviewWorkerID, store.reviewerID, store.reviewVerified)
	}
}
