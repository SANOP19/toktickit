# Lab 3 UI Specification: Zen Green Design System & Component Guidelines

## 1. Design Tokens & Zen Green Palette

TokTickIT enforces the Zen Green visual language established in Lab 2 and extended for Lab 3's multi-role interfaces.

| Token Name | Value | Description |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | App header, primary buttons (`Sign In`, `Save User`, `Submit Ticket`), active navigation tabs. |
| **Secondary Green** | `#0B7A46` | Hover states on primary buttons, link accents, focus outlines. |
| **Pale Green** | `#EAF6EF` | Selected rows, success message callouts, Public Comment bubbles. |
| **Page Background** | `#F5F7F6` | Application body background, quiet near-white surface. |
| **Card Surface** | `#FFFFFF` | Form containers, modal dialogs, data table backgrounds. |
| **Typography Dark** | `#1F2937` | High contrast body typography meeting WCAG AA standards. |
| **Muted Text** | `#6B7280` | Form help text, secondary timestamps, field placeholders. |
| **Internal Note Amber** | `#F59E0B` (Border), `#FFFBEB` (Bg) | Distinct alert styling for confidential staff-only internal notes. |
| **Destructive Red** | `#DC2626` | Error callouts, inline validation messages, user deactivation warnings. |

---

## 2. Application Shell & Role-Based Navigation

### 2.1 Unauthenticated State
- Clean, focused layout with centered card surface on `#F5F7F6` background.
- Navbar displays brand logo ("TokTickIT") without internal navigation links.

### 2.2 Authenticated Navigation Shell
- **Brand Title:** `TokTickIT` (links to user's primary landing view).
- **Role-Filtered Navigation Links:**
  - **Requester:** `My Tickets` | `Create Ticket`
  - **IT Staff:** `Ticket Queue`
  - **Administrator:** `User Management`
- **User Identity Badge:**
  - Placed in top-right navbar shell: `[User Name] ([ROLE_BADGE])`
  - Examples: `Jennifer Anderson (Requester)`, `Alex Thompson (IT Staff)`, `John Smith (Admin)`.
- **Logout Action:**
  - Prominent "Sign Out" / "Logout" button that terminates session and redirects to `/login`.

---

## 3. Screen Specifications

### 3.1 Login Screen (`/login`)
- **Container:** Centered card surface (max-width: 440px).
- **Controls:**
  - Email input (autofocused, email validation).
  - Password input (masked, with show/hide toggle).
  - Primary button: "Sign In" with busy spinner during network request.
- **Feedback & States:**
  - Empty field validation: inline red error messages beneath fields.
  - Invalid credentials / Inactive account: red alert banner above form fields (`"Invalid email or password. Please try again."` or `"Account is inactive. Please contact administrator."`).

### 3.2 Mandatory First-Login Password Change View
- **Behavior:** Triggered immediately upon successful login if user profile has `mustChangePassword === true`. The application shell is suppressed, and user cannot navigate away until completion.
- **Card Header:** "Change Your Password" with explanatory note: *"You must update your initial password to continue."*
- **Fields:**
  - Current Password (masked).
  - New Password (masked).
  - Confirm New Password (masked).
- **Checklist Callout (`#EAF6EF` container):**
  - Live indicator: *"At least 8 characters in length."*
  - Live indicator: *"Passwords must match."*
- **Action:** "Save & Continue" button (disabled until validation criteria met).

### 3.3 IT Staff Ticket Queue (`/staff/queue`)
- **Summary Metrics Bar:** Quick count badges for `Total Open Tickets`, `Assigned to Me`, and `Unassigned`.
- **Query Controls Bar:**
  - Search Input: "Search by ticket number or summary...".
  - Dropdown Filter: `Category` (All, Hardware, Software, Network, Account and Access).
  - Dropdown Filter: `Status` (All, New, Open, In Progress, Waiting for Requester, Resolved).
  - Dropdown Filter: `Priority` (All, Low, Medium, High, Urgent).
  - Dropdown Filter: `Ownership` (All Tickets, Assigned to Me, Unassigned).
- **Desktop Table View (>= 992px):**
  - Columns: `Ticket No.`, `Created Date`, `Summary`, `Category`, `Req Priority`, `IT Priority`, `Status`, `Owner`, `Actions`.
  - Badges:
    - Status: `New` (Sky), `Open` (Blue), `In Progress` (Amber), `Waiting for Requester` (Purple), `Resolved` (Green), `Closed` (Gray).
    - Priority: `Low` (Gray), `Medium` (Yellow-Green), `High` (Orange), `Urgent` (Red).
    - Owner: Shows assigned staff name or italicized *"Unassigned"*.
  - Row Action: "View Detail" button.
- **Mobile Card View (< 768px):**
  - Transition from multi-column grid to vertically stacked cards. Each card displays Ticket No, Status badge, IT Priority badge, Summary, Owner, and "View Detail" tap target.

### 3.4 IT Staff Ticket Detail Screen (`/staff/tickets/:id`)
- **Header:** Back to Queue link, Ticket Number, Created Timestamp, Requester details.
- **Requester Resolution Banner (Conditional):**
  - Appears in pale green if `isRequesterResolved === true`: *"The Requester has indicated this problem appears resolved."*
- **Operational Control Panel:**
  - **Ownership:** Dropdown listing active IT Staff with quick "Claim Ticket" action button (assigns current staff member).
  - **IT Priority:** Dropdown (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - **Status:** Dropdown displaying only permitted transitions based on current state.
- **Tabbed or Split Communication Area:**
  - **Tab 1: Public Comments:**
    - Explicit header: *"Public Comments (Visible to Requester & IT Staff)"*.
    - Chronological list of comment cards with Author Name, Role pill, and timestamp.
    - Input area with "Post Public Comment" button (`#006B3C`).
  - **Tab 2: Internal Notes:**
    - Explicit header: *"Internal Operational Notes (Confidential - Visible ONLY to IT Staff & Admin)"*.
    - Visual distinction: Warm amber/gold card border (`#F59E0B`) with shield/lock icon.
    - Input area with "Save Internal Note" button (`#B45309`).
- **Attachments Panel:**
  - Displays active attachments uploaded by Requester, with active download links and soft-removal audit history.

### 3.5 Requester Ticket Detail Screen (`/tickets/:id`)
- **Continuity from Lab 2:** Read-only ticket details, active attachments, soft-removal modal.
- **Enhancements:**
  - Public Comments thread: Requester can read staff replies and append new comments.
  - "Problem Appears Resolved" toggle button allowing Requester to notify IT Staff.
  - **Strict Security:** Internal Notes tab and all operational controls (Owner, IT Priority, Status dropdown) are completely absent.

### 3.6 Administrator User Management Screen (`/admin/users`)
- **Header:** "User Management" with "+ Create New User" action button.
- **Filter Bar:** Search input (by name or email) and Role filter (All, Requester, IT Staff, Administrator).
- **User Table:**
  - Columns: `Name`, `Email`, `Role` (Badge), `Status` (`Active` in green / `Inactive` in red), `Actions`.
  - Action: "Edit" button opening modal.
- **Create User Modal:**
  - Inputs: Full Name, Email Address, Role dropdown (`Requester`, `IT Staff`, `Administrator`), Active toggle (default: Yes).
  - Initial Password input with checkbox *"User must change password on first login"* (checked by default).
  - "Save User" primary button.
- **Edit User Modal:**
  - Inputs: Name, Email, Role dropdown, Active toggle.
  - Secondary Actions:
    - "Reset Initial Password" button (opens sub-modal to supply temporary password).
    - "Deactivate User" / "Activate User" toggle.
  - **Safety Guard Triggers:**
    - If editing own account: Active toggle and role dropdown are disabled with tooltip: *"You cannot deactivate or demote your own administrator account."*
    - If editing the last active administrator: Deactivation is blocked with error message: *"Cannot deactivate the system's last active administrator."*

---

## 4. Responsive Breakpoint Rules

| Viewport | Range | Layout Behavior |
| :--- | :--- | :--- |
| **Desktop** | `>= 992px` | Multi-column layouts, full data tables, side-by-side forms and detail panels, content centered with max-width 1280px. |
| **Tablet** | `768px - 991px` | Two-column stacked forms, horizontal scrolling with sticky headers on large data tables, responsive padding. |
| **Mobile** | `< 768px` | Single-column vertically stacked layout, table transitions to card representations, touch-friendly button targets (>= 44px), zero horizontal overflow. |

---

## 5. Visual Inspection Checklist (Completed)

| Check # | Verification Area | Pass Criteria | Status | Verification Evidence / Notes |
| :--- | :--- | :--- | :---: | :--- |
| **VC-01** | **Zen Green Palette** | Tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`) applied consistently across all screens. | **PASS** | Brand header, buttons, badges, and surfaces conform uniformly. |
| **VC-02** | **Role Navigation** | Requesters see only Requester links; Staff see Queue; Admin sees Users; no unauthorized routes. | **PASS** | Dynamic navbar filtering verified in `Navbar.tsx` and E2E-01 suite. |
| **VC-03** | **Badges & Labels** | Consistent color tokens for status (`New`, `Open`, `In Progress`, etc.), priority, and role pills. | **PASS** | Verified on Queue, Detail, and User Management table screens. |
| **VC-04** | **Editable vs Read-Only** | Editable fields have clear input borders; read-only fields use subtle background styling. | **PASS** | Verified in `StaffTicketDetail.tsx` and `UserManagement.tsx` modals. |
| **VC-05** | **Communication Separation** | Public Comments (green/neutral) are visually unmistakable from Internal Notes (amber warning). | **PASS** | Amber border `#F59E0B` and lock badge on internal notes; green on comments. |
| **VC-06** | **Validation Placement** | Inline red error messages placed directly below invalid inputs; banner callouts for global errors. | **PASS** | Verified in Login form, Create Ticket form, and User Modals. |
| **VC-07** | **Focus & Accessibility** | Form inputs display clear `#0B7A46` outline on focus; tab navigation logical. | **PASS** | WCAG AA compliance and keyboard accessibility verified. |
| **VC-08** | **Clipping & Overlap** | Modals, dropdowns, and cards render without clipping or overlapping content. | **PASS** | Verified across all dialogs and expanded comment threads. |
| **VC-09** | **Zero Overflow** | Zero horizontal scrollbars across desktop (1280px), tablet (768px), and mobile (375px) viewports. | **PASS** | Mobile card transformations and responsive table containers verified. |
