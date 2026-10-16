"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatAED } from "@/lib/calculations";
import { updateQuotation, deleteQuotation } from "@/actions/quotationActions";
import {
  FileCheck2,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  Building,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from "lucide-react";

interface QuotationsTableClientProps {
  initialQuotations: any[];
}

export default function QuotationsTableClient({
  initialQuotations,
}: QuotationsTableClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [viewingQuote, setViewingQuote] = useState<any>(null);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [deletingQuote, setDeletingQuote] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editForm, setEditForm] = useState({
    validityPeriod: 30,
    paymentTerms: "",
    deliveryTerms: "",
    notes: "",
  });

  const statuses = [
    "ALL",
    "Draft",
    "Pending GM Approval",
    "Approved",
    "Submitted to Client",
    "Accepted",
    "Rejected",
  ];

  const filteredQuotations = initialQuotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.businessEntity?.shortName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || q.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (q: any) => {
    setEditForm({
      validityPeriod: q.validityPeriod || 30,
      paymentTerms: q.paymentTerms || "",
      deliveryTerms: q.deliveryTerms || "",
      notes: q.notes || "",
    });
    setEditingQuote(q);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    setIsSaving(true);
    const res = await updateQuotation(editingQuote.id, {
      validityPeriod: Number(editForm.validityPeriod),
      paymentTerms: editForm.paymentTerms,
      deliveryTerms: editForm.deliveryTerms,
      notes: editForm.notes,
    });
    setIsSaving(false);

    if (res.success) {
      showToast(`Quotation ${editingQuote.quotationNumber} updated!`, "success");
      setEditingQuote(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update quotation", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuote) return;

    setIsDeleting(true);
    const res = await deleteQuotation(deletingQuote.id);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Quotation ${deletingQuote.quotationNumber} deleted!`, "success");
      setDeletingQuote(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete quotation", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Status Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotations by quote #, tender, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer shrink-0 ${
                selectedStatus === s
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "ALL" ? "All Quotations" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3.5 px-5">Quote #</th>
                <th className="py-3.5 px-4">Tender & Client</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">VAT (5%)</th>
                <th className="py-3.5 px-4 text-right">Total Offer (AED)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileCheck2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <span className="font-bold text-slate-700 block">No quotations found</span>
                    <span className="text-xs text-slate-400">
                      Quotations are automatically generated once an estimation is created.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      <span className="text-blue-600">{q.quotationNumber}</span>{" "}
                      <span className="text-[10px] text-slate-400 font-normal">v{q.version}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{q.tender?.title}</div>
                      <div className="text-[11px] text-slate-500">{q.customer?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0176d3]" />
                        {q.businessEntity?.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {formatAED(q.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {formatAED(q.tax)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatAED(q.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          q.status === "Approved" || q.status === "Accepted" || q.status === "Pending GM Approval"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1. View Details (Direct Dedicated Workspace) */}
                        <Link
                          href={`/quotations/${q.id}`}
                          title="View Quotation Proposal"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>

                        {/* 2. Edit Terms */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(q)}
                          title="Edit Commercial Terms"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#0176d3]" />
                          <span>Edit</span>
                        </button>

                        {/* 3. Delete Quote */}
                        {(!q.contracts || q.contracts.length === 0) && (
                          <button
                            type="button"
                            onClick={() => setDeletingQuote(q)}
                            title="Delete Quotation"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Delete</span>
                          </button>
                        )}

                        {/* 4. Open Offer Link */}
                        <Link
                          href={`/quotations/${q.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition shrink-0"
                        >
                          <span>Open Offer →</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Quotation Modal */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {viewingQuote.quotationNumber} v{viewingQuote.version}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {viewingQuote.tender?.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {viewingQuote.businessEntity?.name} • Client: {viewingQuote.customer?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingQuote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {viewingQuote.status}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Subtotal</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {formatAED(viewingQuote.subtotal)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">VAT (5%)</span>
                <div className="text-xs font-bold text-slate-700 mt-0.5">
                  {formatAED(viewingQuote.tax)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Total Offer (AED)</span>
                <div className="text-xs font-bold text-emerald-700 mt-0.5 font-mono">
                  {formatAED(viewingQuote.totalAmount)}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div><strong>Payment Terms:</strong> {viewingQuote.paymentTerms || "Standard 30 Days"}</div>
              <div><strong>Delivery Terms:</strong> {viewingQuote.deliveryTerms || "Ex-Works / As Agreed"}</div>
              <div><strong>Validity Period:</strong> {viewingQuote.validityPeriod || 30} calendar days</div>
              {viewingQuote.notes && (
                <div><strong>Commercial Notes:</strong> {viewingQuote.notes}</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link
                href={`/quotations/${viewingQuote.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
              >
                <span>Open Full Quotation Proposal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setViewingQuote(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quotation Modal */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Edit Quotation Terms: {editingQuote.quotationNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  Update payment terms, validity window, and notes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Validity Window (Days) *
                </label>
                <input
                  type="number"
                  min="7"
                  max="180"
                  required
                  value={editForm.validityPeriod}
                  onChange={(e) =>
                    setEditForm({ ...editForm, validityPeriod: parseInt(e.target.value) || 30 })
                  }
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={editForm.paymentTerms}
                  onChange={(e) => setEditForm({ ...editForm, paymentTerms: e.target.value })}
                  placeholder="e.g. 10% Advance, 90% against progressive invoice"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Delivery / Completion Terms
                </label>
                <input
                  type="text"
                  value={editForm.deliveryTerms}
                  onChange={(e) => setEditForm({ ...editForm, deliveryTerms: e.target.value })}
                  placeholder="e.g. 120 Days from site mobilization"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Commercial Conditions / Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Terms"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Commercial Quotation</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete quotation <strong className="text-slate-900 font-bold">{deletingQuote.quotationNumber}</strong>?
              <span className="block mt-1 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ Note: This will delete the commercial quotation record and all associated approval history.
              </span>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingQuote(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/30 transition cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
