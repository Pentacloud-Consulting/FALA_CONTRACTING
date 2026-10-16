import React from "react";
import Link from "next/link";
import { getTenders } from "@/actions/tenderActions";
import TendersTableClient from "@/components/tenders/TendersTableClient";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TendersPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; status?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";
  const status = resolved?.status || "ALL";

  const tenders = await getTenders(entity, status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tender Management Register
          </h1>
          <p className="text-xs text-slate-500">
            Manage bidding opportunities, commercial submissions, and estimation workflows across Fala entities.
          </p>
        </div>
        <Link
          href="/tenders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Tender</span>
        </Link>
      </div>

      <TendersTableClient initialTenders={tenders} />
    </div>
  );
}
