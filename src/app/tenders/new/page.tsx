import React from "react";
import { getTenderFormData } from "@/actions/tenderActions";
import NewTenderForm from "@/components/tenders/NewTenderForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";


export default async function NewTenderPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const { customers, entities } = await getTenderFormData();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Link
          href="/tenders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Tenders Register</span>
        </Link>
        <span className="text-xs text-slate-400">
          Step 1 begins with Business Entity selection
        </span>
      </div>

      <NewTenderForm
        customers={customers}
        initialEntityCode={resolved?.entity}
      />
    </div>
  );
}
