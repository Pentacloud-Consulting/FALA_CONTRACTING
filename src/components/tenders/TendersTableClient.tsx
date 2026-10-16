"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatAED } from "@/lib/calculations";
import { updateTender, deleteTender } from "@/actions/tenderActions";
import {
  FileSpreadsheet,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  Calculator,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

interface TendersTableClientProps {
  initialTenders: any[];
}

export default function TendersTableClient({ initialTenders }: TendersTableClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [viewingTender, setViewingTender] = useState<any>(null);
  const [editingTender, setEditingTender] = useState<any>(null);
  const [deletingTender, setDeletingTender] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    scopeOfWork: "",
    location: "",
    submissionDeadline: "",
    estimatedValue: 0,
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });

  const statuses = [
    "ALL",
    "Registered",
    "Under Estimation",
    "Estimation Completed",
    "Pending GM Approval",
    "Approved",
    "Awarded",
  ];

  const filteredTenders = initialTenders.filter((t) => {
    const matchesSearch =
      t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.businessEntity?.shortName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || t.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (t: any) => {
    setEditForm({
      title: t.title || "",
      scopeOfWork: t.scopeOfWork || "",
      location: t.location || "",
      submissionDeadline: t.submissionDeadline
        ? new Date(t.submissionDeadline).toISOString().split("T")[0]
        : "",
      estimatedValue: t.estimatedValue || 0,
      contactPerson: t.contactPerson || "",
      contactEmail: t.contactEmail || "",
      contactPhone: t.contactPhone || "",
    });
    setEditingTender(t);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTender) return;

    setIsSaving(true);
    const res = await updateTender(editingTender.id, {
      ...editForm,
      estimatedValue: Number(editForm.estimatedValue),
    });
    setIsSaving(false);

    if (res.success) {
      showToast(`Tender ${editingTender.tenderNumber} updated successfully!`, "success");
      setEditingTender(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update tender", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTender) return;

    setIsDeleting(true);
    const res = await deleteTender(deletingTender.id, true);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Tender ${deletingTender.tenderNumber} deleted successfully!`, "success");
      setDeletingTender(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete tender", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenders by number, title, client, or entity..."
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
              {s === "ALL" ? "All Statuses" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Tenders Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3.5 px-5">Tender #</th>
                <th className="py-3.5 px-4">Title & Client</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Estimated Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTenders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <span className="font-bold text-slate-700 block">No tenders found</span>
                    <span className="text-xs text-slate-400">
                      Try adjusting your search criteria or register a new tender.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredTenders.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      <span className="text-blue-600">{t.tenderNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{t.title}</div>
                      <div className="text-[11px] text-slate-500">{t.customer?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0176d3]" />
                        {t.businessEntity.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px] font-medium">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{new Date(t.submissionDeadline).toLocaleDateString("en-GB")}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatAED(t.estimatedValue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          t.status === "Approved" || t.status === "Awarded" || t.status === "Pending GM Approval"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1. View Details (Direct Dedicated Workspace) */}
                        <Link
                          href={`/tenders/${t.id}`}
                          title="View Tender Workspace"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>

                        {/* 2. Edit Tender */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          title="Edit Tender"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#0176d3]" />
                          <span>Edit</span>
                        </button>

                        {/* 3. Delete Tender */}
                        <button
                          type="button"
                          onClick={() => setDeletingTender(t)}
                          title="Delete Tender"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Delete</span>
                        </button>

                        {/* 4. Estimate Shortcut */}
                        {t.estimations?.length === 0 && (
                          <Link
                            href={`/estimation/new?tenderId=${t.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition shrink-0"
                          >
                            <Calculator className="w-3.5 h-3.5 text-[#0176d3]" />
                            <span>Estimate</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Tender Details Modal */}
      {viewingTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {viewingTender.tenderNumber}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {viewingTender.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {viewingTender.businessEntity?.name} • {viewingTender.customer?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingTender(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {viewingTender.status}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Value</span>
                <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                  {formatAED(viewingTender.estimatedValue)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Deadline</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {new Date(viewingTender.submissionDeadline).toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>

            {viewingTender.scopeOfWork && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Scope of Work</span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {viewingTender.scopeOfWork}
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Contact & Location</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div>Client: <strong>{viewingTender.customer?.name}</strong></div>
                <div>Location: <strong>{viewingTender.location || "Dubai, UAE"}</strong></div>
                <div>Contact Person: <strong>{viewingTender.contactPerson || "Commercial Dept"}</strong></div>
                <div>Email: <strong>{viewingTender.contactEmail || "—"}</strong></div>
                <div>Phone: <strong>{viewingTender.contactPhone || "—"}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link
                href={`/tenders/${viewingTender.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <span>Open Full Tender Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setViewingTender(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tender Modal */}
      {editingTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Edit Tender: {editingTender.tenderNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  Update technical specifications, timeline, and commercial values
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTender(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tender Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Estimated Value (AED) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={editForm.estimatedValue}
                    onChange={(e) =>
                      setEditForm({ ...editForm, estimatedValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Submission Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.submissionDeadline}
                    onChange={(e) =>
                      setEditForm({ ...editForm, submissionDeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Project Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Scope of Work
                </label>
                <textarea
                  rows={3}
                  value={editForm.scopeOfWork}
                  onChange={(e) => setEditForm({ ...editForm, scopeOfWork: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTender(null)}
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
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Tender</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete tender <strong className="text-slate-900 font-bold">{deletingTender.tenderNumber}</strong> ({deletingTender.title})?
              <span className="block mt-1 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ Note: This action will permanently remove this tender and safely unlink any draft estimations or quotations.
              </span>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTender(null)}
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
