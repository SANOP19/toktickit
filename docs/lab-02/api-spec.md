# Lab 2 REST API Specification

## 1. Overview and Base URL
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json` (unless multipart/form-data for file uploads)
- **Error Response Format**:
  ```json
  {
    "error": "Safe error message describing the issue",
    "details": []
  }
  ```

---

## 2. Endpoints

### 2.1 Get Active Development Requesters
- **URL**: `GET /api/dev-requesters`
- **Description**: Returns all active development requesters (`isActive = true`).
- **Response 200 OK**:
  ```json
  [
    {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer.a@example.com"
    },
    {
      "id": 2,
      "name": "Michael Brown",
      "email": "michael.b@example.com"
    }
  ]
  ```

### 2.2 Get Active Categories
- **URL**: `GET /api/categories`
- **Description**: Returns list of all categories ordered by ID.
- **Response 200 OK**:
  ```json
  [
    { "id": 1, "name": "Account and Access" },
    { "id": 2, "name": "Hardware" },
    { "id": 3, "name": "Software" },
    { "id": 4, "name": "Network" }
  ]
  ```

### 2.3 Get Active Related Systems
- **URL**: `GET /api/related-systems`
- **Description**: Returns all active related systems.
- **Response 200 OK**:
  ```json
  [
    { "id": 1, "name": "Email" },
    { "id": 2, "name": "Campus Wi-Fi" },
    { "id": 3, "name": "VPN" },
    { "id": 4, "name": "LEB2 App" },
    { "id": 5, "name": "Grade Submission App" },
    { "id": 6, "name": "Printer" },
    { "id": 7, "name": "Corporate Laptop" }
  ]
  ```

### 2.4 Create a Ticket
- **URL**: `POST /api/tickets`
- **Request Body**:
  ```json
  {
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 7,
    "summary": "Laptop battery drains quickly",
    "description": "Battery discharges completely within 30 minutes of unplugging from the charger.",
    "requestedPriority": "MEDIUM"
  }
  ```
- **Validation Rules**:
  - `requesterId`: Mandatory integer referencing active `RequesterUser`.
  - `categoryId`: Mandatory integer referencing existing `Category`.
  - `relatedSystemId`: Mandatory integer referencing active `RelatedSystem`.
  - `summary`: String, 5–120 characters, required.
  - `description`: String, 10–2000 characters, required.
  - `requestedPriority`: Enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), required.
- **Response 201 Created**:
  ```json
  {
    "id": 1,
    "ticketNumber": "TKT-2026-000001",
    "summary": "Laptop battery drains quickly",
    "description": "Battery discharges completely within 30 minutes...",
    "requestedPriority": "MEDIUM",
    "currentStatus": "New",
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 7,
    "createdAt": "2026-09-03T10:00:00.000Z",
    "updatedAt": "2026-09-03T10:00:00.000Z"
  }
  ```
- **Response 400 Bad Request**: Missing or invalid fields.

### 2.5 Get Paginated Tickets for Requester
- **URL**: `GET /api/tickets`
- **Query Parameters**:
  - `requesterId` (required): Integer
  - `search` (optional): String matching summary or ticketNumber
  - `categoryId` (optional): Integer
  - `priority` (optional): `LOW` | `MEDIUM` | `HIGH` | `URGENT`
  - `status` (optional): String
  - `sortBy` (optional): `createdAt` | `ticketNumber` | `summary` | `priority` | `status` (default: `createdAt`)
  - `sortOrder` (optional): `asc` | `desc` (default: `desc`)
  - `page` (optional): Integer (default: 1)
  - `limit` (optional): Integer (default: 8)
- **Response 200 OK**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "ticketNumber": "TKT-2026-000001",
        "summary": "Laptop battery drains quickly",
        "requestedPriority": "MEDIUM",
        "currentStatus": "New",
        "createdAt": "2026-09-03T10:00:00.000Z",
        "updatedAt": "2026-09-03T10:00:00.000Z",
        "category": { "id": 2, "name": "Hardware" },
        "relatedSystem": { "id": 7, "name": "Corporate Laptop" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 8,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```

### 2.6 Get Owned Ticket Detail
- **URL**: `GET /api/tickets/:id?requesterId=:requesterId`
- **Response 200 OK**:
  ```json
  {
    "id": 1,
    "ticketNumber": "TKT-2026-000001",
    "summary": "Laptop battery drains quickly",
    "description": "Battery discharges completely within 30 minutes...",
    "requestedPriority": "MEDIUM",
    "currentStatus": "New",
    "createdAt": "2026-09-03T10:00:00.000Z",
    "updatedAt": "2026-09-03T10:00:00.000Z",
    "requester": { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.a@example.com" },
    "category": { "id": 2, "name": "Hardware" },
    "relatedSystem": { "id": 7, "name": "Corporate Laptop" },
    "attachments": []
  }
  ```
- **Response 403 Forbidden / 404 Not Found**: If ticket does not belong to `requesterId` or doesn't exist.

### 2.7 Upload Ticket Attachment
- **URL**: `POST /api/tickets/:id/attachments`
- **Headers**: `Content-Type: multipart/form-data`
- **Body Form Data**:
  - `file`: Binary file (MIME: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, max 5MB)
  - `requesterId`: Integer
- **Response 201 Created**:
  ```json
  {
    "id": 1,
    "originalName": "battery-screenshot.png",
    "sizeBytes": 245100,
    "mimeType": "image/png",
    "isRemoved": false,
    "createdAt": "2026-09-03T10:05:00.000Z"
  }
  ```
- **Response 400 Bad Request**: Invalid file type, size > 5MB, or already 5 active attachments.

### 2.8 Get Ticket Attachments Metadata
- **URL**: `GET /api/tickets/:id/attachments?requesterId=:requesterId`
- **Response 200 OK**: List of active and soft-removed attachments with metadata.

### 2.9 Download Active Attachment
- **URL**: `GET /api/tickets/:id/attachments/:attachmentId/download?requesterId=:requesterId`
- **Response 200 OK**: Binary stream of the file with `Content-Disposition`.
- **Response 410 Gone**: If the attachment has been soft-removed.
- **Response 403 Forbidden**: If requester does not own the ticket.

### 2.10 Soft-Remove Attachment
- **URL**: `DELETE /api/tickets/:id/attachments/:attachmentId`
- **Request Body**:
  ```json
  {
    "requesterId": 1,
    "reason": "Uploaded wrong screenshot by mistake"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "id": 1,
    "isRemoved": true,
    "removedAt": "2026-09-03T10:10:00.000Z",
    "removalReason": "Uploaded wrong screenshot by mistake"
  }
  ```
