import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 2 Issue 2: Context Reference APIs", () => {
  describe("GET /api/dev-requesters", () => {
    it("returns active development requesters and excludes inactive users", async () => {
      const mockActiveRequesters = [
        { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
        { id: 2, name: "Michael Brown", email: "michael.b@example.com" },
        { id: 3, name: "Sarah Johnson", email: "sarah.j@example.com" },
        { id: 4, name: "David Lee", email: "david.l@example.com" },
      ];

      vi.spyOn(getPrisma().requesterUser, "findMany").mockImplementation(async (args?: any) => {
        if (args?.where?.isActive === true) {
          return mockActiveRequesters as any;
        }
        return [] as any;
      });

      const res = await request(app).get("/api/dev-requesters");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("name", "Jennifer Anderson");
      expect(res.body[0]).toHaveProperty("email");
      // Inactive user must not be present
      const emails = res.body.map((u: any) => u.email);
      expect(emails).not.toContain("inactive.user@example.com");
    });
  });

  describe("GET /api/related-systems", () => {
    it("returns active related systems list", async () => {
      const mockSystems = [
        { id: 1, name: "Email" },
        { id: 2, name: "Campus Wi-Fi" },
        { id: 3, name: "VPN" },
        { id: 4, name: "LEB2 App" },
        { id: 5, name: "Grade Submission App" },
        { id: 6, name: "Printer" },
        { id: 7, name: "Corporate Laptop" },
      ];

      vi.spyOn(getPrisma().relatedSystem, "findMany").mockResolvedValue(mockSystems as any);

      const res = await request(app).get("/api/related-systems");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(7);
      expect(res.body[0]).toEqual({ id: 1, name: "Email" });
      expect(res.body[6]).toEqual({ id: 7, name: "Corporate Laptop" });
    });
  });
});
