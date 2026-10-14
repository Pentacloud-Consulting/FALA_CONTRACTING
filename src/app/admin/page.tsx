import React from "react";
import prisma from "@/lib/prisma";
import { Sliders, Database, Shield, Server, CheckCircle2 } from "lucide-react";


export default async function AdminPage() {
  const [entities, userCount, tenderCount, quoteCount] = await Promise.all([
    prisma.businessEntity.findMany(),
    prisma.user.count(),
    prisma.tender.count(),
    prisma.quotation.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-700 shrink-0" />
          <span>
            <strong>Simplified Demo Module:</strong> Basic System Administration & Database Registry. Single Sign-On (SSO) SAML and fine-grained ACL permissions are simplified for local MVP demonstration.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
          DEMO MODE
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Administration & System Configuration</h1>
          <p className="text-xs text-slate-500">Database health, active divisions, governance roles, and audit registries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Database Connector</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">SQLite + Prisma</span>
          <span className="text-[11px] text-emerald-600 font-mono">prisma/dev.db (Healthy)</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Business Units</span>
          <span className="text-xl font-extrabold text-blue-700 mt-1 block">{entities.length} Entities</span>
          <span className="text-[11px] text-slate-500">All registered & active</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">System Roles</span>
          <span className="text-xl font-extrabold text-slate-800 mt-1 block">5 Demo Roles</span>
          <span className="text-[11px] text-slate-500">GM, Preparer, PM, Proc.</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Records</span>
          <span className="text-xl font-extrabold text-purple-700 mt-1 block">
            {tenderCount + quoteCount} Transactions
          </span>
          <span className="text-[11px] text-slate-500">Tenders & Quotations</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Configured Fala Business Divisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {entities.map((e) => (
            <div key={e.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{e.name}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: e.color }}
                />
              </div>
              <span className="font-mono text-[10px] text-slate-400 font-bold block">{e.code}</span>
              <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{e.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
