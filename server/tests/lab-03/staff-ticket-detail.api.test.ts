import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, inMemoryTickets, inMemoryInternalNotes } from "../../src/app.js";
import { generateToken } from "../../src/utils/auth.js";

describe("Lab 3 Issue 5 — IT Staff Ticket Detail & Operations API (AC-06, AC-08, AC-09, BR-08, BR-09, BR-11, BR-12, BR-15, BR-16)", () => {
  const staffUser = {
    id: 6,
    name: "Alex Thompson",
    email: "tech.alex@example.com",
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const otherStaffUser = {
    id: 7,
    name: "Lisa Martinez",
    email: "tech.lisa@example.com",
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const adminUser = {
    id: 10,
    name: "John Smith",
    email: "admin.john@example.com",
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

  beforeEach(() => {
    inMemoryInternalNotes.length = 0;
    // Reset sample ticket 3 (Printer ticket with status New and ownerId null)
    const t3 = inMemoryTickets.find((t) => t.id === 3);
    if (t3) {
      t3.currentStatus = "New";
      t3.ownerId = null;
      t3.owner = null;
      t3.itPriority = "LOW";
    }
    // Reset sample ticket 1
    const t1 = inMemoryTickets.find((t) => t.id === 1);
    if (t1) {
      t1.currentStatus = "In Progress";
      t1.ownerId = 5;
      t1.itPriority = "MEDIUM";
    }
  });

  describe("RBAC Access Isolation (BR-06, BR-07, AC-06, BR-15)", () => {
    it("returns 401 Unauthorized when unauthenticated on staff ticket endpoints", async () => {
      const res = await request(app).get("/api/staff/tickets/1");
      expect(res.status).toBe(401);
      expect(res.body.error?.code).toBe("UNAUTHORIZED");
    });

    it("returns 403 Forbidden when REQUESTER attempts to access staff ticket detail", async () => {
      const res = await request(app)
        .get("/api/staff/tickets/1")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error?.code).toBe("FORBIDDEN");
    });

    it("returns 403 Forbidden when REQUESTER attempts to access staff user directory", async () => {
      const res = await request(app)
        .get("/api/staff/users")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error?.code).toBe("FORBIDDEN");
    });

    it("returns 403 Forbidden when REQUESTER attempts to fetch internal notes (AC-06, BR-15)", async () => {
      const res = await request(app)
        .get("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error?.code).toBe("FORBIDDEN");
    });

    it("returns 403 Forbidden when REQUESTER attempts to post an internal note (AC-06, BR-15)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ content: "Malicious attempt to write internal note" });

      expect(res.status).toBe(403);
      expect(res.body.error?.code).toBe("FORBIDDEN");
    });
  });

  describe("Staff Users Directory (GET /api/staff/users)", () => {
    it("returns active IT Staff and Administrator users for IT_STAFF", async () => {
      const res = await request(app)
        .get("/api/staff/users")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      // Verify no requesters in the list
      const hasRequester = res.body.some((u: any) => u.role === "REQUESTER");
      expect(hasRequester).toBe(false);

      // Verify all users have active staff or admin role
      for (const u of res.body) {
        expect(["IT_STAFF", "ADMINISTRATOR"]).toContain(u.role);
      }
    });
  });

  describe("Staff Ticket Detail (GET /api/staff/tickets/:id)", () => {
    it("returns complete operational ticket record for IT Staff", async () => {
      const res = await request(app)
        .get("/api/staff/tickets/1")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.ticketNumber).toBeDefined();
      expect(res.body.requester).toBeDefined();
      expect(res.body.category).toBeDefined();
      expect(res.body.comments).toBeDefined();
      expect(res.body.internalNotes).toBeDefined();
      expect(res.body.attachments).toBeDefined();
    });

    it("returns 404 for nonexistent ticket ID", async () => {
      const res = await request(app)
        .get("/api/staff/tickets/999999")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error?.code).toBe("NOT_FOUND");
    });
  });

  describe("Ticket Ownership Assignment (PATCH /api/staff/tickets/:id/assign) (AC-08, BR-09, BR-12)", () => {
    it("claims unassigned ticket and auto-advances status from New to Open (AC-08, BR-09)", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/3/assign")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: staffUser.id });

      expect(res.status).toBe(200);
      expect(res.body.ownerId).toBe(staffUser.id);
      expect(res.body.currentStatus).toBe("Open");
    });

    it("reassigns ticket to another active IT Staff member", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/1/assign")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ownerId: otherStaffUser.id });

      expect(res.status).toBe(200);
      expect(res.body.ownerId).toBe(otherStaffUser.id);
    });

    it("allows unassigning ticket with ownerId: null", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/1/assign")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: null });

      expect(res.status).toBe(200);
      expect(res.body.ownerId).toBeNull();
    });

    it("rejects assigning to a REQUESTER account with 400 (BR-12)", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/1/assign")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ ownerId: requesterUser.id });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("INVALID_OWNER");
    });
  });

  describe("IT Priority Adjustment (PATCH /api/staff/tickets/:id/priority) (BR-11)", () => {
    it("updates IT Priority to HIGH independently of requestedPriority", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/1/priority")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ itPriority: "HIGH" });

      expect(res.status).toBe(200);
      expect(res.body.itPriority).toBe("HIGH");
      // Requested priority remains immutable
      expect(res.body.requestedPriority).toBe("MEDIUM");
    });

    it("rejects invalid priority value with 400", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/1/priority")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ itPriority: "SUPER_URGENT" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("INVALID_PRIORITY");
    });
  });

  describe("Status Workflow Progression (PATCH /api/staff/tickets/:id/status) (BR-08, BR-09, AC-09)", () => {
    it("allows valid status transition: In Progress -> Resolved", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/1/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Resolved" });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("Resolved");
    });

    it("allows valid status transition: Resolved -> Closed (formal closure by staff)", async () => {
      // First move to Resolved
      await request(app)
        .patch("/api/staff/tickets/1/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Resolved" });

      // Then move to Closed
      const res = await request(app)
        .patch("/api/staff/tickets/1/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Closed" });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("Closed");
    });

    it("rejects invalid status transition: New -> Resolved with 400 (AC-09, BR-09)", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Resolved" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("rejects transitioning out of terminal status Closed with 400", async () => {
      // Set to Resolved then Closed
      await request(app)
        .patch("/api/staff/tickets/1/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Resolved" });
      await request(app)
        .patch("/api/staff/tickets/1/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Closed" });

      // Attempt to move from Closed to Open
      const res = await request(app)
        .patch("/api/staff/tickets/1/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Open" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("INVALID_STATUS_TRANSITION");
    });
  });

  describe("Confidential Internal Notes (AC-06, BR-13, BR-15, BR-16)", () => {
    it("allows IT Staff to post a confidential internal note", async () => {
      const res = await request(app)
        .post("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Replaced faulty RAM module. Monitoring for 24 hours." });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe("Replaced faulty RAM module. Monitoring for 24 hours.");
      expect(res.body.authorId).toBe(staffUser.id);
      expect(res.body.author?.name).toBe(staffUser.name);
      expect(res.body.author?.role).toBe("IT_STAFF");
    });

    it("allows IT Staff to retrieve chronological list of internal notes", async () => {
      // Post note 1
      await request(app)
        .post("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "Initial internal triage complete." });

      // Post note 2
      await request(app)
        .post("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ content: "Approved component replacement under warranty." });

      const res = await request(app)
        .get("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].content).toBe("Initial internal triage complete.");
      expect(res.body[1].content).toBe("Approved component replacement under warranty.");
    });

    it("rejects empty or whitespace-only internal note with 400 (BR-16)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: "   " });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("VALIDATION_ERROR");
    });

    it("rejects internal note exceeding 2,000 characters with 400 (BR-16)", async () => {
      const longNote = "x".repeat(2001);
      const res = await request(app)
        .post("/api/tickets/1/notes")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ content: longNote });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("VALIDATION_ERROR");
    });
  });
});
