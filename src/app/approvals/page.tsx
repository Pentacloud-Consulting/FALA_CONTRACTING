import React from "react";
import prisma from "@/lib/prisma";
import ApprovalsClientView from "@/components/approvals/ApprovalsClientView";

export default async function ApprovalsQueuePage() {
  const [pendingQuotations, recentHistory] = await Promise.all([
    prisma.quotation.findMany({
      where: { status: "Pending GM Approval" },
      include: {
        tender: true,
        customer: true,
        businessEntity: true,
        estimation: true,
        approvalRequests: { where: { status: "PENDING" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.approvalHistory.findMany({
      take: 10,
      orderBy: { timestamp: "desc" },
      include: {
        quotation: {
          include: { tender: true, customer: true, businessEntity: true },
        },
      },
    }),
  ]);

  return (
    <ApprovalsClientView
      pendingQuotations={pendingQuotations}
      recentHistory={recentHistory}
    />
  );
}

