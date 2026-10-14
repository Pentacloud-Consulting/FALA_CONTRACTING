import React from "react";
import { Truck, Wrench, Gauge, CheckCircle2 } from "lucide-react";

export default function FleetPage() {
  const machinery: any[] = [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-700 shrink-0" />
          <span>
            <strong>Simplified Module:</strong> Heavy Plant Fleet & Workshop Asset Tracker.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
          OPERATIONAL
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Heavy Plant & Fleet Workshop</h1>
          <p className="text-xs text-slate-500">Asphalt pavers, rollers, excavators, tipper trucks, and mobile service yards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Heavy Assets</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">0 Units</span>
          <span className="text-[11px] text-slate-500">Pavers, Rollers, Excavators</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Fleet Utilization</span>
          <span className="text-xl font-extrabold text-blue-700 mt-1 block">100% Ready</span>
          <span className="text-[11px] text-slate-500">Mobilization Ready</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Downtime</span>
          <span className="text-xl font-extrabold text-slate-800 mt-1 block">0 Units</span>
          <span className="text-[11px] text-slate-500">Zero Maintenance Backlog</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Central Workshop</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">Al Quoz Yard</span>
          <span className="text-[11px] text-slate-500">Certified technicians</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Heavy Plant & Vehicle Roster</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-4">Asset ID</th>
                <th className="py-2.5 px-4">Machine & Model</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Deployed Project</th>
                <th className="py-2.5 px-4">Operating Hours</th>
                <th className="py-2.5 px-4">Service Schedule</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {machinery.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Truck className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="font-semibold text-slate-600">No machinery units registered yet</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Equipment assigned to awarded infrastructure projects will appear here.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                machinery.map((m) => (
                  <tr key={m.assetId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{m.assetId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.model}</td>
                    <td className="py-3 px-4 text-slate-600">{m.type}</td>
                    <td className="py-3 px-4 text-slate-700">{m.project}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{m.hours}</td>
                    <td className="py-3 px-4 text-slate-500">{m.nextService}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
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
