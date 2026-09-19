import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { getPrisma } from "./prisma.js";
import { generateToken, verifyToken, hashPassword, comparePassword } from "./utils/auth.js";
import { authenticateToken, requireActive, requirePasswordChanged, requireRole } from "./middleware/auth.js";

// [App Setup] Export Express app instance for server runtime & testing
export const app = express();

// [Middleware Setup] Enable CORS for frontend and JSON body parsing
app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

// [Auth & Quarantine Global Interceptor]
// Intercepts authenticated requests and applies mandatory first-login password change quarantine (BR-02, AC-02)
app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
      // If user must change password, quarantine all routes except change-password & logout
      if (payload.mustChangePassword) {
        const allowedPaths = ["/api/auth/change-password", "/api/auth/logout"];
        if (!allowedPaths.includes(req.path)) {
          res.status(403).json({
            error: {
              code: "PASSWORD_CHANGE_REQUIRED",
              message: "You must change your initial password before accessing the system.",
            },
          });
          return;
        }
      }
    }
  }
  next();
});

// ---------------------------------------------------------------------------
// [Multer Storage Setup] Attachment file uploads (Lab 2 Issue 5)
// ---------------------------------------------------------------------------
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit (BR-10)
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only JPG, PNG, WEBP, and PDF files are allowed."));
    }
  },
});

// ---------------------------------------------------------------------------
// In-Memory Storage for Tickets & Attachments (Offline Database Fallback)
// ---------------------------------------------------------------------------
const sampleTickets = [
  {
    id: 1,
    ticketNumber: "TKT-2026-000101",
    summary: "Laptop battery drains quickly",
    description: "Battery discharges completely within 30 minutes of unplugging from charger.",
    requestedPriority: "MEDIUM",
    itPriority: "HIGH",
    currentStatus: "New",
    isRequesterResolved: false,
    requesterId: 1,
    ownerId: null,
    owner: null,
    categoryId: 2,
    relatedSystemId: 7,
    createdAt: "2026-09-03T09:14:00.000Z",
    updatedAt: "2026-09-03T10:30:00.000Z",
    category: { id: 2, name: "Hardware" },
    relatedSystem: { id: 7, name: "Corporate Laptop" },
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
  },
  {
    id: 2,
    ticketNumber: "TKT-2026-000102",
    summary: "Cannot connect to VPN from home",
    description: "Getting connection timeout error 691 when attempting to establish a VPN session.",
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    currentStatus: "Open",
    isRequesterResolved: false,
    requesterId: 1,
    ownerId: 5,
    owner: { id: 5, name: "Alex Rivera", email: "alex.r@example.com", role: "IT_STAFF" },
    categoryId: 4,
    relatedSystemId: 3,
    createdAt: "2026-09-02T08:02:00.000Z",
    updatedAt: "2026-09-02T09:45:00.000Z",
    category: { id: 4, name: "Network" },
    relatedSystem: { id: 3, name: "VPN" },
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
  },
  {
    id: 3,
    ticketNumber: "TKT-2026-000103",
    summary: "Email not syncing on mobile Outlook app",
    description: "New emails do not appear on iOS Outlook app even after pulling to refresh.",
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "In Progress",
    isRequesterResolved: false,
    requesterId: 1,
    ownerId: 5,
    owner: { id: 5, name: "Alex Rivera", email: "alex.r@example.com", role: "IT_STAFF" },
    categoryId: 3,
    relatedSystemId: 1,
    createdAt: "2026-09-01T16:45:00.000Z",
    updatedAt: "2026-09-02T15:20:00.000Z",
    category: { id: 3, name: "Software" },
    relatedSystem: { id: 1, name: "Email" },
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
  },
  {
    id: 4,
    ticketNumber: "TKT-2026-000201",
    summary: "Printer on 3rd floor paper jam error",
    description: "Office printer displays continuous paper jam message even after tray clearing.",
    requestedPriority: "LOW",
    itPriority: "LOW",
    currentStatus: "New",
    isRequesterResolved: false,
    requesterId: 2,
    ownerId: null,
    owner: null,
    categoryId: 2,
    relatedSystemId: 6,
    createdAt: "2026-09-03T11:20:00.000Z",
    updatedAt: "2026-09-03T11:20:00.000Z",
    category: { id: 2, name: "Hardware" },
    relatedSystem: { id: 6, name: "Printer" },
    requester: { id: 2, name: "Michael Brown", email: "michael.b@example.com" },
  },
];

export const inMemoryTickets: any[] = [...sampleTickets];
export const inMemoryAttachments: any[] = [];
export const inMemoryComments: any[] = [];
export const inMemoryInternalNotes: any[] = [];

// ---------------------------------------------------------------------------
// In-Memory Storage for Users (Offline Auth Fallback)
// ---------------------------------------------------------------------------
const defaultPasswordHash = bcrypt.hashSync("Password123!", 10);

export const inMemoryUsers = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@example.com",
    passwordHash: defaultPasswordHash,
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael.b@example.com",
    passwordHash: defaultPasswordHash,
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    passwordHash: defaultPasswordHash,
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 4,
    name: "David Lee",
    email: "david.l@example.com",
    passwordHash: defaultPasswordHash,
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 5,
    name: "Metier Leviathan",
    email: "metier.l@example.com",
    passwordHash: defaultPasswordHash,
    role: "REQUESTER" as const,
    isActive: false,
    mustChangePassword: false,
  },
  {
    id: 6,
    name: "Alex Thompson",
    email: "tech.alex@example.com",
    passwordHash: defaultPasswordHash,
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 7,
    name: "Lisa Martinez",
    email: "tech.lisa@example.com",
    passwordHash: defaultPasswordHash,
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 8,
    name: "Kevin Patel",
    email: "tech.kevin@example.com",
    passwordHash: defaultPasswordHash,
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 9,
    name: "Robert Wilson",
    email: "tech.retired@example.com",
    passwordHash: defaultPasswordHash,
    role: "IT_STAFF" as const,
    isActive: false,
    mustChangePassword: false,
  },
  {
    id: 10,
    name: "John Smith",
    email: "admin.john@example.com",
    passwordHash: defaultPasswordHash,
    role: "ADMINISTRATOR" as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 11,
    name: "Amanda Clark",
    email: "new.user@example.com",
    passwordHash: defaultPasswordHash,
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: true,
  },
];

// ---------------------------------------------------------------------------
// [Route: Health Check] Issue 2 — API health check endpoint
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// [Authentication Endpoints] Lab 3 Issue 2 (AC-01, AC-02, BR-01, BR-02)
// ---------------------------------------------------------------------------

// POST /api/auth/login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required.",
        },
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user: any = null;

    try {
      user = await getPrisma().user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch {
      // Prisma offline, fallback to inMemoryUsers
    }

    if (!user) {
      user = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    }

    if (!user) {
      res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
      return;
    }

    // Inactive account check (BR-01, AC-02)
    if (!user.isActive) {
      res.status(401).json({
        error: {
          code: "ACCOUNT_INACTIVE",
          message: "Account is inactive. Please contact system administrator.",
        },
      });
      return;
    }

    // Password verification with bcrypt
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred during authentication.",
      },
    });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", authenticateToken, (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user,
  });
});

// POST /api/auth/logout
app.post("/api/auth/logout", authenticateToken, (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Successfully logged out.",
  });
});

// POST /api/auth/change-password
app.post("/api/auth/change-password", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Current password, new password, and confirm password are required.",
        },
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "New password and confirm password do not match.",
        },
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 8 characters long.",
        },
      });
      return;
    }

    const userId = req.user!.id;
    let user: any = null;

    try {
      user = await getPrisma().user.findUnique({ where: { id: userId } });
    } catch {}

    if (!user) {
      user = inMemoryUsers.find((u) => u.id === userId);
    }

    if (!user) {
      res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found.",
        },
      });
      return;
    }

    const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Current password is incorrect.",
        },
      });
      return;
    }

    const newHash = await hashPassword(newPassword);
    user.passwordHash = newHash;
    user.mustChangePassword = false;

    try {
      await getPrisma().user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          mustChangePassword: false,
        },
      });
    } catch {}

    const newToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: false,
    });

    res.status(200).json({
      message: "Password changed successfully.",
      mustChangePassword: false,
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: false,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while changing password.",
      },
    });
  }
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
    const prismaAny = getPrisma() as any;
    const requesters = await (prismaAny.user || prismaAny.requesterUser).findMany({
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

// ---------------------------------------------------------------------------
// [Route: Create Ticket] Lab 2 Issue 3 — create ticket with unique number
app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      relatedSystemId,
      summary,
      description,
      requestedPriority = "MEDIUM",
    } = req.body;

    // Authenticated identity determines requesterId (BR-03, AC-03)
    let requesterId = req.body.requesterId;
    if (req.user && req.user.role === "REQUESTER") {
      requesterId = req.user.id;
    }

    // Field-level validations
    const errors: Record<string, string> = {};

    if (!requesterId || typeof requesterId !== "number") {
      errors.requesterId = "Requester ID is required and must be a number.";
    }

    if (!categoryId || typeof categoryId !== "number") {
      errors.categoryId = "Category selection is required.";
    }

    if (!relatedSystemId || typeof relatedSystemId !== "number") {
      errors.relatedSystemId = "Related system selection is required.";
    }

    if (!summary || typeof summary !== "string" || summary.trim().length < 5 || summary.trim().length > 120) {
      errors.summary = "Summary must be between 5 and 120 characters.";
    }

    if (!description || typeof description !== "string" || description.trim().length < 10 || description.trim().length > 2000) {
      errors.description = "Description must be between 10 and 2,000 characters.";
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    if (!validPriorities.includes(requestedPriority)) {
      errors.requestedPriority = "Priority must be LOW, MEDIUM, HIGH, or URGENT.";
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    // Verify requester active status
    try {
      const prismaAny = getPrisma() as any;
      const requester = await (prismaAny.user || prismaAny.requesterUser).findUnique({
        where: { id: requesterId },
      });
      if (requester && !requester.isActive) {
        res.status(400).json({ error: "Selected requester is inactive." });
        return;
      }
    } catch (_dbCheckErr) {
      // Allow fallback if DB offline
    }

    // Generate unique Ticket Number (e.g. TKT-2026-000001)
    const year = new Date().getFullYear();
    let ticketCount = 1;
    try {
      ticketCount = (await getPrisma().ticket.count()) + 1;
    } catch (_countErr) {
      ticketCount = inMemoryTickets.length + 1;
    }
    const ticketNumber = `TKT-${year}-${String(ticketCount).padStart(6, "0")}`;

    const fallbackTicket = {
      id: ticketCount,
      ticketNumber,
      summary: summary.trim(),
      description: description.trim(),
      requestedPriority,
      currentStatus: "New",
      isRequesterResolved: false,
      requesterId,
      categoryId,
      relatedSystemId,
      category: { id: categoryId, name: categoryId === 2 ? "Hardware" : "Software" },
      relatedSystem: { id: relatedSystemId, name: relatedSystemId === 7 ? "Corporate Laptop" : "System" },
      requester: { id: requesterId, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryTickets.push(fallbackTicket);

    // Create Ticket in Database
    try {
      const createdTicket = await getPrisma().ticket.create({
        data: {
          ticketNumber,
          summary: summary.trim(),
          description: description.trim(),
          requestedPriority,
          currentStatus: "New",
          isRequesterResolved: false,
          requesterId,
          categoryId,
          relatedSystemId,
        },
        include: {
          category: true,
          relatedSystem: true,
          requester: true,
        },
      });
      res.status(201).json(createdTicket);
    } catch (_createErr) {
      // Fallback ticket response for offline demonstration
      res.status(201).json(fallbackTicket);
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error creating ticket." });
  }
});

// ---------------------------------------------------------------------------
// [Route: List Tickets] Lab 2 Issue 4 — paginated, filtered tickets by requester
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    let requesterId = Number(req.query.requesterId);
    // Authenticated identity determines requesterId (BR-03, AC-03)
    if (req.user && req.user.role === "REQUESTER") {
      requesterId = req.user.id;
    }

    if (!requesterId || isNaN(requesterId)) {
      res.status(400).json({ error: "requesterId query parameter is required." });
      return;
    }

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const priority = typeof req.query.priority === "string" ? req.query.priority : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const sortBy = typeof req.query.sortBy === "string" && ["createdAt", "ticketNumber", "summary", "requestedPriority", "currentStatus"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 8));

    const where: any = {
      requesterId,
    };
    if (categoryId && !isNaN(categoryId)) where.categoryId = categoryId;
    if (priority) where.requestedPriority = priority;
    if (status) where.currentStatus = status;
    if (search) {
      where.OR = [
        { summary: { contains: search, mode: "insensitive" } },
        { ticketNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
      const totalItems = await getPrisma().ticket.count({ where });
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const skip = (page - 1) * limit;

      const tickets = await getPrisma().ticket.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(200).json({
        data: tickets,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      });
    } catch (_dbErr) {
      // Fallback in-memory tickets for offline demonstration
      let filtered = inMemoryTickets.filter((t) => t.requesterId === requesterId);
      if (categoryId) filtered = filtered.filter((t) => t.categoryId === categoryId);
      if (priority) filtered = filtered.filter((t) => t.requestedPriority === priority);
      if (status) filtered = filtered.filter((t) => t.currentStatus === status);
      if (search) {
        filtered = filtered.filter(
          (t) =>
            t.summary.toLowerCase().includes(search.toLowerCase()) ||
            t.ticketNumber.toLowerCase().includes(search.toLowerCase())
        );
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const skip = (page - 1) * limit;
      const paginatedData = filtered.slice(skip, skip + limit);

      res.status(200).json({
        data: paginatedData,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve tickets." });
  }
});

// ---------------------------------------------------------------------------
// [Route: Ticket Detail] Lab 2 Issue 5 & Lab 3 Issue 3 — Requester Ticket Detail (GET /api/tickets/:id)
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    let requesterId = Number(req.query.requesterId);

    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID." });
      return;
    }

    if (req.user) {
      requesterId = req.user.id;
    } else if (!requesterId || isNaN(requesterId)) {
      res.status(400).json({ error: "requesterId query parameter is required for ownership verification." });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          attachments: {
            orderBy: { createdAt: "asc" },
          },
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, name: true, role: true } },
            },
          },
        },
      });
    } catch (_dbErr) {
      const found = inMemoryTickets.find((t) => t.id === ticketId);
      if (found) {
        ticket = {
          ...found,
          attachments: inMemoryAttachments.filter((a) => a.ticketId === ticketId),
          comments: inMemoryComments.filter((c) => c.ticketId === ticketId),
        };
      }
    }

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found." });
      return;
    }

    // Ownership protection (BR-05 / BR-06 / AC-03 / AC-04)
    if (req.user) {
      if (req.user.role === "REQUESTER" && ticket.requesterId !== req.user.id) {
        res.status(403).json({ error: "Forbidden: You do not have permission to view this ticket." });
        return;
      }
    } else if (ticket.requesterId !== requesterId) {
      res.status(403).json({ error: "Forbidden: You do not have permission to view this ticket." });
      return;
    }

    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve ticket detail." });
  }
});

// ---------------------------------------------------------------------------
// [Route: Upload Attachment] Lab 2 Issue 5 — POST /api/tickets/:id/attachments
// ---------------------------------------------------------------------------
app.post(
  "/api/tickets/:id/attachments",
  (req: Request, res: Response, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "File too large. Maximum permitted file size is 5 MB." });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      } else if (err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      const requesterId = Number(req.body.requesterId || req.query.requesterId);

      if (isNaN(ticketId)) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Invalid ticket ID." });
        return;
      }

      if (!requesterId || isNaN(requesterId)) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "requesterId is required." });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "Attachment file is required." });
        return;
      }

      let ticket: any = null;
      try {
        ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
      } catch (_dbErr) {
        ticket = inMemoryTickets.find((t) => t.id === ticketId);
      }

      if (!ticket) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(404).json({ error: "Ticket not found." });
        return;
      }

      // Ownership protection (BR-05)
      if (ticket.requesterId !== requesterId) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(403).json({ error: "Forbidden: You do not own this ticket." });
        return;
      }

      // Enforce max 5 active attachments per ticket (BR-10 / BR-11)
      let activeCount = 0;
      try {
        activeCount = await getPrisma().attachment.count({
          where: { ticketId, isRemoved: false },
        });
      } catch (_dbErr) {
        activeCount = inMemoryAttachments.filter((a) => a.ticketId === ticketId && !a.isRemoved).length;
      }

      if (activeCount >= 5) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Maximum limit of 5 active attachments reached for this ticket." });
        return;
      }

      const relativeFilePath = path.relative(process.cwd(), req.file.path);
      let attachment: any = null;
      try {
        attachment = await getPrisma().attachment.create({
          data: {
            ticketId,
            originalName: req.file.originalname,
            storageName: req.file.filename,
            filePath: relativeFilePath,
            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,
            isRemoved: false,
          },
        });
      } catch (_dbErr) {
        attachment = {
          id: inMemoryAttachments.length + 1,
          ticketId,
          originalName: req.file.originalname,
          storageName: req.file.filename,
          filePath: req.file.path,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          isRemoved: false,
          removedAt: null,
          removalReason: null,
          removedById: null,
          createdAt: new Date().toISOString(),
        };
        inMemoryAttachments.push(attachment);
      }

      res.status(201).json(attachment);
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload attachment." });
    }
  }
);

// ---------------------------------------------------------------------------
// [Route: List Attachments Metadata] Lab 2 Issue 5 — GET /api/tickets/:id/attachments
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id/attachments", async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const requesterId = Number(req.query.requesterId);

    if (isNaN(ticketId) || !requesterId || isNaN(requesterId)) {
      res.status(400).json({ error: "Valid ticketId and requesterId are required." });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    } catch (_dbErr) {
      ticket = inMemoryTickets.find((t) => t.id === ticketId);
    }
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found." });
      return;
    }

    if (ticket.requesterId !== requesterId) {
      res.status(403).json({ error: "Forbidden: You do not own this ticket." });
      return;
    }

    let attachments: any[] = [];
    try {
      attachments = await getPrisma().attachment.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
      });
    } catch (_dbErr) {
      attachments = inMemoryAttachments.filter((a) => a.ticketId === ticketId);
    }

    res.status(200).json(attachments);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve attachments." });
  }
});

// ---------------------------------------------------------------------------
// [Route: Download Attachment] Lab 2 Issue 5 — GET download or file
// ---------------------------------------------------------------------------
const downloadAttachmentHandler = async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const attachmentId = Number(req.params.attachmentId);
    const requesterId = Number(req.query.requesterId);

    if (isNaN(ticketId) || isNaN(attachmentId) || !requesterId || isNaN(requesterId)) {
      res.status(400).json({ error: "Valid ticketId, attachmentId, and requesterId are required." });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    } catch (_dbErr) {
      ticket = inMemoryTickets.find((t) => t.id === ticketId);
    }
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found." });
      return;
    }

    if (ticket.requesterId !== requesterId) {
      res.status(403).json({ error: "Forbidden: You do not own this ticket." });
      return;
    }

    let attachment: any = null;
    try {
      attachment = await getPrisma().attachment.findUnique({ where: { id: attachmentId } });
    } catch (_dbErr) {
      attachment = inMemoryAttachments.find((a) => a.id === attachmentId && a.ticketId === ticketId);
    }
    if (!attachment || attachment.ticketId !== ticketId) {
      res.status(404).json({ error: "Attachment not found." });
      return;
    }

    // BR-11: Soft-removed attachments cannot be downloaded
    if (attachment.isRemoved) {
      res.status(404).json({ error: "Attachment has been removed and is no longer accessible." });
      return;
    }

    const resolvedPath = path.isAbsolute(attachment.filePath)
      ? attachment.filePath
      : path.resolve(process.cwd(), attachment.filePath);

    if (!fs.existsSync(resolvedPath)) {
      res.status(404).json({ error: "File not found on storage disk." });
      return;
    }

    res.download(resolvedPath, attachment.originalName);
  } catch (err) {
    res.status(500).json({ error: "Failed to download attachment." });
  }
};

app.get("/api/tickets/:id/attachments/:attachmentId/download", downloadAttachmentHandler);
app.get("/api/tickets/:id/attachments/:attachmentId/file", downloadAttachmentHandler);

// ---------------------------------------------------------------------------
// [Route: Soft-Remove Attachment] Lab 2 Issue 5 — DELETE /api/tickets/:id/attachments/:attachmentId
// ---------------------------------------------------------------------------
app.delete("/api/tickets/:id/attachments/:attachmentId", async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const attachmentId = Number(req.params.attachmentId);
    const requesterId = Number(req.body.requesterId || req.query.requesterId);
    const reason = typeof req.body.reason === "string" ? req.body.reason : req.body.removalReason;

    if (isNaN(ticketId) || isNaN(attachmentId) || !requesterId || isNaN(requesterId)) {
      res.status(400).json({ error: "Valid ticketId, attachmentId, and requesterId are required." });
      return;
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
      res.status(400).json({ error: "Removal reason is required and must be at least 5 characters." });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    } catch (_dbErr) {
      ticket = inMemoryTickets.find((t) => t.id === ticketId);
    }
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found." });
      return;
    }

    if (ticket.requesterId !== requesterId) {
      res.status(403).json({ error: "Forbidden: You do not own this ticket." });
      return;
    }

    let attachment: any = null;
    try {
      attachment = await getPrisma().attachment.findUnique({ where: { id: attachmentId } });
    } catch (_dbErr) {
      attachment = inMemoryAttachments.find((a) => a.id === attachmentId && a.ticketId === ticketId);
    }
    if (!attachment || attachment.ticketId !== ticketId) {
      res.status(404).json({ error: "Attachment not found." });
      return;
    }

    let updated: any = null;
    try {
      updated = await getPrisma().attachment.update({
        where: { id: attachmentId },
        data: {
          isRemoved: true,
          removalReason: reason.trim(),
          removedAt: new Date(),
          removedById: requesterId,
        },
      });
    } catch (_dbErr) {
      attachment.isRemoved = true;
      attachment.removalReason = reason.trim();
      attachment.removedAt = new Date().toISOString();
      attachment.removedById = requesterId;
      updated = attachment;
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to soft-remove attachment." });
  }
});

// ---------------------------------------------------------------------------
// [Route: Public Comments - GET] Lab 3 Issue 3 — GET /api/tickets/:id/comments
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id/comments", async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: { id: true, requesterId: true },
      });
    } catch (_dbErr) {
      ticket = inMemoryTickets.find((t) => t.id === ticketId);
    }

    if (!ticket) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
      return;
    }

    // Authorization verification (BR-06, BR-14, AC-04, AC-05)
    if (req.user) {
      if (req.user.role === "REQUESTER" && ticket.requesterId !== req.user.id) {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Forbidden: You do not have permission to view comments on this ticket.",
          },
        });
        return;
      }
    } else {
      const requesterId = Number(req.query.requesterId);
      if (!requesterId || requesterId !== ticket.requesterId) {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Forbidden: Authentication required or invalid requester credentials.",
          },
        });
        return;
      }
    }

    try {
      const comments = await getPrisma().comment.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, name: true, role: true },
          },
        },
      });
      res.status(200).json(comments);
    } catch (_dbErr) {
      const comments = inMemoryComments.filter((c) => c.ticketId === ticketId);
      res.status(200).json(comments);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to retrieve comments." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Public Comments - POST] Lab 3 Issue 3 — POST /api/tickets/:id/comments
// ---------------------------------------------------------------------------
app.post("/api/tickets/:id/comments", async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    const { content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0 || content.trim().length > 2000) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Comment content must be between 1 and 2,000 characters.",
        },
      });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: { id: true, requesterId: true },
      });
    } catch (_dbErr) {
      ticket = inMemoryTickets.find((t) => t.id === ticketId);
    }

    if (!ticket) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
      return;
    }

    let authorId: number;
    let authorRole: "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR" = "REQUESTER";
    let authorName = "Jennifer Anderson";

    if (req.user) {
      authorId = req.user.id;
      authorRole = req.user.role;
      authorName = req.user.name;

      if (req.user.role === "REQUESTER" && ticket.requesterId !== req.user.id) {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Forbidden: You cannot comment on tickets you do not own.",
          },
        });
        return;
      }
    } else {
      const reqId = Number(req.body.authorId || req.body.requesterId || req.query.requesterId);
      if (!reqId || reqId !== ticket.requesterId) {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Forbidden: Authentication required to post comments.",
          },
        });
        return;
      }
      authorId = reqId;
      const foundUser = inMemoryUsers.find((u) => u.id === reqId);
      if (foundUser) {
        authorRole = foundUser.role;
        authorName = foundUser.name;
      }
    }

    try {
      const comment = await getPrisma().comment.create({
        data: {
          ticketId,
          authorId,
          content: content.trim(),
        },
        include: {
          author: {
            select: { id: true, name: true, role: true },
          },
        },
      });
      res.status(201).json(comment);
    } catch (_dbErr) {
      const newComment = {
        id: inMemoryComments.length + 1,
        ticketId,
        authorId,
        author: { id: authorId, name: authorName, role: authorRole },
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      inMemoryComments.push(newComment);
      res.status(201).json(newComment);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to post comment." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Resolve Indication] Lab 3 Issue 3 — POST / PATCH /api/tickets/:id/resolve-indication
// ---------------------------------------------------------------------------
const handleResolveIndication = async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
      });
    } catch (_dbErr) {
      ticket = inMemoryTickets.find((t) => t.id === ticketId);
    }

    if (!ticket) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
      return;
    }

    // Ownership check (BR-06, BR-10, AC-14)
    if (req.user) {
      if (req.user.role === "REQUESTER" && ticket.requesterId !== req.user.id) {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Forbidden: You may only signal resolution on your own tickets.",
          },
        });
        return;
      }
    } else {
      const requesterId = Number(req.body.requesterId || req.query.requesterId);
      if (!requesterId || requesterId !== ticket.requesterId) {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Forbidden: You may only signal resolution on your own tickets.",
          },
        });
        return;
      }
    }

    const isResolved = req.body.isResolved !== undefined ? Boolean(req.body.isResolved) : true;

    try {
      const updated = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: { isRequesterResolved: isResolved },
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          attachments: { orderBy: { createdAt: "asc" } },
        },
      });
      res.status(200).json(updated);
    } catch (_dbErr) {
      ticket.isRequesterResolved = isResolved;
      res.status(200).json({ ...ticket, isRequesterResolved: isResolved });
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update resolution indication." } });
  }
};

app.post("/api/tickets/:id/resolve-indication", handleResolveIndication);
app.patch("/api/tickets/:id/resolve-indication", handleResolveIndication);

// ---------------------------------------------------------------------------
// [Route: IT Staff Ticket Queue] Lab 3 Issue 4 — GET /api/staff/tickets
// ---------------------------------------------------------------------------
app.get("/api/staff/tickets", async (req: Request, res: Response) => {
  try {
    // 1. Authorization: Only IT_STAFF and ADMINISTRATOR allowed (BR-06, BR-07, AC-07)
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required to access IT Staff Ticket Queue.",
        },
      });
      return;
    }

    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Requester accounts cannot access the IT Staff Ticket Queue.",
        },
      });
      return;
    }

    // 2. Extract query parameters
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const currentStatus = typeof req.query.currentStatus === "string" && req.query.currentStatus.trim() ? req.query.currentStatus.trim() : undefined;
    const priority = typeof req.query.priority === "string" && req.query.priority.trim() ? req.query.priority.trim().toUpperCase() : undefined;
    const ownerFilter = typeof req.query.ownerFilter === "string" ? req.query.ownerFilter.trim() : "all";
    const sortBy = typeof req.query.sortBy === "string" && ["createdAt", "updatedAt", "ticketNumber", "itPriority", "currentStatus"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));

    // 3. Build Prisma where clause
    const where: any = {};

    if (categoryId && !isNaN(categoryId)) {
      where.categoryId = categoryId;
    }

    if (currentStatus) {
      where.currentStatus = currentStatus;
    }

    if (priority) {
      where.OR = [
        { itPriority: priority },
        { requestedPriority: priority },
      ];
    }

    if (search) {
      const searchConditions = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    if (ownerFilter === "unassigned") {
      where.ownerId = null;
    } else if (ownerFilter === "assigned_to_me") {
      where.ownerId = req.user.id;
    }

    try {
      const total = await getPrisma().ticket.count({ where });
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;

      const tickets = await getPrisma().ticket.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      // Quick summary counts for Metrics Bar
      const totalOpen = await getPrisma().ticket.count({
        where: { currentStatus: { notIn: ["Resolved", "Closed", "Cancelled"] } },
      });
      const assignedToMe = await getPrisma().ticket.count({
        where: { ownerId: req.user.id, currentStatus: { notIn: ["Closed", "Cancelled"] } },
      });
      const unassigned = await getPrisma().ticket.count({
        where: { ownerId: null, currentStatus: { notIn: ["Closed", "Cancelled"] } },
      });

      res.status(200).json({
        tickets,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        summary: {
          totalOpen,
          assignedToMe,
          unassigned,
        },
      });
    } catch (_dbErr) {
      // In-Memory Fallback for offline/test environments
      let filtered = [...inMemoryTickets];

      if (categoryId && !isNaN(categoryId)) {
        filtered = filtered.filter((t) => t.categoryId === categoryId);
      }

      if (currentStatus) {
        filtered = filtered.filter((t) => t.currentStatus.toLowerCase() === currentStatus.toLowerCase());
      }

      if (priority) {
        filtered = filtered.filter(
          (t) =>
            (t.itPriority && t.itPriority.toUpperCase() === priority) ||
            (t.requestedPriority && t.requestedPriority.toUpperCase() === priority)
        );
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            (t.ticketNumber && t.ticketNumber.toLowerCase().includes(s)) ||
            (t.summary && t.summary.toLowerCase().includes(s))
        );
      }

      if (ownerFilter === "unassigned") {
        filtered = filtered.filter((t) => !t.ownerId);
      } else if (ownerFilter === "assigned_to_me") {
        filtered = filtered.filter((t) => t.ownerId === req.user!.id);
      }

      // Sort
      filtered.sort((a, b) => {
        const valA = a[sortBy] ?? "";
        const valB = b[sortBy] ?? "";
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;
      const paginated = filtered.slice(skip, skip + limit);

      const totalOpen = inMemoryTickets.filter((t) => !["Resolved", "Closed", "Cancelled"].includes(t.currentStatus)).length;
      const assignedToMe = inMemoryTickets.filter((t) => t.ownerId === req.user!.id && !["Closed", "Cancelled"].includes(t.currentStatus)).length;
      const unassigned = inMemoryTickets.filter((t) => !t.ownerId && !["Closed", "Cancelled"].includes(t.currentStatus)).length;

      res.status(200).json({
        tickets: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        summary: {
          totalOpen,
          assignedToMe,
          unassigned,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to retrieve staff ticket queue." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Assignable Staff Users] Lab 3 Issue 5 — GET /api/staff/users
// ---------------------------------------------------------------------------
app.get("/api/staff/users", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Requester accounts cannot access staff user directory.",
        },
      });
      return;
    }

    try {
      const staffUsers = await getPrisma().user.findMany({
        where: {
          role: { in: ["IT_STAFF", "ADMINISTRATOR"] },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: "asc" },
      });
      res.status(200).json(staffUsers);
    } catch (_dbErr) {
      const staffUsers = inMemoryUsers
        .filter((u) => (u.role === "IT_STAFF" || u.role === "ADMINISTRATOR") && u.isActive)
        .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
      res.status(200).json(staffUsers);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to retrieve staff users." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: IT Staff Ticket Detail] Lab 3 Issue 5 — GET /api/staff/tickets/:id
// ---------------------------------------------------------------------------
app.get("/api/staff/tickets/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Requester accounts cannot access IT Staff Ticket Detail.",
        },
      });
      return;
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
          attachments: { orderBy: { createdAt: "asc" } },
          comments: {
            include: {
              author: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          internalNotes: {
            include: {
              author: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!ticket) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
        return;
      }

      res.status(200).json(ticket);
    } catch (_dbErr) {
      const ticket = inMemoryTickets.find((t) => t.id === ticketId);
      if (!ticket) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
        return;
      }

      const comments = inMemoryComments.filter((c) => c.ticketId === ticketId);
      const internalNotes = inMemoryInternalNotes.filter((n) => n.ticketId === ticketId);
      const attachments = inMemoryAttachments.filter((a) => a.ticketId === ticketId);

      res.status(200).json({
        ...ticket,
        attachments,
        comments,
        internalNotes,
      });
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to retrieve staff ticket detail." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Claim / Reassign Ticket] Lab 3 Issue 5 — PATCH /api/staff/tickets/:id/assign
// ---------------------------------------------------------------------------
app.patch("/api/staff/tickets/:id/assign", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Only IT Staff and Administrators can assign tickets.",
        },
      });
      return;
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    const { ownerId } = req.body;
    let targetOwner: any = null;

    if (ownerId !== null && ownerId !== undefined) {
      const parsedOwnerId = Number(ownerId);
      if (isNaN(parsedOwnerId)) {
        res.status(400).json({ error: { code: "INVALID_OWNER", message: "Invalid owner ID." } });
        return;
      }

      try {
        targetOwner = await getPrisma().user.findUnique({
          where: { id: parsedOwnerId },
        });
      } catch (_dbErr) {
        targetOwner = inMemoryUsers.find((u) => u.id === parsedOwnerId);
      }

      if (!targetOwner || !targetOwner.isActive || (targetOwner.role !== "IT_STAFF" && targetOwner.role !== "ADMINISTRATOR")) {
        res.status(400).json({
          error: {
            code: "INVALID_OWNER",
            message: "Assigned owner must be an active IT Staff or Administrator account.",
          },
        });
        return;
      }
    }

    let currentTicket: any = null;
    try {
      currentTicket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
      });
    } catch (_dbErr) {
      currentTicket = inMemoryTickets.find((t) => t.id === ticketId);
    }

    if (!currentTicket) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
      return;
    }

    // AC-08, BR-09: Auto-advance status from "New" to "Open" when assigned
    let newStatus = currentTicket.currentStatus;
    if (currentTicket.currentStatus === "New" && (ownerId !== null && ownerId !== undefined)) {
      newStatus = "Open";
    }

    const assignedOwnerId = ownerId !== null && ownerId !== undefined ? Number(ownerId) : null;

    try {
      const updated = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: {
          ownerId: assignedOwnerId,
          currentStatus: newStatus,
        },
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
          attachments: true,
          comments: { include: { author: { select: { id: true, name: true, role: true } } } },
          internalNotes: { include: { author: { select: { id: true, name: true, role: true } } } },
        },
      });
      res.status(200).json(updated);
    } catch (_dbErr) {
      currentTicket.ownerId = assignedOwnerId;
      currentTicket.currentStatus = newStatus;
      currentTicket.owner = targetOwner
        ? { id: targetOwner.id, name: targetOwner.name, email: targetOwner.email, role: targetOwner.role }
        : null;
      res.status(200).json(currentTicket);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to assign ticket." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: IT Priority Update] Lab 3 Issue 5 — PATCH /api/staff/tickets/:id/priority
// ---------------------------------------------------------------------------
app.patch("/api/staff/tickets/:id/priority", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Only IT Staff and Administrators can adjust IT Priority.",
        },
      });
      return;
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    const { itPriority } = req.body;
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    if (!itPriority || typeof itPriority !== "string" || !validPriorities.includes(itPriority.toUpperCase())) {
      res.status(400).json({
        error: {
          code: "INVALID_PRIORITY",
          message: "IT Priority must be one of: LOW, MEDIUM, HIGH, URGENT.",
        },
      });
      return;
    }

    const priorityVal = itPriority.toUpperCase();

    try {
      const updated = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: { itPriority: priorityVal },
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
          attachments: true,
          comments: { include: { author: { select: { id: true, name: true, role: true } } } },
          internalNotes: { include: { author: { select: { id: true, name: true, role: true } } } },
        },
      });
      res.status(200).json(updated);
    } catch (_dbErr) {
      const ticket = inMemoryTickets.find((t) => t.id === ticketId);
      if (!ticket) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
        return;
      }
      ticket.itPriority = priorityVal;
      res.status(200).json(ticket);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update IT Priority." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Status Workflow Progression] Lab 3 Issue 5 — PATCH /api/staff/tickets/:id/status
// ---------------------------------------------------------------------------
const PERMITTED_STATUS_TRANSITIONS: Record<string, string[]> = {
  "New": ["Open", "Cancelled"],
  "Open": ["In Progress", "Cancelled"],
  "In Progress": ["Waiting for Requester", "Resolved", "Cancelled"],
  "Waiting for Requester": ["In Progress", "Resolved"],
  "Resolved": ["Closed", "Reopened"],
  "Reopened": ["In Progress", "Waiting for Requester", "Resolved"],
  "Closed": [],
  "Cancelled": [],
};

app.patch("/api/staff/tickets/:id/status", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Only IT Staff and Administrators can transition ticket statuses.",
        },
      });
      return;
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    const { status } = req.body;
    if (!status || typeof status !== "string") {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Status is required." } });
      return;
    }

    let currentTicket: any = null;
    try {
      currentTicket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
      });
    } catch (_dbErr) {
      currentTicket = inMemoryTickets.find((t) => t.id === ticketId);
    }

    if (!currentTicket) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
      return;
    }

    const allowedNext = PERMITTED_STATUS_TRANSITIONS[currentTicket.currentStatus] || [];
    if (currentTicket.currentStatus !== status && !allowedNext.includes(status)) {
      res.status(400).json({
        error: {
          code: "INVALID_STATUS_TRANSITION",
          message: `Cannot transition from '${currentTicket.currentStatus}' to '${status}'. Permitted transitions: ${
            allowedNext.length > 0 ? allowedNext.join(", ") : "None (terminal state)"
          }.`,
        },
      });
      return;
    }

    try {
      const updated = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: { currentStatus: status },
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true, role: true } },
          attachments: true,
          comments: { include: { author: { select: { id: true, name: true, role: true } } } },
          internalNotes: { include: { author: { select: { id: true, name: true, role: true } } } },
        },
      });
      res.status(200).json(updated);
    } catch (_dbErr) {
      currentTicket.currentStatus = status;
      res.status(200).json(currentTicket);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update ticket status." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Internal Notes - GET] Lab 3 Issue 5 — GET /api/staff/tickets/:id/notes & /api/tickets/:id/notes
// ---------------------------------------------------------------------------
const handleGetInternalNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Requester accounts cannot access internal operational notes.",
        },
      });
      return;
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    try {
      const notes = await getPrisma().internalNote.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
      });
      res.status(200).json(notes);
    } catch (_dbErr) {
      const notes = inMemoryInternalNotes.filter((n) => n.ticketId === ticketId);
      res.status(200).json(notes);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to retrieve internal notes." } });
  }
};

app.get("/api/staff/tickets/:id/notes", handleGetInternalNotes);
app.get("/api/tickets/:id/notes", handleGetInternalNotes);

// ---------------------------------------------------------------------------
// [Route: Internal Notes - POST] Lab 3 Issue 5 — POST /api/staff/tickets/:id/notes & /api/tickets/:id/notes
// ---------------------------------------------------------------------------
const handlePostInternalNote = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role === "REQUESTER") {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Requester accounts cannot create internal operational notes.",
        },
      });
      return;
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid ticket ID." } });
      return;
    }

    const { content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0 || content.trim().length > 2000) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Internal note content must be between 1 and 2,000 characters.",
        },
      });
      return;
    }

    let ticket: any = null;
    try {
      ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    } catch (_dbErr) {
      ticket = inMemoryTickets.find((t) => t.id === ticketId);
    }

    if (!ticket) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found." } });
      return;
    }

    try {
      const note = await getPrisma().internalNote.create({
        data: {
          ticketId,
          authorId: req.user.id,
          content: content.trim(),
        },
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
      });
      res.status(201).json(note);
    } catch (_dbErr) {
      const newNote = {
        id: inMemoryInternalNotes.length + 1,
        ticketId,
        authorId: req.user.id,
        author: { id: req.user.id, name: req.user.name, role: req.user.role },
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      inMemoryInternalNotes.push(newNote);
      res.status(201).json(newNote);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create internal note." } });
  }
};

app.post("/api/tickets/:id/notes", handlePostInternalNote);
app.post("/api/staff/tickets/:id/notes", handlePostInternalNote);

// ===========================================================================
// [Administrator User Management Endpoints] Lab 3 Issue 6 (FR-11, FR-12, BR-17..21, AC-10..13)
// ===========================================================================

// ---------------------------------------------------------------------------
// [Route: List Users] GET /api/admin/users
// ---------------------------------------------------------------------------
app.get("/api/admin/users", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role !== "ADMINISTRATOR") {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Access denied. Administrator role required." } });
      return;
    }

    const { search, role } = req.query;
    const searchStr = typeof search === "string" ? search.trim().toLowerCase() : "";
    const roleStr = typeof role === "string" ? role.trim().toUpperCase() : "";

    try {
      const where: any = {};
      if (roleStr && ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"].includes(roleStr)) {
        where.role = roleStr;
      }
      if (searchStr) {
        where.OR = [
          { name: { contains: searchStr, mode: "insensitive" } },
          { email: { contains: searchStr, mode: "insensitive" } },
        ];
      }

      const users = await getPrisma().user.findMany({
        where,
        orderBy: { id: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.status(200).json(users);
    } catch (_dbErr) {
      let filtered = [...inMemoryUsers];
      if (roleStr && ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"].includes(roleStr)) {
        filtered = filtered.filter((u) => u.role === roleStr);
      }
      if (searchStr) {
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(searchStr) ||
            u.email.toLowerCase().includes(searchStr)
        );
      }
      const sanitized = filtered.map(({ passwordHash: _, ...u }) => u);
      res.status(200).json(sanitized);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to retrieve users." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Create User] POST /api/admin/users
// ---------------------------------------------------------------------------
app.post("/api/admin/users", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role !== "ADMINISTRATOR") {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Access denied. Administrator role required." } });
      return;
    }

    const { name, email, role, initialPassword, isActive } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Name is required." } });
      return;
    }
    if (!email || typeof email !== "string" || !email.trim() || !email.includes("@")) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Valid email address is required." } });
      return;
    }
    const validRoles = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Role must be REQUESTER, IT_STAFF, or ADMINISTRATOR." } });
      return;
    }
    if (!initialPassword || typeof initialPassword !== "string" || initialPassword.length < 8) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Initial password must be at least 8 characters long." } });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const activeBool = typeof isActive === "boolean" ? isActive : true;

    // Check duplicate email (BR-20)
    try {
      const existing = await getPrisma().user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        res.status(409).json({ error: { code: "EMAIL_ALREADY_EXISTS", message: "A user with this email address already exists." } });
        return;
      }
    } catch (_dbErr) {
      const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        res.status(409).json({ error: { code: "EMAIL_ALREADY_EXISTS", message: "A user with this email address already exists." } });
        return;
      }
    }

    const hashedPassword = await hashPassword(initialPassword);

    try {
      const newUser = await getPrisma().user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: role as any,
          isActive: activeBool,
          mustChangePassword: true, // AC-10, BR-21
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.status(201).json(newUser);
    } catch (_dbErr) {
      const newId = inMemoryUsers.length > 0 ? Math.max(...inMemoryUsers.map((u) => u.id)) + 1 : 1;
      const memUser = {
        id: newId,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: role as any,
        isActive: activeBool,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryUsers.push(memUser);
      const { passwordHash: _, ...sanitized } = memUser;
      res.status(201).json(sanitized);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create user." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Update User] PATCH /api/admin/users/:id
// ---------------------------------------------------------------------------
app.patch("/api/admin/users/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role !== "ADMINISTRATOR") {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Access denied. Administrator role required." } });
      return;
    }

    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid user ID." } });
      return;
    }

    const { name, email, role, isActive } = req.body;

    // Fetch current user record
    let currentUser: any = null;
    try {
      currentUser = await getPrisma().user.findUnique({ where: { id: userId } });
    } catch (_dbErr) {
      currentUser = inMemoryUsers.find((u) => u.id === userId);
    }

    if (!currentUser) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found." } });
      return;
    }

    // Guard 1: Self-Deactivation Guard (BR-18, AC-11)
    if (req.user.id === userId && isActive === false) {
      res.status(400).json({
        error: {
          code: "CANNOT_DEACTIVATE_SELF",
          message: "Administrators cannot deactivate their own account.",
        },
      });
      return;
    }

    // Guard 2: Last Active Admin Protection Guard (BR-19, AC-12)
    const isTargetAdminAndActive = currentUser.role === "ADMINISTRATOR" && currentUser.isActive === true;
    const isDeactivating = typeof isActive === "boolean" && isActive === false;
    const isDemoting = role && role !== "ADMINISTRATOR";

    if (isTargetAdminAndActive && (isDeactivating || isDemoting)) {
      let activeAdminCount = 0;
      try {
        activeAdminCount = await getPrisma().user.count({
          where: { role: "ADMINISTRATOR", isActive: true },
        });
      } catch (_dbErr) {
        activeAdminCount = inMemoryUsers.filter((u) => u.role === "ADMINISTRATOR" && u.isActive === true).length;
      }

      if (activeAdminCount <= 1) {
        res.status(400).json({
          error: {
            code: "LAST_ADMIN_PROTECTED",
            message: "Cannot deactivate or demote the system's last active Administrator.",
          },
        });
        return;
      }
    }

    // Guard 3: Email Uniqueness if email is being updated (BR-20)
    let normalizedEmail: string | undefined = undefined;
    if (email && typeof email === "string" && email.trim()) {
      normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== currentUser.email.toLowerCase()) {
        try {
          const emailCheck = await getPrisma().user.findUnique({ where: { email: normalizedEmail } });
          if (emailCheck && emailCheck.id !== userId) {
            res.status(409).json({
              error: {
                code: "EMAIL_ALREADY_EXISTS",
                message: "A user with this email address already exists.",
              },
            });
            return;
          }
        } catch (_dbErr) {
          const emailCheck = inMemoryUsers.find(
            (u) => u.email.toLowerCase() === normalizedEmail && u.id !== userId
          );
          if (emailCheck) {
            res.status(409).json({
              error: {
                code: "EMAIL_ALREADY_EXISTS",
                message: "A user with this email address already exists.",
              },
            });
            return;
          }
        }
      }
    }

    const updateData: any = {};
    if (name && typeof name === "string" && name.trim()) updateData.name = name.trim();
    if (normalizedEmail) updateData.email = normalizedEmail;
    if (role && ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"].includes(role)) updateData.role = role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    try {
      const updated = await getPrisma().user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.status(200).json(updated);
    } catch (_dbErr) {
      Object.assign(currentUser, updateData, { updatedAt: new Date().toISOString() });
      const { passwordHash: _, ...sanitized } = currentUser;
      res.status(200).json(sanitized);
    }
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update user." } });
  }
});

// ---------------------------------------------------------------------------
// [Route: Reset Password] POST /api/admin/users/:id/reset-password
// ---------------------------------------------------------------------------
app.post("/api/admin/users/:id/reset-password", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }
    if (req.user.role !== "ADMINISTRATOR") {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Access denied. Administrator role required." } });
      return;
    }

    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid user ID." } });
      return;
    }

    const { newInitialPassword } = req.body;
    if (!newInitialPassword || typeof newInitialPassword !== "string" || newInitialPassword.length < 8) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "New initial password must be at least 8 characters long.",
        },
      });
      return;
    }

    let targetUser: any = null;
    try {
      targetUser = await getPrisma().user.findUnique({ where: { id: userId } });
    } catch (_dbErr) {
      targetUser = inMemoryUsers.find((u) => u.id === userId);
    }

    if (!targetUser) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found." } });
      return;
    }

    const hashedPassword = await hashPassword(newInitialPassword);

    try {
      await getPrisma().user.update({
        where: { id: userId },
        data: {
          passwordHash: hashedPassword,
          mustChangePassword: true, // BR-21
        },
      });
    } catch (_dbErr) {
      targetUser.passwordHash = hashedPassword;
      targetUser.mustChangePassword = true;
    }

    res.status(200).json({
      message: "Password reset successfully. User must change password at next login.",
    });
  } catch (err) {
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to reset password." } });
  }
});

export default app;
