package rest

import (
	"encoding/json"
	"errors"
	nethttp "net/http"
	"strconv"
	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/model/dto"
	"task-management-backend/internal/model/response"
	"task-management-backend/internal/module"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	module *module.Module
}

func New(module *module.Module) *Handler {
	return &Handler{module: module}
}

func (h *Handler) Module() *module.Module {
	return h.module
}

func (h *Handler) Register(w nethttp.ResponseWriter, r *nethttp.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	token, user, err := h.Module().WorkConnect.Register(r.Context(), req)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusCreated, response.AuthResponse{Token: token, User: user})
}

func (h *Handler) Login(w nethttp.ResponseWriter, r *nethttp.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	token, user, err := h.Module().WorkConnect.Login(r.Context(), req)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.AuthResponse{Token: token, User: user})
}

func (h *Handler) Me(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	user, err := h.Module().WorkConnect.GetProfile(r.Context(), principal.UserID)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.ProfileResponse{User: user})
}

func (h *Handler) ListWorkers(w nethttp.ResponseWriter, r *nethttp.Request) {
	query := dto.WorkerSearchQuery{
		Category: r.URL.Query().Get("category"),
		City:     r.URL.Query().Get("city"),
		Q:        r.URL.Query().Get("q"),
		Sort:     r.URL.Query().Get("sort"),
	}

	workers, err := h.Module().WorkConnect.ListWorkers(r.Context(), query)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.WorkerListResponse{Workers: workers})
}

func (h *Handler) GetWorkerProfile(w nethttp.ResponseWriter, r *nethttp.Request) {
	workerID, err := parseIDParam(r, "workerID")
	if err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid worker id")
		return
	}

	worker, err := h.Module().WorkConnect.GetWorkerDetails(r.Context(), workerID)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.WorkerDetailsResponse{Worker: worker})
}

func (h *Handler) CreateCustomerRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	var req dto.CreateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	item, err := h.Module().WorkConnect.CreateServiceRequest(r.Context(), principal.UserID, req)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusCreated, response.ServiceRequestResponse{Request: item})
}

func (h *Handler) ListCustomerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	items, err := h.Module().WorkConnect.ListCustomerRequests(r.Context(), principal.UserID)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.ServiceRequestListResponse{Requests: items})
}

func (h *Handler) SubmitCustomerReview(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid request id")
		return
	}

	var req dto.SubmitReviewRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	if err = h.Module().WorkConnect.SubmitReview(r.Context(), principal.UserID, requestID, req); err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusCreated, response.MessageResponse{Message: "Review submitted"})
}

func (h *Handler) InitiateCustomerPayment(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid request id")
		return
	}

	var req dto.InitiatePaymentRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	payment, err := h.Module().WorkConnect.InitiatePayment(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusCreated, response.PaymentResponse{Payment: payment})
}

func (h *Handler) CustomerDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	summary, err := h.Module().WorkConnect.CustomerDashboard(r.Context(), principal.UserID)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.CustomerDashboardResponse{Summary: summary})
}

func (h *Handler) ListWorkerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	items, err := h.Module().WorkConnect.ListWorkerRequests(r.Context(), principal.UserID)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.ServiceRequestListResponse{Requests: items})
}

func (h *Handler) WorkerDecision(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid request id")
		return
	}

	var req dto.WorkerDecisionRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	item, err := h.Module().WorkConnect.WorkerDecision(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.ServiceRequestResponse{Request: item})
}

func (h *Handler) WorkerAvailability(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	var req dto.UpdateAvailabilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	if err := h.Module().WorkConnect.UpdateWorkerAvailability(r.Context(), principal.UserID, req); err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.MessageResponse{Message: "Availability updated"})
}

func (h *Handler) WorkerDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	summary, err := h.Module().WorkConnect.WorkerDashboard(r.Context(), principal.UserID)
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.WorkerDashboardResponse{Summary: summary})
}

func (h *Handler) AdminDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	summary, err := h.Module().WorkConnect.AdminDashboard(r.Context())
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.AdminDashboardResponse{Summary: summary})
}

func (h *Handler) PendingWorkers(w nethttp.ResponseWriter, r *nethttp.Request) {
	workers, err := h.Module().WorkConnect.PendingWorkerVerifications(r.Context())
	if err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.PendingWorkersResponse{Workers: workers})
}

func (h *Handler) VerifyWorker(w nethttp.ResponseWriter, r *nethttp.Request) {
	workerID, err := parseIDParam(r, "workerID")
	if err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid worker id")
		return
	}

	if err = h.Module().WorkConnect.VerifyWorker(r.Context(), workerID, true); err != nil {
		h.writeError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.MessageResponse{Message: "Worker verified"})
}

func parseIDParam(r *nethttp.Request, paramName string) (int64, error) {
	return strconv.ParseInt(chi.URLParam(r, paramName), 10, 64)
}

func (h *Handler) writeError(w nethttp.ResponseWriter, err error) {
	switch {
	case errors.Is(err, apperrors.ErrUserAlreadyExists), errors.Is(err, apperrors.ErrRequestConflict):
		response.Error(w, nethttp.StatusConflict, err.Error())
	case errors.Is(err, apperrors.ErrInvalidCredentials), errors.Is(err, apperrors.ErrUnauthorized):
		response.Error(w, nethttp.StatusUnauthorized, err.Error())
	case errors.Is(err, apperrors.ErrForbidden):
		response.Error(w, nethttp.StatusForbidden, err.Error())
	case errors.Is(err, apperrors.ErrNotFound):
		response.Error(w, nethttp.StatusNotFound, err.Error())
	case errors.Is(err, apperrors.ErrInvalidState):
		response.Error(w, nethttp.StatusUnprocessableEntity, err.Error())
	default:
		response.Error(w, nethttp.StatusBadRequest, err.Error())
	}
}
