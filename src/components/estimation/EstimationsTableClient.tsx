"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatAED } from "@/lib/calculations";
import { updateEstimation, deleteEstimation } from "@/actions/estimationActions";
import {
  Calculator,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  Building,
  ExternalLink,
  ChevronRight,
  FileCheck2,
} from "lucide-react";

interface EstimationsTableClientProps {
  initialEstimations: any[];
}

export default function EstimationsTableClient({
  initialEstimations,
}: EstimationsTableClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewingEst, setViewingEst] = useState<any>(null);
  const [editingEst, setEditingEst] = useState<any>(null);
  const [deletingEst, setDeletingEst] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editForm, setEditForm] = useState({
    targetMargin: 15,
    overheads: 0,
    contingency: 0,
    preparedBy: "",
    notes: "",
  });

  const filteredEstimations = initialEstimations.filter((est) => {
    return (
      est.estimationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.businessEntity?.shortName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenEdit = (est: any) => {
    setEditForm({
      targetMargin: est.targetMargin || 15,
      overheads: est.overheads || 0,
      contingency: est.contingency || 0,
      preparedBy: est.preparedBy || "",
      notes: est.notes || "",
    });
    setEditingEst(est);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEst) return;

    setIsSaving(true);
    const res = await updateEstimation(editingEst.id, {
      targetMargin: Number(editForm.targetMargin),
      overheads: Number(editForm.overheads),
      contingency: Number(editForm.contingency),
      preparedBy: editForm.preparedBy,
      notes: editForm.notes,
    });
    setIsSaving(false);

    if (res.success) {
      showToast(`Estimation ${editingEst.estimationNumber} updated!`, "success");
      setEditingEst(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update estimation", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEst) return;

    setIsDeleting(true);
    const res = await deleteEstimation(deletingEst.id);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Estimation ${deletingEst.estimationNumber} deleted!`, "success");
      setDeletingEst(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete estimation", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search estimations by number, tender title, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3.5 px-5">Est #</th>
                <th className="py-3.5 px-4">Tender & Client</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4 text-right">Direct Cost</th>
                <th className="py-3.5 px-4 text-right">Target Margin</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Offer (Inc VAT)</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEstimations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Calculator className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <span className="font-bold text-slate-700 block">No estimations found</span>
                    <span className="text-xs text-slate-400">
                      Try adjusting your search criteria or register a new cost estimation.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredEstimations.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      <span className="text-blue-600">{est.estimationNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {est.tender?.title}
                      </div>
                      <div className="text-[11px] text-slate-500">{est.customer?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0176d3]" />
                        {est.businessEntity?.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {formatAED(est.totalDirectCost)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                        {est.targetMargin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      {formatAED(est.sellingPriceBeforeTax)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatAED(est.finalPrice)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1. View Details (Direct Dedicated Workspace) */}
                        <Link
                          href={`/estimation/${est.id}`}
                          title="View BOQ & Cost Workspace"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>

                        {/* 2. Edit Estimation */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(est)}
                          title="Edit Estimation Margins"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#0176d3]" />
                          <span>Edit</span>
                        </button>

                        {/* 3. Delete Estimation */}
                        <button
                          type="button"
                          onClick={() => setDeletingEst(est)}
                          title="Delete Estimation"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Delete</span>
                        </button>

                        {/* 4. View & Quote Link */}
                        <Link
                          href={`/estimation/${est.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition shrink-0"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-[#0176d3]" />
                          <span>Quote →</span>
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

      {/* View Estimation Modal */}
      {viewingEst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {viewingEst.estimationNumber}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {viewingEst.tender?.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {viewingEst.businessEntity?.name} • Prepared by {viewingEst.preparedBy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingEst(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Direct Cost</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {formatAED(viewingEst.totalDirectCost)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Target Margin</span>
                <div className="text-xs font-bold text-blue-700 mt-0.5">
                  {viewingEst.targetMargin}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Selling Price</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {formatAED(viewingEst.sellingPriceBeforeTax)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Final Price (VAT)</span>
                <div className="text-xs font-bold text-emerald-700 mt-0.5 font-mono">
                  {formatAED(viewingEst.finalPrice)}
                </div>
              </div>
            </div>

            {viewingEst.notes && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Estimation Notes</span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {viewingEst.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link
                href={`/estimation/${viewingEst.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <span>Open Full BOQ & Cost Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setViewingEst(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Estimation Modal */}
      {editingEst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Edit Estimation: {editingEst.estimationNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  Adjust commercial margin, overhead, contingency, and notes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEst(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Margin (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="0.5"
                    required
                    value={editForm.targetMargin}
                    onChange={(e) =>
                      setEditForm({ ...editForm, targetMargin: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Overheads (AED)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editForm.overheads}
                    onChange={(e) =>
                      setEditForm({ ...editForm, overheads: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contingency (AED)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editForm.contingency}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contingency: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Prepared By Engineer
                </label>
                <input
                  type="text"
                  value={editForm.preparedBy}
                  onChange={(e) => setEditForm({ ...editForm, preparedBy: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Estimation Notes / Assumptions
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
                  onClick={() => setEditingEst(null)}
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
                  <span>{isSaving ? "Recalculating..." : "Save & Recalculate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Cost Estimation</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete estimation <strong className="text-slate-900 font-bold">{deletingEst.estimationNumber}</strong>?
              <span className="block mt-1 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ Note: This will delete the estimation record and its line items.
              </span>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingEst(null)}
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
