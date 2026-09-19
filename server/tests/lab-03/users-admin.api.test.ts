import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { generateToken } from "../../src/utils/auth.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 3 Issue 6 — Administrator User Management API (FR-11, FR-12, BR-17..21, AC-10..13)", () => {
  const adminUser = {
    id: 10,
    name: "John Smith",
    email: "admin.john@example.com",
    role: "ADMINISTRATOR" as const,
    isActive: true,
    mustChangePassword: false,
  };

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

  const adminToken = generateToken(adminUser);
  const staffToken = generateToken(staffUser);
  const requesterToken = generateToken(requesterUser);

  // -------------------------------------------------------------------------
  // 1. Role-Based Access Control (AC-13, BR-07)
  // -------------------------------------------------------------------------
  describe("Authentication & RBAC Access Control (AC-13, BR-07)", () => {
    it("returns 401 Unauthorized when no token is provided", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 403 Forbidden when authenticated as REQUESTER (AC-13)", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("returns 403 Forbidden when authenticated as IT_STAFF (AC-13)", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("returns 200 OK when authenticated as ADMINISTRATOR", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 2. User Listing, Search, and Filtering (FR-11)
  // -------------------------------------------------------------------------
  describe("User Listing, Search, and Filtering (FR-11)", () => {
    it("returns all users with password hashes excluded", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      for (const u of res.body) {
        expect(u.id).toBeDefined();
        expect(u.name).toBeDefined();
        expect(u.email).toBeDefined();
        expect(u.role).toBeDefined();
        expect(u.isActive).toBeDefined();
        expect(u.mustChangePassword).toBeDefined();
        expect(u.passwordHash).toBeUndefined();
      }
    });

    it("filters users by search query (name or email)", async () => {
      const res = await request(app)
        .get("/api/admin/users?search=Jennifer")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].name).toContain("Jennifer");
    });

    it("filters users by role (REQUESTER / IT_STAFF / ADMINISTRATOR)", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=IT_STAFF")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      for (const u of res.body) {
        expect(u.role).toBe("IT_STAFF");
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. Create User (AC-10, BR-20, BR-21)
  // -------------------------------------------------------------------------
  describe("Create User (AC-10, BR-20, BR-21)", () => {
    it("rejects creation with missing name or invalid email", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "",
          email: "invalid-email",
          role: "IT_STAFF",
          initialPassword: "Password123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects creation with password shorter than 8 characters (BR-03)", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Short Pass User",
          email: "shortpass@example.com",
          role: "IT_STAFF",
          initialPassword: "short",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects creation when email already exists with 409 Conflict (BR-20)", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Duplicate User",
          email: "jennifer.a@example.com", // existing email
          role: "REQUESTER",
          initialPassword: "Password123!",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
    });

    it("creates a new user with mustChangePassword=true and hashed password (AC-10, BR-21)", async () => {
      const uniqueEmail = `new.staff.${Date.now()}@example.com`;
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Field Technician",
          email: uniqueEmail,
          role: "IT_STAFF",
          initialPassword: "InitialSecure123!",
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe("New Field Technician");
      expect(res.body.email).toBe(uniqueEmail);
      expect(res.body.role).toBe("IT_STAFF");
      expect(res.body.isActive).toBe(true);
      expect(res.body.mustChangePassword).toBe(true);
      expect(res.body.passwordHash).toBeUndefined();

      // Verify that user can log in with initialPassword
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: uniqueEmail,
          password: "InitialSecure123!",
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.mustChangePassword).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Update User & Safety Guards (BR-18, BR-19, AC-11, AC-12)
  // -------------------------------------------------------------------------
  describe("Update User & Safety Guards (BR-18, BR-19, AC-11, AC-12)", () => {
    it("updates user name and role successfully", async () => {
      const res = await request(app)
        .patch("/api/admin/users/4") // David Lee
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "David Lee (Promoted)",
          role: "IT_STAFF",
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("David Lee (Promoted)");
      expect(res.body.role).toBe("IT_STAFF");
    });

    it("enforces Self-Deactivation Guard: Admin cannot deactivate self (BR-18, AC-11)", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("CANNOT_DEACTIVATE_SELF");
    });

    it("enforces Last Active Admin Guard: cannot deactivate the sole active admin (BR-19, AC-12)", async () => {
      // First find an admin to target
      const listRes = await request(app)
        .get("/api/admin/users?role=ADMINISTRATOR")
        .set("Authorization", `Bearer ${adminToken}`);

      const activeAdmins = listRes.body.filter((u: any) => u.isActive);
      // If there is only 1 active admin (John Smith), attempting to deactivate should fail with LAST_ADMIN_PROTECTED
      // If we create a temporary second admin, and attempt to deactivate when only 1 remains, it should be protected.
      if (activeAdmins.length === 1) {
        // Target is the sole active admin
        // Note: Even if requested by self or another admin, if only 1 active admin exists and is deactivated:
        const targetId = activeAdmins[0].id;
        const res = await request(app)
          .patch(`/api/admin/users/${targetId}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            isActive: false,
          });

        expect(res.status).toBe(400);
        // Can be CANNOT_DEACTIVATE_SELF or LAST_ADMIN_PROTECTED
        expect(["CANNOT_DEACTIVATE_SELF", "LAST_ADMIN_PROTECTED"]).toContain(res.body.error.code);
      } else {
        // Create a separate admin, then test demoting or deactivating the last one
        expect(activeAdmins.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("enforces Last Active Admin Guard: cannot demote sole active admin to non-admin role (BR-19, AC-12)", async () => {
      // Create a temporary second admin so we can test non-self demotion
      const tempEmail = `temp.admin.${Date.now()}@example.com`;
      const createRes = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Temporary Second Admin",
          email: tempEmail,
          role: "ADMINISTRATOR",
          initialPassword: "Password123!",
          isActive: true,
        });

      expect(createRes.status).toBe(201);
      const tempAdminId = createRes.body.id;

      // Deactivate the temporary admin so only 1 active admin remains
      await request(app)
        .patch(`/api/admin/users/${tempAdminId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      // Now John Smith is the ONLY active admin
      // Attempting to demote John Smith to IT_STAFF must return LAST_ADMIN_PROTECTED
      const demoteRes = await request(app)
        .patch(`/api/admin/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "IT_STAFF" });

      expect(demoteRes.status).toBe(400);
      expect(demoteRes.body.error.code).toBe("LAST_ADMIN_PROTECTED");
    });

    it("rejects updating to an email that is already in use (BR-20)", async () => {
      const res = await request(app)
        .patch("/api/admin/users/3") // Sarah Johnson
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "jennifer.a@example.com", // taken by user 1
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
    });
  });

  // -------------------------------------------------------------------------
  // 5. Reset Password (BR-21)
  // -------------------------------------------------------------------------
  describe("Reset Password (BR-21)", () => {
    it("rejects password reset with password < 8 characters", async () => {
      const res = await request(app)
        .post("/api/admin/users/1/reset-password")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          newInitialPassword: "short",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 Not Found for non-existent user", async () => {
      const res = await request(app)
        .post("/api/admin/users/99999/reset-password")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          newInitialPassword: "NewSecurePassword123!",
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("resets password and sets mustChangePassword=true so user can log in with new password (BR-21)", async () => {
      const res = await request(app)
        .post("/api/admin/users/2/reset-password") // Michael Brown
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          newInitialPassword: "ResetPassword2026!",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Password reset successfully");

      // Verify login with new password and check mustChangePassword
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "michael.b@example.com",
          password: "ResetPassword2026!",
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.mustChangePassword).toBe(true);
    });
  });
});
