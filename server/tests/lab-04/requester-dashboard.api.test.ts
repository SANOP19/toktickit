import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, inMemoryTickets } from "../../src/app.js";
import { generateToken } from "../../src/utils/auth.js";

const requester1 = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: false,
};

const requester2 = {
  id: 2,
  name: "Michael Brown",
  email: "michael.b@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: false,
};

const freshRequester = {
  id: 8888,
  name: "Fresh User",
  email: "fresh.user@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: false,
};

const token1 = generateToken(requester1);
const token2 = generateToken(requester2);
const freshToken = generateToken(freshRequester);

describe("Lab 4 Issue 5 — Requester Personal Dashboard API (FR-10, BR-14, BR-15, BR-17, AC-12, AC-14)", () => {
  beforeEach(() => {
    // Tickets 1, 2, 3 belong to requester 1
    const t1 = inMemoryTickets.find((t) => t.id === 1);
    if (t1) {
      t1.requesterId = 1;
      t1.currentStatus = "Open";
      t1.isRequesterResolved = false;
    }

    const t2 = inMemoryTickets.find((t) => t.id === 2);
    if (t2) {
      t2.requesterId = 1;
      t2.currentStatus = "In Progress";
      t2.isRequesterResolved = false;
    }

    const t3 = inMemoryTickets.find((t) => t.id === 3);
    if (t3) {
      t3.requesterId = 1;
      t3.currentStatus = "Resolved";
      t3.isRequesterResolved = true;
    }

    // Ticket 4 belongs to requester 2
    const t4 = inMemoryTickets.find((t) => t.id === 4);
    if (t4) {
      t4.requesterId = 2;
      t4.currentStatus = "Closed";
      t4.isRequesterResolved = false;
    }
  });

  describe("Authentication & Access", () => {
    it("rejects unauthenticated requests with HTTP 401 Unauthorized", async () => {
      const res = await request(app).get("/api/dashboards/requester");
      expect(res.status).toBe(401);
      expect(res.body.error?.code).toBe("UNAUTHORIZED");
    });

    it("allows authenticated requester with HTTP 200 OK", async () => {
      const res = await request(app)
        .get("/api/dashboards/requester")
        .set("Authorization", `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.metrics).toBeDefined();
    });
  });

  describe("Strict Requester Scope Isolation (BR-15, AC-12)", () => {
    it("returns metrics strictly isolated to requester 1", async () => {
      const res = await request(app)
        .get("/api/dashboards/requester")
        .set("Authorization", `Bearer ${token1}`);

      expect(res.status).toBe(200);
      const metrics = res.body.data.metrics;

      // Requester 1 has open/in progress tickets
      expect(metrics.myOpenTickets).toBeGreaterThanOrEqual(2);
      expect(metrics.inProgressTickets).toBeGreaterThanOrEqual(1);
      expect(metrics.resolvedTickets).toBeGreaterThanOrEqual(1);

      // Verify all recentTickets belong to requester 1
      const recent = res.body.data.recentTickets;
      expect(Array.isArray(recent)).toBe(true);
      recent.forEach((t: any) => {
        const memTicket = inMemoryTickets.find((m) => m.id === t.id);
        expect(memTicket?.requesterId).toBe(1);
      });
    });

    it("returns metrics strictly isolated to requester 2 without data leakage", async () => {
      const res = await request(app)
        .get("/api/dashboards/requester")
        .set("Authorization", `Bearer ${token2}`);

      expect(res.status).toBe(200);
      const metrics = res.body.data.metrics;

      // Requester 2 only owns ticket 4 (which is Closed)
      expect(metrics.closedTickets).toBeGreaterThanOrEqual(1);

      // None of Requester 1's tickets appear
      const recent = res.body.data.recentTickets;
      recent.forEach((t: any) => {
        const memTicket = inMemoryTickets.find((m) => m.id === t.id);
        expect(memTicket?.requesterId).toBe(2);
      });
    });
  });

  describe("Recent Tickets Schema & Attributes (AC-12)", () => {
    it("returns expected fields on recentTickets", async () => {
      const res = await request(app)
        .get("/api/dashboards/requester")
        .set("Authorization", `Bearer ${token1}`);

      expect(res.status).toBe(200);
      const recent = res.body.data.recentTickets;
      expect(recent.length).toBeGreaterThan(0);

      const first = recent[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("ticketNumber");
      expect(first).toHaveProperty("summary");
      expect(first).toHaveProperty("category");
      expect(first).toHaveProperty("requestedPriority");
      expect(first).toHaveProperty("currentStatus");
      expect(first).toHaveProperty("isRequesterResolved");
      expect(first).toHaveProperty("updatedAt");
    });
  });

  describe("Zero-Metric Stability (API-15, AC-14, BR-17)", () => {
    it("returns clean 0 counters and empty array for user with 0 tickets", async () => {
      const res = await request(app)
        .get("/api/dashboards/requester")
        .set("Authorization", `Bearer ${freshToken}`);

      expect(res.status).toBe(200);
      const { metrics, recentTickets } = res.body.data;

      expect(metrics.myOpenTickets).toBe(0);
      expect(metrics.inProgressTickets).toBe(0);
      expect(metrics.resolvedTickets).toBe(0);
      expect(metrics.closedTickets).toBe(0);
      expect(recentTickets).toEqual([]);
    });
  });
});
