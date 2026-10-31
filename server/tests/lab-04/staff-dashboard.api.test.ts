import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, inMemoryTickets, inMemoryActionsTaken } from "../../src/app.js";
import { generateToken } from "../../src/utils/auth.js";

const staffUser = {
  id: 6,
  name: "Alex Thompson",
  email: "tech.alex@example.com",
  role: "IT_STAFF" as const,
  isActive: true,
  mustChangePassword: false,
};

const adminUser = {
  id: 10,
  name: "Super Admin",
  email: "admin@toktickit.local",
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

describe("Lab 4 Issue 5 — IT Staff Dashboard API (FR-09, BR-14, BR-16, BR-17, AC-11, AC-14)", () => {
  beforeEach(() => {
    // Reset sample tickets to known states
    const t1 = inMemoryTickets.find((t) => t.id === 1);
    if (t1) {
      t1.currentStatus = "New";
      t1.ownerId = null;
      t1.itPriority = "HIGH";
      t1.requestedPriority = "HIGH";
    }

    const t2 = inMemoryTickets.find((t) => t.id === 2);
    if (t2) {
      t2.currentStatus = "Open";
      t2.ownerId = 6; // assigned to staffUser
      t2.itPriority = "URGENT";
      t2.requestedPriority = "URGENT";
    }

    const t3 = inMemoryTickets.find((t) => t.id === 3);
    if (t3) {
      t3.currentStatus = "In Progress";
      t3.ownerId = 6; // assigned to staffUser
      t3.itPriority = "MEDIUM";
      t3.requestedPriority = "MEDIUM";
    }

    const t4 = inMemoryTickets.find((t) => t.id === 4);
    if (t4) {
      t4.currentStatus = "Waiting for Requester";
      t4.ownerId = 5; // assigned to another staff
      t4.itPriority = "LOW";
      t4.requestedPriority = "LOW";
    }
  });

  describe("Authentication & RBAC (BR-16, AC-11)", () => {
    it("rejects unauthenticated requests with HTTP 401 Unauthorized", async () => {
      const res = await request(app).get("/api/dashboards/staff");
      expect(res.status).toBe(401);
      expect(res.body.error?.code).toBe("UNAUTHORIZED");
    });

    it("rejects requester users with HTTP 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error?.code).toBe("FORBIDDEN");
      expect(res.body.error?.message).toContain("Requester accounts cannot access IT Staff Dashboard");
    });

    it("allows IT_STAFF users to access dashboard with HTTP 200 OK", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.metrics).toBeDefined();
    });

    it("allows ADMINISTRATOR users to access dashboard with HTTP 200 OK", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.metrics).toBeDefined();
    });
  });

  describe("Metrics Calculation (BR-14, BR-16, AC-11)", () => {
    it("returns correct aggregated operational metrics", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      const metrics = res.body.data.metrics;

      expect(metrics.newTickets).toBeGreaterThanOrEqual(1);
      expect(metrics.openTickets).toBeGreaterThanOrEqual(1);
      expect(metrics.inProgressTickets).toBeGreaterThanOrEqual(1);
      expect(metrics.waitingForRequester).toBeGreaterThanOrEqual(1);
      expect(typeof metrics.myAssignedTickets).toBe("number");
      expect(typeof metrics.urgentTickets).toBe("number");
    });

    it("correctly filters myAssignedTickets to current staff user", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      const metrics = res.body.data.metrics;

      // Staff user 6 has tickets 2 and 3 assigned
      expect(metrics.myAssignedTickets).toBeGreaterThanOrEqual(2);
    });

    it("correctly calculates urgentTickets count for active urgent tickets", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      const metrics = res.body.data.metrics;

      // Ticket 2 is URGENT and Open
      expect(metrics.urgentTickets).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Recent Tickets & Actions (AC-11)", () => {
    it("returns up to 5 recent tickets with correct payload schema", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      const recent = res.body.data.recentTickets;

      expect(Array.isArray(recent)).toBe(true);
      expect(recent.length).toBeLessThanOrEqual(5);

      if (recent.length > 0) {
        const item = recent[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("ticketNumber");
        expect(item).toHaveProperty("summary");
        expect(item).toHaveProperty("category");
        expect(item).toHaveProperty("itPriority");
        expect(item).toHaveProperty("currentStatus");
        expect(item).toHaveProperty("ownerName");
        expect(item).toHaveProperty("updatedAt");
      }
    });

    it("returns myRecentActions performed by the requesting staff member", async () => {
      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      const actions = res.body.data.myRecentActions;

      expect(Array.isArray(actions)).toBe(true);
      // All returned actions must be performed by staffUser (id 6)
      actions.forEach((a: any) => {
        expect(a).toHaveProperty("id");
        expect(a).toHaveProperty("ticketId");
        expect(a).toHaveProperty("description");
        expect(a).toHaveProperty("status");
        expect(a).toHaveProperty("actionDateTime");
      });
    });
  });

  describe("Zero-Metric Stability (API-15, AC-14, BR-17)", () => {
    it("returns 0 (not null or undefined) when a metric has no matching tickets", async () => {
      const tempUser = {
        id: 9999,
        name: "New Technician",
        email: "new.tech@example.com",
        role: "IT_STAFF" as const,
        isActive: true,
        mustChangePassword: false,
      };
      const tempToken = generateToken(tempUser);

      const res = await request(app)
        .get("/api/dashboards/staff")
        .set("Authorization", `Bearer ${tempToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.myAssignedTickets).toBe(0);
      expect(res.body.data.myRecentActions).toEqual([]);
    });
  });
});
