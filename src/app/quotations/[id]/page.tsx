import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuotationById } from "@/actions/quotationActions";
import { formatAED } from "@/lib/calculations";
import QuotationActions from "@/components/quotations/QuotationActions";
import {
  ChevronLeft,
  Building2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Printer,
  FileCheck2,
  CheckCircle2,
  FileSignature,
} from "lucide-react";



export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuotationById(id);

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/quotations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Quotations</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-xs font-bold text-slate-800">
            {quote.quotationNumber} (Rev {quote.version})
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              quote.status === "Accepted"
                ? "bg-emerald-100 text-emerald-800"
                : quote.status === "Approved"
                ? "bg-blue-100 text-blue-800"
                : quote.status === "Pending GM Approval"
                ? "bg-amber-100 text-amber-800"
                : quote.status === "Rejected"
                ? "bg-rose-100 text-rose-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {quote.status}
          </span>
        </div>

        {/* Action Controls */}
        <QuotationActions quotation={quote} />
      </div>

      {/* Main Quotation Document / Print Layout */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 lg:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0 print:m-0 print:space-y-5 print:w-full print:block">
        {/* Document Header & Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-6 gap-6 print:flex-row print:pb-4 print:border-b-2 print:border-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded bg-blue-700 text-white flex items-center justify-center font-black text-base print:bg-blue-800">
                F
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                  FALA ROAD CONTRACTING
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Infrastructure & Conglomerate Group
                </span>
              </div>
            </div>
            <p className="text-xs font-bold text-blue-700 print:text-blue-800 pt-1">
              Operating Subsidiary: {quote.businessEntity.name} ({quote.businessEntity.shortName})
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              P.O. Box 48190, Dubai, United Arab Emirates • Tel: +971 4 347 8800 • Email: contracts@falaroad.ae
            </p>
          </div>

          <div className="text-right sm:self-start space-y-1.5 shrink-0">
            <span className="inline-block rounded bg-slate-900 px-3.5 py-1 font-mono text-xs font-bold text-white uppercase tracking-wider print:bg-slate-900 print:text-white">
              COMMERCIAL OFFER
            </span>
            <div className="text-xs">
              <span className="text-slate-500">Ref: </span>
              <strong className="font-mono text-slate-900 font-bold">{quote.quotationNumber}</strong>
            </div>
            <div className="text-xs">
              <span className="text-slate-500">Date: </span>
              <strong className="text-slate-800">
                {new Date(quote.createdAt).toLocaleDateString("en-GB")}
              </strong>
            </div>
            <div className="text-xs">
              <span className="text-slate-500">Validity: </span>
              <strong className="text-slate-800">{quote.validityDays} Calendar Days</strong>
            </div>
          </div>
        </div>

        {/* Client & Tender Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs print:grid-cols-2 print:gap-4 print:p-3 print:bg-slate-50 print:border print:border-slate-300 print:rounded-lg">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Client / Employer Details
            </span>
            <div className="text-sm font-bold text-slate-900">{quote.customer.name}</div>
            <div className="text-slate-600 mt-0.5">{quote.customer.address}</div>
            <div className="text-slate-600">
              {quote.customer.city}, {quote.customer.country}
            </div>
            <div className="text-slate-600 mt-1">
              Attention: <strong className="text-slate-800">{quote.customer.primaryContact}</strong>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Tender & Project Scope
            </span>
            <div className="text-sm font-bold text-slate-900">{quote.tender.title}</div>
            <div className="text-slate-600 mt-0.5">
              Internal Tender Ref: <strong className="font-mono text-slate-800">{quote.tender.tenderNumber}</strong>
            </div>
            {quote.tender.clientReference && (
              <div className="text-slate-600">
                Employer Tender Ref: <strong className="font-mono text-slate-800">{quote.tender.clientReference}</strong>
              </div>
            )}
            <div className="text-slate-600 mt-1">
              Execution Location: <strong className="text-slate-800">{quote.tender.location}</strong>
            </div>
          </div>
        </div>

        {/* Priced Bill of Quantities / Line Items */}
        <div className="space-y-2 print:space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Priced Schedule of Quantities & Rates (BOQ)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">All rates in United Arab Emirates Dirhams (AED)</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 print:overflow-visible print:border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-[11px] font-bold uppercase text-slate-700 print:bg-slate-100 print:border-b-2 print:border-slate-400">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center print:w-8 print:py-2">Item</th>
                  <th className="py-2.5 px-3 print:py-2">Description of Work / Supply</th>
                  <th className="py-2.5 px-3 text-right w-24 print:w-20 print:py-2">Qty</th>
                  <th className="py-2.5 px-3 text-center w-20 print:w-16 print:py-2">Unit</th>
                  <th className="py-2.5 px-3 text-right w-28 print:w-24 print:py-2 whitespace-nowrap">Rate (AED)</th>
                  <th className="py-2.5 px-3 text-right w-36 print:w-32 print:py-2 whitespace-nowrap">Total (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-slate-300">
                {quote.lineItems.map((li: any, idx: number) => (
                  <tr key={li.id} className="print-avoid-break">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] print:py-2">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 leading-snug print:py-2">{li.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 print:py-2">{li.quantity.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 print:py-2">{li.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 print:py-2 whitespace-nowrap">{formatAED(li.unitRate)}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900 print:py-2 whitespace-nowrap">
                      {formatAED(li.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commercial Summary Table */}
        <div className="flex justify-end print-avoid-break">
          <div className="w-full sm:w-88 print:w-80 space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Subtotal Amount</span>
              <span className="font-semibold font-mono text-slate-900">{formatAED(quote.subtotal)}</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
                <span>Special Commercial Discount</span>
                <span className="font-mono">-{formatAED(quote.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">UAE VAT (5.0%)</span>
              <span className="font-semibold font-mono text-slate-900">{formatAED(quote.tax)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-b-2 border-slate-900 text-sm font-black text-slate-900 print:py-1.5">
              <span>Total Contract Offer</span>
              <span className="text-blue-700 print:text-slate-900 font-mono text-base">{formatAED(quote.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Commercial Terms & Conditions */}
        <div className="print-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs print:grid-cols-2 print:gap-4 print:pt-3">
          <div>
            <h4 className="font-bold text-slate-800 mb-1">Payment & Commercial Terms:</h4>
            <p className="text-slate-600 leading-relaxed">{quote.paymentTerms}</p>

            <h4 className="font-bold text-slate-800 mt-3 mb-1">Delivery / Mobilization Terms:</h4>
            <p className="text-slate-600 leading-relaxed">{quote.deliveryTerms}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-1">Key Assumptions & Scope Inclusions:</h4>
            <p className="text-slate-600 leading-relaxed">
              {quote.assumptions || "Subject to unrestricted site access and standard authority approvals."}
            </p>

            <h4 className="font-bold text-slate-800 mt-3 mb-1">Specific Exclusions:</h4>
            <p className="text-slate-600 leading-relaxed">
              {quote.exclusions || "Statutory connection fees payable directly by Employer."}
            </p>
          </div>
        </div>

        {/* Executive Sign-off Block */}
        <div className="print-avoid-break pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs print:pt-4 print:gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-6">
              Prepared & Submitted by:
            </span>
            <div className="border-b border-slate-400 pb-1 font-bold text-slate-900">
              Eng. Tariq Al-Nuaimi
            </div>
            <div className="text-[11px] text-slate-600">Senior Tendering & Estimation Engineer</div>
            <div className="text-[10px] text-slate-400">Fala Road Contracting</div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-6">
              Approved for Release by:
            </span>
            <div className="border-b border-slate-400 pb-1 font-bold text-emerald-800 flex items-center justify-between">
              <span>H.E. Saeed Fala Al-Falasi</span>
              {quote.status !== "Draft" && quote.status !== "Pending GM Approval" && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase font-bold border border-emerald-300">
                  ✓ GM SIGNED & SEALED
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-600">General Manager & Executive Director</div>
            <div className="text-[10px] text-slate-400">Office of the Executive Board</div>
          </div>
        </div>
      </div>

      {/* Approval Audit Trail (Hidden on print) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Governance & GM Approval History</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {quote.approvalHistory.length} Recorded Transitions
          </span>
        </div>

        <div className="space-y-3">
          {quote.approvalHistory.map((h: any) => (
            <div
              key={h.id}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs"
            >
              <div
                className={`p-1.5 rounded-full mt-0.5 shrink-0 ${
                  h.action === "APPROVED"
                    ? "bg-emerald-100 text-emerald-700"
                    : h.action === "REJECTED"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {h.action === "APPROVED" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{h.action}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(h.timestamp).toLocaleString("en-GB")}
                  </span>
                </div>
                <div className="text-slate-600 mt-0.5">
                  Actor: <strong className="text-slate-800">{h.actorName}</strong> (
                  <span className="font-mono text-[11px]">{h.actorRole}</span>)
                </div>
                {h.comment && (
                  <p className="mt-1 text-slate-700 font-medium italic bg-white p-2 rounded border border-slate-200/60">
                    "{h.comment}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
