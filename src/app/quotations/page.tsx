import React from "react";
import Link from "next/link";
import { getQuotations } from "@/actions/quotationActions";
import { formatAED } from "@/lib/calculations";
import {
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";


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

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {["ALL", "Draft", "Pending GM Approval", "Approved", "Submitted to Client", "Accepted", "Rejected"].map((s) => (
          <Link
            key={s}
            href={`/quotations?status=${s}${entity !== "ALL" ? `&entity=${entity}` : ""}`}
            className={`rounded-full px-3 py-1 font-medium transition ${
              status === s
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "ALL" ? "All Quotations" : s}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Tender & Client</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">VAT (5%)</th>
                <th className="py-3 px-4 text-right">Total Offer (AED)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileCheck2 className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="font-semibold text-slate-700">No commercial quotations issued yet</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Quotations are automatically generated once an estimation is calculated and submitted for GM review.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {q.quotationNumber} <span className="text-[10px] text-slate-400">v{q.version}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{q.tender.title}</div>
                      <div className="text-[11px] text-slate-400">{q.customer.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${q.businessEntity.color}15`,
                          color: q.businessEntity.color,
                        }}
                      >
                        {q.businessEntity.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {formatAED(q.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {formatAED(q.tax)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatAED(q.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          q.status === "Accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : q.status === "Approved"
                            ? "bg-blue-100 text-blue-800"
                            : q.status === "Pending GM Approval"
                            ? "bg-amber-100 text-amber-800"
                            : q.status === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/quotations/${q.id}`}
                        className="rounded bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 transition"
                      >
                        Open Offer →
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
