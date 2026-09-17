import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Authorization & Ownership Protection (BR-03, AC-03)", () => {
  it("AC-03: ignores forged requesterId in POST /api/tickets and sets owner to authenticated requester", async () => {
    // 1. Log in as Jennifer Anderson (id: 1)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "jennifer.a@example.com",
        password: "Password123!",
      });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    // 2. Submit ticket with forged requesterId = 999
    const ticketRes = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        requesterId: 999, // Forged requester ID
        categoryId: 1,
        relatedSystemId: 1,
        summary: "Security Ticket for Ownership Check",
        description: "Testing server-side ownership override against forged client identity.",
        requestedPriority: "MEDIUM",
      });

    expect(ticketRes.status).toBe(201);
    // Verified: Server strictly used authenticated ID (1), not forged 999
    expect(ticketRes.body.requesterId).toBe(1);
    expect(ticketRes.body.requesterId).not.toBe(999);
  });

  it("AC-03: ignores forged requesterId query param in GET /api/tickets and filters by authenticated requester", async () => {
    // Log in as Jennifer Anderson (id: 1)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "jennifer.a@example.com",
        password: "Password123!",
      });

    const token = loginRes.body.token;

    // Attempt to access Michael Brown's tickets (requesterId = 2)
    const res = await request(app)
      .get("/api/tickets?requesterId=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    // All returned tickets must belong to Jennifer Anderson (id: 1)
    for (const ticket of res.body.data) {
      expect(ticket.requesterId).toBe(1);
    }
  });

  it("rejects access to /api/auth/me when token is invalid or tampered", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.jwt.token.signature");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
