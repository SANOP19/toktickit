import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { generateToken } from "../../src/utils/auth.js";

describe("Lab 3 Issue 4 — IT Staff Ticket Queue API (AC-07, BR-06, BR-07, BR-08, BR-11, BR-12)", () => {
  const staffUser = {
    id: 5,
    name: "Alex Rivera",
    email: "alex.r@example.com",
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const adminUser = {
    id: 10,
    name: "System Admin",
    email: "admin@example.com",
    role: "ADMINISTRATOR" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const requesterUser = {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@example.com",
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const staffToken = generateToken(staffUser);
  const adminToken = generateToken(adminUser);
  const requesterToken = generateToken(requesterUser);

  describe("Authentication & RBAC Protection (BR-06, BR-07)", () => {
    it("returns 401 Unauthorized when no token is provided", async () => {
      const res = await request(app).get("/api/staff/tickets");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("returns 403 Forbidden when authenticated as REQUESTER (BR-06)", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("returns 200 OK when authenticated as IT_STAFF", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tickets).toBeDefined();
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it("returns 200 OK when authenticated as ADMINISTRATOR", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tickets)).toBe(true);
    });
  });

  describe("Query Filters & Search Engine (AC-07)", () => {
    it("supports search query on summary and ticket number", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?search=battery")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(res.body.tickets.some((t: any) => t.summary.includes("battery"))).toBe(true);
    });

    it("filters tickets by categoryId", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?categoryId=2")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tickets.every((t: any) => t.categoryId === 2)).toBe(true);
    });

    it("filters tickets by currentStatus", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?currentStatus=Open")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tickets.every((t: any) => t.currentStatus === "Open")).toBe(true);
    });

    it("filters tickets by priority (matching itPriority or requestedPriority)", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?priority=HIGH")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(
        res.body.tickets.every(
          (t: any) => t.itPriority === "HIGH" || t.requestedPriority === "HIGH"
        )
      ).toBe(true);
    });
  });

  describe("Ownership Filter & Metrics Bar (BR-11, BR-12, UI-Mockup 2)", () => {
    it("filters unassigned tickets when ownerFilter=unassigned", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?ownerFilter=unassigned")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tickets.every((t: any) => t.ownerId === null || !t.ownerId)).toBe(true);
    });

    it("filters tickets assigned to the authenticated staff member when ownerFilter=assigned_to_me", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?ownerFilter=assigned_to_me")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tickets.every((t: any) => t.ownerId === staffUser.id)).toBe(true);
    });

    it("provides quick summary metrics (totalOpen, assignedToMe, unassigned)", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(typeof res.body.summary.totalOpen).toBe("number");
      expect(typeof res.body.summary.assignedToMe).toBe("number");
      expect(typeof res.body.summary.unassigned).toBe("number");
    });
  });

  describe("Pagination & Sorting", () => {
    it("returns paginated results with page and limit", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?page=1&limit=2")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.total).toBeGreaterThan(0);
      expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });

    it("sorts tickets by requested field and sortOrder", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?sortBy=ticketNumber&sortOrder=asc")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      const tickets = res.body.tickets;
      if (tickets.length >= 2) {
        expect(tickets[0].ticketNumber.localeCompare(tickets[1].ticketNumber)).toBeLessThanOrEqual(0);
      }
    });
  });
});
