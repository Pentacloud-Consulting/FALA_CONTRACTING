import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/actions/projectActions";
import { formatAED } from "@/lib/calculations";
import MilestoneManager from "@/components/projects/MilestoneManager";
import {
  ChevronLeft,
  Building2,
  Calendar,
  FolderKanban,
  CheckCircle2,
  ShoppingCart,
  Plus,
  ArrowRight,
} from "lucide-react";



export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Projects Register</span>
        </Link>
        <span
          className="rounded px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${project.businessEntity.color}15`,
            color: project.businessEntity.color,
          }}
        >
          {project.businessEntity.name}
        </span>
      </div>

      {/* Main Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {project.projectNumber}
              </span>
              <span className="text-xs text-slate-400">
                Contract:{" "}
                <Link
                  href={`/contracts/${project.contractId}`}
                  className="font-mono text-slate-700 hover:underline font-bold"
                >
                  {project.contract.contractNumber}
                </Link>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Client: <strong className="text-slate-700">{project.customer.name}</strong> • Project Manager:{" "}
              <strong className="text-slate-700">{project.projectManager}</strong> • Location:{" "}
              <strong className="text-slate-700">{project.location}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/procurement"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Issue Purchase Request</span>
            </Link>
          </div>
        </div>

        {/* Progress Bar & Financial Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold">
              <span className="text-slate-600">Executive Completion</span>
              <span className="text-blue-600">{project.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">Contract Value:</span>
            <strong className="text-slate-900 font-bold">{formatAED(project.contractValue)}</strong>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">Approved Budget:</span>
            <strong className="text-emerald-700 font-bold">{formatAED(project.approvedBudget)}</strong>
          </div>
        </div>
      </div>

      {/* Milestones Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Contract Milestones & Deliverables
            </h2>
            <p className="text-xs text-slate-500">
              Interactive milestone tracking automatically syncs overall project progress.
            </p>
          </div>
        </div>

        <MilestoneManager
          milestones={project.milestones}
          projectId={project.id}
        />
      </div>

      {/* Connected Procurement Section (PRs & POs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linked PRs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Linked Purchase Requests ({project.purchaseRequests.length})
            </h3>
            <Link
              href="/procurement"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              All PRs →
            </Link>
          </div>

          {project.purchaseRequests.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No purchase requests raised yet.</p>
          ) : (
            <div className="space-y-2">
              {project.purchaseRequests.map((pr: any) => (
                <div
                  key={pr.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800">{pr.prNumber}</span>
                    <p className="text-slate-600 line-clamp-1">{pr.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatAED(pr.totalAmount)}</span>
                    <span className="block text-[10px] text-blue-600 font-semibold">{pr.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked POs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Linked Purchase Orders ({project.purchaseOrders.length})
            </h3>
            <Link
              href="/procurement"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              All POs →
            </Link>
          </div>

          {project.purchaseOrders.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No purchase orders issued yet.</p>
          ) : (
            <div className="space-y-2">
              {project.purchaseOrders.map((po: any) => (
                <div
                  key={po.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800">{po.poNumber}</span>
                    <p className="text-slate-600">{po.supplier.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatAED(po.totalAmount)}</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">{po.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
