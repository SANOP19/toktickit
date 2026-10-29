import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, inMemoryActionsTaken, inMemoryTickets, inMemoryUsers } from "../../src/app.js";
import { generateToken } from "../../src/utils/auth.js";

describe("Lab 4 Issue 2 — Actions Taken API (FR-01..06, BR-01..09, AC-01..07)", () => {
  const activeStaff = {
    id: 6,
    name: "Alex Thompson",
    email: "tech.alex@example.com",
    role: "IT_STAFF" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const inactiveStaff = {
    id: 9,
    name: "Robert Wilson",
    email: "tech.retired@example.com",
    role: "IT_STAFF" as const,
    isActive: false,
    mustChangePassword: false,
  };

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

  const adminUser = {
    id: 10,
    name: "John Smith",
    email: "admin.john@example.com",
    role: "ADMINISTRATOR" as const,
    isActive: true,
    mustChangePassword: false,
  };

  const staffToken = generateToken(activeStaff);
  const inactiveStaffToken = generateToken(inactiveStaff);
  const requester1Token = generateToken(requesterUser1);
  const requester2Token = generateToken(requesterUser2);
  const adminToken = generateToken(adminUser);

  beforeEach(() => {
    // Reset test ticket 1 in inMemoryTickets
    const t1 = inMemoryTickets.find((t) => t.id === 1);
    if (t1) {
      t1.requesterId = 1;
    }
  });

  // -------------------------------------------------------------------------
  // 1. Creation & Attribution (AC-01, BR-01, BR-03)
  // -------------------------------------------------------------------------
  describe("POST /api/tickets/:id/actions-taken", () => {
    it("API-01: creates an Action Taken under the ticket with authenticated creator attribution", async () => {
      const res = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Replaced faulty Cat6 patch cable and verified line rate with tester.",
          result: "Link rate restored to 1000Mbps full duplex with 0 CRC errors.",
          status: "COMPLETED",
          followUpRequired: false,
          attachmentNotes: "tester_output_oct29.txt",
        });

      expect(res.status).toBe(201);
      const action = res.body.data || res.body;
      expect(action).toHaveProperty("id");
      expect(action.ticketId).toBe(1);
      expect(action.description).toContain("Replaced faulty Cat6");
      expect(action.result).toContain("Link rate restored");
      expect(action.performedById).toBe(activeStaff.id);
      expect(action.version).toBe(1);
    });

    it("API-02: rejects creation when followUpRequired is true but followUpNote is missing or empty (AC-02, BR-05)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Adjusted gateway IP configuration on router interface.",
          result: "Ping packets responding within acceptable latency limits.",
          status: "IN_PROGRESS",
          followUpRequired: true,
          followUpNote: "", // Missing mandatory follow-up note
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("FOLLOW_UP_NOTE_REQUIRED");
    });

    it("API-03: accepts creation when followUpRequired is true and followUpNote is populated (AC-02, BR-05)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Applied temporary DHCP reservation lease for host.",
          result: "Host acquired correct DNS server IP addresses.",
          status: "IN_PROGRESS",
          followUpRequired: true,
          followUpNote: "Migrate reservation to static DNS record during next maintenance.",
        });

      expect(res.status).toBe(201);
      const action = res.body.data || res.body;
      expect(action.followUpRequired).toBe(true);
      expect(action.followUpNote).toContain("Migrate reservation");
    });

    it("API-04: rejects creation attempt by Requester role with HTTP 403 Forbidden (AC-03, BR-04)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${requester1Token}`)
        .send({
          description: "Requester trying to inject an action taken log.",
          result: "Should never succeed.",
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("API-07: rejects action creation by an inactive staff member with HTTP 400 (AC-05, BR-07)", async () => {
      const res = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${inactiveStaffToken}`)
        .send({
          description: "Retired staff attempting to log action.",
          result: "Intervention performed.",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INACTIVE_STAFF_MEMBER");
    });

    it("rejects action creation with invalid short description", async () => {
      const res = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Fix", // Too short (< 5 chars)
          result: "Done successfully.",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // -------------------------------------------------------------------------
  // 2. Reading Actions Taken & Scoped Visibility (AC-04, BR-16)
  // -------------------------------------------------------------------------
  describe("GET /api/tickets/:id/actions-taken", () => {
    it("API-05: allows Requester to view Actions Taken for tickets they own (AC-04, BR-16)", async () => {
      const res = await request(app)
        .get("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${requester1Token}`);

      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty("actionsTaken");
      expect(Array.isArray(data.actionsTaken)).toBe(true);
    });

    it("API-06: rejects Requester viewing Actions Taken for tickets owned by someone else (AC-04, BR-16)", async () => {
      const res = await request(app)
        .get("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${requester2Token}`); // Michael requesting Jennifer's ticket

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("allows IT Staff to view Actions Taken across all tickets", async () => {
      const res = await request(app)
        .get("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(Array.isArray(data.actionsTaken)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Updating Actions Taken & Concurrency (AC-06, AC-07, BR-03, BR-08)
  // -------------------------------------------------------------------------
  describe("PATCH /api/tickets/:id/actions-taken/:actionId", () => {
    it("API-08: allows IT Staff to update action details and transition status (AC-06, BR-03)", async () => {
      // Create an action first
      const createRes = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Initial diagnostic scan initiated.",
          result: "Scanning in progress.",
          status: "IN_PROGRESS",
        });

      const created = createRes.body.data || createRes.body;
      const actionId = created.id;

      const updateRes = await request(app)
        .patch(`/api/tickets/1/actions-taken/${actionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          result: "Diagnostic completed with 0 errors reported.",
          status: "COMPLETED",
          version: created.version,
        });

      expect(updateRes.status).toBe(200);
      const updated = updateRes.body.data || updateRes.body;
      expect(updated.status).toBe("COMPLETED");
      expect(updated.result).toContain("Diagnostic completed");
      expect(updated.version).toBe(created.version + 1);
    });

    it("API-09: detects stale update collision and returns HTTP 409 Conflict (AC-07, BR-08)", async () => {
      // Create action
      const createRes = await request(app)
        .post("/api/tickets/1/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Original action entry for conflict testing.",
          result: "Initial state.",
          status: "IN_PROGRESS",
        });

      const created = createRes.body.data || createRes.body;
      const actionId = created.id;

      // Update 1 advances version from 1 to 2
      await request(app)
        .patch(`/api/tickets/1/actions-taken/${actionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          result: "Updated state by Staff A.",
          version: created.version,
        });

      // Update 2 attempts update with old version 1 -> Stale collision!
      const conflictRes = await request(app)
        .patch(`/api/tickets/1/actions-taken/${actionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          result: "Conflicting update by Staff B with outdated version.",
          version: created.version, // Still version 1!
        });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error.code).toBe("STALE_UPDATE_DETECTED");
    });

    it("allows Administrator to update Actions Taken", async () => {
      const updateRes = await request(app)
        .patch("/api/tickets/1/actions-taken/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          result: "Administrator verified and validated hardware repair.",
        });

      expect(updateRes.status).toBe(200);
    });
  });
});
