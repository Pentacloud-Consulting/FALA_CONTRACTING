import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import NewEstimationForm from "@/components/estimation/NewEstimationForm";
import { ChevronLeft } from "lucide-react";


export default async function NewEstimationPage({
  searchParams,
}: {
  searchParams: Promise<{ tenderId?: string }>;
}) {
  const resolved = await searchParams;
  const tenderId = resolved?.tenderId;

  const tenders = await prisma.tender.findMany({
    include: { customer: true, businessEntity: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/estimation"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Cost Estimation</span>
        </Link>
        <span className="text-xs text-slate-400">
          Target Margin is calculated as a % of the Selling Price
        </span>
      </div>

      <NewEstimationForm
        tenders={tenders}
        selectedTenderId={tenderId}
      />
    </div>
  );
}
