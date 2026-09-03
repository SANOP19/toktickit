import { Category, RelatedSystem, RequesterUser } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type { Category, RelatedSystem, RequesterUser };

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
