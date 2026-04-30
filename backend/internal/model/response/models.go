package response

import "task-management-backend/internal/model/db"

type AuthResponse struct {
	Token           string  `json:"token"`
	User            db.User `json:"user"`
	WorkerProfileID *int64  `json:"workerProfileId,omitempty"`
}

type ProfileResponse struct {
	User            db.User `json:"user"`
	WorkerProfileID *int64  `json:"workerProfileId,omitempty"`
}

type WorkerListResponse struct {
	Workers []db.WorkerCard `json:"workers"`
}

type WorkerDetailsResponse struct {
	Worker db.WorkerDetails `json:"worker"`
}

type ServiceRequestResponse struct {
	Request db.ServiceRequestView `json:"request"`
}

type ServiceRequestListResponse struct {
	Requests []db.ServiceRequestView `json:"requests"`
}

type CustomerDashboardResponse struct {
	Summary db.CustomerDashboard `json:"summary"`
}

type WorkerDashboardResponse struct {
	Summary db.WorkerDashboard `json:"summary"`
}

type AdminDashboardResponse struct {
	Summary db.AdminDashboard `json:"summary"`
}

type PendingWorkersResponse struct {
	Workers []db.WorkerCard `json:"workers"`
}

type PaymentResponse struct {
	Payment db.Payment `json:"payment"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

type MessageConversationsResponse struct {
	Conversations []db.MessageConversation `json:"conversations"`
}

type MessageListResponse struct {
	Messages []db.Message `json:"messages"`
}

type MessageSendResponse struct {
	Message db.Message `json:"message"`
}
