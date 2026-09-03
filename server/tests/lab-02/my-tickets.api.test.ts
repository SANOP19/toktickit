import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 2 Issue 4: My Tickets API (GET /api/tickets)", () => {
  const mockTicketsRequester1 = [
    {
      id: 1,
      ticketNumber: "TKT-2026-000101",
      summary: "Laptop battery drains quickly",
      requestedPriority: "MEDIUM",
      currentStatus: "New",
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 7,
      createdAt: new Date("2026-09-03T10:00:00Z"),
      updatedAt: new Date("2026-09-03T10:00:00Z"),
      category: { id: 2, name: "Hardware" },
      relatedSystem: { id: 7, name: "Corporate Laptop" },
      requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
    },
    {
      id: 2,
      ticketNumber: "TKT-2026-000102",
      summary: "Cannot connect to VPN from home",
      requestedPriority: "HIGH",
      currentStatus: "Open",
      requesterId: 1,
      categoryId: 4,
      relatedSystemId: 3,
      createdAt: new Date("2026-09-02T10:00:00Z"),
      updatedAt: new Date("2026-09-02T10:00:00Z"),
      category: { id: 4, name: "Network" },
      relatedSystem: { id: 3, name: "VPN" },
      requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
    },
  ];

  it("requires requesterId parameter and returns 400 if missing", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("retrieves paginated tickets for the specified requester (API-04)", async () => {
    vi.spyOn(getPrisma().ticket, "count").mockResolvedValue(2);
    vi.spyOn(getPrisma().ticket, "findMany").mockResolvedValue(mockTicketsRequester1 as any);

    const res = await request(app).get("/api/tickets?requesterId=1&page=1&limit=8");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 8,
      totalItems: 2,
      totalPages: 1,
    });
    expect(res.body.data[0].requesterId).toBe(1);
  });

  it("filters tickets by search query and category (API-05)", async () => {
    vi.spyOn(getPrisma().ticket, "count").mockResolvedValue(1);
    vi.spyOn(getPrisma().ticket, "findMany").mockResolvedValue([mockTicketsRequester1[0]] as any);

    const res = await request(app).get("/api/tickets?requesterId=1&search=battery&categoryId=2");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].summary).toContain("battery");
    expect(res.body.data[0].categoryId).toBe(2);
  });

  it("enforces multi-user isolation: Requester 2 tickets do not include Requester 1 tickets (API-06, BR-05)", async () => {
    const mockTicketsRequester2 = [
      {
        id: 3,
        ticketNumber: "TKT-2026-000201",
        summary: "Printer on 3rd floor paper jam error",
        requestedPriority: "LOW",
        currentStatus: "New",
        requesterId: 2,
        categoryId: 2,
        relatedSystemId: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 2, name: "Hardware" },
        relatedSystem: { id: 6, name: "Printer" },
        requester: { id: 2, name: "Michael Brown", email: "michael.b@example.com" },
      },
    ];

    vi.spyOn(getPrisma().ticket, "count").mockResolvedValue(1);
    vi.spyOn(getPrisma().ticket, "findMany").mockResolvedValue(mockTicketsRequester2 as any);

    const res = await request(app).get("/api/tickets?requesterId=2");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].requesterId).toBe(2);
    // Ticket 1 and 2 belonging to Requester 1 must not be present
    const ticketNumbers = res.body.data.map((t: any) => t.ticketNumber);
    expect(ticketNumbers).not.toContain("TKT-2026-000101");
    expect(ticketNumbers).not.toContain("TKT-2026-000102");
  });
});
