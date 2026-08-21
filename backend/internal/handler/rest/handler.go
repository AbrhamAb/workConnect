package rest

import (
	"net/http"

	restuser "task-management-backend/internal/handler/rest/user"
	"task-management-backend/internal/module"
)

type Handler interface {
	Module() *module.Module
	HealthCheck(w http.ResponseWriter, r *http.Request)
	Register(w http.ResponseWriter, r *http.Request)
	Login(w http.ResponseWriter, r *http.Request)
	Me(w http.ResponseWriter, r *http.Request)
	UpdateCurrentUser(w http.ResponseWriter, r *http.Request)
	ListWorkers(w http.ResponseWriter, r *http.Request)
	GetWorkerProfile(w http.ResponseWriter, r *http.Request)
	GetWorkerReviews(w http.ResponseWriter, r *http.Request)
	UpdateWorkerProfile(w http.ResponseWriter, r *http.Request)
	SubmitVerificationRequest(w http.ResponseWriter, r *http.Request)
	GetVerificationStatus(w http.ResponseWriter, r *http.Request)
	CreateCustomerRequest(w http.ResponseWriter, r *http.Request)
	ListCustomerRequests(w http.ResponseWriter, r *http.Request)
	GetCustomerRequest(w http.ResponseWriter, r *http.Request)
	SubmitCustomerReview(w http.ResponseWriter, r *http.Request)
	InitiateCustomerPayment(w http.ResponseWriter, r *http.Request)
	CustomerDashboard(w http.ResponseWriter, r *http.Request)
	ListWorkerRequests(w http.ResponseWriter, r *http.Request)
	GetWorkerRequest(w http.ResponseWriter, r *http.Request)
	WorkerDecision(w http.ResponseWriter, r *http.Request)
	StartWorkerRequest(w http.ResponseWriter, r *http.Request)
	CompleteWorkerRequest(w http.ResponseWriter, r *http.Request)
	ConfirmCustomerRequest(w http.ResponseWriter, r *http.Request)
	CancelCustomerRequest(w http.ResponseWriter, r *http.Request)
	WorkerAvailability(w http.ResponseWriter, r *http.Request)
	WorkerDashboard(w http.ResponseWriter, r *http.Request)
	AdminDashboard(w http.ResponseWriter, r *http.Request)
	PendingWorkers(w http.ResponseWriter, r *http.Request)
	VerifyWorker(w http.ResponseWriter, r *http.Request)
	ListMessageConversations(w http.ResponseWriter, r *http.Request)
	ListMessagesByRequest(w http.ResponseWriter, r *http.Request)
	SendMessage(w http.ResponseWriter, r *http.Request)
	ListPortfolioItems(w http.ResponseWriter, r *http.Request)
	CreatePortfolioItem(w http.ResponseWriter, r *http.Request)
	UpdatePortfolioItem(w http.ResponseWriter, r *http.Request)
	DeletePortfolioItem(w http.ResponseWriter, r *http.Request)
}

func New(modules *module.Module) Handler {
	return restuser.New(modules)
}
