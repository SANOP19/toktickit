# Lab 3 REST API Specification: TokTickIT Security, Workflows, and Administration

## 1. Global API Standards & Conventions

- **Base URL:** `/api`
- **Default Content-Type:** `application/json` (except `multipart/form-data` for attachment uploads)
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Security Standard:** Every protected route verifies identity via middleware. Client-supplied IDs (e.g. `requesterId` in body or query) are overridden by `req.user.id`.
- **Standard Error Response Shape:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_ERROR",
    "message": "Human-readable explanation of error.",
    "fields": {
      "fieldName": "Field-specific validation error message."
    }
  }
}
```

---

## 2. Authentication & Session Endpoints

### 2.1 POST `/api/auth/login`
- **Purpose:** Authenticate user credentials and establish session.
- **Access:** Public (Unauthenticated).
- **Request Body:**
```json
{
  "email": "janderson@example.com",
  "password": "Password123!"
}
```
- **Responses:**
  - `200 OK`:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "janderson@example.com",
      "role": "REQUESTER",
      "mustChangePassword": false,
      "isActive": true
    }
  }
  ```
  - `401 Unauthorized`: Invalid credentials or deactivated account (`code: INVALID_CREDENTIALS | ACCOUNT_INACTIVE`).

### 2.2 POST `/api/auth/logout`
- **Purpose:** Terminate user session and clear client tokens.
- **Access:** Authenticated (Any Role).
- **Responses:**
  - `200 OK`: `{ "message": "Successfully logged out." }`

### 2.3 GET `/api/auth/me`
- **Purpose:** Retrieve current authenticated user profile.
- **Access:** Authenticated (Any Role).
- **Responses:**
  - `200 OK`: `{ "user": { "id": 1, "name": "Jennifer Anderson", "email": "janderson@example.com", "role": "REQUESTER", "mustChangePassword": false, "isActive": true } }`
  - `401 Unauthorized`: Missing or invalid Bearer token.

### 2.4 POST `/api/auth/change-password`
- **Purpose:** Change user password (mandatory for first login or self-service update).
- **Access:** Authenticated (Any Role, including quarantined users with `mustChangePassword=true`).
- **Request Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "SecurePassword2026!",
  "confirmPassword": "SecurePassword2026!"
}
```
- **Responses:**
  - `200 OK`: `{ "message": "Password successfully updated.", "mustChangePassword": false }`
  - `400 Bad Request`: Password mismatch, incorrect current password, or length < 8 chars.

---

## 3. Requester Ticket Endpoints (Continuation of Lab 2)

### 3.1 POST `/api/tickets`
- **Purpose:** Create a new support ticket bound to the authenticated requester.
- **Access:** Requester, Administrator.
- **Request Body:**
```json
{
  "summary": "Laptop screen flickers intermittently",
  "description": "The display blinks black every few minutes when connected to external monitor.",
  "categoryId": 2,
  "relatedSystemId": 7,
  "requestedPriority": "HIGH"
}
```
- **Responses:**
  - `201 Created`: Returns created ticket with generated `ticketNumber` (`TKT-YYYY-XXXXXX`), `currentStatus: "New"`, `requesterId: req.user.id`.
  - `400 Bad Request`: Field validation failure.

### 3.2 GET `/api/tickets`
- **Purpose:** Retrieve tickets submitted by the authenticated requester.
- **Access:** Requester (Returns only owned tickets).
- **Query Parameters:** `search`, `categoryId`, `status`, `priority`, `page` (default: 1), `limit` (default: 10), `sortBy`, `sortOrder`.
- **Responses:**
  - `200 OK`: Paginated list of owned tickets with metadata (`total`, `page`, `totalPages`).

### 3.3 GET `/api/tickets/:id`
- **Purpose:** View ticket details, active attachments, and public comments.
- **Access:** Requester (owned tickets only), IT Staff, Administrator.
- **Responses:**
  - `200 OK`: Full ticket details with category, related system, attachments, and public comments.
  - `404 Not Found`: Ticket not found or not owned by requesting Requester.

### 3.4 POST `/api/tickets/:id/resolve-indication`
- **Purpose:** Requester signals that the problem appears resolved.
- **Access:** Ticket Owner Requester.
- **Request Body:** `{ "isResolved": true }`
- **Responses:**
  - `200 OK`: Updated ticket with `isRequesterResolved: true`.
  - `403 Forbidden`: Not ticket owner.

---

## 4. IT Staff Ticket Queue & Operations Endpoints

### 4.1 GET `/api/staff/tickets`
- **Purpose:** Shared Ticket Queue query engine for IT Staff triaging.
- **Access:** IT Staff, Administrator.
- **Query Parameters:**
  - `search`: Case-insensitive search on `ticketNumber` and `summary`.
  - `categoryId`: Filter by Category ID.
  - `currentStatus`: Filter by Status (`New`, `Open`, `In Progress`, etc.).
  - `priority`: Filter by IT Priority or Requested Priority.
  - `ownerFilter`: `all` | `unassigned` | `assigned_to_me`.
  - `page`: Page index (default: 1).
  - `limit`: Page size (default: 10).
  - `sortBy`: `createdAt` | `updatedAt` | `ticketNumber` | `itPriority`.
  - `sortOrder`: `asc` | `desc`.
- **Responses:**
  - `200 OK`:
  ```json
  {
    "tickets": [...],
    "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
  }
  ```
  - `403 Forbidden`: Requesters are blocked from queue access.

### 4.2 GET `/api/staff/tickets/:id`
- **Purpose:** Retrieve comprehensive operational ticket detail including Internal Notes.
- **Access:** IT Staff, Administrator.
- **Responses:**
  - `200 OK`: Complete ticket record including Requester profile, Owner profile, Attachments, Public Comments, and Internal Notes.

### 4.3 PATCH `/api/staff/tickets/:id/assign`
- **Purpose:** Claim or reassign ticket ownership.
- **Access:** IT Staff, Administrator.
- **Request Body:** `{ "ownerId": 2 }` (or `null` to unassign).
- **Behavior:** If ticket status was `New`, assigning an owner automatically advances status to `Open`.
- **Responses:**
  - `200 OK`: Updated ticket with new `ownerId` and assigned user profile.
  - `400 Bad Request`: Invalid owner ID (user must be active IT Staff).

### 4.4 PATCH `/api/staff/tickets/:id/priority`
- **Purpose:** Modify IT Priority.
- **Access:** IT Staff, Administrator.
- **Request Body:** `{ "itPriority": "HIGH" }`
- **Responses:**
  - `200 OK`: Updated ticket with new `itPriority`.

### 4.5 PATCH `/api/staff/tickets/:id/status`
- **Purpose:** Advance ticket status across permitted lifecycle states.
- **Access:** IT Staff, Administrator.
- **Request Body:** `{ "status": "In Progress" }`
- **Validation:** Must follow permitted transition matrix.
- **Responses:**
  - `200 OK`: Updated ticket status.
  - `400 Bad Request`: Disallowed status transition.

---

## 5. Comments & Internal Notes Endpoints

### 5.1 GET `/api/tickets/:id/comments`
- **Purpose:** Retrieve threaded Public Comments.
- **Access:** Requester (owned ticket), IT Staff, Administrator.
- **Responses:**
  - `200 OK`: Array of comment objects: `[{ "id": 1, "author": { "name": "...", "role": "..." }, "content": "...", "createdAt": "..." }]`.

### 5.2 POST `/api/tickets/:id/comments`
- **Purpose:** Append a new Public Comment.
- **Access:** Requester (owned ticket), IT Staff, Administrator.
- **Request Body:** `{ "content": "Thank you, the replacement battery arrived." }`
- **Responses:**
  - `201 Created`: Appended comment object.
  - `400 Bad Request`: Empty or whitespace-only content.

### 5.3 GET `/api/tickets/:id/notes`
- **Purpose:** Retrieve confidential Internal Notes.
- **Access:** IT Staff, Administrator ONLY.
- **Responses:**
  - `200 OK`: Array of internal note objects.
  - `403 Forbidden`: Returned immediately to Requesters without leaking note count or presence.

### 5.4 POST `/api/tickets/:id/notes`
- **Purpose:** Append a confidential Internal Note.
- **Access:** IT Staff, Administrator ONLY.
- **Request Body:** `{ "content": "Checked vendor warranty. Dispatching technician on Monday." }`
- **Responses:**
  - `201 Created`: Appended internal note object.
  - `403 Forbidden`: Returned to Requesters.

---

## 6. Administrator User Management Endpoints

### 6.1 GET `/api/admin/users`
- **Purpose:** Retrieve user accounts.
- **Access:** Administrator ONLY.
- **Query Parameters:** `search` (name or email), `role` (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
- **Responses:**
  - `200 OK`: Array of user records: `[{ "id": 1, "name": "...", "email": "...", "role": "...", "isActive": true, "mustChangePassword": false }]`.
  - `403 Forbidden`: Returned to non-administrators.

### 6.2 POST `/api/admin/users`
- **Purpose:** Create a new user account with initial password.
- **Access:** Administrator ONLY.
- **Request Body:**
```json
{
  "name": "Alex Thompson",
  "email": "alex.t@example.com",
  "role": "IT_STAFF",
  "isActive": true,
  "initialPassword": "Password123!",
  "mustChangePassword": true
}
```
- **Responses:**
  - `201 Created`: User created with hashed initial password.
  - `409 Conflict`: Email address already registered (`code: EMAIL_ALREADY_EXISTS`).
  - `400 Bad Request`: Validation failure.

### 6.3 PATCH `/api/admin/users/:id`
- **Purpose:** Update user details, role, or activation status.
- **Access:** Administrator ONLY.
- **Request Body:**
```json
{
  "name": "Alex Thompson",
  "email": "alex.t@example.com",
  "role": "IT_STAFF",
  "isActive": false
}
```
- **Safety Guards:**
  - If `id === req.user.id && isActive === false` → returns `400 Bad Request` with `CANNOT_DEACTIVATE_SELF`.
  - If target user is the last active Administrator and request deactivates or changes role → returns `400 Bad Request` with `LAST_ADMIN_PROTECTED`.
- **Responses:**
  - `200 OK`: Updated user profile.
  - `400 Bad Request`: Safety guard violation.
  - `409 Conflict`: Email collision with another user.

### 6.4 POST `/api/admin/users/:id/reset-password`
- **Purpose:** Set a new initial password for a user account.
- **Access:** Administrator ONLY.
- **Request Body:**
```json
{
  "newInitialPassword": "TemporaryPass123!"
}
```
- **Behavior:** Updates password hash and sets `mustChangePassword = true`.
- **Responses:**
  - `200 OK`: `{ "message": "Password reset successfully. User must change password at next login." }`
