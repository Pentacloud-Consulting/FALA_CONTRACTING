import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding HR & Technical Workforce entity to SQLite...");

  const hrEntity = await prisma.businessEntity.upsert({
    where: { code: "HR_WORKFORCE" },
    update: {
      name: "HR & Technical Workforce",
      shortName: "HR & Workforce",
      description: "Infrastructure manpower supply, civil labor deployment, certified equipment operators, and site technical supervision.",
      color: "#0d9488",
      icon: "HardHat",
      isActive: true,
    },
    create: {
      code: "HR_WORKFORCE",
      name: "HR & Technical Workforce",
      shortName: "HR & Workforce",
      description: "Infrastructure manpower supply, civil labor deployment, certified equipment operators, and site technical supervision.",
      color: "#0d9488",
      icon: "HardHat",
      isActive: true,
    },
  });

  console.log("✅ HR Entity upserted successfully:", hrEntity);
}

main()
  .catch((e) => {
    console.error("Error upserting HR entity:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
