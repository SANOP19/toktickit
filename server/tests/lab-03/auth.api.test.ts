import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, inMemoryUsers } from "../../src/app.js";

describe("Lab 3 API Authentication Suites (POST /api/auth/*)", () => {
  beforeEach(() => {
    // Reset test user state if needed
    const amanda = inMemoryUsers.find((u) => u.email === "new.user@example.com");
    if (amanda) {
      amanda.mustChangePassword = true;
    }
  });

  describe("POST /api/auth/login", () => {
    it("API-01: logs in successfully with valid credentials and returns JWT + user profile", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "jennifer.a@example.com",
          password: "Password123!",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toMatchObject({
        name: "Jennifer Anderson",
        email: "jennifer.a@example.com",
        role: "REQUESTER",
        isActive: true,
        mustChangePassword: false,
      });
    });

    it("API-02: rejects login with incorrect password with HTTP 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "jennifer.a@example.com",
          password: "WrongPassword!",
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects login with non-existent email with HTTP 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@toktickit.com",
          password: "Password123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("API-03: rejects login for inactive account with HTTP 401 (BR-01, AC-02)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "metier.l@example.com",
          password: "Password123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("ACCOUNT_INACTIVE");
    });

    it("rejects missing email or password with HTTP 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "jennifer.a@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/auth/me & POST /api/auth/logout", () => {
    it("retrieves current authenticated user profile with valid Bearer token", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "tech.alex@example.com",
          password: "Password123!",
        });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user).toMatchObject({
        email: "tech.alex@example.com",
        role: "IT_STAFF",
      });
    });

    it("rejects unauthenticated requests to /api/auth/me with HTTP 401", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("logs out successfully with valid token", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin.john@example.com",
          password: "Password123!",
        });

      const token = loginRes.body.token;

      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toContain("logged out");
    });
  });

  describe("First-Login Mandatory Password Change (BR-02, AC-03)", () => {
    it("API-04: blocks normal application routes for quarantined user with mustChangePassword=true", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "new.user@example.com",
          password: "Password123!",
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.mustChangePassword).toBe(true);
      const token = loginRes.body.token;

      // Attempt to access tickets endpoint
      const accessRes = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${token}`);

      expect(accessRes.status).toBe(403);
      expect(accessRes.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
    });

    it("API-05: updates password, clears quarantine flag, and unblocks normal access", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "new.user@example.com",
          password: "Password123!",
        });

      const token = loginRes.body.token;

      // Update password
      const changeRes = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "Password123!",
          newPassword: "NewSecretPassword2026!",
          confirmPassword: "NewSecretPassword2026!",
        });

      expect(changeRes.status).toBe(200);
      expect(changeRes.body.mustChangePassword).toBe(false);
      const newToken = changeRes.body.token;

      // Access should now be unblocked
      const accessRes = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${newToken}`);

      expect(accessRes.status).toBe(200);
    });

    it("rejects password change if new password does not meet minimum length", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "jennifer.a@example.com",
          password: "Password123!",
        });

      const token = loginRes.body.token;

      const changeRes = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "Password123!",
          newPassword: "short",
          confirmPassword: "short",
        });

      expect(changeRes.status).toBe(400);
      expect(changeRes.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects password change if passwords do not match", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "jennifer.a@example.com",
          password: "Password123!",
        });

      const token = loginRes.body.token;

      const changeRes = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "Password123!",
          newPassword: "ValidPassword123!",
          confirmPassword: "DifferentPassword123!",
        });

      expect(changeRes.status).toBe(400);
      expect(changeRes.body.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
