package user

import (
	"context"
	"encoding/json"
	"errors"
	nethttp "net/http"
	"strconv"

	apperrors "task-management-backend/internal/constant/errors"
	"task-management-backend/internal/handler/middleware"
	basehandler "task-management-backend/internal/handler/rest/base"
	customerhandler "task-management-backend/internal/handler/rest/customer"
	workerhandler "task-management-backend/internal/handler/rest/worker"
	"task-management-backend/internal/model/db"
	"task-management-backend/internal/model/dto"
	"task-management-backend/internal/model/response"
	"task-management-backend/internal/module"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	module   *module.Module
	base     *basehandler.Base
	customer *customerhandler.Handler
	worker   *workerhandler.Handler
}

func New(modules *module.Module) *Handler {
	base := basehandler.New(modules)
	return &Handler{
		module:   modules,
		base:     base,
		customer: customerhandler.New(base),
		worker:   workerhandler.New(base),
	}
}

func (h *Handler) Module() *module.Module {
	return h.module
}

func (h *Handler) HealthCheck(w nethttp.ResponseWriter, _ *nethttp.Request) {
	w.WriteHeader(nethttp.StatusOK)
	_, _ = w.Write([]byte("workconnect-backend-ok"))
}

func (h *Handler) Register(w nethttp.ResponseWriter, r *nethttp.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid payload"))
		return
	}

	token, user, err := h.Module().WorkConnect.Register(r.Context(), req)
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, nethttp.StatusText(nethttp.StatusCreated), h.authResponse(r.Context(), token, user))
}

func (h *Handler) Login(w nethttp.ResponseWriter, r *nethttp.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid payload"))
		return
	}
	//   if err := req.Validate(); err != nil {
	// 	return
	//   }
	loginResp, err := h.Module().WorkConnect.Login(r.Context(), req)
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), h.authResponseFromLoginResp(r.Context(), loginResp))
}

func (h *Handler) Me(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	user, err := h.Module().WorkConnect.GetProfile(r.Context(), principal.UserID)
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), h.profileResponse(r.Context(), user))
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
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.WorkerListResponse{Workers: workers})
}

func (h *Handler) GetWorkerProfile(w nethttp.ResponseWriter, r *nethttp.Request) {
	workerID, err := parseIDParam(r, "workerID")
	if err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid worker id"))
		return
	}

	worker, err := h.Module().WorkConnect.GetWorkerDetails(r.Context(), workerID)
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.WorkerDetailsResponse{Worker: worker})
}

func (h *Handler) CreateCustomerRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.customer.CreateCustomerRequest(w, r)
}

func (h *Handler) ListCustomerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.customer.ListCustomerRequests(w, r)
}

func (h *Handler) SubmitCustomerReview(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.customer.SubmitCustomerReview(w, r)
}

func (h *Handler) InitiateCustomerPayment(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.customer.InitiateCustomerPayment(w, r)
}

func (h *Handler) CustomerDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.customer.CustomerDashboard(w, r)
}

func (h *Handler) ListWorkerRequests(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.worker.ListWorkerRequests(w, r)
}

func (h *Handler) WorkerDecision(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.worker.WorkerDecision(w, r)
}

func (h *Handler) CompleteWorkerRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.worker.CompleteWorkerRequest(w, r)
}

func (h *Handler) WorkerAvailability(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.worker.WorkerAvailability(w, r)
}

func (h *Handler) WorkerDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	h.worker.WorkerDashboard(w, r)
}

func (h *Handler) AdminDashboard(w nethttp.ResponseWriter, r *nethttp.Request) {
	summary, err := h.Module().WorkConnect.AdminDashboard(r.Context())
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.AdminDashboardResponse{Summary: summary})
}

func (h *Handler) PendingWorkers(w nethttp.ResponseWriter, r *nethttp.Request) {
	workers, err := h.Module().WorkConnect.PendingWorkerVerifications(r.Context())
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.PendingWorkersResponse{Workers: workers})
}

func (h *Handler) VerifyWorker(w nethttp.ResponseWriter, r *nethttp.Request) {
	workerID, err := parseIDParam(r, "workerID")
	if err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid worker id"))
		return
	}

	if err = h.Module().WorkConnect.VerifyWorker(r.Context(), workerID, true); err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.MessageResponse{Message: "Worker verified"})
}

func (h *Handler) ListMessageConversations(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	items, err := h.Module().WorkConnect.ListMessageConversations(r.Context(), principal.UserID)
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.MessageConversationsResponse{Conversations: items})
}

func (h *Handler) ListMessagesByRequest(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid request id"))
		return
	}

	limit := 50
	if limitRaw := r.URL.Query().Get("limit"); limitRaw != "" {
		parsedLimit, parseErr := strconv.Atoi(limitRaw)
		if parseErr != nil {
			response.SendErrorResponse(w, r, errors.New("invalid limit"))
			return
		}
		limit = parsedLimit
	}

	var beforeID int64
	if beforeRaw := r.URL.Query().Get("beforeId"); beforeRaw != "" {
		parsedBeforeID, parseErr := strconv.ParseInt(beforeRaw, 10, 64)
		if parseErr != nil {
			response.SendErrorResponse(w, r, errors.New("invalid beforeId"))
			return
		}
		beforeID = parsedBeforeID
	}

	items, err := h.Module().WorkConnect.ListMessagesByRequest(r.Context(), principal.UserID, requestID, dto.ListMessagesQuery{
		Limit:    limit,
		BeforeID: beforeID,
	})
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusOK, nethttp.StatusText(nethttp.StatusOK), response.MessageListResponse{Messages: items})
}

func (h *Handler) SendMessage(w nethttp.ResponseWriter, r *nethttp.Request) {
	principal, ok := middleware.PrincipalFromContext(r.Context())
	if !ok {
		response.SendErrorResponse(w, r, apperrors.ErrUnauthorized)
		return
	}

	requestID, err := parseIDParam(r, "requestID")
	if err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid request id"))
		return
	}

	var req dto.SendMessageRequest
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.SendErrorResponse(w, r, errors.New("invalid payload"))
		return
	}

	item, err := h.Module().WorkConnect.SendMessage(r.Context(), principal.UserID, requestID, req)
	if err != nil {
		h.writeError(w, r, err)
		return
	}

	response.SendSuccessResponse(w, r, nethttp.StatusCreated, nethttp.StatusText(nethttp.StatusCreated), response.MessageSendResponse{Message: item})
}

func parseIDParam(r *nethttp.Request, paramName string) (int64, error) {
	return strconv.ParseInt(chi.URLParam(r, paramName), 10, 64)
}

func (h *Handler) writeError(w nethttp.ResponseWriter, r *nethttp.Request, err error) {
	response.SendErrorResponse(w, r, err)
}

func (h *Handler) authResponse(ctx context.Context, token string, user db.User) response.AuthResponse {
	resp := response.AuthResponse{Token: token, User: user}
	if user.Role == db.RoleWorker {
		if workerProfileID, _, err := h.Module().WorkConnect.GetWorkerProfileInfo(ctx, user.ID); err == nil {
			resp.WorkerProfileID = &workerProfileID
		}
	}
	return resp
}

func (h *Handler) authResponseFromLoginResp(ctx context.Context, loginResp *dto.UserLoginResponse) response.AuthResponse {
	resp := response.AuthResponse{
		Token: loginResp.Token,
		User: db.User{
			ID:       loginResp.ID,
			FullName: loginResp.FullName,
			Role:     loginResp.Role,
		},
	}
	if loginResp.Role == db.RoleWorker {
		if workerProfileID, _, err := h.Module().WorkConnect.GetWorkerProfileInfo(ctx, loginResp.ID); err == nil {
			resp.WorkerProfileID = &workerProfileID
		}
	}
	return resp
}

func (h *Handler) profileResponse(ctx context.Context, user db.User) response.ProfileResponse {
	resp := response.ProfileResponse{User: user}
	if user.Role == db.RoleWorker {
		if workerProfileID, _, err := h.Module().WorkConnect.GetWorkerProfileInfo(ctx, user.ID); err == nil {
			resp.WorkerProfileID = &workerProfileID
		}
	}
	return resp
}
