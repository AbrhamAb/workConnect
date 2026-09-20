// Mock users used to seed the application on first launch.
//
// NOTE:
// - Passwords are stored in plain text ONLY because this is a frontend-only
//   mock application.
// - When the Go backend is connected, passwords will never exist here.
// - Authentication will be handled by the backend.

export const users = [
  {
    id: "cust-1",
    role: "customer",

    fullName: "Abel Bekele",

    email: "abel@example.com",
    password: "password123",

    phone: "+251911111111",
    city: "Addis Ababa",

    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",

    createdAt: "2026-01-15T09:30:00Z",
  },

  {
    id: "worker-1",
    role: "worker",

    fullName: "Samuel Kebede",

    email: "samuel@example.com",
    password: "password123",

    phone: "+251933333333",
    city: "Addis Ababa",

    profileImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",

    createdAt: "2026-01-08T11:10:00Z",
  },

  {
    id: "worker-2",
    role: "worker",

    fullName: "Dawit Haile",

    email: "dawit@example.com",
    password: "password123",

    phone: "+251944444444",
    city: "Hawassa",

    profileImage:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400",

    createdAt: "2026-03-11T16:40:00Z",
  },
];
 