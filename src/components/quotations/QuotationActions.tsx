"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  submitQuotationForGMApproval,
  gmDecideQuotation,
  submitQuotationToClient,
  recordClientDecision,
  convertQuotationToContract,
} from "@/actions/quotationActions";
import {
  ShieldAlert,
  ShieldCheck,
  Printer,
  Send,
  FileSignature,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";

export default function QuotationActions({
  quotation,
}: {
  quotation: any;
}) {
  const router = useRouter();
  const { currentUser, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<
    "GM_APPROVE" | "GM_REJECT" | "GM_CHANGES" | "SUBMIT_CLIENT" | "RECORD_DECISION" | "CONVERT_CONTRACT" | null
  >(null);

  // Form states for modals
  const [reason, setReason] = useState("");
  const [submissionMethod, setSubmissionMethod] = useState("Official Client Tender Portal & Hardcopy Dossier");
  const [clientDecisionVal, setClientDecisionVal] = useState("Accepted");
  const [clientPoNumber, setClientPoNumber] = useState("PO-GULF-INFRA-8831");
  const [clientComments, setClientComments] = useState("Commercial and technical offer approved by client tender board.");
  const [contractStartDate, setContractStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [contractCompletionDate, setContractCompletionDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const isGM = currentUser.role === "GM";

  // 1. Submit for GM Approval
  const handleSubmitForGM = async () => {
    setLoading(true);
    const res = await submitQuotationForGMApproval(quotation.id, currentUser.name);
    setLoading(false);
    if (res.success) {
      showToast("Quotation submitted for GM approval successfully!", "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed to submit quotation", "error");
    }
  };

  // 2. GM Decision
  const handleGMDecision = async (decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => {
    if (!isGM) {
      showToast("Access Denied: Switch to the GM demo role in the header to decide.", "error");
      return;
    }

    if ((decision === "REJECT" || decision === "REQUEST_CHANGES") && !reason.trim()) {
      showToast("Please provide a reason for rejection or change request.", "error");
      return;
    }

    setLoading(true);
    const res = await gmDecideQuotation({
      quotationId: quotation.id,
      actorRole: currentUser.role,
      actorName: currentUser.name,
      decision,
      reason,
    });
    setLoading(false);
    setModalMode(null);

    if (res.success) {
      showToast(`Quotation ${decision === "APPROVE" ? "Approved" : "Rejected"} by General Manager!`, "success");
      router.refresh();
    } else {
      showToast(res.error || "Decision failed", "error");
    }
  };

  // 3. Submit to Client
  const handleSubmitToClient = async () => {
    setLoading(true);
    const res = await submitQuotationToClient(quotation.id, submissionMethod);
    setLoading(false);
    setModalMode(null);
    if (res.success) {
      showToast("Quotation marked as officially submitted to client!", "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed", "error");
    }
  };

  // 4. Record Client Decision
  const handleRecordClientDecision = async () => {
    setLoading(true);
    const res = await recordClientDecision({
      quotationId: quotation.id,
      decision: clientDecisionVal,
      comments: clientComments,
      clientPoNumber,
    });
    setLoading(false);
    setModalMode(null);
    if (res.success) {
      showToast(`Client decision '${clientDecisionVal}' saved!`, "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed to save client decision", "error");
    }
  };

  // 5. Convert to Contract
  const handleConvertToContract = async () => {
    setLoading(true);
    const res = await convertQuotationToContract({
      quotationId: quotation.id,
      startDate: contractStartDate,
      completionDate: contractCompletionDate,
    });
    setLoading(false);
    setModalMode(null);
    if (res.success && res.contract) {
      showToast(`Contract ${res.contract.contractNumber} awarded and generated!`, "success");
      router.push(`/contracts/${res.contract.id}`);
    } else {
      showToast(res.error || "Failed to create contract", "error");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Print Button (Available for all approved/submitted offers) */}
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
      >
        <Printer className="h-4 w-4 text-slate-500" />
        <span>Print Offer Document</span>
      </button>

      {/* STATE 1: DRAFT -> Submit for GM Approval */}
      {quotation.status === "Draft" && (
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmitForGM}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-600/20"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          <span>Submit for Mandatory GM Approval</span>
        </button>
      )}

      {/* STATE 2: PENDING GM APPROVAL -> GM Actions */}
      {quotation.status === "Pending GM Approval" && (
        <>
          {isGM ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalMode("GM_APPROVE")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>GM: Approve Offer</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode("GM_REJECT")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-sm"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode("GM_CHANGES")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Request Changes</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs text-amber-800">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>
                Awaiting General Manager Approval. <em>(Switch to GM in header to decide)</em>
              </span>
            </div>
          )}
        </>
      )}

      {/* STATE 3: APPROVED -> Submit to Client */}
      {quotation.status === "Approved" && (
        <button
          type="button"
          onClick={() => setModalMode("SUBMIT_CLIENT")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
        >
          <Send className="h-4 w-4" />
          <span>Mark Submitted to Client</span>
        </button>
      )}

      {/* STATE 4: SUBMITTED TO CLIENT -> Record Decision */}
      {quotation.status === "Submitted to Client" && (
        <button
          type="button"
          onClick={() => setModalMode("RECORD_DECISION")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Record Client Decision</span>
        </button>
      )}

      {/* STATE 5: ACCEPTED -> Convert to Awarded Contract */}
      {quotation.status === "Accepted" && quotation.contracts?.length === 0 && (
        <button
          type="button"
          onClick={() => setModalMode("CONVERT_CONTRACT")}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
        >
          <FileSignature className="h-4 w-4" />
          <span>Convert into Awarded Contract →</span>
        </button>
      )}

      {/* MODAL 1: GM APPROVE */}
      {modalMode === "GM_APPROVE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                General Manager Approval Confirmation
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              As General Manager, you are authorizing the commercial and execution terms for quotation{" "}
              <strong>{quotation.quotationNumber}</strong> ({quotation.tender.title}) for client submission.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Executive Comments / Directives (Optional)
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Commercial terms verified. Approved to proceed with official submission."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGMDecision("APPROVE")}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {loading ? "Approving..." : "Confirm GM Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GM REJECT */}
      {modalMode === "GM_REJECT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <XCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                General Manager Quotation Rejection
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter the mandatory reason for rejecting this quotation. The tendering team will review your comments and issue a revised package.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mandatory Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Unfavourable payment terms, insufficient margin on asphalt wearing course, missing client NOC clause..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !reason.trim()}
                onClick={() => handleGMDecision("REJECT")}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GM REQUEST CHANGES */}
      {modalMode === "GM_CHANGES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-600">
              <RotateCcw className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                Request Engineering/Commercial Changes
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide instructions for revision. The quotation will revert to Draft status for adjustment.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Changes Description <span className="text-amber-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Adjust unit rate on item 2, change advance payment condition to 15% against guarantee."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !reason.trim()}
                onClick={() => handleGMDecision("REQUEST_CHANGES")}
                className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Request Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SUBMIT TO CLIENT */}
      {modalMode === "SUBMIT_CLIENT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-blue-600">
              <Send className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                Record Official Client Submission
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Confirm that this GM-approved offer has been officially tendered to {quotation.customer.name}.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Submission Channel
              </label>
              <input
                type="text"
                value={submissionMethod}
                onChange={(e) => setSubmissionMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmitToClient}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                {loading ? "Recording..." : "Confirm Client Submission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RECORD CLIENT DECISION */}
      {modalMode === "RECORD_DECISION" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-purple-600">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                Record Client Commercial Decision
              </h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Client Decision
              </label>
              <select
                value={clientDecisionVal}
                onChange={(e) => setClientDecisionVal(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="Accepted">Accepted (Award Notification / PO Issued)</option>
                <option value="Revision Requested">Revision Requested</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            {clientDecisionVal === "Accepted" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client PO / Letter of Acceptance Reference
                </label>
                <input
                  type="text"
                  value={clientPoNumber}
                  onChange={(e) => setClientPoNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Client Remarks
              </label>
              <textarea
                rows={2}
                value={clientComments}
                onChange={(e) => setClientComments(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleRecordClientDecision}
                className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
              >
                {loading ? "Saving..." : "Save Client Decision"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONVERT TO CONTRACT */}
      {modalMode === "CONVERT_CONTRACT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-600">
              <FileSignature className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">
                Award & Convert into Active Contract
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Converting this accepted quotation will officially award the tender, lock the contract value, and generate a new Contract register record.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Commencement Date</label>
                <input
                  type="date"
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Completion</label>
                <input
                  type="date"
                  value={contractCompletionDate}
                  onChange={(e) => setContractCompletionDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConvertToContract}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                {loading ? "Generating..." : "Award & Generate Contract"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
