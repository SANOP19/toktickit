import { Category, RelatedSystem, RequesterUser, Attachment, Ticket, TicketPriority } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type { Category, RelatedSystem, RequesterUser, Attachment, Ticket, TicketPriority };

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

  const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load tickets");
  }
  return res.json();
}

export async function getTicketDetail(ticketId: number, requesterId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}?requesterId=${requesterId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load ticket details");
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
