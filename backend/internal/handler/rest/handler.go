package rest

import (
	"net/http"

	restuser "task-management-backend/internal/handler/rest/user"
	"task-management-backend/internal/module"
)

type ModuleProvider interface {
	Module() *module.Module
}

type PublicHandler interface {
	HealthCheck(w http.ResponseWriter, r *http.Request)
	ListWorkers(w http.ResponseWriter, r *http.Request)
	GetWorkerProfile(w http.ResponseWriter, r *http.Request)
}

type AuthHandler interface {
	ModuleProvider
	Register(w http.ResponseWriter, r *http.Request)
	Login(w http.ResponseWriter, r *http.Request)
	Me(w http.ResponseWriter, r *http.Request)
}

type CustomerHandler interface {
	ModuleProvider
	CreateCustomerRequest(w http.ResponseWriter, r *http.Request)
	ListCustomerRequests(w http.ResponseWriter, r *http.Request)
	SubmitCustomerReview(w http.ResponseWriter, r *http.Request)
	InitiateCustomerPayment(w http.ResponseWriter, r *http.Request)
	CustomerDashboard(w http.ResponseWriter, r *http.Request)
}

type WorkerHandler interface {
	ModuleProvider
	ListWorkerRequests(w http.ResponseWriter, r *http.Request)
	WorkerDecision(w http.ResponseWriter, r *http.Request)
	CompleteWorkerRequest(w http.ResponseWriter, r *http.Request)
	WorkerAvailability(w http.ResponseWriter, r *http.Request)
	WorkerDashboard(w http.ResponseWriter, r *http.Request)
}

type AdminHandler interface {
	ModuleProvider
	AdminDashboard(w http.ResponseWriter, r *http.Request)
	PendingWorkers(w http.ResponseWriter, r *http.Request)
	VerifyWorker(w http.ResponseWriter, r *http.Request)
}

type MessageHandler interface {
	ModuleProvider
	ListMessageConversations(w http.ResponseWriter, r *http.Request)
	ListMessagesByRequest(w http.ResponseWriter, r *http.Request)
	SendMessage(w http.ResponseWriter, r *http.Request)
}

type Handler interface {
	PublicHandler
	AuthHandler
	CustomerHandler
	WorkerHandler
	AdminHandler
	MessageHandler
}

func New(modules *module.Module) Handler {
	return restuser.New(modules)
}
