import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { HardHat, Users, Award, ShieldCheck } from "lucide-react";

export default async function HRPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-blue-700 shrink-0" />
          <span>
            <strong>Simplified Module:</strong> Key Engineering & Project Management Workforce Directory.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
          OPERATIONAL
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">HR & Technical Workforce Directory</h1>
          <p className="text-xs text-slate-500">Site engineers, estimators, project managers, and specialized infrastructure manpower deployment.</p>
        </div>
        <Link
          href="/tenders/new?entity=HR_WORKFORCE"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
        >
          <HardHat className="h-4 w-4" />
          <span>+ Create Manpower Tender</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">System Users</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{users.length} Users</span>
          <span className="text-[11px] text-slate-500">Active Fala Profiles</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Governance Roles</span>
          <span className="text-xl font-extrabold text-blue-700 mt-1 block">4 Roles</span>
          <span className="text-[11px] text-slate-500">GM, Estimator, PM, Proc.</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Engineers</span>
          <span className="text-xl font-extrabold text-slate-800 mt-1 block">Tendering & PM</span>
          <span className="text-[11px] text-slate-500">Ready for bids</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Compliance</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">100% Certified</span>
          <span className="text-[11px] text-slate-500">RTA / DM Standards</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Registered System Personnel</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Role Key</th>
                <th className="py-2.5 px-4">Title / Designation</th>
                <th className="py-2.5 px-4">Email Address</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{u.title || "Staff"}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Active
                    </span>
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
