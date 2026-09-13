package response

type Response struct {
	Status  int            `json:"status,omitempty"`
	Message string         `json:"message,omitempty"`
	Data    any            `json:"data,omitempty"`
	Meta    any            `json:"meta,omitempty"`
	Error   *ErrorResponse `json:"error,omitempty"`
}

type ErrorResponse struct {
	Type       string       `json:"type,omitempty"`
	Message    string       `json:"message"`
	Detail     []FieldError `json:"details,omitempty"`
	StatusCode int          `json:"status_code,omitempty"`
	FieldError []FieldError `json:"field_error,omitempty"`
}

type FieldError struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}
