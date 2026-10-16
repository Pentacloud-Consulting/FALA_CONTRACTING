import React from "react";
import { getQuotations } from "@/actions/quotationActions";
import QuotationsTableClient from "@/components/quotations/QuotationsTableClient";

export const dynamic = "force-dynamic";

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; status?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";
  const status = resolved?.status || "ALL";

  const quotations = await getQuotations(entity, status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Commercial Quotations & Offers Register
          </h1>
          <p className="text-xs text-slate-500">
            Formal commercial proposals, mandatory GM approvals, client tender submissions, and award tracking.
          </p>
        </div>
      </div>

      <QuotationsTableClient initialQuotations={quotations} />
    </div>
  );
}
