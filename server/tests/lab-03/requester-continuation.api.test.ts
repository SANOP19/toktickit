import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, inMemoryTickets, inMemoryComments } from "../../src/app.js";
import { generateToken } from "../../src/utils/auth.js";

describe("Lab 3 Issue 3 — Requester Continuation, Public Comments & Resolve Indication", () => {
  const requesterUser1 = {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@example.com",
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const requesterUser2 = {
    id: 2,
    name: "Michael Brown",
    email: "michael.b@example.com",
    role: "REQUESTER" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const itStaffUser = {
    id: 5,
    name: "Alex Rivera",
    email: "alex.r@example.com",
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const tokenRequester1 = generateToken(requesterUser1);
  const tokenRequester2 = generateToken(requesterUser2);
  const tokenStaff = generateToken(itStaffUser);

  beforeEach(() => {
    // Reset inMemoryComments and ticket 1 isRequesterResolved
    inMemoryComments.length = 0;
    const t1 = inMemoryTickets.find((t) => t.id === 1);
    if (t1) {
      t1.isRequesterResolved = false;
    }
  });

  describe("Public Comments API (AC-05, BR-13, BR-14, BR-16)", () => {
    it("POST /api/tickets/:id/comments rejects empty or whitespace comments with 400 (BR-16)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenRequester1}`)
        .send({ content: "   " });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("POST /api/tickets/:id/comments rejects comments exceeding 2,000 characters with 400 (BR-16)", async () => {
      const longComment = "a".repeat(2001);
      const res = await request(app)
        .post("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenRequester1}`)
        .send({ content: longComment });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("POST /api/tickets/:id/comments prevents non-owner Requester from commenting on another's ticket (BR-06)", async () => {
      // Ticket 1 belongs to Requester 1. Requester 2 attempts to comment:
      const res = await request(app)
        .post("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenRequester2}`)
        .send({ content: "Unauthorized comment attempt" });

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it("POST /api/tickets/:id/comments creates comment for owner and returns 201 with author metadata (AC-05)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenRequester1}`)
        .send({ content: "Thank you, I tried rebooting but the battery still discharges quickly." });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.content).toBe("Thank you, I tried rebooting but the battery still discharges quickly.");
      expect(res.body.author).toBeDefined();
      expect(res.body.author.name).toBe("Jennifer Anderson");
      expect(res.body.author.role).toBe("REQUESTER");
    });

    it("GET /api/tickets/:id/comments retrieves threaded comments in chronological order", async () => {
      // Add first comment as Requester 1
      await request(app)
        .post("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenRequester1}`)
        .send({ content: "First comment from requester" });

      // Add second comment as IT Staff
      await request(app)
        .post("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenStaff}`)
        .send({ content: "Second comment from IT staff" });

      const res = await request(app)
        .get("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenRequester1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].content).toBe("First comment from requester");
      expect(res.body[1].content).toBe("Second comment from IT staff");
      expect(res.body[1].author.role).toBe("IT_STAFF");
    });

    it("GET /api/tickets/:id/comments prevents non-owner Requester from viewing comments (BR-06)", async () => {
      const res = await request(app)
        .get("/api/tickets/1/comments")
        .set("Authorization", `Bearer ${tokenRequester2}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("Requester Problem Resolved Indication (AC-14, BR-10)", () => {
    it("POST /api/tickets/:id/resolve-indication prevents non-owner Requester from signaling resolution", async () => {
      const res = await request(app)
        .post("/api/tickets/1/resolve-indication")
        .set("Authorization", `Bearer ${tokenRequester2}`)
        .send({ isResolved: true });

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it("POST /api/tickets/:id/resolve-indication sets isRequesterResolved to true while preserving status (AC-14, BR-10)", async () => {
      const initialTicketRes = await request(app)
        .get("/api/tickets/1")
        .set("Authorization", `Bearer ${tokenRequester1}`);

      const originalStatus = initialTicketRes.body.currentStatus;

      const resolveRes = await request(app)
        .post("/api/tickets/1/resolve-indication")
        .set("Authorization", `Bearer ${tokenRequester1}`)
        .send({ isResolved: true });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.isRequesterResolved).toBe(true);
      // Status must not be changed automatically (BR-10)
      expect(resolveRes.body.currentStatus).toBe(originalStatus);

      // Verify persistence on subsequent GET /api/tickets/:id
      const verifyRes = await request(app)
        .get("/api/tickets/1")
        .set("Authorization", `Bearer ${tokenRequester1}`);

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.isRequesterResolved).toBe(true);
    });

    it("PATCH /api/tickets/:id/resolve-indication supports toggling isResolved to false", async () => {
      // First resolve it
      await request(app)
        .post("/api/tickets/1/resolve-indication")
        .set("Authorization", `Bearer ${tokenRequester1}`)
        .send({ isResolved: true });

      // Then undo / report problem persists
      const undoRes = await request(app)
        .patch("/api/tickets/1/resolve-indication")
        .set("Authorization", `Bearer ${tokenRequester1}`)
        .send({ isResolved: false });

      expect(undoRes.status).toBe(200);
      expect(undoRes.body.isRequesterResolved).toBe(false);
    });
  });
});
