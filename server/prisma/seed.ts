import { getPrisma } from "../src/prisma.js";

// Lab 2 Idempotent Seeding Script
// Seeds:
// 1. 4 Ticket Categories
// 2. 7 Related Systems (platforms/services)
// 3. 4 Active Development Requesters
// 4. 1 Inactive Development Requester (for access control testing)
async function main() {
  const prisma = getPrisma();

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

  // 3. Development Requesters (Active & Inactive)
  const requesters = [
    { name: "Jennifer Anderson", email: "jennifer.a@example.com", isActive: true },
    { name: "Michael Brown", email: "michael.b@example.com", isActive: true },
    { name: "Sarah Johnson", email: "sarah.j@example.com", isActive: true },
    { name: "David Lee", email: "david.l@example.com", isActive: true },
    { name: "Inactive Test User", email: "inactive.user@example.com", isActive: false },
  ];
  for (const req of requesters) {
    await prisma.requesterUser.upsert({
      where: { email: req.email },
      update: { name: req.name, isActive: req.isActive },
      create: req,
    });
  }
  console.log("Development Requesters seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
