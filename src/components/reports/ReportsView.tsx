"use client";

import React, { useState } from "react";
import { formatAED } from "@/lib/calculations";
import { Download, FileSpreadsheet, Filter, CheckCircle2 } from "lucide-react";

export default function ReportsView({
  tenders,
  quotations,
  contracts,
  projects,
  purchaseOrders,
}: {
  tenders: any[];
  quotations: any[];
  contracts: any[];
  projects: any[];
  purchaseOrders: any[];
}) {
  const [reportType, setReportType] = useState<
    "TENDERS" | "QUOTATIONS" | "CONTRACTS" | "PROJECTS" | "PO"
  >("TENDERS");

  // Export CSV
  const exportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = "report.csv";

    if (reportType === "TENDERS") {
      filename = "fala-tender-register.csv";
      headers = ["Tender Number", "Title", "Customer", "Business Entity", "Estimated Value", "Deadline", "Status"];
      rows = tenders.map((t) => [
        t.tenderNumber,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.customer.name.replace(/"/g, '""')}"`,
        t.businessEntity.name,
        t.estimatedValue,
        new Date(t.submissionDeadline).toISOString().split("T")[0],
        t.status,
      ]);
    } else if (reportType === "QUOTATIONS") {
      filename = "fala-quotation-register.csv";
      headers = ["Quotation Number", "Version", "Tender", "Customer", "Subtotal", "Tax", "Total Amount", "Status", "Client Decision"];
      rows = quotations.map((q) => [
        q.quotationNumber,
        q.version,
        `"${q.tender.title.replace(/"/g, '""')}"`,
        `"${q.customer.name.replace(/"/g, '""')}"`,
        q.subtotal,
        q.tax,
        q.totalAmount,
        q.status,
        q.clientDecision,
      ]);
    } else if (reportType === "CONTRACTS") {
      filename = "fala-contract-register.csv";
      headers = ["Contract Number", "Customer", "Business Entity", "Contract Value", "Commencement", "Completion", "Client PO"];
      rows = contracts.map((c) => [
        c.contractNumber,
        `"${c.customer.name.replace(/"/g, '""')}"`,
        c.businessEntity.name,
        c.contractValue,
        new Date(c.startDate).toISOString().split("T")[0],
        new Date(c.completionDate).toISOString().split("T")[0],
        c.clientPoNumber || "N/A",
      ]);
    } else if (reportType === "PROJECTS") {
      filename = "fala-projects-summary.csv";
      headers = ["Project Number", "Project Name", "Client", "Contract Value", "Approved Budget", "Progress (%)", "Status"];
      rows = projects.map((p) => [
        p.projectNumber,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.customer.name.replace(/"/g, '""')}"`,
        p.contractValue,
        p.approvedBudget,
        p.progress,
        p.status,
      ]);
    } else if (reportType === "PO") {
      filename = "fala-purchase-orders.csv";
      headers = ["PO Number", "Supplier", "Entity", "Total Amount", "Delivery Date", "Status"];
      rows = purchaseOrders.map((po) => [
        po.poNumber,
        `"${po.supplier.name.replace(/"/g, '""')}"`,
        po.businessEntity.name,
        po.totalAmount,
        new Date(po.expectedDeliveryDate).toISOString().split("T")[0],
        po.status,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Report Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "TENDERS", label: "Tender Register", count: tenders.length },
            { id: "QUOTATIONS", label: "Quotation Status", count: quotations.length },
            { id: "CONTRACTS", label: "Contract Register", count: contracts.length },
            { id: "PROJECTS", label: "Project Summary", count: projects.length },
            { id: "PO", label: "Purchase Orders", count: purchaseOrders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                reportType === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  reportType === tab.id ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export to CSV Spreadsheet</span>
        </button>
      </div>

      {/* Report Table Display */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            {reportType === "TENDERS" && "Official Tender Pipeline & Register"}
            {reportType === "QUOTATIONS" && "Commercial Offers & Governance Approval Status"}
            {reportType === "CONTRACTS" && "Awarded Contracts & Client PO Commitments"}
            {reportType === "PROJECTS" && "Project Execution Milestones & Budget Matrix"}
            {reportType === "PO" && "Procurement & Purchase Orders Register"}
          </h2>
          <span className="text-xs text-slate-400">All Fala Entities Included</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === "TENDERS" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Tender #</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Entity</th>
                  <th className="py-2.5 px-4 text-right">Estimated Value</th>
                  <th className="py-2.5 px-4">Deadline</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No tenders registered in report database.
                    </td>
                  </tr>
                ) : (
                  tenders.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.tenderNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{t.title}</td>
                      <td className="py-3 px-4 text-slate-600">{t.customer.name}</td>
                      <td className="py-3 px-4 text-slate-600">{t.businessEntity.name}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatAED(t.estimatedValue)}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(t.submissionDeadline).toLocaleDateString("en-GB")}</td>
                      <td className="py-3 px-4 text-right font-semibold text-blue-700">{t.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === "QUOTATIONS" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Quote #</th>
                  <th className="py-2.5 px-4">Tender</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                  <th className="py-2.5 px-4 text-right">VAT</th>
                  <th className="py-2.5 px-4 text-right">Total Offer (AED)</th>
                  <th className="py-2.5 px-4 text-right">GM Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No quotations recorded in report database.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{q.quotationNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{q.tender.title}</td>
                      <td className="py-3 px-4 text-slate-600">{q.customer.name}</td>
                      <td className="py-3 px-4 text-right">{formatAED(q.subtotal)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatAED(q.tax)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatAED(q.totalAmount)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">{q.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === "CONTRACTS" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Contract #</th>
                  <th className="py-2.5 px-4">Tender / Scope</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Entity</th>
                  <th className="py-2.5 px-4 text-right">Contract Value</th>
                  <th className="py-2.5 px-4">PO Ref</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No awarded contracts recorded in report database.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.contractNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{c.tender.title}</td>
                      <td className="py-3 px-4 text-slate-600">{c.customer.name}</td>
                      <td className="py-3 px-4 text-slate-600">{c.businessEntity.name}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatAED(c.contractValue)}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{c.clientPoNumber || "N/A"}</td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">{c.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === "PROJECTS" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">Project #</th>
                  <th className="py-2.5 px-4">Project Name</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4 text-right">Contract Value</th>
                  <th className="py-2.5 px-4 text-right">Approved Budget</th>
                  <th className="py-2.5 px-4 text-right">Progress</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No active projects recorded in report database.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.projectNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600">{p.customer.name}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatAED(p.contractValue)}</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-semibold">{formatAED(p.approvedBudget)}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600">{p.progress}%</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{p.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === "PO" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-4">PO #</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4">Entity</th>
                  <th className="py-2.5 px-4 text-right">Total (AED)</th>
                  <th className="py-2.5 px-4">Expected Delivery</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No purchase orders recorded in report database.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{po.poNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{po.supplier.name}</td>
                      <td className="py-3 px-4 text-slate-600">{po.businessEntity.name}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatAED(po.totalAmount)}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(po.expectedDeliveryDate).toLocaleDateString("en-GB")}</td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">{po.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
