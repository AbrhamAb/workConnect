# WorkConnect Backend

Go backend for WorkConnect, a service marketplace that connects customers with verified workers (electricians, plumbers, carpenters, mechanics, cleaners, and related professionals).

## Tech Stack

- Go + Chi router
- PostgreSQL
- JWT authentication
- Layered backend architecture:
  - routing -> handler -> module -> persistence -> database

## Architecture

- `cmd/main.go` bootstraps the app
- `internal/initializer` wires logger, DB, modules, and router
- `internal/glue/routing` declares API routes
- `internal/handler/rest` contains HTTP handlers and request/response handling
- `internal/module` contains business rules and access control
- `internal/storage/persistence` contains SQL queries and transactional persistence logic
- `platform/database` opens the DB connection and applies schema migrations

## What Was Designed From Your Customer Screens

The current backend prioritizes customer-side workflows shown in your UI designs:

- Authentication (register/login/profile)
- Worker discovery (category, city, search, sort)
- Worker profile details
- Service request submission (title, issue description, location, preferred time, budget)
- Request tracking dashboard
- Review submission after completion
- Payment initiation placeholder (ready for Chapa/StarPay integration)
- Messaging between customer and worker after the worker accepts a request

Worker and Admin modules are included with simplified, project-friendly scope:

- Worker: receive requests, accept/reject, update availability, dashboard
- Admin: monitor platform, list pending workers, verify worker accounts

## API Base

- Base URL: `/api/v1`

## Main Route Groups

- Health
  - `GET /health`
- Public
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /workers`
  - `GET /workers/{workerID}`
- Authenticated
  - `GET /auth/me`
- Customer role
  - `POST /customer/requests`
  - `GET /customer/requests`
  - `POST /customer/requests/{requestID}/review`
  - `POST /customer/requests/{requestID}/payments/initiate`
  - `GET /customer/dashboard`
- Worker role
  - `GET /worker/requests`
  - `PATCH /worker/requests/{requestID}/decision`
  - `PATCH /worker/availability`
  - `GET /worker/dashboard`
- Customer/Worker messaging
  - `GET /messages/conversations`
  - `GET /messages/requests/{requestID}`
  - `POST /messages/requests/{requestID}`
- Admin role
  - `GET /admin/dashboard`
  - `GET /admin/workers/pending-verification`
  - `PATCH /admin/workers/{workerID}/verify`

## Data Model Summary

Core tables:

- users
- worker_profiles
- service_categories
- worker_skills
- service_requests
- reviews
- payments
- message_conversations
- messages
- message_conversation_reads

See `docs/architecture.md` for the architecture and relational diagram.

## Messaging Rules

- Messaging is available only after a worker accepts the request.
- Only the assigned customer and worker can read or send messages in a thread.
- Conversations are created automatically when a worker accepts a request.
- The thread is tied to a service request, not a standalone chat room.
- Read state and unread counts are tracked per participant.

## Environment Variables

- `DATABASE_URL` (required)
- `JWT_SECRET` (required in real deployments)
- `PORT` (optional, default `8080`)

### Neon Database Example

Use your Neon connection string and keep SSL enabled:

```text
postgres://<neon_user>:<neon_password>@<neon_host>/<neon_db>?sslmode=require
```

## Run

```powershell
Set-Location backend
$env:DATABASE_URL="postgres://<neon_user>:<neon_password>@<neon_host>/<neon_db>?sslmode=require"
$env:JWT_SECRET="change-me"
go run ./cmd/main.go
```

Health check:

- `GET /health`

## Local API Base

- `http://localhost:8080/api/v1`

## Recommended Test Order

1. `POST /auth/register` for customer, worker, and admin users.
2. `POST /auth/login` for each role and save the tokens.
3. `GET /admin/workers/pending-verification` then `PATCH /admin/workers/{workerID}/verify`.
4. `GET /workers` and `GET /workers/{workerID}` to confirm the verified worker is visible.
5. `POST /customer/requests` to create a job request.
6. `PATCH /worker/requests/{requestID}/decision` with `accept`.
7. `GET /messages/conversations` and `GET /messages/requests/{requestID}`.
8. `POST /messages/requests/{requestID}` to send a message.
9. `GET /customer/dashboard`, `GET /worker/dashboard`, and `GET /admin/dashboard`.
10. `POST /customer/requests/{requestID}/payments/initiate`.
11. Update the request to `completed` in the database if you want to test `POST /customer/requests/{requestID}/review`, because the project currently does not expose a public complete-request endpoint.

## Run With Docker

From the repository root (where `docker-compose.yml` is located):

```powershell
# First time only:
Copy-Item .env.example .env
# Edit .env and set your Neon DATABASE_URL

docker compose up --build -d
```

View service logs:

```powershell
docker compose logs -f backend
```

Stop services:

```powershell
docker compose down
```

Stop services and remove database volume:

```powershell
docker compose down
```

### Docker Environment Variables

The backend service is configured in `docker-compose.yml` with:

- `PORT` (defaults to `8080`)
- `JWT_SECRET` (defaults to `change-me-in-prod`)
- `DATABASE_URL` (required, set this to your Neon connection string)

The project no longer depends on a local Docker Postgres container. The backend connects directly to your external Neon Postgres instance.

## Database Migration Behavior

On startup, the backend runs schema migration SQL automatically against the configured `DATABASE_URL`. With Neon, this means your cloud database schema is created/updated when the service boots.

## Current API Summary

### Health

- `GET /health`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Public Worker Discovery

- `GET /api/v1/workers`
- `GET /api/v1/workers/{workerID}`

### Customer

- `POST /api/v1/customer/requests`
- `GET /api/v1/customer/requests`
- `POST /api/v1/customer/requests/{requestID}/review`
- `POST /api/v1/customer/requests/{requestID}/payments/initiate`
- `GET /api/v1/customer/dashboard`

### Worker

- `GET /api/v1/worker/requests`
- `PATCH /api/v1/worker/requests/{requestID}/decision`
- `PATCH /api/v1/worker/availability`
- `GET /api/v1/worker/dashboard`

### Messaging

- `GET /api/v1/messages/conversations`
- `GET /api/v1/messages/requests/{requestID}`
- `POST /api/v1/messages/requests/{requestID}`

### Admin

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/workers/pending-verification`
- `PATCH /api/v1/admin/workers/{workerID}/verify`
