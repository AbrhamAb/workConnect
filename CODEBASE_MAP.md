# WorkConnect Codebase Structure Map

**Project**: WorkConnect - A service marketplace connecting customers with verified workers
**Tech Stack**: Frontend (Next.js 16.2.6, React 19.2.4) | Backend (Go 1.26.1, Chi router, PostgreSQL)

---

## 1. PROJECT ROOT STRUCTURE

```
workConnect/
├── .git/                          # Git repository
├── .gitignore
├── docker-compose.yml             # Docker Compose configuration
├── backend/                       # Go backend application
├── frontend/                      # Next.js React frontend
└── postman/                       # API testing collection
```

### Docker Compose Configuration
- **File**: [docker-compose.yml](docker-compose.yml)
- **Services**: Backend service (port 8080)
- **Environment**: PORT, JWT_SECRET, DATABASE_URL
- **Build Context**: ./backend/Dockerfile

---

## 2. BACKEND STRUCTURE (Go)

### 2.1 Root Files & Configuration

**File**: [go.mod](backend/go.mod)
- Go version: 1.26.1
- Key Dependencies:
  - `github.com/go-chi/chi/v5` - HTTP router
  - `github.com/jackc/pgx/v5` - PostgreSQL driver
  - `github.com/golang-jwt/jwt/v5` - JWT authentication
  - `github.com/go-ozzo/ozzo-validation/v4` - Input validation
  - `golang.org/x/crypto` - Password hashing (bcrypt)
  - `go.uber.org/zap` - Structured logging

**File**: [Dockerfile](backend/Dockerfile)
- Multi-stage build (builder + distroless)
- Go 1.26.1-alpine builder
- Distroless static image for production
- Exposes port 8080

**File**: [README.md](backend/README.md)
- Architecture overview: routing → handler → module → persistence → database
- Tech stack and design patterns

### 2.2 Entry Point

**File**: [cmd/main.go](backend/cmd/main.go)
- Simple entry point calling `initializer.Run()`

**File**: [internal/initializer/initializer.go](backend/internal/initializer/initializer.go)
- Loads environment variables from `.env` file
- Initializes logger (zap)
- Connects to database
- Wires up modules and handlers
- Starts HTTP server on configurable PORT (default: 8080)
- **Key Responsibilities**:
  - loadEnvFile() - custom .env loader
  - Database connection and migration
  - Server startup

**File**: [internal/initializer/initializer_test.go](backend/internal/initializer/initializer_test.go)
- Test file for initializer (exists but not explored)

### 2.3 Routing & API Endpoints

**File**: [internal/glue/routing/route.go](backend/internal/glue/routing/route.go)
- `NewRouter()` - Creates chi router with CORS and StripSlashes middleware
- `RegisterRoutes()` - Generic route registration with middleware support
- Base URL: `/api/v1`
- CORS configured for `http://localhost:3000`

**File**: [internal/glue/routing/user.go](backend/internal/glue/routing/user.go)
- `RegisterWorkConnectRoutes()` - Registers all API routes

**Complete API Routes**:

```
GET    /Healthcheck                           - Health check
GET    /workers                               - List workers (public)
GET    /workers/{workerID}                    - Get worker details (public)

POST   /auth/register                         - Register new user
POST   /auth/login                            - Login
GET    /auth/me                               - Get current user profile (protected)

CUSTOMER ROUTES (requires auth + customer role):
POST   /customer/requests                     - Create service request
GET    /customer/requests                     - List customer's requests
GET    /customer/requests/{requestID}         - Get request details
PATCH  /customer/requests/{requestID}/confirm - Confirm request
PATCH  /customer/requests/{requestID}/cancel  - Cancel request
POST   /customer/requests/{requestID}/review  - Submit review
POST   /customer/requests/{requestID}/payments/initiate - Initiate payment
GET    /customer/dashboard                    - Customer dashboard

WORKER ROUTES (requires auth + worker role):
GET    /worker/requests                       - List worker's requests
GET    /worker/requests/{requestID}           - Get request details
PATCH  /worker/requests/{requestID}/start     - Start working on request
PATCH  /worker/requests/{requestID}/decision  - Accept/reject request
PATCH  /worker/requests/{requestID}/complete  - Mark request complete
PATCH  /worker/availability                   - Update availability status
GET    /worker/dashboard                      - Worker dashboard

MESSAGING ROUTES (requires auth + customer/worker role):
GET    /messages/conversations                - List conversations
GET    /messages/requests/{requestID}         - List messages for request
POST   /messages/requests/{requestID}         - Send message

ADMIN ROUTES (requires auth + admin role):
GET    /admin/dashboard                       - Admin dashboard
GET    /admin/workers/pending-verification   - Pending worker verifications
PATCH  /admin/workers/{workerID}/verify      - Verify worker account
```

### 2.4 HTTP Handlers

**File**: [internal/handler/rest/handler.go](backend/internal/handler/rest/handler.go)
- `Handler` interface defining all HTTP handler methods
- Wraps module business logic
- Methods for all endpoints (Register, Login, Me, CreateCustomerRequest, etc.)

**File**: [internal/handler/rest/user/user.go](backend/internal/handler/rest/user/user.go)
- `Handler` struct implementing rest.Handler interface
- **Key Methods**:
  - `HealthCheck()` - Returns health status
  - `Register()` - User registration with validation
  - `Login()` - Authentication with JWT
  - `Me()` - Get current user profile
  - `ListWorkers()` - List workers with filters
  - `GetWorkerProfile()` - Get worker details
  - `CreateCustomerRequest()` - Create service request
  - `ListCustomerRequests()` - List customer's requests
  - `GetCustomerRequest()` - Get request with worker details
  - `SubmitCustomerReview()` - Submit review after completion
  - `InitiateCustomerPayment()` - Payment initiation
  - `CustomerDashboard()` - Customer stats dashboard
  - `ListWorkerRequests()` - Worker's incoming requests
  - `WorkerDecision()` - Accept/reject request
  - `StartWorkerRequest()` - Mark request as started
  - `CompleteWorkerRequest()` - Mark request complete
  - `ConfirmCustomerRequest()` - Customer confirms worker
  - `CancelCustomerRequest()` - Customer cancels request
  - `WorkerAvailability()` - Update worker availability
  - `WorkerDashboard()` - Worker stats dashboard
  - `AdminDashboard()` - Admin platform stats
  - `PendingWorkers()` - List pending worker verifications
  - `VerifyWorker()` - Approve/reject worker verification
  - `ListMessageConversations()` - List messaging conversations
  - `ListMessagesByRequest()` - Get messages for request
  - `SendMessage()` - Send message between parties

### 2.5 Middleware

**File**: [internal/handler/middleware/middleware.go](backend/internal/handler/middleware/middleware.go)
- `CORS()` - Sets CORS headers for localhost:3000
- `Auth()` - JWT token validation middleware
- `RequireRoles()` - Role-based access control (customer, worker, admin)
- `PrincipalFromContext()` - Extracts authenticated user from request context

### 2.6 Business Logic Layer (Modules)

**File**: [internal/module/module.go](backend/internal/module/module.go)
- `Module` struct containing `WorkConnectService`
- `WorkConnectService` interface defining all business operations
- **Initialization**: Wires store, JWT secret, and creates WorkConnectModule

**File**: [internal/module/user/user.go](backend/internal/module/user/user.go)
- `WorkConnectModule` - Core business logic implementation
- **Key Methods**:
  - `Register()` - User registration with bcrypt hashing, worker profile creation
  - `Login()` - Credential validation with JWT generation
  - `GetProfile()`, `GetUserByID()` - User retrieval
  - `GetWorkerProfileInfo()` - Worker profile lookup
  - `ListWorkers()` - Search/filter workers by category, city, search term
  - `GetWorkerDetails()` - Worker details with skills
  - `CreateServiceRequest()` - Create new service request
  - `ListCustomerRequests()`, `ListWorkerRequests()` - Request listings
  - `GetServiceRequestByID()` - Get specific request
  - `WorkerDecision()` - Accept/reject logic
  - `StartWorkerRequest()`, `CompleteWorkerRequest()` - Status transitions
  - `ConfirmCustomerRequest()`, `CancelCustomerRequest()` - Customer actions
  - `UpdateWorkerAvailability()` - Availability status update
  - `SubmitReview()` - Rating calculation and storage
  - `InitiatePayment()` - Payment initiation (placeholder)
  - `CustomerDashboard()`, `WorkerDashboard()`, `AdminDashboard()` - Stats
  - `PendingWorkerVerifications()` - Verification queue
  - `VerifyWorker()` - Worker verification logic
  - `ListMessageConversations()`, `ListMessagesByRequest()`, `SendMessage()` - Messaging
  - `ParseToken()` - JWT validation
- **Auth Claims**: UserID, FullName, Role, JWT RegisteredClaims

### 2.7 Data Persistence Layer

**File**: [internal/storage/persistence/persistence.go](backend/internal/storage/persistence/persistence.go)
- `Store` interface defining all database operations
- All methods work with context for cancellation/timeouts
- **Methods**: 50+ methods for user, worker, request, review, payment, message operations

**File**: [internal/storage/persistence/user/user.go](backend/internal/storage/persistence/user/user.go)
- `sqlStore` struct implementing Store interface
- SQL queries using prepared statements
- **Key Operations**:
  - User CRUD (CreateUser, GetUserByEmail, GetUserByID)
  - Worker profiles (CreateWorkerProfile, ListWorkers, GetWorkerDetails)
  - Service requests (CreateServiceRequest, ListCustomerRequests, ListWorkerRequests, UpdateServiceRequestStatusByWorker, MarkServiceRequestCompletedByWorker)
  - Reviews (CreateReview, RefreshWorkerRating)
  - Payments (InitiatePayment)
  - Messages (CreateMessage, ListMessages, UpsertMessageConversation, ListMessageConversations, MarkConversationRead)
  - Dashboards (CustomerDashboard, WorkerDashboard, AdminDashboard)
  - Verification (PendingWorkerVerifications, VerifyWorker, WorkerProfileByUserID)
  - Validation queries (RequestBelongsToCustomer, GetRequestMessagingParticipants)

### 2.8 Database & Platform

**File**: [platform/database/database.go](backend/platform/database/database.go)
- `Connect()` - Establishes PostgreSQL connection via pgx driver
- Connection pooling configuration:
  - Max idle time: 5 minutes
  - Max lifetime: 30 minutes
  - Max open connections: 10
  - Max idle connections: 5
- `migrate()` - Auto-runs schema migrations on startup

**Database Schema** (auto-migrated):

```sql
TABLES:
- users (id, full_name, email, phone, role, is_active, email_verified, phone_verified, password_hash, created_at, updated_at)
- worker_profiles (id, user_id, headline, bio, city, subcity, profile_picture_url, experience_years, hourly_rate_etb, availability_status, is_verified, verification_status, onboarding_step, onboarding_completed, profile_strength_score, response_rate, reliability_score, rating_average, rating_count, completed_jobs, created_at, updated_at)
- service_categories (id, name, slug, description)
- worker_skills (worker_id, category_id) - junction table
- worker_verification_requests (id, worker_id, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, created_at, updated_at)
- worker_documents (id, worker_id, document_type, file_url, file_name, mime_type, file_size_bytes, status, review_notes, uploaded_at, updated_at)
- worker_portfolio_projects (id, worker_id, title, description, cover_image_url, city, completed_at, is_published, created_at, updated_at)
- worker_portfolio_media (id, portfolio_project_id, media_url, media_type, display_order, created_at)
- worker_notification_preferences (worker_id, receive_job_alerts, receive_marketing, updated_at)
- service_requests (id, reference_code, customer_id, worker_id, category_id, title, description, location_address, preferred_at, budget_etb, status, worker_decision_at, created_at, updated_at)
- reviews (id, request_id, customer_id, worker_id, rating, comment, created_at)
- payments (id, request_id, amount_etb, currency, provider, provider_ref, status, paid_at, created_at, updated_at)
- message_conversations (id, request_id, customer_user_id, worker_user_id, last_message_preview, last_message_at, created_at, updated_at)
- messages (id, conversation_id, request_id, sender_user_id, body, message_type, created_at)
- message_conversation_reads (conversation_id, user_id, last_read_message_id, last_read_at)

TRIGGERS (PostgreSQL functions):
- validate_message_conversation() - Ensures conversations are only for accepted/completed requests
- validate_message_sender() - Ensures only conversation participants can send messages
- sync_conversation_last_message() - Updates conversation last_message_preview on new message
```

**Constants**:
- Roles: customer, worker, admin
- Availability: available, busy
- Request Status: pending, accepted, rejected, completed, cancelled
- Payment Status: pending, paid, failed
- Message Type: text
- Document Types: government_id, professional_certificate, business_license, other
- Verification Status: not_submitted, pending, approved, rejected

**File**: [platform/logger/logger.go](backend/platform/logger/logger.go)
- Uses Uber's zap logger
- Production configuration

### 2.9 Data Models & DTOs

**File**: [internal/model/db/models.go](backend/internal/model/db/models.go)
- Database model structs with JSON tags:
  - `User` - Basic user info (ID, FullName, Email, Phone, Role, IsActive, PasswordHash, timestamps)
  - `WorkerProfile` - Worker details (ID, UserID, Headline, Bio, City, ExperienceYears, HourlyRateETB, AvailabilityStatus, IsVerified, RatingAverage, RatingCount, CompletedJobs, timestamps)
  - `WorkerCard` - Worker listing view (ID, UserID, FullName, Headline, City, HourlyRate, Rating, RatingCount, Availability, IsVerified, CompletedJobs, PrimaryCategoryName)
  - `WorkerDetails` - Worker profile details (Worker WorkerCard, Bio, Phone, Email, Skills [])
  - `ServiceRequest` - Service request (ID, ReferenceCode, CustomerID, WorkerID, CategoryID, Title, Description, LocationAddress, PreferredAt, BudgetETB, Status, WorkerDecisionAt, timestamps)
  - `ServiceRequestView` - Service request with names (ServiceRequest + CategoryName, WorkerName, CustomerName, CustomerPhone)
  - `Payment` - Payment info (ID, RequestID, AmountETB, Currency, Provider, ProviderRef, Status, PaidAt, timestamps)
  - `CustomerDashboard` - Stats (TotalRequests, PendingRequests, CompletedRequests)
  - `WorkerDashboard` - Stats (IncomingPendingRequests, AcceptedRequests, CompletedJobs, EstimatedEarningsETB)
  - `AdminDashboard` - Stats (TotalUsers, TotalWorkers, PendingVerifications, TotalRequests, OpenRequests)
  - `MessageConversation` - Conversation metadata (ID, RequestID, OtherPartyUserID, OtherPartyName, LastMessagePreview, LastMessageAt, UnreadCount)
  - `Message` - Individual message (ID, ConversationID, RequestID, SenderUserID, SenderName, Body, MessageType, CreatedAt)

**File**: [internal/model/dto/user_dto.go](backend/internal/model/dto/user_dto.go)
- Data Transfer Objects:
  - `RegisterRequest` - FullName, Email, Phone, Role, Password
  - `LoginRequest` - Email, Password
  - `UserLoginResponse` - ID, FullName, Role, Token
  - `WorkerSearchQuery` - Category, City, Q (search term), Sort
  - `CreateServiceRequest` - WorkerID, CategoryID, Title, Description, LocationAddress, PreferredAt, BudgetETB
  - `WorkerDecisionRequest` - Decision (accept/reject)
  - `UpdateAvailabilityRequest` - AvailabilityStatus (available/busy)
  - `SubmitReviewRequest` - Rating (1-5), Comment
  - `InitiatePaymentRequest` - Provider (chapa/starpay/cash), AmountETB
  - `SendMessageRequest` - Body, MessageType
  - `ListMessagesQuery` - Limit, BeforeID

**File**: [internal/model/dto/user_validation.go](backend/internal/model/dto/user_validation.go)
- Validation using ozzo-validation library
- Field rules: required, length, email format, ranges, enums
- Validates RegisterRequest, LoginRequest, CreateServiceRequest, WorkerDecisionRequest, UpdateAvailabilityRequest, SubmitReviewRequest, InitiatePaymentRequest

**File**: [internal/model/response/response.go](backend/internal/model/response/response.go)
- `SendSuccessResponse()` - Returns 200 with data and optional metadata
- `SendErrorResponse()` - Maps errors to HTTP status codes and returns error response
- Error mapping for all custom app errors

### 2.10 Error Handling

**File**: [internal/constant/errors/errors.go](backend/internal/constant/errors/errors.go)
- Custom error variables:
  - ErrInvalidCredentials
  - ErrUserAlreadyExists
  - ErrUnauthorized
  - ErrForbidden
  - ErrNotFound
  - ErrInvalidRole
  - ErrInvalidState
  - ErrRequestConflict
  - ErrWorkerNotVerified
  - ErrValidation
- ErrorMap: Maps errors to HTTP status codes (400, 401, 403, 404, 409, etc.)

### 2.11 Database Seed Data

**File**: [docs/demo_seed.sql](backend/docs/demo_seed.sql)
- Demo users with bcrypt hashed passwords:
  - Admin: admin@workconnect.demo
  - Customers: sara.customer@workconnect.demo, dawit.customer@workconnect.demo
  - Workers: abel.worker@workconnect.demo (Electrician), hanna.worker@workconnect.demo (Plumber)
- Worker profiles with ratings, skills, and verification status
- Service categories with skills mapping
- Worker verification requests and documents
- Worker portfolio projects

### 2.12 Code Quality Notes

**Observations**:
1. Minor TODO in user persistence: "u forget to check if user not found error and return custom error message" (already returns generic error)
2. Comment in Login handler about validation - suggests service layer shouldn't validate but handler should
3. No test files beyond initializer_test.go
4. Database schema uses PostgreSQL-specific features (ENUM checks, triggers, CTEs, RETURNING clauses)

---

## 3. FRONTEND STRUCTURE (Next.js React)

### 3.1 Root Configuration Files

**File**: [package.json](frontend/package.json)
- Next.js 16.2.6, React 19.2.4
- Build: `npm run dev`, `npm run build`, `npm start`, `npm run lint`
- Key Dependencies:
  - `@tanstack/react-query` - Data fetching & caching
  - `react-hook-form` - Form state management
  - `yup` - Schema validation
  - `zustand` - State management
  - `@hookform/resolvers` - Hook form & Yup integration
- Dev Dependencies:
  - Tailwind CSS v4, PostCSS, ESLint, TypeScript
  - Babel React Compiler

**File**: [next.config.mjs](frontend/next.config.mjs)
- Next.js configuration (not explored in detail)

**File**: [jsconfig.json](frontend/jsconfig.json)
- Path aliases (not explored in detail)

**File**: [postcss.config.mjs](frontend/postcss.config.mjs)
- PostCSS config with Tailwind (not explored in detail)

**File**: [eslint.config.mjs](frontend/eslint.config.mjs)
- ESLint configuration (not explored in detail)

### 3.2 Application Entry & Root Layout

**File**: [src/app/layout.js](frontend/src/app/layout.js)
- Root layout wrapping all pages
- Imports globals.css
- Wraps app with QueryProvider (React Query)
- Wraps QueryProvider with AuthProvider
- Metadata: title="WorkConnect", description="Job platform"

**File**: [src/app/globals.css](frontend/src/app/globals.css)
- Global styles (not explored)

**File**: [src/app/not-found.js](frontend/src/app/not-found.js)
- Not found page component

### 3.3 Route Groups (App Router Layout)

```
(auth)          - Authentication pages (login, register, forgot-password)
(public)        - Public pages (landing page)
(customer)      - Customer dashboard & features
(worker)        - Worker dashboard & features
(admin)         - Admin dashboard & features
```

#### 3.3.1 Auth Route Group

**Path**: [src/app/(auth)/](frontend/src/app/%28auth%29/)
- [layout.js](frontend/src/app/%28auth%29/layout.js) - Shared auth layout
- **Sub-routes**:
  - `/login` - Customer/worker login
  - `/register` - Role selection register page
  - `/register-customer` - Customer registration form
  - `/register-worker` - Worker registration form
  - `/forgot-password` - Password recovery

#### 3.3.2 Public Route Group

**Path**: [src/app/(public)/](frontend/src/app/%28public%29/)
- [page.js](frontend/src/app/%28public%29/page.js) - Landing/home page

#### 3.3.3 Customer Route Group

**Path**: [src/app/(customer)/customer/](frontend/src/app/%28customer%29/customer/)
- [layout.js](frontend/src/app/%28customer%29/customer/layout.js) - Customer layout
- **Sub-routes**:
  - `/dashboard` - Customer dashboard
  - `/profile` - Customer profile management
  - `/requests` - Customer service requests
  - `/workers` - Browse available workers

#### 3.3.4 Worker Route Group

**Path**: [src/app/(worker)/worker/](frontend/src/app/%28worker%29/worker/)
- [layout.js](frontend/src/app/%28worker%29/worker/layout.js) - Worker layout
- **Sub-routes**:
  - `/dashboard` - Worker dashboard with analytics
  - `/profile` - Worker profile management
  - `/requests` - Worker's incoming requests
  - `/portfolio` - Portfolio/past work display
  - `/analytics` - Performance analytics
  - `/verification` - Verification status & submission

### 3.4 Feature Modules

**Path**: [src/features/](frontend/src/features/)

#### Authentication Features
- [auth/](frontend/src/features/auth/) - Login/register forms, password recovery
- [auth/worker-registration/](frontend/src/features/auth/worker-registration/) - Worker-specific registration flow

#### Customer Features
- [customer-profile/](frontend/src/features/customer-profile/) - Profile management
  - `AccountStats.jsx`, `PersonalInfoCard.jsx`, `ProfileHeader.jsx`, `SecurityCard.jsx`, `FavoritesCard.jsx`, `DangerZone.jsx`
- [customer-requests/](frontend/src/features/customer-requests/) - Request management
  - `LeaveReviewCard.jsx`, `RequestActions.jsx`, `RequestDescription.jsx`, `RequestHeader.jsx`, `RequestOverview.jsx`, `RequestPhotos.jsx`, `RequestTimeline.jsx`, `WorkerSummarySidebar.jsx`
- [requests/](frontend/src/features/requests/) - Generic request features

#### Worker Features
- [worker-profile/](frontend/src/features/worker-profile/) - Worker profile management
  - `AccountInformationCard.jsx`, `ProfessionalProfileCard.jsx`, `PortfolioCard.jsx`, `WorkerProfileHeader.jsx`, `SecurityCard.jsx`, `DangerZoneCard.jsx`
- [worker-dashboard/](frontend/src/features/worker-dashboard/) - Worker dashboard
  - `DashboardHeader.jsx`, `ActiveJobsCard.jsx`, `NewRequestsSection.jsx`, `ReliabilityCard.jsx`, `WorkerStatsGrid.jsx`
- [worker-requests/](frontend/src/features/worker-requests/) - Worker request handling
- [worker-request-details/](frontend/src/features/worker-request-details/) - Individual request details
- [worker-portfolio/](frontend/src/features/worker-portfolio/) - Portfolio display & management
- [worker-analytics/](frontend/src/features/worker-analytics/) - Performance analytics
- [worker-verification/](frontend/src/features/worker-verification/) - Verification workflow
- [workers/](frontend/src/features/workers/) - Worker discovery/browse

### 3.5 Components Library

**Path**: [src/components/](frontend/src/components/)

**Core UI Components** (reusable, primitive):
- [button.jsx](frontend/src/components/button.jsx) - Button component
- [card.jsx](frontend/src/components/card.jsx) - Card container
- [badge.jsx](frontend/src/components/badge.jsx) - Badge/label
- [switch.jsx](frontend/src/components/switch.jsx) - Toggle switch
- [progress-bar.jsx](frontend/src/components/progress-bar.jsx) - Progress indicator
- [avatar.jsx](frontend/src/components/avatar.jsx) - User avatar
- [stat-card.jsx](frontend/src/components/stat-card.jsx) - Statistic display card

**Feature Components**:
- [hero-search.jsx](frontend/src/components/hero-search.jsx) - Hero section with search
- [worker-profile-card.jsx](frontend/src/components/worker-profile-card.jsx) - Worker card in list
- [customer-request-card.jsx](frontend/src/components/customer-request-card.jsx) - Request card
- [worker-request-card.jsx](frontend/src/components/worker-request-card.jsx) - Worker's request card
- [category-card.jsx](frontend/src/components/category-card.jsx) - Service category card
- [footer.jsx](frontend/src/components/footer.jsx) - Application footer
- [top-nav.jsx](frontend/src/components/top-nav.jsx) - Navigation bar
- [user-menu.jsx](frontend/src/components/user-menu.jsx) - User dropdown menu

**Layout Components**:
- [layout/](frontend/src/components/layout/) - Layout wrapper components
- [auth/](frontend/src/components/auth/) - Authentication-related components

### 3.6 Services (API Integration)

**Path**: [src/services/](frontend/src/services/)

**Core API Service**:
- [api.service.js](frontend/src/services/api.service.js)
  - Base API client with `apiRequest()` function
  - Helper functions: `apiGet()`, `apiPost()`, `apiPatch()`, `apiDelete()`
  - Handles authentication headers (Bearer token from localStorage)
  - API base URL from `NEXT_PUBLIC_API_BASE_URL` env (default: localhost:8080/api/v1)
  - Error handling with custom error messages
  - Request/response interceptors

**Authentication Service**:
- [auth.service.js](frontend/src/services/auth.service.js)
  - User session management (localStorage)
  - `login(email, password)` - POST /auth/login
  - `logout()` - Clears session
  - `registerCustomer(data)` - POST /auth/register (role: customer)
  - `registerWorker(data)` - POST /auth/register (role: worker)
  - `forgotPassword(email)` - Password recovery
  - `getCurrentUser()`, `setCurrentUser()`, `isAuthenticated()`

**Worker Service**:
- [worker.service.js](frontend/src/services/worker.service.js)
  - Worker data mapping & normalization
  - `getWorkerById(workerId)` - GET /workers/{workerId}
  - ID format conversion (legacy format like "worker-123" to numeric)
  - Helper functions for formatting dates, status, worker cards

**Customer Service**:
- [customer.service.js](frontend/src/services/customer.service.js)
  - Customer profile management
  - Request normalization functions
  - Session merging for logged-in customers

**Request Service**:
- [request.service.js](frontend/src/services/request.service.js)
  - Service request operations
  - `createRequest(data)` - POST /customer/requests
  - `getRequest(requestId)` - GET /customer/requests/{requestId}
  - `listRequests()` - GET /customer/requests or /worker/requests
  - `acceptRequest(requestId)` - PATCH /worker/requests/{requestId}/decision
  - `rejectRequest(requestId)` - PATCH /worker/requests/{requestId}/decision
  - `startRequest(requestId)` - PATCH /worker/requests/{requestId}/start
  - `completeRequest(requestId)` - PATCH /worker/requests/{requestId}/complete
  - `confirmRequest(requestId)` - PATCH /customer/requests/{requestId}/confirm
  - `cancelRequest(requestId)` - PATCH /customer/requests/{requestId}/cancel
  - Request normalization with date/status formatting

**Review Service**:
- [review.service.js](frontend/src/services/review.service.js)
  - Review management (stored in local mock or backend)
  - `getReviews()`, `getReviewById(reviewId)`, `getReviewByRequest(requestId)`
  - `getWorkerReviews(workerId)`, `getCustomerReviews(customerId)`
  - `getWorkerRating(workerId)` - Average rating calculation
  - `submitReview(requestId, data)` - POST /customer/requests/{requestId}/review

**Portfolio Service**:
- [portfolio.service.js](frontend/src/services/portfolio.service.js)
  - Portfolio/past work management
  - Methods for fetching, creating, updating portfolio items

**Favorite Service**:
- [favorite.service.js](frontend/src/services/favorite.service.js)
  - Worker favoriting/bookmarking

**Payment Service**:
- TBD - Payment provider integration (Chapa/StarPay)

**Storage Service**:
- [storage.service.js](frontend/src/services/storage.service.js)
  - Local mock database for development/testing
  - `initializeDatabase()`, `getDatabase()`, `saveDatabase()`, `resetDatabase()`
  - CRUD operations: `findMany()`, `findOne()`, `insertOne()`, `updateOne()`, `deleteOne()`

### 3.7 State Management (Zustand)

**Path**: [src/store/](frontend/src/store/)

**File**: [authStore.js](frontend/src/store/authStore.js)
- Global auth state using Zustand
- **State**:
  - `user` - Current user object
  - `isAuthenticated` - Boolean flag
  - `isLoading` - Loading state
- **Actions**:
  - `initialize()` - Load user from localStorage on app startup
  - `login(email, password)` - Authentication
  - `registerCustomer(formData)` - Customer registration
  - `registerWorker(formData)` - Worker registration
  - `logout()` - Clear auth state

### 3.8 Providers (Context/Query Setup)

**Path**: [src/providers/](frontend/src/providers/)

**File**: [AuthProvider.jsx](frontend/src/providers/AuthProvider.jsx)
- Client component initializing authentication
- Calls `initializeDatabase()` to set up mock data
- Calls `useAuthStore.initialize()` to load user session
- Wraps children for auth context

**File**: [query-provider.jsx](frontend/src/providers/query-provider.jsx)
- React Query QueryClientProvider setup
- Configures query client with default options

### 3.9 Validation

**Path**: [src/validation/](frontend/src/validation/)

**File**: [helpers.js](frontend/src/validation/helpers.js)
- `validateSchema(schema, data)` - Validates data against Yup schema
- Returns `{ isValid, errors }` object
- Works with react-hook-form

**Sub-folders**:
- [auth/](frontend/src/validation/auth/) - Auth form validation schemas
- [customer/](frontend/src/validation/customer/) - Customer form validation
- [worker/](frontend/src/validation/worker/) - Worker form validation

### 3.10 Utilities

**Path**: [src/lib/](frontend/src/lib/)

**File**: [delay.js](frontend/src/lib/delay.js)
- Simulation utility for delay/loading states

**File**: [utils.js](frontend/src/lib/utils.js)
- General utility functions

### 3.11 Mock Data (Development)

**Path**: [src/mock/](frontend/src/mock/)

**File**: [initialize.js](frontend/src/mock/initialize.js)
- Exports database initialization/management functions
- Imports from storage.service

**Path**: [src/mock/data/](frontend/src/mock/data/)
- Mock data files (workers, customers, requests, categories, etc.)

### 3.12 Development Notes

**API Connection**:
- Frontend reads from Go backend at `http://localhost:8080/api/v1` by default
- Override with `NEXT_PUBLIC_API_BASE_URL` environment variable
- Backend must be running for auth, workers, requests, dashboards
- Falls back to mock data when backend unavailable

**Tech Stack Details**:
- Next.js App Router for routing (not Pages Router)
- React 19 with functional components
- Tailwind CSS for styling
- React Hook Form for form management
- Yup for validation schemas
- Zustand for global state (auth)
- React Query for server state (data fetching)
- ESLint for code quality

---

## 4. API TESTING & DOCUMENTATION

**File**: [postman/README.md](postman/README.md)
- Contains Postman collection and environment variables
- Notes workflow: Use `Worker/Complete Request` before `Customer/Review Request`

**File**: [postman/WorkConnect API.postman_collection.json](postman/WorkConnect%20API.postman_collection.json)
- Complete API collection with all endpoints
- Request/response examples

**File**: [postman/WorkConnect API.postman_environment.json](postman/WorkConnect%20API.postman_environment.json)
- Environment variables (base_url, tokens, etc.)

---

## 5. KEY ARCHITECTURAL PATTERNS

### 5.1 Backend Architecture (Go)

**Layered Pattern**:
```
HTTP Request
    ↓
Routing (chi router)
    ↓
Handler (HTTP handlers, validation)
    ↓
Module (Business logic, access control)
    ↓
Storage/Persistence (SQL queries)
    ↓
Database (PostgreSQL)
```

**Middleware Chain**:
- CORS middleware
- Auth middleware (JWT validation)
- RequireRoles middleware (authorization)

**Error Handling**:
- Custom error types with HTTP status mapping
- Structured error responses

**Authentication**:
- JWT tokens with custom claims (UserID, FullName, Role)
- Token stored in localStorage on frontend
- Sent as Bearer token in Authorization header

### 5.2 Frontend Architecture (React)

**Client-Server Data Flow**:
```
UI Components
    ↓
React Query (data fetching hooks)
    ↓
Service Layer (API calls)
    ↓
API Client (HTTP + auth headers)
    ↓
Backend API
```

**State Management**:
- Zustand for auth state (user, authenticated)
- React Query for server state (worker data, requests, reviews)
- React Hook Form for form state
- localStorage for persistence (user session)

**Component Structure**:
- Layout components (nested routes)
- Feature components (business logic)
- UI components (reusable)
- Services (API integration)

---

## 6. DATABASE MODELS

### User Model
- Roles: customer, worker, admin
- Password stored as bcrypt hash
- Email unique constraint
- Timestamps: created_at, updated_at

### Worker Profile Model
- One-to-one with User
- Skill association via worker_skills junction table
- Ratings calculated from reviews
- Verification workflow
- Portfolio with media

### Service Request Model
- Links customer user, worker profile, category
- Lifecycle: pending → accepted/rejected → completed/cancelled
- Includes messaging conversation (one-to-one)

### Messaging Model
- Conversations per request (customer + worker only)
- Messages have sender context
- Read tracking per user

### Reviews Model
- One review per completed request
- Rating 1-5
- Optional comment
- Auto-updates worker rating stats

### Payments Model
- Placeholder structure
- Provider refs for payment gateway integration

---

## 7. CONFIGURATION & ENVIRONMENT

**Backend Environment Variables**:
- `PORT` - Server port (default: 8080)
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - JWT signing key (default: "dev-secret-change-me")

**Frontend Environment Variables**:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://localhost:8080/api/v1)

**Local Development Setup**:
1. `.env` file in backend root
2. Backend runs on port 8080
3. Frontend runs on port 3000 (dev server)
4. CORS configured for localhost:3000

---

## 8. FILE COUNTS & SUMMARY

### Backend Structure
- **Go files**: Main modules + handlers, routing, middleware, models, DTOs, validation, errors, persistence, database, platform
- **Key count**: ~20 core files
- **Test files**: 1 (initializer_test.go)
- **SQL**: Auto-migrated schema in database.go

### Frontend Structure
- **React/JS files**: ~50+ component files + service files
- **Layouts**: 5 route groups
- **Features**: 12+ feature modules
- **Components**: 15+ component files
- **Services**: 9 service files
- **Configuration**: package.json, next.config.mjs, tailwind, postcss, eslint

### Project Files
- Docker: docker-compose.yml, Dockerfile (backend)
- Documentation: README files (backend, frontend, postman)
- API Testing: Postman collection & environment

---

## 9. DEVELOPMENT NOTES & INCOMPLETE IMPLEMENTATIONS

### Known Issues/TODOs:
1. **Backend**: Comment in user persistence about proper error handling for "user not found"
2. **Backend**: Comment in module/user/Login about validation placement (handler vs service)
3. **Frontend**: Mock data initialization for development mode
4. **Payment**: Placeholder implementation ready for Chapa/StarPay integration
5. **Verification**: Worker verification workflow partially implemented (pending in demo data)
6. **Portfolio**: Portfolio features scaffolded but not fully detailed in exploration

### Features Fully Implemented:
- ✅ User authentication (register/login)
- ✅ Worker discovery & listing
- ✅ Service request creation & management
- ✅ Worker accept/reject workflow
- ✅ Customer confirmation
- ✅ Request completion
- ✅ Review submission
- ✅ Messaging between participants
- ✅ Dashboard analytics (customer, worker, admin)
- ✅ Worker verification workflow
- ✅ Role-based access control

### Features Partially Implemented:
- ⚠️ Payment processing (structure only)
- ⚠️ Portfolio management (models exist, UI scaffolded)
- ⚠️ Worker verification documents (schema exists, not detailed)
- ⚠️ Notification preferences (schema exists, not wired)

---

## 10. TECHNOLOGY STACK SUMMARY

**Backend**:
- Runtime: Go 1.26.1
- HTTP Router: Chi v5.2.5
- Database: PostgreSQL (via pgx)
- Authentication: JWT (golang-jwt)
- Hashing: bcrypt (golang.org/x/crypto)
- Validation: ozzo-validation
- Logging: Uber zap
- Deployment: Docker (distroless)

**Frontend**:
- Framework: Next.js 16.2.6
- UI Library: React 19.2.4
- State: Zustand, React Query, React Hook Form
- Styling: Tailwind CSS 4
- Validation: Yup
- HTTP: Fetch API (browser native)
- Build: Next.js built-in (Webpack)

**Infrastructure**:
- Containerization: Docker & Docker Compose
- Database: PostgreSQL (Neon in prod docs)
- API Testing: Postman

---

This comprehensive map covers all major components, files, API endpoints, data models, services, and architectural patterns in the WorkConnect codebase.
