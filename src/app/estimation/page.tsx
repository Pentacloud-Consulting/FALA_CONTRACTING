import React from "react";
import Link from "next/link";
import { getEstimations } from "@/actions/estimationActions";
import EstimationsTableClient from "@/components/estimation/EstimationsTableClient";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EstimationsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";
  const estimations = await getEstimations(entity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cost Estimation Register
          </h1>
          <p className="text-xs text-slate-500">
            Bill of Quantities (BOQ), margin analysis, and direct cost engineering models.
          </p>
        </div>
        <Link
          href="/estimation/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Cost Estimation</span>
        </Link>
      </div>

      <EstimationsTableClient initialEstimations={estimations} />
    </div>
  );
}
