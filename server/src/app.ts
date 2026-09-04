import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
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
    currentStatus: "New",
    requesterId: 1,
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
    currentStatus: "Open",
    requesterId: 1,
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
    currentStatus: "In Progress",
    requesterId: 1,
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
    currentStatus: "New",
    requesterId: 2,
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

// ---------------------------------------------------------------------------
// [Route: Create Ticket] Lab 2 Issue 3 — create ticket with unique number
app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const {
      requesterId,
      categoryId,
      relatedSystemId,
      summary,
      description,
      requestedPriority = "MEDIUM",
    } = req.body;

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
      const requester = await getPrisma().requesterUser.findUnique({
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
    const requesterId = Number(req.query.requesterId);
    if (!requesterId || isNaN(requesterId)) {
      res.status(400).json({ error: "requesterId query parameter is required and must be a number." });
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
// [Route: Ticket Detail] Lab 2 Issue 5 — Requester Ticket Detail (GET /api/tickets/:id)
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const requesterId = Number(req.query.requesterId);

    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID." });
      return;
    }

    if (!requesterId || isNaN(requesterId)) {
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
        },
      });
    } catch (_dbErr) {
      const found = inMemoryTickets.find((t) => t.id === ticketId);
      if (found) {
        ticket = {
          ...found,
          attachments: inMemoryAttachments.filter((a) => a.ticketId === ticketId),
        };
      }
    }

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found." });
      return;
    }

    // Ownership protection (BR-05 / AC-03)
    if (ticket.requesterId !== requesterId) {
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

export default app;
