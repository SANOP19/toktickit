import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import path from "node:path";
import fs from "node:fs";
import { app } from "../../src/app.js";

describe("Attachment Lifecycle API (Upload, Download, Soft-Removal)", () => {
  let requester1Id: number;
  let requester2Id: number;
  let ticket1Id: number;
  let attachmentId: number;

  beforeAll(async () => {
    const reqRes = await request(app).get("/api/dev-requesters");
    requester1Id = reqRes.body[0].id;
    requester2Id = reqRes.body[1].id;

    const catRes = await request(app).get("/api/categories");
    const sysRes = await request(app).get("/api/related-systems");

    const tRes = await request(app).post("/api/tickets").send({
      requesterId: requester1Id,
      categoryId: catRes.body[0].id,
      relatedSystemId: sysRes.body[0].id,
      summary: "Ticket for Attachment Lifecycle Tests",
      description: "Testing uploading, downloading, and soft-removing attachments on a ticket.",
      requestedPriority: "LOW",
    });

    ticket1Id = tRes.body.id;
  });

  it("uploads a valid PNG attachment successfully (API-08, BR-10, AC-06)", async () => {
    const fakePngBuffer = Buffer.from("89504E470D0A1A0A0000000D49484452", "hex");

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .field("requesterId", requester1Id)
      .attach("file", fakePngBuffer, "screenshot.png");

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.originalName).toBe("screenshot.png");
    expect(res.body.isRemoved).toBe(false);

    attachmentId = res.body.id;
  });

  it("rejects an unsupported attachment file type (API-09, BR-10, AC-07)", async () => {
    const badBuffer = Buffer.from("MZ90000300000004", "hex");

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .field("requesterId", requester1Id)
      .attach("file", badBuffer, "virus.exe");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Unsupported file type");
  });

  it("rejects upload when unauthorized requester attempts upload (AC-03, BR-05)", async () => {
    const fakePngBuffer = Buffer.from("89504E470D0A1A0A0000000D49484452", "hex");

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .field("requesterId", requester2Id)
      .attach("file", fakePngBuffer, "unauthorized.png");

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Forbidden");
  });

  it("downloads active attachment successfully (API-12, BR-10)", async () => {
    const res = await request(app).get(
      `/api/tickets/${ticket1Id}/attachments/${attachmentId}/download?requesterId=${requester1Id}`
    );

    expect(res.status).toBe(200);
    expect(res.header["content-disposition"]).toContain("screenshot.png");
  });

  it("soft-removes attachment with required reason (API-11, BR-11, AC-08)", async () => {
    const res = await request(app)
      .delete(`/api/tickets/${ticket1Id}/attachments/${attachmentId}`)
      .send({
        requesterId: requester1Id,
        reason: "Uploaded wrong screenshot by mistake",
      });

    expect(res.status).toBe(200);
    expect(res.body.isRemoved).toBe(true);
    expect(res.body.removalReason).toBe("Uploaded wrong screenshot by mistake");
    expect(res.body.removedAt).not.toBeNull();
  });

  it("blocks downloading soft-removed attachment (API-12, BR-11, AC-09)", async () => {
    const res = await request(app).get(
      `/api/tickets/${ticket1Id}/attachments/${attachmentId}/download?requesterId=${requester1Id}`
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("removed");
  });

  it("enforces maximum limit of 5 active attachments per ticket (API-10, BR-10)", async () => {
    const fakePng = Buffer.from("89504E470D0A1A0A0000000D49484452", "hex");

    // Upload 5 active attachments
    for (let i = 1; i <= 5; i++) {
      const uploadRes = await request(app)
        .post(`/api/tickets/${ticket1Id}/attachments`)
        .field("requesterId", requester1Id)
        .attach("file", fakePng, `active_${i}.png`);
      expect(uploadRes.status).toBe(201);
    }

    // 6th upload should be rejected
    const excessRes = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .field("requesterId", requester1Id)
      .attach("file", fakePng, "excess.png");

    expect(excessRes.status).toBe(400);
    expect(excessRes.body.error).toContain("Maximum limit of 5 active attachments");
  });

  afterAll(async () => {
    // Clean up test uploaded files in uploads folder except .gitkeep
    const uploadDir = path.resolve(process.cwd(), "uploads");
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        if (file !== ".gitkeep") {
          try {
            fs.unlinkSync(path.join(uploadDir, file));
          } catch {
            // Ignore if file cannot be removed
          }
        }
      }
    }
  });
});
