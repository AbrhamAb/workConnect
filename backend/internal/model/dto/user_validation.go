package dto

import (
	"strings"
	"task-management-backend/internal/model/db"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

func (r RegisterRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.FullName,
			validation.Required.Error("full name is required"),
			validation.Length(2, 100).Error("name must be between 2 and 100 characters"),
		),
		validation.Field(&r.Email,
			validation.Required.Error("email is required"),
			is.Email.Error("email must be a valid email address"),
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
		validation.Field(&r.Email, validation.Required.Error("email is required"), is.Email.Error("email must be valid")),
		validation.Field(&r.Password, validation.Required.Error("password is required")),
	)
}

func (r CreateServiceRequest) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.WorkerID, validation.Required, validation.Min(int64(1))),
		validation.Field(&r.CategoryID, validation.Required, validation.Min(int64(1))),
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
