# Lab 4 UI Specification: Zen Green Design System, Dashboards, and Actions Taken

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)  
**Project:** TokTickIT Multi-Role IT Service Desk Platform  
**Sprint:** Sprint 4 (Final Presentation & UI Polish)

---

## 1. Zen Green Design Tokens & Typography

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `--color-primary` | `#006B3C` | Main brand color, top navigation bar, primary buttons |
| `--color-primary-hover` | `#085430` | Hover state for buttons and links |
| `--color-primary-focus` | `#0B7A46` | Accessible focus outline (3px solid) |
| `--color-primary-tint` | `#EAF6EF` | Card backgrounds, badge fills, table hover highlights |
| `--color-bg` | `#F5F7F6` | Global page background |
| `--color-surface` | `#FFFFFF` | Card surfaces, modals, table rows |
| `--color-border` | `#E5E7EB` | Dividers, input outlines, table cell borders |
| `--color-text-main` | `#111827` | Headings, primary content, table data |
| `--color-text-muted` | `#6B7280` | Subtitles, helper text, timestamps, table headers |
| `--color-amber-warning` | `#F59E0B` | Internal notes alert, attention-needed indicators |
| `--color-blue-info` | `#2563EB` | In Progress badges, info callouts |
| `--font-sans` | `Inter, -apple-system, BlinkMacSystemFont, sans-serif` | Clean, high-legibility UI typography |

---

## 2. Screen Specifications

### 2.1 IT Staff Dashboard (`StaffDashboard.tsx`)
*Adheres to Teacher Mockup 1 (Handout Page 5)*
- **Header Section:**
  - Greeting: `Welcome back, [Staff Name]!`
  - Subtitle: `Here's what's happening with your queue today.`
  - Action: Real-time `Refresh` button with rotating loading indicator.
- **Operational KPI Cards Grid:**
  - `New`: Total tickets in New status. Drill-down: `/staff/queue?status=NEW`.
  - `Open`: Total tickets in Open status. Drill-down: `/staff/queue?status=OPEN`.
  - `In Progress`: Total tickets in In Progress status. Drill-down: `/staff/queue?status=IN_PROGRESS`.
  - `Waiting for Requester`: Waiting on user feedback. Drill-down: `/staff/queue?status=WAITING_FOR_REQUESTER`.
  - `My Assigned`: Tickets assigned to current staff user. Drill-down: `/staff/queue?owner=me`.
  - Visual: Zen Green card styling, bold numerical counter, badge status indicator.
- **My Recent Tickets Panel:**
  - Compact table displaying Ticket #, Summary, Status badge, and Updated timestamp.
  - "View all" header link routing directly to queue.
  - Clickable rows opening `StaffTicketDetail.tsx`.
- **Quick Actions Card:**
  - Quick buttons with icons: `+ Create Ticket`, `🔍 Search Tickets`, `📋 My Queue`.

---

### 2.2 Requester Dashboard (`RequesterDashboard.tsx`)
*Adheres to Teacher Mockup 2 (Handout Page 6)*
- **Header Section:**
  - Greeting: `Welcome, [Requester Name]!`
  - Subtitle: `Here's the latest on your requests.`
- **Personal Metric Cards:**
  - `My Open Tickets`: All unclosed tickets owned by user. Drill-down: `/tickets?status=open`.
  - `In Progress`: Active tickets currently being worked on. Drill-down: `/tickets?status=IN_PROGRESS`.
  - `Resolved`: Tickets marked as resolved by staff. Drill-down: `/tickets?status=RESOLVED`.
  - `Closed`: Completed historical tickets. Drill-down: `/tickets?status=CLOSED`.
- **My Recent Tickets Panel:**
  - Compact cards/table of user's recent submissions.
  - "View all" header link routing to `MyTickets.tsx`.
- **Quick Actions Panel:**
  - `+ Create Ticket`, `📋 View My Tickets`.

---

### 2.3 Actions Taken on Ticket Detail (`StaffTicketDetail.tsx` & `TicketDetail.tsx`)
- **Tab Layout on Ticket Detail:**
  - Tab 1: `Public Comments` (Zen Green border `#006B3C`, visible to all)
  - Tab 2: `Confidential Internal Notes` (Amber border `#F59E0B`, lock icon 🔒, staff/admin only)
  - Tab 3: `Actions Taken` (Parent-child work intervention log)
- **Actions Taken UI Structure:**
  - **Header Bar:** Shows count badge (e.g. `Actions Taken (3)`).
  - **Add Action Button (Staff/Admin Only):** `+ Add Action Taken` opens modal/drawer.
  - **Chronological List Cards:**
    - Action Header: Date/time badge, Performed By badge (avatar + staff name), Status badge (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
    - Action Description: Highlighting specific technical intervention.
    - Result Block: Subtle shaded callout showing operational results.
    - Follow-Up Callout: If `followUpRequired === true`, shows amber pill `Follow-Up Required` with the detailed follow-up note.
    - Attachment Notes: If present, displays file reference callout (e.g. `📎 Attachment Notes: screenshot1.png`).
    - Edit Action (Staff/Admin Only): Allows inline or modal editing of result, status, or follow-up notes.
  - **Requester View (`TicketDetail.tsx`):**
    - Identical chronological cards in read-only presentation.
    - Add/Edit buttons strictly hidden and unrendered.

---

### 2.4 Application Shell & Obsolete Element Cleanup (`Navbar.tsx`)
- **Navigation Links:**
  - For `REQUESTER`: `Dashboard`, `My Tickets`, `Create Ticket`.
  - For `IT_STAFF`: `Dashboard`, `Ticket Queue`, `Create Ticket`.
  - For `ADMINISTRATOR`: `Dashboard`, `Ticket Queue`, `User Management`.
- **Cleanup (Handout Section 7):**
  - Completely purged any development switcher or temporary role buttons.
  - Verified active link highlighting (`border-bottom: 3px solid white` or distinct pill fill).
  - Profile dropdown with authenticated username, role badge, and `Sign Out` button.

---

## 3. Responsive Breakpoint Conventions

| Component | Desktop (>= 1280px) | Tablet (768px - 1024px) | Mobile (375px - 767px) |
| :--- | :--- | :--- | :--- |
| **KPI Metrics Cards** | 5-column / 4-column inline grid | 2-column wrapped grid | 1-column stacked cards |
| **Dashboard Layout** | 2-column (70% tickets, 30% quick actions) | Stacked 1-column layout | Stacked 1-column layout |
| **Actions Taken List**| Multi-column action cards with inline badges | Condensed card layout | Vertical stacked elements with touch-friendly buttons |
| **Action Taken Modal**| 600px centered dialog with backdrop | 90% viewport centered modal | Full-screen sheet with top sticky header |
| **Touch Targets** | Standard mouse targets (>= 36px) | Touch targets >= 44px | Touch targets >= 44px, full-width submit |

---

## 4. Visual and Accessibility Checklist (VC-01 to VC-10)

| ID | Design Requirement | Evaluation Standard | Status |
| :--- | :--- | :--- | :---: |
| **VC-01** | **Zen Green Palette** | Primary `#006B3C`, focus `#0B7A46`, tint `#EAF6EF` used consistently | **Verified** |
| **VC-02** | **Role Navigation** | Navigation strictly matches authenticated role; active page indicated | **Verified** |
| **VC-03** | **Badges & Labels** | Semantic color-coding for status (New, Open, In Progress, Resolved, Closed) | **Verified** |
| **VC-04** | **Editable vs Read-Only**| Editable inputs have distinct borders; read-only fields use neutral background | **Verified** |
| **VC-05** | **Communication Tabs** | Public Comments (Green), Internal Notes (Amber 🔒), Actions Taken (Teal) | **Verified** |
| **VC-06** | **Validation Placement** | Inline red error text directly below invalid inputs; summary alerts on top | **Verified** |
| **VC-07** | **Keyboard Focus** | Visible outline (`3px solid #0B7A46`) on all interactive controls via Tab | **Verified** |
| **VC-08** | **Clipping & Overlap** | Zero truncated cards, no overlapping controls, modals stay inside viewport | **Verified** |
| **VC-09** | **Zero Overflow** | Zero horizontal scrollbars across 1280px, 768px, and 375px viewports | **Verified** |
| **VC-10** | **Obsolete UI Purge** | All temporary dev selectors and legacy buttons completely removed | **Verified** |
