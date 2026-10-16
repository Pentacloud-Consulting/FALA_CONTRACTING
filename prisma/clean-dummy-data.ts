import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clean() {
  console.log("🧹 Removing dummy records from SQLite database...");

  // 1. Delete Procurement
  await prisma.goodsReceiptLineItem.deleteMany({});
  await prisma.goodsReceipt.deleteMany({});
  await prisma.purchaseOrderLineItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.purchaseRequestLineItem.deleteMany({});
  await prisma.purchaseRequest.deleteMany({});

  // 2. Delete Projects & Milestones
  await prisma.projectMilestone.deleteMany({});
  await prisma.project.deleteMany({});

  // 3. Delete Contracts
  await prisma.contract.deleteMany({});

  // 4. Delete Quotations & Approvals
  await prisma.approvalHistory.deleteMany({});
  await prisma.approvalRequest.deleteMany({});
  await prisma.quotationLineItem.deleteMany({});
  await prisma.quotationVersion.deleteMany({});
  await prisma.quotation.deleteMany({});

  // 5. Delete Estimations
  await prisma.estimationLineItem.deleteMany({});
  await prisma.estimation.deleteMany({});

  // 6. Delete Tenders
  await prisma.tender.deleteMany({});

  // 7. Delete CRM Opportunities & Leads
  await prisma.opportunity.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.supplier.deleteMany({});

  console.log("✅ All dummy transactional & demo data removed cleanly!");
  console.log("✓ Fala 7 Business Entities and Demo Roles preserved.");
}

clean()
  .catch((e) => {
    console.error("Error clearing dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
