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

const requesterUser = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: false,
};

const staffToken = generateToken(staffUser);
const requesterToken = generateToken(requesterUser);

describe("Lab 4 Issue 4 — Ticket Workflow Hardening & Resolution Gate (FR-07, FR-08, BR-10..13, AC-08, AC-09)", () => {
  beforeEach(() => {
    // Reset sample ticket 3 in memory (0 actions taken, status = In Progress)
    const t3 = inMemoryTickets.find((t) => t.id === 3);
    if (t3) {
      t3.currentStatus = "In Progress";
      t3.ownerId = 6;
      t3.isRequesterResolved = false;
      t3.resolutionSummary = null;
    }

    // Ensure Ticket 3 has 0 actions taken initially
    for (let i = inMemoryActionsTaken.length - 1; i >= 0; i--) {
      if (inMemoryActionsTaken[i].ticketId === 3) {
        inMemoryActionsTaken.splice(i, 1);
      }
    }
  });

  describe("Server-Side Resolution Gate Enforcement (FR-07, BR-11, AC-08)", () => {
    it("rejects advancing ticket to Resolved when ticket has 0 Actions Taken (HTTP 400 RESOLUTION_GATE_FAILED)", async () => {
      const res = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Resolved" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("RESOLUTION_GATE_FAILED");
      expect(res.body.error?.message).toContain("Cannot advance ticket to Resolved or Closed without at least one recorded Action Taken");

      // Verify status did not change
      const t3 = inMemoryTickets.find((t) => t.id === 3);
      expect(t3?.currentStatus).toBe("In Progress");
    });

    it("rejects advancing ticket to Closed when ticket has 0 Actions Taken (HTTP 400 RESOLUTION_GATE_FAILED)", async () => {
      const t3 = inMemoryTickets.find((t) => t.id === 3);
      if (t3) t3.currentStatus = "Resolved";

      const res = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Closed" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("RESOLUTION_GATE_FAILED");
    });

    it("allows advancing to Resolved when >= 1 Action Taken exists on the ticket", async () => {
      // 1. Record an Action Taken on ticket 3
      const actionRes = await request(app)
        .post("/api/tickets/3/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Diagnosed fiber cable and replaced SFP+ transceiver.",
          result: "Interface link state transitioned to UP with 0 CRC drops.",
          status: "COMPLETED",
          followUpRequired: false,
        });

      expect(actionRes.status).toBe(201);

      // 2. Advance to Resolved with resolutionSummary
      const res = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "Resolved",
          resolutionSummary: "Hardware transceiver replaced and signal stability verified.",
        });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("Resolved");
      expect(res.body.resolutionSummary).toBe("Hardware transceiver replaced and signal stability verified.");
    });

    it("allows advancing from Resolved to Closed when Action Taken exists", async () => {
      // 1. Add action
      await request(app)
        .post("/api/tickets/3/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Verified workstation patch and verified network connectivity.",
          result: "User workstation online.",
          status: "COMPLETED",
          followUpRequired: false,
        });

      // 2. In Progress -> Resolved
      await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Resolved" });

      // 3. Resolved -> Closed
      const res = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Closed" });

      expect(res.status).toBe(200);
      expect(res.body.currentStatus).toBe("Closed");
    });
  });

  describe("8-State Transition Rules & Terminal States (BR-10)", () => {
    it("rejects transitioning out of terminal status Closed with HTTP 400", async () => {
      const t3 = inMemoryTickets.find((t) => t.id === 3);
      if (t3) t3.currentStatus = "Closed";

      const res = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Open" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("INVALID_STATUS_TRANSITION");
      expect(res.body.error?.message).toContain("terminal state");
    });

    it("rejects transitioning out of terminal status Cancelled with HTTP 400", async () => {
      const t3 = inMemoryTickets.find((t) => t.id === 3);
      if (t3) t3.currentStatus = "Cancelled";

      const res = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "In Progress" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("INVALID_STATUS_TRANSITION");
    });
  });

  describe("Advisory Requester Resolution Authority (FR-08, BR-12, AC-14)", () => {
    it("preserves currentStatus and does not satisfy Resolution Gate when requester toggles resolved indicator", async () => {
      // 1. Requester toggles isRequesterResolved to true on ticket 3
      const requesterRes = await request(app)
        .post("/api/tickets/3/resolve-indication")
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ isResolved: true });

      expect(requesterRes.status).toBe(200);
      expect(requesterRes.body.isRequesterResolved).toBe(true);

      // Verify formal currentStatus remains "In Progress"
      expect(requesterRes.body.currentStatus).toBe("In Progress");

      // 2. Staff attempts to resolve ticket 3 which still has 0 Actions Taken
      // Must still be blocked by Resolution Gate
      const staffRes = await request(app)
        .patch("/api/staff/tickets/3/status")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "Resolved" });

      expect(staffRes.status).toBe(400);
      expect(staffRes.body.error?.code).toBe("RESOLUTION_GATE_FAILED");
    });
  });
});
