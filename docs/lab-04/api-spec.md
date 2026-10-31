# Lab 4 REST API Specification: Actions Taken, Dashboards, and Resolution Gate

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)  
**Project:** TokTickIT Multi-Role IT Service Desk Platform  
**Sprint:** Sprint 4 (Final Increment)  
**Target Base URL:** `http://localhost:3000`

---

## 1. Global REST Architecture & Conventions

### 1.1 Authentication & Session
All protected endpoints require an `Authorization` HTTP header with a signed JWT Bearer token:
```http
Authorization: Bearer <jwt-token>
```
* Unauthenticated requests return `401 Unauthorized`.
* Quarantined users (`mustChangePassword: true`) accessing functional endpoints receive `403 Forbidden` (`PASSWORD_CHANGE_REQUIRED`).
* Role violations receive `403 Forbidden` (`FORBIDDEN_ROLE`).

### 1.2 Standard Success Envelope
```json
{
  "success": true,
  "data": { ... }
}
```

### 1.3 Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of error condition."
  }
}
```

---

## 2. Actions Taken Endpoints

### 2.1 Retrieve Ticket Actions Taken
* **Method & Route:** `GET /api/tickets/:id/actions-taken`
* **Access Control:** `REQUESTER` (owned tickets only), `IT_STAFF`, `ADMINISTRATOR`
* **Path Parameters:** `id` (integer) - Target Ticket ID.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ticketId": 101,
    "actionsTaken": [
      {
        "id": 1,
        "ticketId": 101,
        "actionDateTime": "2026-10-29T10:15:00.000Z",
        "description": "Replaced faulty Cat6 Ethernet patch cord on port 4 and re-tested link speed.",
        "result": "Gigabit link established, latency reduced to 1ms.",
        "status": "COMPLETED",
        "followUpRequired": true,
        "followUpNote": "Verify user connection stability tomorrow morning after 9:00 AM.",
        "attachmentNotes": "speedtest_capture_port4.png",
        "version": 1,
        "performedBy": {
          "id": 3,
          "name": "Alex Thompson",
          "email": "alex.thompson@toktickit.local",
          "role": "IT_STAFF"
        },
        "createdAt": "2026-10-29T10:15:30.000Z",
        "updatedAt": "2026-10-29T10:15:30.000Z"
      }
    ]
  }
}
```
* **Error Responses:**
  * `401 Unauthorized` — Missing or invalid token.
  * `403 Forbidden` — Requester attempting to view actions for a ticket they do not own.
  * `404 Not Found` — Ticket does not exist.

---

### 2.2 Create Action Taken Record
* **Method & Route:** `POST /api/tickets/:id/actions-taken`
* **Access Control:** `IT_STAFF`, `ADMINISTRATOR` (Requesters receive `403 Forbidden`)
* **Path Parameters:** `id` (integer) - Target Ticket ID.
* **Request Body:**
```json
{
  "description": "Cleaned printer roller heads and cleared paper jam sensor obstruction.",
  "result": "Test page printed successfully without jamming.",
  "status": "COMPLETED",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "printer_test_page_101.pdf"
}
```
* **Validation Rules:**
  * `description`: String (5 to 2,000 characters, non-whitespace).
  * `result`: String (5 to 2,000 characters, non-whitespace).
  * `status`: Optional enum (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`). Defaults to `COMPLETED`.
  * `followUpRequired`: Boolean (default `false`).
  * `followUpNote`: **Mandatory (5 to 2,000 characters) if `followUpRequired === true`**.
  * `attachmentNotes`: Optional string (up to 1,000 characters).
  * Performing user is automatically set to `req.user.id`.
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "ticketId": 101,
    "description": "Cleaned printer roller heads and cleared paper jam sensor obstruction.",
    "result": "Test page printed successfully without jamming.",
    "status": "COMPLETED",
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "printer_test_page_101.pdf",
    "version": 1,
    "performedBy": {
      "id": 2,
      "name": "Michael Brown",
      "email": "michael.brown@toktickit.local",
      "role": "IT_STAFF"
    },
    "createdAt": "2026-10-29T11:00:00.000Z",
    "updatedAt": "2026-10-29T11:00:00.000Z"
  }
}
```
* **Error Responses:**
  * `400 Bad Request` — `FOLLOW_UP_NOTE_REQUIRED`: Follow-up required is true but note is missing or empty.
  * `400 Bad Request` — `VALIDATION_ERROR`: Field lengths out of bounds or empty text.
  * `400 Bad Request` — `INACTIVE_STAFF_MEMBER`: Performing user account has been deactivated.
  * `403 Forbidden` — Authenticated role is `REQUESTER`.
  * `404 Not Found` — Ticket does not exist.

---

### 2.3 Update Action Taken Record (With Concurrency Control)
* **Method & Route:** `PATCH /api/tickets/:id/actions-taken/:actionId`
* **Access Control:** `IT_STAFF`, `ADMINISTRATOR`
* **Path Parameters:**
  * `id` (integer) - Target Ticket ID.
  * `actionId` (integer) - Action Taken ID.
* **Request Body:**
```json
{
  "description": "Updated intervention notes following firmware patch.",
  "result": "Firmware 2.4.1 flashed. Unit responding on SNMP.",
  "status": "COMPLETED",
  "followUpRequired": true,
  "followUpNote": "Check again during evening maintenance window.",
  "attachmentNotes": "firmware_patch_log.txt",
  "version": 1
}
```
* **Concurrency Handling:**
  * Client provides the last known `version` number.
  * If database `version !== req.body.version`, returns `409 Conflict` (`STALE_UPDATE_DETECTED`).
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticketId": 101,
    "description": "Updated intervention notes following firmware patch.",
    "result": "Firmware 2.4.1 flashed. Unit responding on SNMP.",
    "status": "COMPLETED",
    "followUpRequired": true,
    "followUpNote": "Check again during evening maintenance window.",
    "attachmentNotes": "firmware_patch_log.txt",
    "version": 2,
    "updatedAt": "2026-10-29T11:45:00.000Z"
  }
}
```
* **Error Responses:**
  * `409 Conflict` — `STALE_UPDATE_DETECTED`: Record was modified by another session.
  * `400 Bad Request` — Validation failure or missing follow-up note.
  * `403 Forbidden` — Insufficient role permissions.
  * `404 Not Found` — Action or Ticket does not exist.

---

## 3. Dashboard Endpoints

### 3.1 IT Staff Operational Dashboard
* **Method & Route:** `GET /api/dashboards/staff`
* **Access Control:** `IT_STAFF`, `ADMINISTRATOR` (Requesters receive `403 Forbidden`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "newTickets": 14,
      "openTickets": 23,
      "inProgressTickets": 18,
      "waitingForRequester": 7,
      "myAssignedTickets": 16,
      "urgentTickets": 4
    },
    "recentTickets": [
      {
        "id": 105,
        "ticketNumber": "TKT-2026-000105",
        "summary": "Laptop battery drains quickly under load",
        "category": "Hardware",
        "itPriority": "HIGH",
        "currentStatus": "IN_PROGRESS",
        "ownerName": "Michael Brown",
        "updatedAt": "2026-10-29T09:14:00.000Z"
      }
    ],
    "myRecentActions": [
      {
        "id": 12,
        "ticketId": 105,
        "ticketNumber": "TKT-2026-000105",
        "description": "Performed battery diagnostic test and replaced cell block.",
        "status": "COMPLETED",
        "actionDateTime": "2026-10-29T09:30:00.000Z"
      }
    ]
  }
}
```

---

### 3.2 Requester Personal Dashboard
* **Method & Route:** `GET /api/dashboards/requester`
* **Access Control:** All Authenticated (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`)
* **Scope Isolation:** Data is strictly filtered to `requesterId == req.user.id`.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "myOpenTickets": 3,
      "inProgressTickets": 2,
      "resolvedTickets": 5,
      "closedTickets": 12
    },
    "recentTickets": [
      {
        "id": 204,
        "ticketNumber": "TKT-2026-000204",
        "summary": "Cannot connect to VPN from home network",
        "category": "Network",
        "requestedPriority": "HIGH",
        "currentStatus": "IN_PROGRESS",
        "isRequesterResolved": false,
        "updatedAt": "2026-10-29T10:45:00.000Z"
      }
    ]
  }
}
```

---

## 4. Ticket Status Workflow with Resolution Gate

### 4.1 Update Ticket Status (Enforced Resolution Gate)
* **Method & Route:** `PATCH /api/staff/tickets/:id/status`
* **Access Control:** `IT_STAFF`, `ADMINISTRATOR`
* **Request Body:**
```json
{
  "status": "RESOLVED",
  "resolutionSummary": "Ethernet cable replaced and connection verified with user."
}
```
* **Resolution Gate Logic:**
  * When `status === "RESOLVED"` or `status === "CLOSED"`:
    1. Query database for `count(ActionTaken WHERE ticketId == id)`.
    2. If `count === 0`, reject immediately with HTTP 400:
```json
{
  "success": false,
  "error": {
    "code": "RESOLUTION_GATE_FAILED",
    "message": "Cannot resolve or close a ticket without at least one recorded Action Taken."
  }
}
```
  * Otherwise, verify allowed status transition in 8-State matrix and persist.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "ticketNumber": "TKT-2026-000101",
    "currentStatus": "RESOLVED",
    "resolutionSummary": "Ethernet cable replaced and connection verified with user.",
    "updatedAt": "2026-10-29T11:50:00.000Z"
  }
}
```
