package dto

import "testing"

func TestRegisterRequestAllowsProfileImage(t *testing.T) {
	request := RegisterRequest{
		FullName:     "Test Worker",
		Email:        "worker@example.com",
		Phone:        "+251911111111",
		Role:         "worker",
		Password:     "password123",
		PrimarySkill: "Plumbing",
		ProfileImage: "data:image/png;base64,abc123",
	}

	if err := request.Validate(); err != nil {
		t.Fatalf("expected valid registration with profile image, got error: %v", err)
	}
}
