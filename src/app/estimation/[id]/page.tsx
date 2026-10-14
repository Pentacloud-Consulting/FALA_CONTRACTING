import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstimationById } from "@/actions/estimationActions";
import { formatAED } from "@/lib/calculations";
import GenerateQuoteButton from "@/components/estimation/GenerateQuoteButton";
import {
  ChevronLeft,
  Building2,
  Calendar,
  User,
  Calculator,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";



export default async function EstimationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const est = await getEstimationById(id);

  if (!est) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/estimation"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Estimations Register</span>
        </Link>
        <span
          className="rounded px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${est.businessEntity.color}15`,
            color: est.businessEntity.color,
          }}
        >
          {est.businessEntity.name}
        </span>
      </div>

      {/* Main Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {est.estimationNumber} (v{est.version})
              </span>
              <span className="text-xs text-slate-400">
                Tender: <strong className="text-slate-700">{est.tender.tenderNumber}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {est.tender.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Client: <strong className="text-slate-700">{est.customer.name}</strong> • Prepared by:{" "}
              <strong className="text-slate-700">{est.preparedBy}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {est.quotations.length === 0 ? (
              <GenerateQuoteButton
                estimationId={est.id}
                tenderId={est.tenderId}
                fallbackData={{
                  preparedBy: est.preparedBy,
                  targetMargin: est.targetMargin,
                  totalDirectCost: est.totalDirectCost,
                  overheads: est.overheads,
                  contingency: est.contingency,
                  totalCost: est.totalCost,
                  sellingPriceBeforeTax: est.sellingPriceBeforeTax,
                  taxAmount: est.taxAmount,
                  finalPrice: est.finalPrice,
                  estimatedProfit: est.estimatedProfit,
                  lineItems: est.lineItems,
                }}
              />
            ) : (
              <Link
                href={`/quotations/${est.quotations[0].id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>View Quotation ({est.quotations[0].quotationNumber}) →</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Financial Matrix Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Direct BOQ Cost
          </span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">
            {formatAED(est.totalDirectCost)}
          </span>
          <span className="text-[11px] text-slate-500">Materials, Labour, Plant</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Cost (Inc Overheads)
          </span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">
            {formatAED(est.totalCost)}
          </span>
          <span className="text-[11px] text-slate-500">Direct + Overheads + Contingency</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Gross Margin & Profit
          </span>
          <span className="text-lg font-bold text-emerald-600 mt-1 block">
            {formatAED(est.estimatedProfit)}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {est.targetMargin}% Target Margin
          </span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
            Final Client Offer (Inc VAT)
          </span>
          <span className="text-lg font-extrabold text-blue-900 mt-1 block">
            {formatAED(est.finalPrice)}
          </span>
          <span className="text-[11px] text-slate-500">Selling Price + 5% UAE VAT</span>
        </div>
      </div>

      {/* BOQ Line Items Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Engineered BOQ Line Items Breakdown
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {est.lineItems.length} Cost Elements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-right">Quantity</th>
                <th className="py-2.5 px-4">Unit</th>
                <th className="py-2.5 px-4 text-right">Unit Rate</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {est.lineItems.map((li, idx) => (
                <tr key={li.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {li.costCategory}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{li.description}</td>
                  <td className="py-2.5 px-4 text-right font-mono">{li.quantity.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-slate-500">{li.unit}</td>
                  <td className="py-2.5 px-4 text-right">{formatAED(li.unitRate)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    {formatAED(li.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
