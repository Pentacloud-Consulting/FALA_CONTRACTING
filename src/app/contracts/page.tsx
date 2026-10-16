import React from "react";
import { getContracts } from "@/actions/contractActions";
import ContractsTableClient from "@/components/contracts/ContractsTableClient";

export const dynamic = "force-dynamic";

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";
  const contracts = await getContracts(entity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Awarded Contracts Register
          </h1>
          <p className="text-xs text-slate-500">
            Official legally binding contracts awarded from client-accepted quotations and tenders.
          </p>
        </div>
      </div>

      <ContractsTableClient initialContracts={contracts} />
    </div>
  );
}
