# Lab 2 Zen Green UI Specification

## 1. Color Tokens and Theme System

The application adopts the **Zen Green Theme** to convey clarity, reliability, and calm focus:

| Token Name | Hex Code | Purpose & Usage |
|---|---|---|
| `--color-primary-green` | `#006B3C` | Main application header, primary CTA buttons, strong emphasis |
| `--color-secondary-green` | `#0B7A46` | Active navigation tabs, links, focus rings, hover states |
| `--color-pale-green` | `#EAF6EF` | Selected card backgrounds, success alerts, subtle section shading |
| `--color-page-bg` | `#F5F7F6` | Main window and viewport background |
| `--color-surface` | `#FFFFFF` | Form cards, tables, modal dialogs |
| `--color-border` | `#E5E7EB` | Dividers, card borders, neutral input borders |
| `--color-text-main` | `#1F2937` | Primary dark charcoal typography |
| `--color-text-muted` | `#6B7280` | Helper text, secondary labels, timestamps |
| `--color-error` | `#DC2626` | Validation error text, error borders, danger alerts |
| `--color-warning` | `#D97706` | Amber warnings, medium/urgent priority badges |
| `--color-success` | `#16A34A` | Success icons, online status pill, completed tags |

---

## 2. Typography and Spacing
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Scale**:
  - `h1` (App title): `24px` (`1.5rem`), font-weight 700
  - `h2` (Screen headers): `20px` (`1.25rem`), font-weight 600
  - `h3` (Card/Section titles): `16px` (`1rem`), font-weight 600
  - Body text: `14px` (`0.875rem`), line-height 1.5
  - Small / captions: `12px` (`0.75rem`), line-height 1.4
- **Spacing Unit**: 4px base grid (4px, 8px, 12px, 16px, 24px, 32px).

---

## 3. Form Controls and Component Rules
- **Labels**: Rendered above controls, font-weight 500 (`#374151`). Required fields include an explicit red asterisk `<span class="text-danger">*</span>`.
- **Editable Inputs**: Background `#FFFFFF`, border `1px solid #D1D5DB`, border-radius `6px`, padding `8px 12px`. Consistent height `40px` for text inputs and dropdown selects.
- **Multiline Description**: Minimum height `120px`, vertical resize only.
- **Read-Only Fields**: Background `#F9FAFB`, border `1px solid #E5E7EB`, text `#4B5563`.
- **Validation Messages**: Placed directly below the affected control in red `#DC2626` text (`12px`) with an error icon.
- **Buttons**:
  - **Primary**: Background `#006B3C`, text `#FFFFFF`, hover `#0B7A46`.
  - **Secondary / Outline**: Border `1px solid #D1D5DB`, text `#374151`, hover background `#F3F4F6`.
  - **Destructive**: Background `#DC2626`, text `#FFFFFF`, hover `#B91C1C`.
  - **Disabled / Busy State**: Opacity `0.65`, pointer-events none, displays inline loading spinner.

---

## 4. Priority & Status Badges
- **Status Badges**:
  - `New`: Blue / Light cyan (`bg-info text-dark`)
  - `In Progress`: Blue (`bg-primary text-white`)
  - `Resolved`: Green (`bg-success text-white`)
  - `Closed`: Gray (`bg-secondary text-white`)
- **Requested Priority Badges**:
  - `LOW`: Soft green (`#DEF7EC`, text `#03543F`)
  - `MEDIUM`: Soft amber (`#FEF3C7`, text `#92400E`)
  - `HIGH`: Soft orange (`#FEE2E2`, text `#991B1B`)
  - `URGENT`: Bright red (`#F87171`, text `#FFFFFF`)

---

## 5. Application Shell & Screens

### 5.1 Shell Layout
- **Header**: Background `#006B3C`, containing TokTickIT branding, navigation tabs (`My Tickets`, `Create Ticket`), and active Requester pill with a "Change" button.
- **Footer**: Subtle version and course information.

### 5.2 Development Requester Selection Screen
- Centered card (`max-width: 520px`).
- Descriptive banner: *"Select a Development Requester to test requester-specific ticket behavior. This is not a login screen. Authentication and role-based access will be introduced in Lab 3."*
- Dropdown listing only active requesters.
- "Continue" button saving context to `localStorage` / React state.

### 5.3 Create Ticket Screen
- Two-column responsive card on desktop (`max-width: 800px`).
- Left column: Classification (Category dropdown, Related System dropdown, Priority selector).
- Right column / Full width: Summary (with character counter), Multiline Description.
- Bottom section: File upload dropzone, list of selected files with size badges and remove buttons.
- Action row: Cancel button, Submit Ticket primary button with loading indicator.

### 5.4 My Tickets Screen
- Toolbar: Search input with search icon, Category dropdown filter, Priority filter, Status filter, "Clear Filters" link, and primary "+ Create Ticket" action button.
- Desktop: Table with columns (Ticket No, Created Date, Summary, Category, Priority, Status, Last Updated). Clicking row opens Ticket Detail.
- Mobile: Card-based list displaying Ticket No, Date, Status badge, and Summary.
- Pagination: Previous/Next buttons, active page indicators, showing "Page X of Y (Z tickets)".
- Empty State: Illustrated empty box with *"No tickets yet. Click Create Ticket to submit your first request."*
- No-Results State: *"No tickets match your search or filter criteria. Try clearing filters."*

### 5.5 Ticket Detail Screen
- Header: Ticket Number, creation date, status badge, back navigation link (`← Back to My Tickets`).
- Metadata Grid: Requester, Category, Related System, Requested Priority.
- Summary and Description read-only panels.
- Attachment Section:
  - List of active attachments with filename, size, upload date, and download button.
  - "Add Attachment" button with modal.
  - Soft-removal action on each attachment triggering a confirmation modal requiring a removal reason.
  - Soft-removed attachments section showing filename, removed timestamp, reason, and a disabled "Removed" badge (download blocked).

---

## 6. Responsive Layout Breakpoints

| Viewport | Min Width | Layout Rules |
|---|---|---|
| **Desktop** | `≥ 992px` | Centered layout (`max-width: 1200px`); multi-column grid; full data table. |
| **Tablet** | `768px – 991px` | Two-column form layout; horizontal table scrolling with visible indicators. |
| **Mobile** | `< 768px` | Single-column stacked fields; ticket cards instead of wide table; full-width buttons. |
