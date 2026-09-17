# Lab 3 Sprint Engineering Specification: TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens

## 1. Sprint Goal
Evolve the TokTickIT MVP from the temporary Development Requester selector into a production-grade, multi-user service desk system supporting three distinct roles: **Requester**, **IT Staff**, and **Administrator**. Deliver secure email and password authentication with bcrypt hashing, mandatory first-login password change for initial credentials, server-enforced role-based authorization, an operational IT Staff Ticket Queue with search/filtering/sorting/pagination, IT Staff Ticket Detail with ownership assignment, IT Priority management, 8-status workflow transitions, threaded Public Comments, role-restricted Internal Notes, and a minimalist Administrator User Management interface, while maintaining 100% regression continuity for existing Lab 2 Requester features under the Zen Green design system.

---

## 2. Stakeholder Request Interpretation
The stakeholder requires transitioning TokTickIT from a local development prototype into an authentic multi-user application. 
- The temporary Requester selector must be eliminated and replaced with real authentication.
- Requesters must continue creating and tracking their support requests seamlessly, with ownership bound to their authenticated session rather than client-supplied inputs. Requesters should also be able to communicate via Public Comments and signal when an issue appears resolved.
- IT Staff require an operational command center (Shared Ticket Queue) to triage, claim, prioritize, update statuses, exchange public messages with Requesters, and record private internal investigative notes.
- Administrators need a streamlined User Management facility to provision accounts, assign a single permitted role, update account details, toggle activation status, and set/reset initial passwords that force password change upon next login.
- Security must be enforced server-side on every REST endpoint and database query: hiding or disabling a UI button is strictly recognized as presentation feedback, not an authorization control.

---

## 3. Scope Boundaries

### 3.1 Included Scope
1. **Authentication & Session**:
   - Email and password login with bcrypt password verification.
   - JWT Bearer token authentication in `Authorization` header.
   - User session retrieval (`GET /api/auth/me`) and secure logout (`POST /api/auth/logout`).
   - Mandatory first-login password change interceptor for accounts flagged with `mustChangePassword: true`.
2. **Role-Based Authorization & Navigation**:
   - Three mutually exclusive roles: `Requester`, `IT Staff`, and `Administrator`.
   - Server-side RBAC middleware rejecting unauthorized operations with HTTP 401/403.
   - Dynamic Zen Green navigation displaying only authorized routes and authenticated user badge (`Name [Role]`).
3. **Requester Feature Continuity & Enhancements**:
   - Seamless continuation of Lab 2 Ticket Creation, My Tickets, Ticket Detail, and Attachment management.
   - Complete removal of the temporary Development Requester modal and switcher controls.
   - Threaded Public Comments on owned tickets.
   - "Problem Appears Resolved" toggle button allowing Requesters to signal completion.
4. **IT Staff Operations**:
   - Shared IT Ticket Queue supporting search, multi-field filtering (category, priority, status, ownership), sorting, and pagination.
   - Operational Ticket Detail allowing ticket claiming (assign to self) or reassignment to other active IT Staff.
   - IT Priority management (independent of Requester requested priority).
   - Ticket status progression across the 8 required lifecycle states.
   - Threaded Public Comments (visible to Requester, IT Staff, Admin).
   - Confidential Internal Notes (strictly visible only to IT Staff and Admin).
5. **Administrator User Management**:
   - Minimalist user listing displaying Name, Email, Role, Status, and Edit action.
   - Search users by name or email, with optional role filter.
   - Create user with name, email, one permitted role, activation state, and initial password.
   - Edit user name, email, role, and active status.
   - Set/reset initial password requiring password change at next login.
   - Safety guards: prevention of self-deactivation and prevention of deactivating the system's last active Administrator.
6. **Data Continuity & Seeding**:
   - Database evolution from `RequesterUser` to `User` without data loss for existing tickets, categories, related systems, and attachments.
   - Idempotent seed data with active/inactive accounts across all three roles and initial test tickets.

### 3.2 Explicitly Excluded Scope (Deferred to Lab 4 or Beyond)
- Email invitations, password-reset emails, and outbound SMTP services.
- Multi-factor authentication (MFA), OAuth2, social login, and SSO.
- Public self-registration (all accounts are administrator-provisioned).
- Actions Taken tracking by IT Staff (deferred to Lab 4).
- Formal SLA calculation engines, escalation timers, and automated webhook notifications.
- Multi-tenant organization hierarchies, departments, customer billing, and profile pictures.
- User deletion, bulk operations, user CSV import/export, and account audit history tables.
- Multiple simultaneous roles assigned to a single user account.

---

## 4. Functional Requirements (FR)

- **FR-01 (Authentication)**: The system shall authenticate users using email and password, issuing a signed JWT upon verification of active account status.
- **FR-02 (Password Enforcement)**: The system shall restrict any user with `mustChangePassword=true` strictly to the password change endpoint until a valid new password is saved.
- **FR-03 (Role-Based Access Control)**: The system shall restrict access to endpoints and views according to the authenticated user's assigned role (`Requester`, `IT_STAFF`, `ADMINISTRATOR`).
- **FR-04 (Requester Binding)**: All ticket creation and query operations for Requesters shall automatically bind to `req.user.id`, ignoring any client-supplied `requesterId`.
- **FR-05 (Requester Resolution Signal)**: The system shall permit a Requester to flag an owned ticket as "Problem Appears Resolved", updating `isRequesterResolved=true` without directly closing the ticket.
- **FR-06 (IT Staff Queue Retrieval)**: The system shall provide IT Staff with a paginated queue of tickets with multi-field search (ticket number, summary), filters (status, category, priority, owner), and sorting.
- **FR-07 (Ownership Assignment)**: The system shall permit active IT Staff and Administrators to claim an unassigned ticket or reassign ticket ownership to another active IT Staff member.
- **FR-08 (IT Priority & Status Management)**: The system shall permit IT Staff and Administrators to modify IT Priority and transition ticket statuses according to the permitted state transition matrix.
- **FR-09 (Public Comments)**: The system shall provide an append-only conversation thread for Public Comments on each ticket, accessible to the Requester, IT Staff, and Administrator.
- **FR-10 (Internal Notes)**: The system shall provide an append-only operational log for Internal Notes, accessible strictly to IT Staff and Administrators, returning HTTP 403 Forbidden to Requesters.
- **FR-11 (Admin User Management)**: The system shall permit Administrators to list, search, filter, create, and update user accounts and issue new initial passwords.
- **FR-12 (Administrator Safety Controls)**: The system shall reject any request by an Administrator to deactivate their own account or deactivate the last remaining active Administrator in the system.

---

## 5. Business Rules (BR)

### 5.1 Authentication & Security Rules
- **BR-01 (Active Account Prerequisite)**: Only accounts with `isActive=true` may successfully authenticate. Inactive accounts receive an HTTP 401 Unauthorized response without disclosing detailed account state.
- **BR-02 (First-Login Password Quarantine)**: Any user authenticated with `mustChangePassword=true` is quarantined. All API endpoints except `POST /api/auth/change-password` and `POST /api/auth/logout` return HTTP 403 Forbidden with code `PASSWORD_CHANGE_REQUIRED`.
- **BR-03 (Password Policy)**: New passwords must be at least 8 characters long and match the confirmation password. Passwords must be hashed using bcrypt (cost factor >= 10) prior to database persistence; plaintext passwords must never be stored or logged.
- **BR-04 (Session Revocation on Logout)**: Client-side logout clears authentication tokens from storage; protected endpoints reject requests lacking a valid Bearer token with HTTP 401 Unauthorized.

### 5.2 Ownership & Role Authorization Rules
- **BR-05 (Server-Enforced Requester Identity)**: The authenticated user's ID derived from the verified JWT token strictly determines ticket ownership. Client-supplied requester identifiers are ignored.
- **BR-06 (Requester Ticket Isolation)**: A Requester may only retrieve, inspect, attach files to, and comment on tickets where `ticket.requesterId == req.user.id`. Access to tickets owned by others returns HTTP 404/403.
- **BR-07 (Role Boundary Separation)**: IT Staff manage ticket operations and queues; Administrators manage user accounts. An Administrator cannot claim tickets or perform IT Staff queue actions unless assigned an IT Staff role or explicitly granted dual permissions.

### 5.3 Ticket Workflow & Status Rules
- **BR-08 (Eight Permitted Statuses)**: Valid ticket statuses are strictly: `New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`, `Reopened`, and `Cancelled`.
- **BR-09 (Permitted Status Transitions)**:
  - `New` → `Open` (upon ticket claim or initial IT staff triaging).
  - `Open` → `In Progress` (when active work commences).
  - `In Progress` ↔ `Waiting for Requester` (when awaiting client input/reply).
  - `In Progress` / `Waiting for Requester` → `Resolved` (when IT staff concludes remediation).
  - `Resolved` → `Closed` (formal closure by IT staff after confirmation).
  - `Resolved` → `Reopened` (if the requester indicates problem persists or IT reopens).
  - `New` / `Open` / `In Progress` → `Cancelled` (invalid or duplicate tickets).
- **BR-10 (Resolution Authority)**: Only IT Staff and Administrators may formally transition a ticket to `Resolved` or `Closed`. Requesters may only signal `isRequesterResolved = true`.
- **BR-11 (IT Priority Independence)**: `requestedPriority` is submitted by the Requester and is immutable. `itPriority` initially defaults to `requestedPriority`, but can subsequently be updated only by IT Staff or Administrators.
- **BR-12 (Primary Ticket Ownership)**: Each ticket may have at most one primary owner (`ownerId`), who must be an active user with role `IT_STAFF` or `ADMINISTRATOR`. Tickets begin with `ownerId = null` (Unassigned).

### 5.4 Communication Rules (Comments & Notes)
- **BR-13 (Append-Only Immutability)**: Both Public Comments and Internal Notes are strictly append-only. No editing, updating, or deleting of existing comments or notes is permitted.
- **BR-14 (Public Comment Access)**: Public Comments are visible to the ticket's Requester, all IT Staff, and Administrators.
- **BR-15 (Internal Note Confidentiality)**: Internal Notes are strictly confidential to IT Staff and Administrators. Requesters are completely blocked from viewing or creating Internal Notes (API returns HTTP 403).
- **BR-16 (Content Validation)**: Comments and Internal Notes must contain between 1 and 2,000 characters of non-whitespace text. Author identity and timestamps are automatically stamped by the server.

### 5.5 Administrator Safety Rules
- **BR-17 (Account Deactivation Over Deletion)**: User accounts are never deleted from the database to preserve historical ticket, comment, and note audit trails. Inactive users have `isActive = false`.
- **BR-18 (Self-Deactivation Block)**: An Administrator is strictly prohibited from deactivating their own currently authenticated account (returns HTTP 400 with `CANNOT_DEACTIVATE_SELF`).
- **BR-19 (Last Active Admin Protection)**: The system must verify that at least one other active Administrator account exists before allowing an Administrator to be deactivated or demoted (returns HTTP 400 with `LAST_ADMIN_PROTECTED`).
- **BR-20 (Email Uniqueness)**: Every user email address must be globally unique across all accounts. Duplicate emails return HTTP 409 Conflict.
- **BR-21 (Password Reset Flagging)**: When an Administrator issues a new initial password for a user, the system must automatically set `mustChangePassword = true`.

---

## 6. Acceptance Criteria (AC)

- **AC-01 (Valid Authentication)**: Given an active user with valid email and password, when `POST /api/auth/login` is executed, then HTTP 200 is returned with a valid JWT token and user profile object.
- **AC-02 (Inactive Account Rejection)**: Given an account with `isActive=false`, when login is attempted with correct credentials, then HTTP 401 is returned with an inactive account notification.
- **AC-03 (First-Login Password Intercept)**: Given an authenticated user with `mustChangePassword=true`, when the user attempts to access any functional API or screen, then access is blocked and the user is routed to the mandatory Change Password interface until a new valid password is saved.
- **AC-04 (Requester Isolation)**: Given an authenticated Requester, when accessing `/api/tickets` or `/api/tickets/:id`, then only tickets matching `requesterId == req.user.id` are returned.
- **AC-05 (Public Comment Threading)**: Given an authenticated Requester or IT Staff, when submitting a valid public comment on a ticket, then the comment is appended and visible to both parties.
- **AC-06 (Internal Note Protection)**: Given an authenticated Requester, when attempting to fetch or post to `/api/tickets/:id/notes`, then HTTP 403 Forbidden is returned with zero note content exposed.
- **AC-07 (Staff Queue Querying)**: Given an authenticated IT Staff member, when fetching `/api/staff/tickets` with search and filters, then matching tickets are returned with correct status, priority, and ownership metadata.
- **AC-08 (Ticket Claim & Reassignment)**: Given an unassigned ticket, when an IT Staff member claims the ticket, then `ownerId` updates to that staff member and status advances from `New` to `Open`.
- **AC-09 (Status Transition Enforcement)**: Given a ticket in `Resolved` status, when an IT Staff member updates status to `Closed`, then the transition succeeds; if an invalid transition is attempted, HTTP 400 is returned.
- **AC-10 (Admin User Creation)**: Given an Administrator, when submitting a valid user payload with role and initial password, then the user is created with `mustChangePassword=true` and HTTP 201 is returned.
- **AC-11 (Admin Self-Deactivation Guard)**: Given an Administrator, when attempting to deactivate their own account via `PATCH /api/admin/users/:id`, then HTTP 400 is returned with an explicit safety rejection.
- **AC-12 (Last Admin Protection Guard)**: Given the sole active Administrator in the system, when an update attempts to deactivate or re-role this account, then the operation is blocked with HTTP 400.
- **AC-13 (Non-Admin Access Prevention)**: Given an authenticated Requester or IT Staff member, when requesting `/api/admin/users`, then HTTP 403 Forbidden is returned.
- **AC-14 (Requester Resolution Indication)**: Given an open ticket, when the ticket Requester clicks "Problem Appears Resolved", then `isRequesterResolved` becomes `true` while the formal status remains unchanged.
- **AC-15 (Logout Token Revocation)**: Given an authenticated session, when the user clicks Logout, then client storage is cleared and subsequent requests return HTTP 401 Unauthorized.

---

## 7. Data Changes & Migration Decisions

### 7.1 Entity Relationship Model
- **`RequesterUser` Model Evolution**: Migrated into the unified `User` model with `role` enum (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), `passwordHash`, `isActive`, and `mustChangePassword`. Existing Requester IDs and ticket relationships are strictly preserved.
- **`Ticket` Model Updates**:
  - `requesterId`: References `User.id` (Foreign Key).
  - `ownerId`: References `User.id` (Foreign Key, Nullable for unassigned tickets).
  - `itPriority`: Priority Enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), nullable/defaulting to requested priority.
  - `isRequesterResolved`: Boolean flag (default `false`).
- **`Comment` Model (New)**: `id`, `ticketId` (FK Ticket), `authorId` (FK User), `content` (String), `createdAt` (DateTime).
- **`InternalNote` Model (New)**: `id`, `ticketId` (FK Ticket), `authorId` (FK User), `content` (String), `createdAt` (DateTime).

### 7.2 Migration Strategy
A Prisma migration (`migration.sql`) alters `RequesterUser` into `User`, adds necessary password and role columns, seeds existing requesters with default initial passwords, and establishes foreign key constraints on Ticket owner, comments, and internal notes without dropping existing tables.

---

## 8. Definition of Done (DoD) for Sprint 3

1. **Specification & Contract Compliance**:
   - `docs/lab-03/` specifications (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) complete and merged prior to implementation PRs.
2. **Product Functionality**:
   - Secure login, logout, and first-login password change working end-to-end.
   - Requester Lab 2 regression passing 100% with real authenticated identity.
   - Shared IT Staff Ticket Queue with search, filter, sort, pagination, and responsive cards.
   - IT Staff Ticket Detail with ownership claiming, IT Priority, status workflow, public comments, and internal notes.
   - Administrator User Management with user creation, editing, deactivation, password reset, and safety guards.
3. **Quality & Test Automation**:
   - 100% pass rate across all server Vitest suites (`server/tests/lab-03/`).
   - 100% pass rate across all client Vitest suites (`client/tests/lab-03/`).
   - 100% pass rate across all Playwright E2E suites (`e2e/lab-03/`).
   - Zero TypeScript compilation errors and zero unhandled console warnings.
4. **Engineering Process**:
   - All work delivered on feature branches merged into `lab3-staging` via peer review (Rule 1 enforced).
   - Final release PR merged into `main`.
   - Comprehensive 9-part PDF report submitted.
