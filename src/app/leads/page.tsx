import React from "react";
import prisma from "@/lib/prisma";
import { getLeads } from "@/actions/leadActions";
import LeadsTableClient from "@/components/leads/LeadsTableClient";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const entityFilter = resolvedParams?.entity || "ALL";
  const statusFilter = resolvedParams?.status || "ALL";

  const [leads, entities, accounts] = await Promise.all([
    getLeads(entityFilter, statusFilter),
    prisma.businessEntity.findMany({ where: { isActive: true } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial Leads Pipeline
          </h1>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            Pre-qualification pipeline with division-specific technical field capture and 1-action conversion
          </p>
        </div>
      </div>

      <LeadsTableClient
        initialLeads={leads}
        entityList={entities}
        accountsList={accounts}
      />
    </div>
  );
}
