import React from "react";
import Link from "next/link";
import { getEstimations } from "@/actions/estimationActions";
import { formatAED } from "@/lib/calculations";
import { Plus, Calculator, ArrowUpRight, CheckCircle2 } from "lucide-react";


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
            Cost Estimations Register
          </h1>
          <p className="text-xs text-slate-500">
            Bill of Quantities (BOQ), margin analysis, and direct cost engineering models.
          </p>
        </div>
        <Link
          href="/estimation/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Cost Estimation</span>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Est #</th>
                <th className="py-3 px-4">Tender & Client</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 text-right">Direct Cost</th>
                <th className="py-3 px-4 text-right">Target Margin</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Offer (Inc VAT)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estimations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Calculator className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="font-semibold text-slate-700">No estimations recorded yet</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 mb-3">
                        Build your Bill of Quantities (BOQ) and margin model for a registered tender.
                      </span>
                      <Link
                        href="/estimation/new"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>New Cost Estimation</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                estimations.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {est.estimationNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {est.tender.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{est.customer.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${est.businessEntity.color}15`,
                          color: est.businessEntity.color,
                        }}
                      >
                        {est.businessEntity.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {formatAED(est.totalDirectCost)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {est.targetMargin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      {formatAED(est.sellingPriceBeforeTax)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatAED(est.finalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/estimation/${est.id}`}
                        className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition"
                      >
                        View & Quote →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
