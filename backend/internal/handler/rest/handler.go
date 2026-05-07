package rest

import (
	"context"
	"encoding/json"
	stderrs "errors"
	nethttp "net/http"
	"strconv"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/handler/middleware"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	"task-management-backend/internal/model/response"
	"task-management-backend/internal/module"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	module *module.Module
}

type validatable interface {
	Validate() error
}

func New(module *module.Module) *Handler {
	return &Handler{module: module}
}

func (h *Handler) Module() *module.Module {
	return h.module
}

func (h *Handler) Register(w nethttp.ResponseWriter, r *nethttp.Request) {
	var req dto.RegisterRequest
	if err := decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	token, user, err := h.Module().WorkConnect.Register(r.Context(), req)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, "user registered", h.authPayload(r.Context(), token, user))
}

func (h *Handler) Login(w nethttp.ResponseWriter, r *nethttp.Request) {
	var req dto.LoginRequest
	if err := decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	auth, err := h.Module().WorkConnect.Login(r.Context(), req)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "login successful", auth)
}

func (h *Handler) Me(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	user, err := h.Module().WorkConnect.GetProfile(r.Context(), principal.UserID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "profile fetched", h.profilePayload(r.Context(), user))
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
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "workers fetched", map[string]any{"workers": workers})
}

func (h *Handler) GetWorkerProfile(w nethttp.ResponseWriter, r *nethttp.Request) {
	workerID, err := parseIDParam(r, "workerID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid worker id"))
		return
	}

	worker, err := h.Module().WorkConnect.GetWorkerDetails(r.Context(), workerID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "worker fetched", map[string]any{"worker": worker})
}

func (h *Handler) CreateCustomerRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	var req dto.CreateServiceRequest
	if err := decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	item, err := h.Module().WorkConnect.CreateServiceRequest(r.Context(), principal.UserID, req)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, "request created", map[string]any{"request": item})
}

func (h *Handler) ListCustomerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	items, err := h.Module().WorkConnect.ListCustomerRequests(r.Context(), principal.UserID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "requests fetched", map[string]any{"requests": items})
}

func (h *Handler) SubmitCustomerReview(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid request id"))
		return
	}

	var req dto.SubmitReviewRequest
	if err = decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	if err = h.Module().WorkConnect.SubmitReview(r.Context(), principal.UserID, requestID, req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, "review submitted", nil)
}

func (h *Handler) InitiateCustomerPayment(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid request id"))
		return
	}

	var req dto.InitiatePaymentRequest
	if err = decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	payment, err := h.Module().WorkConnect.InitiatePayment(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, "payment initiated", map[string]any{"payment": payment})
}

func (h *Handler) CustomerDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	summary, err := h.Module().WorkConnect.CustomerDashboard(r.Context(), principal.UserID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "dashboard fetched", map[string]any{"summary": summary})
}

func (h *Handler) ListWorkerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	items, err := h.Module().WorkConnect.ListWorkerRequests(r.Context(), principal.UserID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "requests fetched", map[string]any{"requests": items})
}

func (h *Handler) WorkerDecision(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid request id"))
		return
	}

	var req dto.WorkerDecisionRequest
	if err = decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	item, err := h.Module().WorkConnect.WorkerDecision(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "request updated", map[string]any{"request": item})
}

func (h *Handler) CompleteWorkerRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid request id"))
		return
	}

	item, err := h.Module().WorkConnect.CompleteWorkerRequest(r.Context(), principal.UserID, requestID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "request completed", map[string]any{"request": item})
}

func (h *Handler) WorkerAvailability(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	var req dto.UpdateAvailabilityRequest
	if err := decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	if err := h.Module().WorkConnect.UpdateWorkerAvailability(r.Context(), principal.UserID, req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "availability updated", nil)
}

func (h *Handler) WorkerDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	summary, err := h.Module().WorkConnect.WorkerDashboard(r.Context(), principal.UserID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "dashboard fetched", map[string]any{"summary": summary})
}

func (h *Handler) AdminDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	summary, err := h.Module().WorkConnect.AdminDashboard(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "dashboard fetched", map[string]any{"summary": summary})
}

func (h *Handler) PendingWorkers(w nethttp.ResponseWriter, r *nethttp.Request) {
	workers, err := h.Module().WorkConnect.PendingWorkerVerifications(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "workers fetched", map[string]any{"workers": workers})
}

func (h *Handler) VerifyWorker(w nethttp.ResponseWriter, r *nethttp.Request) {
	workerID, err := parseIDParam(r, "workerID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid worker id"))
		return
	}

	if err = h.Module().WorkConnect.VerifyWorker(r.Context(), workerID, true); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "worker verified", nil)
}

func (h *Handler) ListMessageConversations(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	items, err := h.Module().WorkConnect.ListMessageConversations(r.Context(), principal.UserID)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "conversations fetched", map[string]any{"conversations": items})
}

func (h *Handler) ListMessagesByRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid request id"))
		return
	}

	limit := 50
	if limitRaw := r.URL.Query().Get("limit"); limitRaw != "" {
		parsedLimit, parseErr := strconv.Atoi(limitRaw)
		if parseErr != nil {
			response.SendErrorResponse(w, r, stderrs.New("invalid limit"))
			return
		}
		limit = parsedLimit
	}

	var beforeID int64
	if beforeRaw := r.URL.Query().Get("beforeId"); beforeRaw != "" {
		parsedBeforeID, parseErr := strconv.ParseInt(beforeRaw, 10, 64)
		if parseErr != nil {
			response.SendErrorResponse(w, r, stderrs.New("invalid beforeId"))
			return
		}
		beforeID = parsedBeforeID
	}

	items, err := h.Module().WorkConnect.ListMessagesByRequest(r.Context(), principal.UserID, requestID, dto.ListMessagesQuery{
		Limit:    limit,
		BeforeID: beforeID,
	})
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, "messages fetched", map[string]any{"messages": items})
}

func (h *Handler) SendMessage(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, err := h.requirePrincipal(r.Context())
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, stderrs.New("invalid request id"))
		return
	}

	var req dto.SendMessageRequest
	if err = decodeAndValidate(r, &req); err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	item, err := h.Module().WorkConnect.SendMessage(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		response.SendErrorResponse(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, "message sent", map[string]any{"message": item})
}

func parseIDParam(r *nethttp.Request, paramName string) (int64, error) {
	return strconv.ParseInt(chi.URLParam(r, paramName), 10, 64)
}

func decodeAndValidate(r *nethttp.Request, dst any) error {
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		return stderrs.New("invalid payload")
	}

	req, ok := dst.(validatable)
	if !ok {
		return nil
	}

	return req.Validate()
}

func (h *Handler) requirePrincipal(ctx context.Context) (module.AuthPrincipal, error) {
	principal, ok := middleware.PrincipalFromContext(ctx)
	if !ok {
		return module.AuthPrincipal{}, apperrors.ErrUnauthorized
	}
	return principal, nil
}

func (h *Handler) authPayload(ctx context.Context, token string, user db.User) map[string]any {
	data := map[string]any{
		"token": token,
		"user":  user,
	}

	if user.Role == db.RoleWorker {
		if workerProfileID, _, err := h.Module().WorkConnect.GetWorkerProfileInfo(ctx, user.ID); err == nil {
			data["workerProfileId"] = workerProfileID
		}
	}

	return data
}

func (h *Handler) profilePayload(ctx context.Context, user db.User) map[string]any {
	data := map[string]any{"user": user}

	if user.Role == db.RoleWorker {
		if workerProfileID, _, err := h.Module().WorkConnect.GetWorkerProfileInfo(ctx, user.ID); err == nil {
			data["workerProfileId"] = workerProfileID
		}
	}

	return data
}

// func (h *Handler) writeError(w nethttp.ResponseWriter, r *nethttp.Request, err error) {
// 	response.SendErrorResponse(w, r, err)
// }
