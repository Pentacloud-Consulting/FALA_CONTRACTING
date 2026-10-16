import React from "react";
import prisma from "@/lib/prisma";
import { getOpportunities } from "@/actions/opportunityActions";
import OpportunitiesTableClient from "@/components/opportunities/OpportunitiesTableClient";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; stage?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";
  const stage = resolved?.stage || "ALL";

  const [opportunities, accounts, entities] = await Promise.all([
    getOpportunities(entity, stage),
    prisma.account.findMany({
      orderBy: { name: "asc" },
      include: { contacts: true },
    }),
    prisma.businessEntity.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial Opportunities Pipeline
          </h1>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            8-Stage commercial pipeline: Qualification ➔ Tender/Estimation ➔ Quotation ➔ GM Approval ➔ Submitted to Client ➔ Negotiation ➔ Closed Won / Lost
          </p>
        </div>
      </div>

      <OpportunitiesTableClient
        initialOpportunities={opportunities}
        accountsList={accounts}
        entityList={entities}
      />
    </div>
  );
}
