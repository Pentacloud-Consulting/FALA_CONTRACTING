import React from "react";
import Link from "next/link";
import { getTenders } from "@/actions/tenderActions";
import { formatAED } from "@/lib/calculations";
import {
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowUpRight,
  Calculator,
  Calendar,
} from "lucide-react";


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
            Tender Register & Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Manage bidding opportunities, commercial submissions, and estimation workflows across Fala entities.
          </p>
        </div>
        <Link
          href="/tenders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Tender</span>
        </Link>
      </div>

      {/* Filter Chips / Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Filter:
        </span>
        {["ALL", "Registered", "Under Estimation", "Estimation Completed", "Pending GM Approval", "Approved", "Awarded"].map((s) => (
          <Link
            key={s}
            href={`/tenders?status=${s}${entity !== "ALL" ? `&entity=${entity}` : ""}`}
            className={`rounded-full px-3 py-1 font-medium transition ${
              status === s
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "ALL" ? "All Statuses" : s}
          </Link>
        ))}
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Tender #</th>
                <th className="py-3 px-4">Title & Client</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Estimated Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileSpreadsheet className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="font-semibold text-slate-700">No tenders registered</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 mb-3">
                        Create your first infrastructure tender to start the workflow.
                      </span>
                      <Link
                        href="/tenders/new"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Tender</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                tenders.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.tenderNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{t.title}</div>
                      <div className="text-[11px] text-slate-500">{t.customer.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${t.businessEntity.color}15`,
                          color: t.businessEntity.color,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: t.businessEntity.color }}
                        />
                        {t.businessEntity.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{new Date(t.submissionDeadline).toLocaleDateString("en-GB")}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatAED(t.estimatedValue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          t.status === "Awarded"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.status === "Pending GM Approval"
                            ? "bg-amber-100 text-amber-800"
                            : t.status === "Approved"
                            ? "bg-blue-100 text-blue-800"
                            : t.status === "Under Estimation"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/tenders/${t.id}`}
                        className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition"
                      >
                        View Detail
                      </Link>
                      {t.estimations.length === 0 && (
                        <Link
                          href={`/estimation/new?tenderId=${t.id}`}
                          className="rounded bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition inline-flex items-center gap-1"
                        >
                          <Calculator className="h-3 w-3" />
                          <span>Estimate</span>
                        </Link>
                      )}
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
