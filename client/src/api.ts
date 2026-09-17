import { Category, RelatedSystem, RequesterUser, Attachment, Ticket, TicketPriority, TicketComment, InternalNote, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type { Category, RelatedSystem, RequesterUser, Attachment, Ticket, TicketPriority, TicketComment, InternalNote, User };

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetch(`${API_URL}/api/health`);
  if (!healthRes.ok) {
    throw new Error("Unable to connect to TokTickIT API");
  }

  let categories: Category[] = [];
  try {
    const catRes = await fetch(`${API_URL}/api/categories`);
    if (catRes.ok) {
      categories = await catRes.json();
    }
  } catch (_err) {
    // Categories fallback
  }

  return { online: true, categories };
}

export async function fetchDevRequesters(): Promise<RequesterUser[]> {
  const res = await fetch(`${API_URL}/api/dev-requesters`);
  if (!res.ok) {
    throw new Error("Failed to load development requesters");
  }
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) {
    throw new Error("Failed to load categories");
  }
  return res.json();
}

export async function fetchRelatedSystems(): Promise<RelatedSystem[]> {
  const res = await fetch(`${API_URL}/api/related-systems`);
  if (!res.ok) {
    throw new Error("Failed to load related systems");
  }
  return res.json();
}

export async function createTicket(payload: {
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  summary: string;
  description: string;
  requestedPriority: string;
}): Promise<any> {
  const res = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create ticket");
  }
  return res.json();
}

export async function fetchTickets(params: {
  requesterId: number;
  search?: string;
  categoryId?: number;
  priority?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<any> {
  const query = new URLSearchParams();
  query.set("requesterId", String(params.requesterId));
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", String(params.categoryId));
  if (params.priority) query.set("priority", params.priority);
  if (params.status) query.set("status", params.status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load tickets");
  }
  return res.json();
}

export async function getTicketDetail(ticketId: number, requesterId?: number): Promise<Ticket> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const query = requesterId ? `?requesterId=${requesterId}` : "";
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}${query}`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load ticket details");
  }
  return res.json();
}

export async function getCommentsApi(ticketId: number): Promise<TicketComment[]> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || data?.error || "Failed to load comments");
  }
  return res.json();
}

export async function addCommentApi(ticketId: number, content: string): Promise<TicketComment> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || data?.error || "Failed to post comment");
  }
  return res.json();
}

export async function toggleProblemResolvedApi(ticketId: number, isResolved: boolean): Promise<Ticket> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/resolve-indication`, {
    method: "POST",
    headers,
    body: JSON.stringify({ isResolved }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || data?.error || "Failed to update resolution status");
  }
  return res.json();
}

export async function uploadAttachment(
  ticketId: number,
  requesterId: number,
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("requesterId", String(requesterId));

  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/attachments`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to upload attachment");
  }
  return res.json();
}

export function getAttachmentDownloadUrl(
  ticketId: number,
  attachmentId: number,
  requesterId: number
): string {
  return `${API_URL}/api/tickets/${ticketId}/attachments/${attachmentId}/download?requesterId=${requesterId}`;
}

export async function softRemoveAttachment(
  ticketId: number,
  attachmentId: number,
  requesterId: number,
  reason: string
): Promise<Attachment> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requesterId, reason }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to remove attachment");
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Lab 3 Authentication API Clients
// ---------------------------------------------------------------------------
export const TOKEN_STORAGE_KEY = "toktickit_auth_token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {}
}

export function removeAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

export async function loginApi(email: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.error || "Login failed. Please check credentials.";
    const code = data?.error?.code || "AUTH_FAILED";
    const err = new Error(errorMsg);
    (err as any).code = code;
    throw err;
  }

  setAuthToken(data.token);
  return data;
}

export async function getMeApi(token: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch user profile");
  }
  return data.user;
}

export async function logoutApi(token: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } finally {
    removeAuthToken();
  }
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  token: string
): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || "Failed to change password";
    throw new Error(errorMsg);
  }

  setAuthToken(data.token);
  return data;
}

// ---------------------------------------------------------------------------
// Lab 3 Issue 4 — IT Staff Ticket Queue API Client
// ---------------------------------------------------------------------------
export interface StaffTicketQueryParams {
  search?: string;
  categoryId?: number;
  currentStatus?: string;
  priority?: string;
  ownerFilter?: "all" | "unassigned" | "assigned_to_me";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface StaffTicketQueueResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalOpen: number;
    assignedToMe: number;
    unassigned: number;
  };
}

export async function fetchStaffTicketsApi(
  params: StaffTicketQueryParams = {}
): Promise<StaffTicketQueueResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", String(params.categoryId));
  if (params.currentStatus) query.set("currentStatus", params.currentStatus);
  if (params.priority) query.set("priority", params.priority);
  if (params.ownerFilter) query.set("ownerFilter", params.ownerFilter);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/staff/tickets?${query.toString()}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.error || "Failed to load staff ticket queue.";
    const code = data?.error?.code || "QUEUE_FETCH_ERROR";
    const err = new Error(errorMsg);
    (err as any).code = code;
    throw err;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Lab 3 Issue 5 — IT Staff Ticket Detail & Operations API Client
// ---------------------------------------------------------------------------
export async function fetchStaffUsersApi(): Promise<User[]> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/staff/users`, { headers });
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch staff directory.");
  }
  return data;
}

export async function fetchStaffTicketDetailApi(ticketId: number): Promise<Ticket> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch staff ticket detail.");
  }
  return data;
}

export async function assignStaffTicketApi(ticketId: number, ownerId: number | null): Promise<Ticket> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ ownerId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to assign ticket.");
  }
  return data;
}

export async function updateStaffTicketPriorityApi(ticketId: number, itPriority: string): Promise<Ticket> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ itPriority }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to update IT Priority.");
  }
  return data;
}

export async function updateStaffTicketStatusApi(ticketId: number, status: string): Promise<Ticket> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to update ticket status.");
  }
  return data;
}

export async function fetchInternalNotesApi(ticketId: number): Promise<InternalNote[]> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}/notes`, { headers });
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to fetch internal notes.");
  }
  return data;
}

export async function addInternalNoteApi(ticketId: number, content: string): Promise<InternalNote> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to post internal note.");
  }
  return data;
}

