package dto

import (
	"net/mail"
	"strings"
	"task-management-backend/internal/model/db"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

func validEmail(value any) error {
	email, ok := value.(string)
	if !ok {
		return validation.NewError("validation_email", "email must be valid")
	}

	parsed, err := mail.ParseAddress(strings.TrimSpace(email))
	if err != nil || parsed.Address != strings.TrimSpace(email) {
		return validation.NewError("validation_email", "email must be valid")
	}

	return nil
}

func (r RegisterRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.FullName,
			validation.Required.Error("full name is required"),
			validation.Length(2, 100).Error("name must be between 2 and 100 characters"),
		),
		validation.Field(&r.Email,
			validation.Required.Error("email is required"),
			validation.By(validEmail),
		),
		validation.Field(&r.Phone,
			validation.Required.Error("phone is required"),
			validation.Length(7, 20).Error("phone number is invalid"),
		),
		validation.Field(&r.Role,
			validation.Required,
			validation.By(func(value any) error {
				role, _ := value.(string)
				normalized := strings.ToLower(strings.TrimSpace(role))
				if normalized != db.RoleCustomer && normalized != db.RoleWorker && normalized != db.RoleAdmin {
					return validation.NewError("validation_role", "role must be customer, worker, or admin")
				}
				return nil
			}),
		),
		validation.Field(&r.Password,
			validation.Required.Error("password is required"),
			validation.Length(8, 100).Error("password must be at least 8 characters"),
		),
	)
}

func (r LoginRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Email, validation.Required.Error("email is required"), validation.By(validEmail)),
		validation.Field(&r.Password, validation.Required.Error("password is required")),
	)
}

// i have include regex to include email and password lendth and is email is correctly putted
// var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// func (l *LoginRequest) Validate() error {
// 	return validation.ValidateStruct(l,
// 		validation.Field(&l.Email,
// 			validation.Required.Error("email is required"),
// 			validation.Match(emailRegex).Error("invalid email format"),
// 		),
// 		validation.Field(&l.Password,
// 			validation.Required.Error("password is required"),
// 			validation.Length(6, 50).Error("password must be between 6 and 50 characters"),
// 		),
// 	)
// }

func (r CreateServiceRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.WorkerID, validation.Required, validation.Min(int64(1))),
		validation.Field(&r.CategoryID, validation.Min(int64(0))),
		validation.Field(&r.Title, validation.Required, validation.Length(5, 120)),
		validation.Field(&r.Description, validation.Required, validation.Length(10, 2000)),
		validation.Field(&r.LocationAddress, validation.Required, validation.Length(4, 255)),
		validation.Field(&r.BudgetETB, validation.Min(0.0)),
	)
}

func (r WorkerDecisionRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Decision, validation.Required, validation.In("accept", "reject")),
	)
}

func (r UpdateAvailabilityRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.AvailabilityStatus, validation.Required, validation.In(db.AvailabilityAvailable, db.AvailabilityBusy)),
	)
}

func (r UploadWorkerDocumentRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.DocumentType, validation.Required, validation.In("government_id", "professional_certificate", "business_license", "other")),
		validation.Field(&r.FileURL, validation.Required, validation.Length(1, 15_000_000)),
		validation.Field(&r.FileName, validation.Required, validation.Length(1, 255)),
		validation.Field(&r.MimeType, validation.Required, validation.In("image/png", "image/jpeg", "application/pdf")),
		validation.Field(&r.FileSizeBytes, validation.Required, validation.Min(int64(1)), validation.Max(int64(10*1024*1024))),
	)
}

func (r SubmitReviewRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Rating, validation.Required, validation.Min(1), validation.Max(5)),
		validation.Field(&r.Comment, validation.Length(0, 500)),
	)
}

func (r InitiatePaymentRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Provider, validation.Required, validation.In("chapa", "starpay", "cash")),
		validation.Field(&r.AmountETB, validation.Required, validation.Min(1.0)),
	)
}

func (r SendMessageRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Body, validation.Required, validation.Length(1, 4000)),
		validation.Field(&r.MessageType, validation.In("", db.MessageTypeText)),
	)
}

func (r ListMessagesQuery) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Limit, validation.Min(1), validation.Max(100)),
		validation.Field(&r.BeforeID, validation.Min(int64(0))),
	)
}
