import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContractById } from "@/actions/contractActions";
import { formatAED } from "@/lib/calculations";
import InitializeProjectButton from "@/components/contracts/InitializeProjectButton";
import {
  ChevronLeft,
  Building2,
  Calendar,
  FileSignature,
  FolderKanban,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";



export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContractById(id);

  if (!contract) {
    notFound();
  }

  const hasProject = contract.projects && contract.projects.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Link
            href="/contracts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Contracts</span>
          </Link>

          {(contract.opportunity || contract.tender?.opportunity) && (
            <>
              <span className="text-slate-300">|</span>
              <Link
                href={`/opportunities/${(contract.opportunity || contract.tender?.opportunity)?.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-blue-600" />
                <span>Return to Opportunity ({(contract.opportunity || contract.tender?.opportunity)?.oppNumber})</span>
              </Link>
            </>
          )}
        </div>
        <span
          className="rounded px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${contract.businessEntity.color}15`,
            color: contract.businessEntity.color,
          }}
        >
          {contract.businessEntity.name}
        </span>
      </div>

      {/* Main Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {contract.contractNumber}
              </span>
              <span className="text-xs text-slate-400">
                Client PO: <strong>{contract.clientPoNumber || "PO-CONFIRMED"}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {contract.tender.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Employer: <strong className="text-slate-800">{contract.customer.name}</strong> • Value:{" "}
              <strong className="text-emerald-700">{formatAED(contract.contractValue)}</strong>
            </p>
          </div>

          <div>
            {!hasProject ? (
              <InitializeProjectButton
                contractId={contract.id}
                defaultProjectName={contract.tender.title}
                defaultBudget={contract.contractValue * 0.85}
              />
            ) : (
              <Link
                href={`/projects/${contract.projects[0].id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
              >
                <FolderKanban className="h-4 w-4" />
                <span>Go to Active Project ({contract.projects[0].projectNumber}) →</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope & Terms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Agreed Contractual Scope of Work</h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {contract.agreedScope}
            </p>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 mb-1">Payment Schedule & Terms</h3>
              <p className="text-xs text-slate-600">{contract.paymentTerms}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Value */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Execution Timeline
            </h3>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Commencement</span>
              <span className="font-semibold text-slate-800">
                {new Date(contract.startDate).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Completion</span>
              <span className="font-semibold text-slate-800">
                {new Date(contract.completionDate).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Awarded Tender</span>
              <Link
                href={`/tenders/${contract.tender.id}`}
                className="font-mono text-blue-600 font-bold hover:underline"
              >
                {contract.tender.tenderNumber}
              </Link>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Approved Quotation</span>
              <Link
                href={`/quotations/${contract.quotation.id}`}
                className="font-mono text-blue-600 font-bold hover:underline"
              >
                {contract.quotation.quotationNumber}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
