import bcrypt from "bcryptjs";
import { getPrisma } from "../src/prisma.js";

// Lab 3 Idempotent Seeding Script
// Seeds:
// 1. 4 Ticket Categories
// 2. 7 Related Systems
// 3. User accounts across 3 roles:
//    - 4 Active Requesters + 1 Inactive Requester
//    - 3 Active IT Staff + 1 Inactive IT Staff
//    - 1 Active Administrator
//    - 1 First-login account with mustChangePassword = true
// 4. Sample realistic tickets with owners, priorities, statuses, comments & notes
async function main() {
  const prisma = getPrisma();

  // Common password hash for test accounts: "Password123!"
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Categories
  const categories = [
    "Account and Access",
    "Hardware",
    "Software",
    "Network",
  ];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Categories seeded successfully.");

  // 2. Related Systems
  const relatedSystems = [
    "Email",
    "Campus Wi-Fi",
    "VPN",
    "LEB2 App",
    "Grade Submission App",
    "Printer",
    "Corporate Laptop",
  ];
  for (const name of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }
  console.log("Related Systems seeded successfully.");

  // 3. User Accounts (Requesters, IT Staff, Administrator)
  const users = [
    // Requesters (Active)
    {
      name: "Jennifer Anderson",
      email: "jennifer.a@example.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Michael Brown",
      email: "michael.b@example.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "David Lee",
      email: "david.l@example.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    },
    // Inactive Requester (for login rejection test)
    {
      name: "Metier Leviathan",
      email: "metier.l@example.com",
      role: "REQUESTER" as const,
      isActive: false,
      mustChangePassword: false,
    },
    // IT Staff (Active)
    {
      name: "Alex Thompson",
      email: "tech.alex@example.com",
      role: "IT_STAFF" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Lisa Martinez",
      email: "tech.lisa@example.com",
      role: "IT_STAFF" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Kevin Patel",
      email: "tech.kevin@example.com",
      role: "IT_STAFF" as const,
      isActive: true,
      mustChangePassword: false,
    },
    // Inactive IT Staff (for login rejection test)
    {
      name: "Robert Wilson",
      email: "tech.retired@example.com",
      role: "IT_STAFF" as const,
      isActive: false,
      mustChangePassword: false,
    },
    // Administrator
    {
      name: "John Smith",
      email: "admin.john@example.com",
      role: "ADMINISTRATOR" as const,
      isActive: true,
      mustChangePassword: false,
    },
    // First-Login Password Change Test Account
    {
      name: "Amanda Clark",
      email: "new.user@example.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: true, // Forces password change on first login
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword,
      },
      create: {
        ...u,
        passwordHash,
      },
    });
  }
  console.log("User accounts seeded successfully (11 accounts across all roles).");

  // Retrieve key seeded IDs for realistic ticket association
  const jennifer = await prisma.user.findUnique({ where: { email: "jennifer.a@example.com" } });
  const michael = await prisma.user.findUnique({ where: { email: "michael.b@example.com" } });
  const alex = await prisma.user.findUnique({ where: { email: "tech.alex@example.com" } });
  const lisa = await prisma.user.findUnique({ where: { email: "tech.lisa@example.com" } });
  const hardwareCat = await prisma.category.findUnique({ where: { name: "Hardware" } });
  const networkCat = await prisma.category.findUnique({ where: { name: "Network" } });
  const softwareCat = await prisma.category.findUnique({ where: { name: "Software" } });
  const laptopSys = await prisma.relatedSystem.findUnique({ where: { name: "Corporate Laptop" } });
  const vpnSys = await prisma.relatedSystem.findUnique({ where: { name: "VPN" } });
  const emailSys = await prisma.relatedSystem.findUnique({ where: { name: "Email" } });

  if (jennifer && michael && alex && lisa && hardwareCat && networkCat && softwareCat && laptopSys && vpnSys && emailSys) {
    // 4. Sample Realistic Tickets
    const sampleTickets = [
      {
        ticketNumber: "TKT-2026-000101",
        summary: "Laptop battery drains quickly",
        description: "Battery discharges completely within 30 minutes of unplugging from charger.",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "In Progress",
        requesterId: jennifer.id,
        ownerId: alex.id,
        categoryId: hardwareCat.id,
        relatedSystemId: laptopSys.id,
      },
      {
        ticketNumber: "TKT-2026-000102",
        summary: "Cannot connect to VPN from home",
        description: "Getting connection timeout error 691 when attempting to establish a VPN session.",
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "Open",
        requesterId: jennifer.id,
        ownerId: lisa.id,
        categoryId: networkCat.id,
        relatedSystemId: vpnSys.id,
      },
      {
        ticketNumber: "TKT-2026-000103",
        summary: "Email not syncing on mobile Outlook app",
        description: "New emails do not appear on iOS Outlook app even after pulling to refresh.",
        requestedPriority: "MEDIUM",
        itPriority: "LOW",
        currentStatus: "Waiting for Requester",
        requesterId: jennifer.id,
        ownerId: alex.id,
        categoryId: softwareCat.id,
        relatedSystemId: emailSys.id,
      },
      {
        ticketNumber: "TKT-2026-000104",
        summary: "Printer in Engineering Dept is jamming",
        description: "Tray 2 jams continuously whenever printing more than 5 sheets.",
        requestedPriority: "LOW",
        itPriority: null,
        currentStatus: "New",
        requesterId: michael.id,
        ownerId: null, // Unassigned
        categoryId: hardwareCat.id,
        relatedSystemId: laptopSys.id,
      },
    ];

    for (const t of sampleTickets) {
      const ticket = await prisma.ticket.upsert({
        where: { ticketNumber: t.ticketNumber },
        update: {
          summary: t.summary,
          description: t.description,
          requestedPriority: t.requestedPriority,
          itPriority: t.itPriority,
          currentStatus: t.currentStatus,
          ownerId: t.ownerId,
        },
        create: t,
      });

      // Add a sample Public Comment and Internal Note for Ticket 1
      if (t.ticketNumber === "TKT-2026-000101") {
        await prisma.comment.deleteMany({ where: { ticketId: ticket.id } });
        await prisma.comment.create({
          data: {
            ticketId: ticket.id,
            authorId: alex.id,
            content: "Hello Jennifer, we have ordered a replacement battery module for your laptop.",
          },
        });
        await prisma.comment.create({
          data: {
            ticketId: ticket.id,
            authorId: jennifer.id,
            content: "Thank you Alex! Please let me know when it arrives.",
          },
        });

        await prisma.internalNote.deleteMany({ where: { ticketId: ticket.id } });
        await prisma.internalNote.create({
          data: {
            ticketId: ticket.id,
            authorId: alex.id,
            content: "Diagnostic confirmed cell #3 failure. Warranty replacement tracking code: BAT-99421.",
          },
        });
      }
    }
    console.log("Sample tickets, public comments, and internal notes seeded successfully.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
