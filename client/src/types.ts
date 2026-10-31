export type Role = "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RequesterUser {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
}

export interface Attachment {
  id: number;
  ticketId: number;
  originalName: string;
  storageName: string;
  mimeType: string;
  sizeBytes: number;
  isRemoved: boolean;
  removedAt?: string | null;
  removalReason?: string | null;
  createdAt: string;
}

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TicketComment {
  id: number;
  ticketId: number;
  authorId: number;
  author: {
    id: number;
    name: string;
    role: Role;
  };
  content: string;
  createdAt: string;
}

export interface InternalNote {
  id: number;
  ticketId: number;
  authorId: number;
  author: {
    id: number;
    name: string;
    role: Role;
  };
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: TicketPriority;
  itPriority?: TicketPriority | null;
  currentStatus: string;
  isRequesterResolved?: boolean;
  requesterId: number;
  ownerId?: number | null;
  categoryId: number;
  relatedSystemId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  relatedSystem?: RelatedSystem;
  requester?: RequesterUser;
  owner?: User | null;
  attachments?: Attachment[];
  comments?: TicketComment[];
  internalNotes?: InternalNote[];
  actionsTaken?: ActionTaken[];
  resolutionSummary?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: Role;
  initialPassword: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// [Sprint 4: Actions Taken Interfaces]
// ---------------------------------------------------------------------------
export type ActionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface ActionTaken {
  id: number;
  ticketId: number;
  performedById: number;
  performedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  actionDateTime: string;
  description: string;
  result: string;
  status: ActionStatus;
  followUpRequired: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionTakenPayload {
  description: string;
  result: string;
  status?: ActionStatus;
  followUpRequired?: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
}

export interface UpdateActionTakenPayload {
  description?: string;
  result?: string;
  status?: ActionStatus;
  followUpRequired?: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  version?: number;
}



// ---------------------------------------------------------------------------
// [Sprint 4: Dashboard Interfaces]
// ---------------------------------------------------------------------------
export interface StaffDashboardMetrics {
  newTickets: number;
  openTickets: number;
  inProgressTickets: number;
  waitingForRequester: number;
  myAssignedTickets: number;
  urgentTickets: number;
}

export interface StaffRecentTicket {
  id: number;
  ticketNumber: string;
  summary: string;
  category: string;
  itPriority?: string;
  requestedPriority?: string;
  currentStatus: string;
  ownerName?: string;
  updatedAt: string;
}

export interface StaffRecentAction {
  id: number;
  ticketId: number;
  ticketNumber?: string;
  description: string;
  status: ActionStatus | string;
  actionDateTime: string;
}

export interface StaffDashboardData {
  metrics: StaffDashboardMetrics;
  recentTickets: StaffRecentTicket[];
  myRecentActions?: StaffRecentAction[];
}

export interface RequesterDashboardMetrics {
  myOpenTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

export interface RequesterRecentTicket {
  id: number;
  ticketNumber: string;
  summary: string;
  category: string;
  requestedPriority: string;
  currentStatus: string;
  isRequesterResolved?: boolean;
  updatedAt: string;
}

export interface RequesterDashboardData {
  metrics: RequesterDashboardMetrics;
  recentTickets: RequesterRecentTicket[];
}
