"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DEMO_USERS } from "@/lib/types";
import { formatAED } from "@/lib/calculations";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  UserCheck,
  ArrowLeft,
} from "lucide-react";

export default function ApprovalsClientView({
  pendingQuotations,
  recentHistory,
}: {
  pendingQuotations: any[];
  recentHistory: any[];
}) {
  const { currentUser, setCurrentUser, showToast } = useApp();
  const isGM = currentUser?.role === "GM";

  const handleSwitchToGM = () => {
    const gmUser = DEMO_USERS.find((u) => u.role === "GM");
    if (gmUser) {
      setCurrentUser(gmUser);
      showToast(
        "Switched to H.E. Saeed Fala Al-Falasi (General Manager). GM module unlocked!",
        "success"
      );
    }
  };

  // RESTRICTED VIEW: When current user is NOT GM
  if (!isGM) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/quotations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Quotations &amp; Offers</span>
          </Link>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
            Restricted Executive Module
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0176d3] shadow-inner border border-blue-200">
            <Lock className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Executive Governance Gate — GM Role Required
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
              The <strong>General Manager Approvals Queue</strong> is restricted to executive leadership.
              Only users with the <strong>General Manager (GM)</strong> role have governance authority to
              review commercial margins and sign off on client offers.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-600 max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Active Demo Role
              </span>
              <strong className="text-slate-900 font-bold">{currentUser?.name}</strong>
              <span className="text-slate-500 block text-[11px]">{currentUser?.title}</span>
            </div>
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 uppercase">
              {currentUser?.role}
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSwitchToGM}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0176d3] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-[#015ba5] transition cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Switch to H.E. Saeed Fala Al-Falasi (GM)</span>
            </button>
            <Link
              href="/quotations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Go to Quotations</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHORIZED VIEW: Current user IS GM
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 uppercase tracking-wide border border-blue-200">
              Mandatory Governance Gate
            </span>
            <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-bold border border-blue-200">
              ✓ Active as GM ({currentUser?.name})
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            General Manager Approvals Queue
          </h1>
          <p className="text-xs text-slate-500">
            Every commercial offer requires executive sign-off from H.E. Saeed Fala Al-Falasi before official client submission.
          </p>
        </div>
      </div>

      {/* Pending Queue */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#0176d3]" />
          <span>Pending GM Approval Queue ({pendingQuotations.length})</span>
        </h2>

        {pendingQuotations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="h-8 w-8 text-[#0176d3] mx-auto mb-2" />
            <p className="font-semibold text-slate-700">All caught up!</p>
            <p className="text-slate-400">No quotations currently awaiting GM decision.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQuotations.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 hover:border-blue-400 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {q.quotationNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {q.tender.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Employer: <strong className="text-slate-700">{q.customer.name}</strong>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
                    <span className="h-2 w-2 rounded-full bg-[#0176d3]" />
                    {q.businessEntity.shortName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Total Offer Value
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatAED(q.totalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Target Margin
                    </span>
                    <span className="font-bold text-[#0176d3] text-sm">
                      {q.estimation?.targetMargin ? `${q.estimation.targetMargin}%` : "15.0%"}
                    </span>
                  </div>
                </div>

                {q.approvalRequests[0]?.comments && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 italic">
                    "{q.approvalRequests[0].comments}"
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Awaiting executive signoff
                  </span>
                  <Link
                    href={`/quotations/${q.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0176d3] px-4 py-2 text-xs font-bold text-white hover:bg-[#015ba5] transition shadow-xs"
                  >
                    <span>Open & Decide →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Governance Audit Log */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Recent Approval Decisions & Transitions</span>
        </h2>

        <div className="divide-y divide-slate-100 text-xs">
          {recentHistory.map((h) => (
            <div key={h.id} className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      h.action === "APPROVED"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : h.action === "REJECTED"
                        ? "bg-slate-100 text-slate-800 border border-slate-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {h.action}
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {h.quotation.quotationNumber}
                  </span>
                  <span className="text-slate-400">—</span>
                  <span className="font-semibold text-slate-700">
                    {h.quotation.tender.title}
                  </span>
                </div>
                <div className="text-slate-500">
                  By: <strong>{h.actorName}</strong> ({h.actorRole}) • Client:{" "}
                  {h.quotation.customer.name}
                </div>
                {h.comment && (
                  <p className="text-slate-600 italic text-[11px]">"{h.comment}"</p>
                )}
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(h.timestamp).toLocaleDateString("en-GB")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
