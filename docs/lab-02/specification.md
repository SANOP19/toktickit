# Lab 2 Sprint Engineering Specification

## 1. Sprint Goal
Deliver a functional, responsive, and secure Requester-facing IT Ticketing MVP using a simulated Development Requester context ("user login") that allows users to create tickets with unique ticket numbers and attachments, inspect their own tickets via search/filter/sort/pagination in "My Tickets", view ticket details, and manage attachments with strict soft-removal rules, all adhering to the Zen Green design system.

---

## 2. Stakeholder Request Interpretation
The IT department requires a working proof that the TokTickIT system can support genuine end-user (Requester) support workflows. Requesters must be able to report issues with necessary metadata and file attachments, monitor their submitted requests with robust multi-user data isolation (Requester A cannot view or manage Requester B's tickets), and manage supporting evidence over time. To simulate real authentication ahead of Lab 3, a lightweight Development Requester selection mechanism is provided.

---

## 3. Scope

### Included
- **Development Requester Context**: Choose from active seeded requesters; switch requester on demand; inactive requesters strictly hidden.
- **Create Ticket**: Form capturing Summary, Description, Category, Related System, Requested Priority, and Attachments; system generates a unique Ticket Number (`TKT-YYYY-XXXXXX`) with status `New`.
- **Attachment Management**: Upload supporting files (JPG/JPEG, PNG, WEBP, PDF, max 5MB, up to 5 active per ticket); view attachment metadata; download active files; soft-remove with a mandatory reason.
- **My Tickets**: List tickets owned by the current requester with full-text search, category filter, priority filter, status filter, sorting, and pagination.
- **Ticket Detail**: View read-only ticket header and manage attachments (upload, download, soft-remove).
- **Zen Green UI Theme**: Consistent color tokens, typography, form control states, validation errors, and responsive layouts for desktop, tablet, and mobile.

### Excluded
- Real user authentication (passwords, hashing, sessions, tokens, JWT).
- IT Staff workflow (queues, claiming tickets, changing IT priority or status).
- Public comments, internal notes, and actions taken (deferred to later labs).
- Ticket status lifecycle transitions beyond initial `New` status.
- Admin management of users, roles, or reference data.

---

## 4. Functional Requirements
- **FR-01 (Requester Selection)**: The system must allow users to select an active Development Requester to establish the current session context.
- **FR-02 (Requester Switching)**: Users must be able to switch the active Requester, causing all ticket listings and details to immediately reload with the newly selected identity.
- **FR-03 (Ticket Creation)**: Requesters must be able to submit a new ticket with Category, Related System, Summary, Description, Priority, and optional Attachments.
- **FR-04 (Ticket Number Generation)**: The backend must automatically generate a unique, sequential/formatted Ticket Number (`TKT-YYYY-XXXXXX`) upon successful creation.
- **FR-05 (My Tickets Retrieval)**: The system must display a list of tickets strictly owned by the active Requester, supporting search, filters, sorting, and pagination.
- **FR-06 (Ticket Detail Inspection)**: The system must display read-only details of an owned ticket, preventing access by any other requester.
- **FR-07 (Attachment Upload)**: Requesters can upload allowed file formats (JPG, PNG, WEBP, PDF) up to 5MB, maintaining a limit of 5 active attachments per ticket.
- **FR-08 (Attachment Soft-Removal)**: Requesters can soft-remove an attachment by providing a mandatory reason; removed files can no longer be downloaded or previewed, but their metadata remains visible.

---

## 5. Business Rules (BR)
- **BR-01 (Ticket Number)**: The official Ticket Number is generated exclusively by the backend, must be unique, and follows the format `TKT-YYYY-XXXXXX`.
- **BR-02 (Initial Status)**: Every newly created ticket begins with Current Status `New`.
- **BR-03 (Dev Requester Context)**: Lab 2 uses a Development Requester selector instead of login. The selected identity is for testing purposes only and does not represent authenticated identity.
- **BR-04 (Requester Inactivity)**: Inactive Development Requesters (`isActive = false`) must be excluded from the selector dropdown and cannot create or view tickets.
- **BR-05 (Multi-User Data Isolation)**: A Requester can only view, search, and access tickets that they own (`requesterId` matches). Unauthorized access to another user's ticket must be rejected with 403 Forbidden or 404 Not Found.
- **BR-06 (Summary Validation)**: Ticket Summary is required, trimmed of leading/trailing whitespace, with a minimum length of 5 characters and a maximum of 120 characters.
- **BR-07 (Description Validation)**: Description is required, trimmed of leading/trailing whitespace, with a minimum length of 10 characters and maximum of 2,000 characters.
- **BR-08 (Classification Required)**: Category and Related System selections are mandatory and must refer to active database records.
- **BR-09 (Priority Defaults)**: Requested Priority is mandatory and must be one of `LOW`, `MEDIUM`, `HIGH`, `URGENT` (defaults to `MEDIUM`).
- **BR-10 (Attachment Formats & Limits)**: Permitted MIME types are `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`. File size must not exceed 5 MB (5,242,880 bytes). A ticket may have at most 5 active attachments.
- **BR-11 (Attachment Soft-Removal)**: Removal of an attachment must set `isRemoved = true`, record `removedAt`, `removalReason`, and `removedById`. Physical files are retained or marked inaccessible; API requests to download soft-removed files must return HTTP 410 Gone or 404 Not Found.
- **BR-12 (Form Failure Preservation)**: On API failure or submission error, form inputs must remain preserved so the user does not lose entered data.

---

## 6. UI Specification Summary
- **Color Palette (Zen Green)**:
  - Primary Green: `#006B3C` (app header, primary CTA buttons)
  - Secondary Green: `#0B7A46` (hover states, active navigation tabs, focus accents)
  - Pale Green: `#EAF6EF` (section highlights, success messages)
  - Page Background: `#F5F7F6`
  - Surfaces/Cards: `#FFFFFF` with border `#E5E7EB`
  - Text: Dark charcoal `#1F2937`
  - Error: Dark red `#DC2626`
  - Warning: Amber `#D97706`
- **Navigation & Shell**: Top navigation bar with TokTickIT logo, "My Tickets" tab, "Create Ticket" tab, selected Requester pill, and "Change Requester" button.
- **Responsive Layout**:
  - Desktop (≥992px): Multi-column form layout, standard table with full columns.
  - Tablet (768–991px): Two-column layout, responsive table.
  - Mobile (<768px): Single-column stacked fields, ticket card list, full-width touch-friendly buttons.

---

## 7. Data Changes
- **`RequesterUser`**: Stores development requesters (`id`, `name`, `email`, `isActive`, `createdAt`).
- **`Category`**: Existing reference entity (`id`, `name`, `createdAt`).
- **`RelatedSystem`**: Stores affected platforms/services (`id`, `name`, `isActive`, `createdAt`).
- **`Ticket`**: Parent ticket record (`id`, `ticketNumber`, `summary`, `description`, `requestedPriority`, `currentStatus`, `requesterId`, `categoryId`, `relatedSystemId`, `createdAt`, `updatedAt`).
- **`Attachment`**: Child attachment record (`id`, `ticketId`, `originalName`, `storageName`, `filePath`, `mimeType`, `sizeBytes`, `isRemoved`, `removedAt`, `removalReason`, `removedById`, `createdAt`).

---

## 8. API Contract Summary
- `GET /api/dev-requesters`: List active development requesters.
- `GET /api/categories`: List active categories.
- `GET /api/related-systems`: List active related systems.
- `POST /api/tickets`: Create ticket with validation, generating `ticketNumber`.
- `GET /api/tickets`: Query tickets for active requester with search, filters, sort, and pagination.
- `GET /api/tickets/:id`: Get owned ticket detail. Returns 403/404 if not owned.
- `POST /api/tickets/:id/attachments`: Upload attachment (multipart/form-data).
- `GET /api/tickets/:id/attachments`: Retrieve attachment metadata.
- `GET /api/tickets/:id/attachments/:attachmentId/download`: Download active attachment.
- `DELETE /api/tickets/:id/attachments/:attachmentId`: Soft-remove attachment with reason.

---

## 9. Acceptance Criteria (Given-When-Then)
- **AC-01**: Given valid Ticket data and an active Requester context, when the Requester submits the Create Ticket form, then the ticket is saved with status `New`, an official Ticket Number is generated, and confirmation is displayed.
- **AC-02**: Given no Development Requester is selected, when the user visits the application, then the Development Requester Selection screen is displayed before any ticket operations.
- **AC-03**: Given Requester A is active, when requesting tickets via My Tickets or Ticket Detail, then only tickets belonging to Requester A are returned; attempting to access Requester B's ticket returns an access denied error.
- **AC-04**: Given an invalid submission (e.g. missing summary or short description), when the user submits Create Ticket, then field-level validation errors appear immediately below the invalid inputs without calling the API.
- **AC-05**: Given valid search/filter parameters, when viewing My Tickets, then the list dynamically filters by keyword, category, priority, and status with pagination.
- **AC-06**: Given a ticket with fewer than 5 active attachments, when uploading a valid JPG, PNG, WEBP, or PDF file (≤ 5MB), then the attachment is saved and listed.
- **AC-07**: Given an invalid attachment (unsupported format or > 5MB), when attempting to upload, then the file is rejected with an error message and not uploaded.
- **AC-08**: Given an active attachment on an owned ticket, when the user submits a removal request with a reason, then the attachment is marked as soft-removed.
- **AC-09**: Given a soft-removed attachment, when any user attempts to download it, then the download request is rejected (HTTP 410/404) while its metadata remains visible.
- **AC-10**: Given the backend is stopped or returns an error during ticket submission, then a clear error banner is displayed and form field values are preserved.

---

## 10. Definition of Done
### Part 1: Product Completion
- [ ] All functional requirements (FR-01 to FR-08) and business rules (BR-01 to BR-12) implemented.
- [ ] Prisma models migrated and database seeded with 4 requesters, 1 inactive requester, 4 categories, and 7 related systems.
- [ ] Zen Green UI theme and responsive layouts verified across Desktop, Tablet, and Mobile.
- [ ] All automated tests (unit, API, UI, E2E) passing 100% without skipped or flaky tests.

### Part 2: Course Delivery Requirements
- [ ] Git Flow observed: all changes originate from `lab2-staging` via feature branches and peer-reviewed PRs.
- [ ] Every PR linked to its corresponding Issue on the Kanban board.
- [ ] Peer review comments replied to and PRs merged by the reviewer.
- [ ] Single PDF document compiled with Answer Parts 1 through 9.

---

## 11. Assumptions and Decisions
- **Ticket Number Format**: Sequential per calendar year: `TKT-2026-000001`.
- **Attachment Storage**: Local file system under `server/uploads/lab-02/` with UUID-based unique storage filenames to prevent filename collisions.
