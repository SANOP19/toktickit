import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 2 Issue 3: Ticket Creation API (POST /api/tickets)", () => {
  const validTicketPayload = {
    requesterId: 1,
    categoryId: 2,
    relatedSystemId: 7,
    summary: "Laptop battery drains quickly",
    description: "Battery discharges completely within 30 minutes of unplugging from the charger.",
    requestedPriority: "MEDIUM",
  };

  it("creates a ticket successfully and returns 201 with unique ticketNumber and status New (API-01)", async () => {
    vi.spyOn(getPrisma().requesterUser, "findUnique").mockResolvedValue({
      id: 1,
      name: "Jennifer Anderson",
      email: "jennifer.a@example.com",
      isActive: true,
      createdAt: new Date(),
    } as any);

    vi.spyOn(getPrisma().ticket, "count").mockResolvedValue(4);

    (vi.spyOn(getPrisma().ticket, "create") as any).mockImplementation(async (args: any) => {
      return {
        id: 5,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const res = await request(app).post("/api/tickets").send(validTicketPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("ticketNumber");
    expect(res.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(res.body.summary).toBe("Laptop battery drains quickly");
    expect(res.body.currentStatus).toBe("New");
    expect(res.body.requesterId).toBe(1);
  });

  it("rejects ticket creation with missing summary and short description with 400 (API-02)", async () => {
    const invalidPayload = {
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      summary: "Hi", // too short (min 5)
      description: "Short", // too short (min 10)
      requestedPriority: "MEDIUM",
    };

    const res = await request(app).post("/api/tickets").send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
    expect(res.body.details).toHaveProperty("summary");
    expect(res.body.details).toHaveProperty("description");
  });

  it("rejects ticket creation for an inactive requester with 400 (API-03)", async () => {
    vi.spyOn(getPrisma().requesterUser, "findUnique").mockResolvedValue({
      id: 5,
      name: "Inactive Test User",
      email: "inactive.user@example.com",
      isActive: false,
      createdAt: new Date(),
    } as any);

    const res = await request(app)
      .post("/api/tickets")
      .send({ ...validTicketPayload, requesterId: 5 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Selected requester is inactive.");
  });
});
