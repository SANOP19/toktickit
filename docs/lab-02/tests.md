# Lab 2 Test Plan and Results

## 1. Test Strategy
Testing for Lab 2 employs Test-Driven Development (TDD) and Test-Driven Specification (Test DD), covering multiple testing layers:
- **API Integration Tests (Supertest)**: Verifies backend HTTP response status codes, payload shapes, business rule validations, ownership restrictions, and attachment lifecycle.
- **UI Component Tests (Vitest + React Testing Library)**: Verifies frontend user interaction, field-level validation messages, form busy states, responsive UI elements, and mock API error handling.
- **End-to-End Tests (Playwright)**: Verifies complete user journeys across all screens (Requester Selection -> Create Ticket -> My Tickets -> Ticket Detail -> Attachment management).

---

## 2. Planned Tests Table

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
|---|---|---|---|---|---|---|
| **API-01** | API | AC-01, BR-01, BR-02 | Create valid ticket with required fields | HTTP 201; returns saved ticket with `TKT-YYYY-XXXXXX` and status `New` | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-02** | API | AC-04, BR-06, BR-07 | Submit ticket with missing or invalid fields | HTTP 400; returns field validation errors; no ticket created | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-03** | API | AC-02, BR-04 | Attempt ticket creation with inactive requester | HTTP 400/403; operation rejected | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-04** | API | AC-03, AC-05, BR-05 | Retrieve tickets for active requester with pagination | HTTP 200; returns array of owned tickets with pagination metadata | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-05** | API | AC-05, BR-05 | Search and filter tickets by category, priority, status | HTTP 200; returns matched tickets only | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-06** | API | AC-03, BR-05 | Requester A requests tickets of Requester B | HTTP 200; Requester B tickets are omitted (isolation verified) | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-07** | API | AC-03, BR-05 | Retrieve owned ticket detail vs unowned ticket detail | HTTP 200 for owned; HTTP 403 or 404 for unowned | `server/tests/lab-02/ticket-detail.api.test.ts` | Pass |
| **API-08** | API | AC-06, BR-10 | Upload valid attachment (PDF/PNG <= 5MB) | HTTP 201; metadata stored; file saved | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-09** | API | AC-07, BR-10 | Upload invalid file (unsupported MIME or > 5MB) | HTTP 400; file rejected | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-10** | API | AC-06, BR-10 | Upload more than 5 active attachments to a ticket | HTTP 400; rejected due to max limit | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-11** | API | AC-08, BR-11 | Soft-remove an attachment with mandatory reason | HTTP 200; `isRemoved: true`; reason recorded | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-12** | API | AC-09, BR-11 | Download active file vs soft-removed file | HTTP 200 for active; HTTP 410 or 404 for soft-removed | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **UI-01** | UI | AC-02, BR-03 | Requester selector screen renders active requesters | Active users shown; inactive users omitted; select sets context | `client/tests/lab-02/RequesterContext.test.tsx` | Pass |
| **UI-02** | UI | AC-04, BR-06, BR-07 | Create ticket form client validation | Red error messages shown below invalid inputs; API not called | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-03** | UI | AC-01, AC-10 | Create ticket form submit busy state & error state | Submit button disabled with spinner; error banner shown on failure | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-04** | UI | AC-03, AC-05 | My Tickets table rendering, filtering, and pagination | Displays correct rows; filter controls trigger re-query; empty state | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-05** | UI | AC-03, BR-05 | Ticket Detail read-only display and access control | Ticket header read-only; unauthorized message if not owned | `client/tests/lab-02/TicketDetail.test.tsx` | Pass |
| **UI-06** | UI | AC-08, AC-09 | Attachment management section & soft-remove modal | Active list, remove modal prompts for reason, removed badge displayed | `client/tests/lab-02/TicketDetail.test.tsx` | Pass |
| **E2E-01**| E2E| AC-01, AC-03, AC-05, AC-08 | Complete user journey | Select user -> Create ticket -> View in list -> Detail -> Soft-remove file | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Covered By Tests |
|---|---|
| **AC-01** (Create valid ticket & ticket number) | `API-01`, `UI-03`, `E2E-01` |
| **AC-02** (Dev requester selection context) | `API-03`, `UI-01`, `E2E-01` |
| **AC-03** (Ownership isolation between users) | `API-04`, `API-06`, `API-07`, `UI-04`, `UI-05`, `E2E-01` |
| **AC-04** (Field-level validation messages) | `API-02`, `UI-02` |
| **AC-05** (Search, filters, sort, pagination) | `API-04`, `API-05`, `UI-04`, `E2E-01` |
| **AC-06** (Attachment upload ≤ 5MB, ≤ 5 active) | `API-08`, `API-10`, `UI-06`, `E2E-01` |
| **AC-07** (Attachment format & size rejection) | `API-09` |
| **AC-08** (Attachment soft-removal with reason) | `API-11`, `UI-06`, `E2E-01` |
| **AC-09** (Blocked download for removed files) | `API-12`, `UI-06`, `E2E-01` |
| **AC-10** (Form preservation during API failure) | `UI-03` |

---

## 4. Responsive and Visual Checklist
- [x] **Desktop (≥ 992px)**: Header displays logo, nav links, requester switcher; multi-column layout; full ticket table with all columns visible; content centered with `max-width: 1200px`.
- [x] **Tablet (768–991px)**: Two-column form layout; table horizontally scrollable or compressed gracefully; no overlapping text.
- [x] **Mobile (< 768px)**: Stacked single-column layout; touch-friendly buttons (≥ 44px height); ticket list transitions to card-based layout; hamburger navigation or clean icon bar.
- [x] **Colors & Contrast**: Zen Green tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`); text passes WCAG AA contrast against backgrounds.
- [x] **Control States**: Focus indicators clearly visible on keyboard tab navigation; disabled controls distinct; red asterisks (`*`) on required labels.

---

## 5. Test Commands
```bash
# Backend tests
cd server
npm test -- --run

# Frontend tests
cd ../client
npm test -- --run

# E2E Playwright tests
cd ..
npx playwright test e2e/lab-02/
```

---

## 6. Final Results
All tests in test suites passed 100% with no skipped or disabled tests.
```text
Server Tests: 21 passed (21 across 7 test files)
Client Tests: 14 passed (14 across 5 test files)
E2E Tests: 1 planned (1)
```

---

## 7. Known Limitations or Deferred Tests
- Authentication and session-cookie tests deferred to Lab 3 when real login is introduced.
- IT Staff workflow tests deferred to Lab 4.
