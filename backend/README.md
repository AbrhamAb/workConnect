# WorkConnect Backend

Go backend for WorkConnect, a service marketplace that connects customers with verified workers (electricians, plumbers, carpenters, mechanics, cleaners, and related professionals).

## Tech Stack

- Go + Chi router
- PostgreSQL
- JWT authentication
- Layered backend architecture:
  - routing -> handler -> module -> persistence -> database

## What Was Designed From Your Customer Screens

The current backend prioritizes customer-side workflows shown in your UI designs:

- Authentication (register/login/profile)
- Worker discovery (category, city, search, sort)
- Worker profile details
- Service request submission (title, issue description, location, preferred time, budget)
- Request tracking dashboard
- Review submission after completion
- Payment initiation placeholder (ready for Chapa/StarPay integration)

Worker and Admin modules are included with simplified, project-friendly scope:

- Worker: receive requests, accept/reject, update availability, dashboard
- Admin: monitor platform, list pending workers, verify worker accounts

## API Base

- Base URL: `/api/v1`

## Main Route Groups

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

See `docs/architecture.md` for the architecture and relational diagram.

## Environment Variables

- `DATABASE_URL` (required)
- `JWT_SECRET` (required in real deployments)
- `PORT` (optional, default `8080`)

## Run

```powershell
Set-Location backend
$env:DATABASE_URL="postgres://user:password@localhost:5432/workconnect?sslmode=disable"
$env:JWT_SECRET="change-me"
go run ./cmd/main.go
```

Health check:

- `GET /health`

## Run With Docker

From the repository root (where `docker-compose.yml` is located):

```powershell
docker compose up --build -d
```

View service logs:

```powershell
docker compose logs -f backend db
```

Stop services:

```powershell
docker compose down
```

Stop services and remove database volume:

```powershell
docker compose down -v
```

### Docker Environment Variables

The backend service is configured in `docker-compose.yml` with:

- `PORT=8080`
- `JWT_SECRET=change-me-in-prod`
- `DATABASE_URL=postgres://task_user:task_password@db:5432/task_management?sslmode=disable`

`db` is the Postgres service name, and Docker's internal network lets the backend connect to it directly by that name.
