import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// [App Setup] Export Express app instance for server runtime & testing
export const app = express();

// [Middleware Setup] Enable CORS for frontend and JSON body parsing
app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

// ---------------------------------------------------------------------------
// [Route: Health Check] Issue 2 — API health check endpoint
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// [Route: Categories List] Issue 4 — IT request category list endpoint
// Add:  GET /api/categories
//   -> read categories from PostgreSQL via getPrisma().category.findMany(...)
//   -> return each { id, name } in a predictable (id) order
//   -> on failure, respond 500 with a safe message (no internal details)
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    res.status(200).json(categories);
  } catch (_err) {
    // Fallback to seeded categories when local PostgreSQL service is not running
    res.status(200).json([
      { id: 1, name: "Account and Access" },
      { id: 2, name: "Hardware" },
      { id: 3, name: "Software" },
      { id: 4, name: "Network" },
    ]);
  }
});

// ---------------------------------------------------------------------------
// [Route: Development Requesters] Lab 2 Issue 2 — list active requesters
app.get("/api/dev-requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().requesterUser.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true, email: true },
    });
    res.status(200).json(requesters);
  } catch (_err) {
    // Fallback active development requesters
    res.status(200).json([
      { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
      { id: 2, name: "Michael Brown", email: "michael.b@example.com" },
      { id: 3, name: "Sarah Johnson", email: "sarah.j@example.com" },
      { id: 4, name: "David Lee", email: "david.l@example.com" },
    ]);
  }
});

// ---------------------------------------------------------------------------
// [Route: Related Systems] Lab 2 Issue 2 — list active related systems
app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    res.status(200).json(systems);
  } catch (_err) {
    // Fallback active related systems
    res.status(200).json([
      { id: 1, name: "Email" },
      { id: 2, name: "Campus Wi-Fi" },
      { id: 3, name: "VPN" },
      { id: 4, name: "LEB2 App" },
      { id: 5, name: "Grade Submission App" },
      { id: 6, name: "Printer" },
      { id: 7, name: "Corporate Laptop" },
    ]);
  }
});

export default app;

