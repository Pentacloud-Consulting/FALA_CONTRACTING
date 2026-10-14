import React from "react";
import { Landmark, Receipt, DollarSign, ArrowUpRight } from "lucide-react";

export default function FinancePage() {
  const invoices: any[] = [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-blue-700 shrink-0" />
          <span>
            <strong>Simplified Module:</strong> Interim Payment Certificates (IPC) and Client Billing Overview.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
          OPERATIONAL
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Finance & Commercial Billing</h1>
          <p className="text-xs text-slate-500">Contract IPC billings, retention balances, and client payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Billed YTD</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">AED 0.00</span>
          <span className="text-[11px] text-slate-500">Certified by Consultants</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Collected Cash</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">AED 0.00</span>
          <span className="text-[11px] text-slate-500">Direct Inflows</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Outstanding Receivables</span>
          <span className="text-xl font-extrabold text-amber-600 mt-1 block">AED 0.00</span>
          <span className="text-[11px] text-slate-500">Pending Client Claims</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Retention Held</span>
          <span className="text-xl font-extrabold text-blue-700 mt-1 block">AED 0.00</span>
          <span className="text-[11px] text-slate-500">5% DLP Guarantee</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Commercial Invoices & Claims</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-4">Project</th>
                <th className="py-2.5 px-4">Claim Type</th>
                <th className="py-2.5 px-4 text-right">Amount (AED)</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="h-8 w-8 text-slate-300 mb-2" />
                      <span className="font-semibold text-slate-600">No invoices or payment certificates recorded yet</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Interim progress certificates issued against awarded contracts will be tracked here.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.number} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{inv.customer}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.project}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.type}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{inv.amount}</td>
                    <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.status}
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
