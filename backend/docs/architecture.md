# WorkConnect Architecture Notes

## 1) Architecture

WorkConnect follows a clear 3-tier architecture:

1. Presentation Layer: Next.js frontend
2. Application Layer: Go backend API
3. Data Layer: PostgreSQL

Backend layering:

- `cmd/main.go` bootstraps startup
- `internal/initializer` wires logger, db, module, router
- `internal/glue/routing` declares route groups
- `internal/handler/rest` handles HTTP concerns only
- `internal/module` contains business rules and role workflows
- `internal/storage/persistence` runs SQL and persistence queries
- `platform/database` manages DB connection and migration

## 2) Role Workflows

### Customer

1. Register/login
2. Search workers by category/city/keyword
3. View worker profile
4. Create service request
5. Track request status
6. Pay (payment intent placeholder)
7. Leave review after completion

### Worker

1. Register as worker
2. Wait for admin verification
3. Receive and review incoming requests
4. Accept/reject requests
5. Update availability (available/busy)
6. Track dashboard metrics

### Admin

1. View platform dashboard
2. Review pending worker verifications
3. Verify worker accounts

## 3) Simplifications (Mentor-Aligned)

- Scheduling uses a single optional preferred datetime, not full calendar scheduling.
- Payments are integration-ready with a payment initiation endpoint (for Chapa/StarPay), not a custom payment engine.
- Admin is focused on core governance features only.

## 4) Database Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o| WORKER_PROFILES : "has worker profile"
    WORKER_PROFILES ||--o{ WORKER_SKILLS : "has skills"
    SERVICE_CATEGORIES ||--o{ WORKER_SKILLS : "tags worker"

    USERS ||--o{ SERVICE_REQUESTS : "customer creates"
    WORKER_PROFILES ||--o{ SERVICE_REQUESTS : "worker receives"
    SERVICE_CATEGORIES ||--o{ SERVICE_REQUESTS : "request category"

    SERVICE_REQUESTS ||--o| REVIEWS : "one completion review"
    USERS ||--o{ REVIEWS : "customer writes"
    WORKER_PROFILES ||--o{ REVIEWS : "worker receives"

    SERVICE_REQUESTS ||--o{ PAYMENTS : "payment records"

    USERS {
      bigint id PK
      string full_name
      string email UK
      string phone
      string role
      bool is_active
      string password_hash
      timestamptz created_at
      timestamptz updated_at
    }

    WORKER_PROFILES {
      bigint id PK
      bigint user_id FK UK
      string headline
      string bio
      string city
      int experience_years
      numeric hourly_rate_etb
      string availability_status
      bool is_verified
      numeric rating_average
      int rating_count
      int completed_jobs
      timestamptz created_at
      timestamptz updated_at
    }

    SERVICE_CATEGORIES {
      bigint id PK
      string name UK
      string slug UK
      string description
    }

    SERVICE_REQUESTS {
      bigint id PK
      string reference_code UK
      bigint customer_id FK
      bigint worker_id FK
      bigint category_id FK
      string title
      string description
      string location_address
      timestamptz preferred_at
      numeric budget_etb
      string status
      timestamptz worker_decision_at
      timestamptz created_at
      timestamptz updated_at
    }

    REVIEWS {
      bigint id PK
      bigint request_id FK UK
      bigint customer_id FK
      bigint worker_id FK
      int rating
      string comment
      timestamptz created_at
    }

    PAYMENTS {
      bigint id PK
      bigint request_id FK
      numeric amount_etb
      string currency
      string provider
      string provider_ref
      string status
      timestamptz paid_at
      timestamptz created_at
      timestamptz updated_at
    }
```
