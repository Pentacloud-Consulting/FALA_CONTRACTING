import React from "react";
import prisma from "@/lib/prisma";
import ReportsView from "@/components/reports/ReportsView";


export default async function ReportsPage() {
  const [tenders, quotations, contracts, projects, purchaseOrders] =
    await Promise.all([
      prisma.tender.findMany({
        include: { businessEntity: true, customer: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.quotation.findMany({
        include: { tender: true, customer: true, businessEntity: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contract.findMany({
        include: { tender: true, customer: true, businessEntity: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        include: { customer: true, businessEntity: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.purchaseOrder.findMany({
        include: { supplier: true, businessEntity: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Executive ERP Reports & Data Exports
        </h1>
        <p className="text-xs text-slate-500">
          Consolidated data reports across all Fala business divisions with instant CSV spreadsheet download.
        </p>
      </div>

      <ReportsView
        tenders={tenders}
        quotations={quotations}
        contracts={contracts}
        projects={projects}
        purchaseOrders={purchaseOrders}
      />
    </div>
  );
}
