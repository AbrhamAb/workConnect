package customer

import (
	"encoding/json"
	"errors"
	nethttp "net/http"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/handler/rest/base"
	"task-management-backend/internal/model/dto"
	"task-management-backend/internal/model/response"
)

type Handler struct {
	base *base.Base
}

func New(baseHandler *base.Base) *Handler {
	return &Handler{base: baseHandler}
}

func (h *Handler) CreateCustomerRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	var req dto.CreateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid payload"))
		return
	}

	item, err := h.base.Module().WorkConnect.CreateServiceRequest(r.Context(), principal.UserID, req)
	if err != nil {
		h.base.WriteError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, nethttp.StatusText(nethttp.StatusCreated), response.ServiceRequestResponse{Request: item})
}

func (h *Handler) ListCustomerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	items, err := h.base.Module().WorkConnect.ListCustomerRequests(r.Context(), principal.UserID)
	if err != nil {
		h.base.WriteError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.ServiceRequestListResponse{Requests: items})
}

func (h *Handler) SubmitCustomerReview(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	requestID, err := h.base.ParseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid request id"))
		return
	}

	var req dto.SubmitReviewRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid payload"))
		return
	}

	if err = h.base.Module().WorkConnect.SubmitReview(r.Context(), principal.UserID, requestID, req); err != nil {
		h.base.WriteError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, nethttp.StatusText(nethttp.StatusCreated), response.MessageResponse{Message: "Review submitted"})
}

func (h *Handler) InitiateCustomerPayment(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	requestID, err := h.base.ParseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid request id"))
		return
	}

	var req dto.InitiatePaymentRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid payload"))
		return
	}

	payment, err := h.base.Module().WorkConnect.InitiatePayment(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		h.base.WriteError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, nethttp.StatusText(nethttp.StatusCreated), response.PaymentResponse{Payment: payment})
}

func (h *Handler) CustomerDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	summary, err := h.base.Module().WorkConnect.CustomerDashboard(r.Context(), principal.UserID)
	if err != nil {
		h.base.WriteError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.CustomerDashboardResponse{Summary: summary})
}
