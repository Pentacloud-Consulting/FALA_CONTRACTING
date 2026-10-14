import React from "react";
import Link from "next/link";
import { getProjects } from "@/actions/projectActions";
import { formatAED } from "@/lib/calculations";
import { FolderKanban, CheckCircle2, Clock, Calendar, ArrowRight } from "lucide-react";


export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";
  const projects = await getProjects(entity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Projects Execution Register
          </h1>
          <p className="text-xs text-slate-500">
            Active infrastructure contracts under execution, milestone delivery, and budget monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            <div className="flex flex-col items-center justify-center">
              <FolderKanban className="h-8 w-8 text-slate-300 mb-2" />
              <span className="font-semibold text-slate-700">No active projects found</span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Projects are automatically provisioned when contracts are executed with the client.
              </span>
            </div>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {p.projectNumber}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${p.businessEntity.color}15`,
                      color: p.businessEntity.color,
                    }}
                  >
                    {p.businessEntity.shortName}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Client: <strong className="text-slate-700">{p.customer.name}</strong> • Manager:{" "}
                  <strong className="text-slate-700">{p.projectManager}</strong>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Overall Progress</span>
                  <span className="text-blue-600">{p.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Contract Value
                  </span>
                  <span className="font-bold text-slate-900">{formatAED(p.contractValue)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Approved Budget
                  </span>
                  <span className="font-bold text-slate-900">{formatAED(p.approvedBudget)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {p.milestones.length} Milestones
                </span>
                <Link
                  href={`/projects/${p.id}`}
                  className="rounded bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Manage Milestones →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
