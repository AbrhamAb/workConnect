# Contributing to WorkConnect

Welcome! This document outlines our development process, focusing on contract-first API development to prevent integration issues between frontend and backend.

---

## Table of Contents
1. [Overview](#overview)
2. [Contract-First Development](#contract-first-development)
3. [Frontend Development Workflow](#frontend-development-workflow)
4. [Backend Development Workflow](#backend-development-workflow)
5. [API Contract Rules](#api-contract-rules)
6. [Pre-Commit Validation](#pre-commit-validation)
7. [Code Review Checklist](#code-review-checklist)

---

## Overview

WorkConnect uses a **contract-first API architecture** where the OpenAPI specification (`openapi.yaml`) is the **single source of truth** for all API communication between frontend and backend.

### Key Principles
- ✅ **Contract First**: OpenAPI spec changes come before code changes
- ✅ **Field Name Consistency**: All fields use camelCase (verified across all 25 endpoints)
- ✅ **HTTP Method Integrity**: Method changes require explicit approval
- ✅ **Backward Compatibility**: No breaking changes without version bump
- ✅ **Implementation Coverage**: Every backend endpoint must have a frontend caller or explicit TODO

---

## Contract-First Development

### The Contract-First Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. PLAN: Add new endpoint or modify existing one       │
├─────────────────────────────────────────────────────────┤
│ 2. UPDATE: Modify openapi.yaml with new contract      │
│    - Add/modify paths, methods, parameters, schemas    │
│    - Update request/response field names              │
│    - Document all changes in commit message            │
├─────────────────────────────────────────────────────────┤
│ 3. BACKEND: Implement endpoint to match spec          │
│    - Use struct tags that exactly match openapi.yaml   │
│    - All DTOs must match schema definitions            │
│    - All response models must match response types     │
├─────────────────────────────────────────────────────────┤
│ 4. FRONTEND: Implement API calls matching spec        │
│    - Create/update service layer to match paths       │
│    - Use exact field names from request/response      │
│    - Add UI components to call the endpoint           │
├─────────────────────────────────────────────────────────┤
│ 5. VALIDATE: Run pre-commit validation scripts        │
│    - Check backend struct tags against openapi.yaml    │
│    - Verify no field name mismatches                  │
│    - Confirm HTTP methods unchanged                    │
├─────────────────────────────────────────────────────────┤
│ 6. REVIEW: Code review with focus on contract         │
│    - Verify spec was updated first                     │
│    - Confirm implementations match spec exactly        │
│    - Check for backwards compatibility                 │
├─────────────────────────────────────────────────────────┤
│ 7. MERGE: Deploy with confidence                       │
│    - Contract ensures no integration issues            │
│    - Frontend and backend automatically aligned        │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Development Workflow

### When Adding a New API Call

1. **Check the spec first**
   ```bash
   grep -A 10 "/your/endpoint" openapi.yaml
   ```

2. **Note the exact contract**
   - HTTP method (GET, POST, PATCH, DELETE)
   - Path and parameters
   - Request body fields and types
   - Response fields and types
   - Authentication requirement

3. **Implement the service layer call**
   ```javascript
   // src/services/your.service.js
   export async function callNewEndpoint(data) {
     const response = await apiPost("/your/endpoint", {
       fieldName1: data.fieldName1,  // MUST match openapi.yaml exactly
       fieldName2: data.fieldName2,
     });
     return response?.data || response;
   }
   ```

4. **Use in UI components**
   ```javascript
   try {
     const result = await callNewEndpoint(formData);
     // Handle response
   } catch (error) {
     // Handle error
   }
   ```

### Field Naming Rules

**All field names MUST match openapi.yaml exactly**

✅ Correct (matches spec):
```javascript
const request = {
  workerId: 123,        // ← camelCase
  categoryId: 45,       // ← camelCase
  locationAddress: "...", // ← camelCase
  budgetEtb: 500,      // ← camelCase with unit suffix
  preferredAt: "2026-08-17T10:00:00Z", // ← ISO datetime
};
```

❌ Incorrect (does not match spec):
```javascript
const request = {
  workerID: 123,        // ← Wrong: should be workerId
  category_id: 45,      // ← Wrong: should be categoryId
  location_address: "", // ← Wrong: should be locationAddress
  budget_etb: 500,      // ← Wrong: should be budgetEtb
  preferred_at: "...",  // ← Wrong: should be preferredAt
};
```

---

## Backend Development Workflow

### When Adding a New Endpoint

1. **Update openapi.yaml first**
   ```yaml
   /your/endpoint:
     post:
       operationId: yourOperationId
       tags: [YourTag]
       summary: Brief description
       security:
         - bearerAuth: []  # if authenticated
       parameters: [...]
       requestBody: {...}
       responses:
         "201":
           description: Success
           content:
             application/json:
               schema:
                 $ref: "#/components/schemas/YourResponse"
   ```

2. **Add request DTO struct with exact field names**
   ```go
   // internal/model/dto/your_dto.go
   type YourRequest struct {
       WorkerID   int64  `json:"workerId" validate:"required"`  // ← Match openapi.yaml
       CategoryID int64  `json:"categoryId" validate:"required"`
       Title      string `json:"title" validate:"required"`
       BudgetEtb  float64 `json:"budgetEtb" validate:"required"`
   }
   ```

3. **Add response model struct with exact field names**
   ```go
   // internal/model/db/models.go
   type YourResponse struct {
       ID         int64     `json:"id"`
       WorkerID   int64     `json:"workerId"`      // ← Match openapi.yaml
       CreatedAt  time.Time `json:"createdAt"`
   }
   ```

4. **Register route with exact HTTP method**
   ```go
   // internal/glue/routing/your.go
   router.Post("/your/endpoint", h.YourHandler)  // ← Must match method in spec
   ```

5. **Implement handler following spec exactly**
   ```go
   func (h *Handler) YourHandler(w http.ResponseWriter, r *http.Request) {
       var req dto.YourRequest
       if err := decodeAndValidate(r, &req); err != nil {
           response.SendErrorResponse(w, r, err)
           return
       }
       
       // Process request
       
       response.SendSuccessResponse(w, r, http.StatusCreated, "...", 
           map[string]any{"data": result})
   }
   ```

### Struct Tag Convention

All struct tags MUST use JSON struct tags with exact field names from openapi.yaml:

✅ Correct (matches openapi.yaml):
```go
type CreateServiceRequest struct {
    WorkerID       int64     `json:"workerId" validate:"required"`
    CategoryID     int64     `json:"categoryId" validate:"required"`
    LocationAddress string   `json:"locationAddress" validate:"required"`
    BudgetEtb      float64   `json:"budgetEtb" validate:"required"`
    PreferredAt    time.Time `json:"preferredAt" validate:"required"`
}
```

❌ Incorrect (won't match validation):
```go
type CreateServiceRequest struct {
    WorkerID       int64     `json:"worker_id"`      // ← Wrong
    CategoryID     int64     `json:"category_id"`    // ← Wrong
    LocationAddress string   `json:"location_address"` // ← Wrong
    BudgetEtb      float64   `json:"budget_etb"`    // ← Wrong
}
```

---

## API Contract Rules

### Field Names (Golden Rule)
**All JSON field names MUST use camelCase and MUST match openapi.yaml**

- ✅ workerId, categoryId, locationAddress, budgetEtb, preferredAt
- ❌ worker_id, worker-id, workerID, WORKER_ID

### HTTP Methods
- GET: Retrieving data (never has request body)
- POST: Creating new resources
- PATCH: Modifying existing resources (partial updates)
- DELETE: Deleting resources

**Methods are READ-ONLY**: Changing an endpoint's HTTP method requires:
1. Approval from both frontend and backend leads
2. Major version bump in API versioning
3. Deprecation notice for existing clients

### Authentication
All endpoints must explicitly declare authentication requirements in openapi.yaml:
```yaml
security:
  - bearerAuth: []  # Requires JWT token
# OR
security: []  # No auth required
```

### Response Format
All responses MUST follow the standard envelope format:
```json
{
  "status": 200,
  "message": "Human readable message",
  "data": { /* actual response data */ },
  "meta": { /* pagination, etc */ }
}
```

### Error Format
All error responses MUST include:
```json
{
  "status": 400,
  "message": "Error message",
  "error": {
    "type": "ValidationError",
    "message": "Field validation failed",
    "details": [
      { "field": "email", "message": "Invalid email" }
    ]
  }
}
```

---

## Pre-Commit Validation

### Automatic Validation (Git Hooks)

Before committing, our pre-commit hook runs:

```bash
# 1. Validate backend structs match openapi.yaml
go run ./scripts/validate-api-contract.go

# 2. Check for field name consistency
grep -E "json:\"[a-z]+_[a-z]" internal/model --recursive

# 3. Verify HTTP methods haven't changed
./scripts/check-http-methods.sh

# 4. Frontend field name check (if files changed)
grep -E "workerId|worker_id|workerID" frontend/src --recursive
```

### Manual Validation

To manually validate the contract:

```bash
# Backend: Validate all structs against spec
go run ./scripts/validate-api-contract.go

# Frontend: Check for field name mismatches
npm run validate:api-contract

# Full validation
make validate-contract
```

---

## Code Review Checklist

When reviewing API-related changes, ensure:

### 1. Contract First ✅
- [ ] `openapi.yaml` was modified BEFORE code changes
- [ ] All changes are documented in the spec
- [ ] Commit message references the spec section modified

### 2. Field Names ✅
- [ ] All JSON field names use camelCase
- [ ] Field names exactly match openapi.yaml
- [ ] No snake_case (field_name) or PascalCase (FieldName) anywhere
- [ ] Unit suffixes (Etb, Usd) are included in field names if in spec

### 3. HTTP Methods ✅
- [ ] HTTP method matches openapi.yaml
- [ ] GET endpoints have no request body
- [ ] POST endpoints create resources, PATCH modifies, DELETE removes
- [ ] If HTTP method changed, see special approval requirements

### 4. Backend Implementation ✅
- [ ] Struct tags exactly match openapi.yaml field names
- [ ] Request DTOs have `json:` tags matching spec
- [ ] Response models have `json:` tags matching spec
- [ ] All validation rules are documented in struct tags
- [ ] Handler implementation matches spec exactly

### 5. Frontend Implementation ✅
- [ ] API calls use exact paths from spec
- [ ] Request body fields exactly match spec
- [ ] Response field access uses exact names from spec
- [ ] Error handling follows standard envelope format
- [ ] UI component exists or TODO comment added

### 6. Testing ✅
- [ ] Integration tests verify request/response format
- [ ] Manual testing confirms field names are correct
- [ ] Both frontend and backend tested together
- [ ] Error cases handled properly

### 7. Documentation ✅
- [ ] Changes described in commit message
- [ ] openapi.yaml includes operation descriptions
- [ ] New DTOs documented in schema section
- [ ] Breaking changes noted in PR description

---

## Common Mistakes & Fixes

### ❌ Mistake: Using snake_case in JSON
```go
type Request struct {
    WorkerID int64 `json:"worker_id"`  // Wrong!
}
```
✅ **Fix**: Use camelCase matching spec
```go
type Request struct {
    WorkerID int64 `json:"workerId"`  // Correct
}
```

### ❌ Mistake: Forgetting to update openapi.yaml
```go
// Backend code changed but spec not updated
type NewRequest struct {
    NewField string `json:"newField"`
}
```
✅ **Fix**: Update spec first, then implement
```yaml
# Update openapi.yaml first
components:
  schemas:
    NewRequest:
      type: object
      properties:
        newField:
          type: string
```

### ❌ Mistake: Wrong HTTP method
```javascript
// Frontend sends PATCH but backend expects POST
await apiPatch("/items", data);  // Wrong!
```
✅ **Fix**: Match spec exactly
```javascript
// Check spec shows POST
await apiPost("/items", data);  // Correct
```

### ❌ Mistake: Inconsistent field names between frontend/backend
```javascript
// Frontend
apiPost("/create-request", {
    workerID: 123,  // Wrong casing
});

// Backend expects
type CreateRequest struct {
    WorkerID int64 `json:"workerId"`  // camelCase
}
```
✅ **Fix**: Both sides must match spec
```javascript
// Frontend - matches spec
apiPost("/customer/requests", {
    workerId: 123,  // Correct casing
});
```

---

## Deployment Checklist

Before deploying to production:

1. **Contract Validation** ✅
   - [ ] Run `validate-api-contract` script and get green
   - [ ] All structs match field names in openapi.yaml
   - [ ] No field name mismatches detected

2. **Integration Testing** ✅
   - [ ] Frontend and backend deployed to staging
   - [ ] All API calls succeed with correct data
   - [ ] No "undefined property" errors in frontend
   - [ ] All error responses follow standard format

3. **Documentation** ✅
   - [ ] openapi.yaml is up-to-date
   - [ ] All new endpoints documented
   - [ ] CHANGELOG.md updated with API changes
   - [ ] Client documentation (if external) updated

4. **Backwards Compatibility** ✅
   - [ ] No breaking changes to existing endpoints
   - [ ] If needed, deprecated endpoints still work
   - [ ] Migration path documented for clients

---

## Getting Help

- **API Contract Questions**: See `openapi.yaml` and this document
- **Field Name Consistency**: Search spec for field name examples
- **Backend Implementation**: See `backend/internal/model/` for similar structures
- **Frontend Implementation**: See `frontend/src/services/` for similar calls
- **Validation Scripts**: See `scripts/validate-api-contract.go`

---

## Questions?

If you're unsure whether a change follows the contract-first process, **always ask before coding**. It's better to clarify the contract first than fix integration issues later.

Happy coding! 🚀
