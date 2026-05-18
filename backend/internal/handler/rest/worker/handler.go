package worker

import (
	"encoding/json"
	nethttp "net/http"
	"strconv"

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

func (h *Handler) ListWorkerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	items, err := h.base.Module().WorkConnect.ListWorkerRequests(r.Context(), principal.UserID)
	if err != nil {
		h.base.WriteError(w, err)
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

	requestID, err := h.base.ParseIDParam(r, "requestID")
	if err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid request id")
		return
	}

	var req dto.WorkerDecisionRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid payload")
		return
	}

	item, err := h.base.Module().WorkConnect.WorkerDecision(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		h.base.WriteError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.ServiceRequestResponse{Request: item})
}

func (h *Handler) CompleteWorkerRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.Error(w, nethttp.StatusUnauthorized, apperrors.ErrUnauthorized.Error())
		return
	}

	requestID, err := h.base.ParseIDParam(r, "requestID")
	if err != nil {
		response.Error(w, nethttp.StatusBadRequest, "invalid request id")
		return
	}

	item, err := h.base.Module().WorkConnect.CompleteWorkerRequest(r.Context(), principal.UserID, requestID)
	if err != nil {
		h.base.WriteError(w, err)
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

	if err := h.base.Module().WorkConnect.UpdateWorkerAvailability(r.Context(), principal.UserID, req); err != nil {
		h.base.WriteError(w, err)
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

	summary, err := h.base.Module().WorkConnect.WorkerDashboard(r.Context(), principal.UserID)
	if err != nil {
		h.base.WriteError(w, err)
		return
	}

	response.JSON(w, nethttp.StatusOK, response.WorkerDashboardResponse{Summary: summary})
}

func (h *Handler) ParseLimit(value string) (int, error) {
	return strconv.Atoi(value)
}
