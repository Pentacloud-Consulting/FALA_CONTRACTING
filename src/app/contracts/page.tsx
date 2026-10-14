import React from "react";
import Link from "next/link";
import { getContracts } from "@/actions/contractActions";
import { formatAED } from "@/lib/calculations";
import { FileSignature, FolderKanban, CheckCircle2, ChevronRight, Calendar } from "lucide-react";


export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";
  const contracts = await getContracts(entity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Awarded Contracts Register
          </h1>
          <p className="text-xs text-slate-500">
            Official legally binding contracts awarded from client-accepted quotations and tenders.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Contract #</th>
                <th className="py-3 px-4">Tender & Client</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 text-right">Contract Value</th>
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4">Active Project</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileSignature className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="font-semibold text-slate-700">No awarded contracts in register</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Contracts are created when a GM-approved commercial offer is marked as client-accepted.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {c.contractNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{c.tender.title}</div>
                      <div className="text-[11px] text-slate-400">{c.customer.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${c.businessEntity.color}15`,
                          color: c.businessEntity.color,
                        }}
                      >
                        {c.businessEntity.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatAED(c.contractValue)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {new Date(c.startDate).toLocaleDateString("en-GB")} →{" "}
                      {new Date(c.completionDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.projects.length > 0 ? (
                        <Link
                          href={`/projects/${c.projects[0].id}`}
                          className="font-mono text-[11px] text-blue-600 font-bold hover:underline"
                        >
                          {c.projects[0].projectNumber}
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic">Not initialized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/contracts/${c.id}`}
                        className="rounded bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 transition"
                      >
                        View & Manage →
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
