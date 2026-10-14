import React from "react";
import { Boxes, PackageCheck, AlertCircle, Warehouse, Plus } from "lucide-react";

export default function InventoryPage() {
  const stockItems: any[] = [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-blue-700 shrink-0" />
          <span>
            <strong>Simplified Module:</strong> Inventory Yard Overview for infrastructure raw materials and precast elements.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
          OPERATIONAL
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory & Central Yard Overview</h1>
          <p className="text-xs text-slate-500">Live storage levels across Fala quarries, batching yards, and warehousing facilities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Material Value</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">AED 0.00</span>
          <span className="text-[11px] text-slate-500">Quarries & Batching Yards</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active SKUs</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">0 SKUs</span>
          <span className="text-[11px] text-slate-500">RTA / Municipal certified</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Depot Storage Yards</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">4 Active Yards</span>
          <span className="text-[11px] text-slate-500">Dubai, RAK, Sharjah, DIC</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Material Stock Inventory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-4">SKU Code</th>
                <th className="py-2.5 px-4">Material Description</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">On-Hand Stock</th>
                <th className="py-2.5 px-4">Yard Location</th>
                <th className="py-2.5 px-4 text-right">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Boxes className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="font-semibold text-slate-600">No inventory items recorded yet</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Delivered goods receipts from procurement will reflect stock directly into storage yards.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.stock}</td>
                    <td className="py-3 px-4 text-slate-600">{item.yard}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.status}
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
