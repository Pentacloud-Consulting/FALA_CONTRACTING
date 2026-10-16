import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenderById } from "@/actions/tenderActions";
import { formatAED } from "@/lib/calculations";
import {
  ChevronLeft,
  Calculator,
  FileCheck2,
  FileSignature,
  Building2,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";



export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tender = await getTenderById(id);

  if (!tender) {
    notFound();
  }

  const specificFields = tender.specificFieldsJson
    ? JSON.parse(tender.specificFieldsJson)
    : {};

  return (
    <div className="space-y-6">
      {/* Back and Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Link
            href="/tenders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Tender Management</span>
          </Link>

          {tender.opportunity && (
            <>
              <span className="text-slate-300">|</span>
              <Link
                href={`/opportunities/${tender.opportunity.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-blue-600" />
                <span>Return to Opportunity ({tender.opportunity.oppNumber})</span>
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-[#0176d3]" />
            {tender.businessEntity.name}
          </span>
          <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-bold">
            {tender.status}
          </span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {tender.tenderNumber}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Ref: {tender.clientReference || "N/A"}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {tender.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Customer: <strong className="text-slate-700">{tender.customer.name}</strong> • Location:{" "}
              <strong className="text-slate-700">{tender.location}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {tender.estimations.length === 0 ? (
              <Link
                href={`/estimation/new?tenderId=${tender.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0176d3] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#015ba5] transition"
              >
                <Calculator className="h-4 w-4" />
                <span>Create Cost Estimation</span>
              </Link>
            ) : (
              <Link
                href={`/estimation/${tender.estimations[0].id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0176d3] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#015ba5] transition"
              >
                <Calculator className="h-4 w-4" />
                <span>View Estimation ({tender.estimations[0].estimationNumber})</span>
              </Link>
            )}

            {tender.quotations.length > 0 && (
              <Link
                href={`/quotations/${tender.quotations[0].id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 text-xs font-bold transition"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Open Quotation</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Scope, Description & Entity Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entity Technical & Dynamic Parameters */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tender.businessEntity.color }}
                />
                <span>{tender.businessEntity.name} — Technical Specifications</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {tender.businessEntity.code}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(specificFields).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {String(value || "N/A")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scope of Work */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Scope of Work & Specification</h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {tender.scopeOfWork}
            </p>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 mb-1">General Description</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{tender.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters, Workflow Links & History */}
        <div className="space-y-6">
          {/* Key Parameters */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Tender Metadata
            </h3>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Estimated Value</span>
              <span className="font-bold text-slate-900">{formatAED(tender.estimatedValue)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Submission Deadline</span>
              <span className="font-semibold text-slate-800">
                {new Date(tender.submissionDeadline).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Assigned Owner</span>
              <span className="font-semibold text-slate-800">{tender.ownerName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Contact Person</span>
              <span className="font-semibold text-slate-800">{tender.contactPerson}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Supporting Docs</span>
              <span className="font-mono text-[11px] text-blue-600 truncate max-w-[150px]">
                {tender.supportingDocs || "None"}
              </span>
            </div>
          </div>

          {/* Workflow Links */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Connected ERP Lifecycle
            </h3>

            <div className="space-y-2">
              {/* Step: Estimation */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Cost Estimation</span>
                  <span className="text-[11px] text-slate-500">
                    {tender.estimations.length > 0 ? tender.estimations[0].estimationNumber : "Not started"}
                  </span>
                </div>
                {tender.estimations.length > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Link
                    href={`/estimation/new?tenderId=${tender.id}`}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Start →
                  </Link>
                )}
              </div>

              {/* Step: Quotation */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Commercial Quotation</span>
                  <span className="text-[11px] text-slate-500">
                    {tender.quotations.length > 0 ? tender.quotations[0].quotationNumber : "Pending estimation"}
                  </span>
                </div>
                {tender.quotations.length > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    {tender.quotations[0].status}
                  </span>
                ) : null}
              </div>

              {/* Step: Contract */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Awarded Contract</span>
                  <span className="text-[11px] text-slate-500">
                    {tender.contracts.length > 0 ? tender.contracts[0].contractNumber : "Pending award"}
                  </span>
                </div>
                {tender.contracts.length > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
