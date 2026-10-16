"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatAED } from "@/lib/calculations";
import { updateContract, deleteContract } from "@/actions/contractActions";
import {
  FileSignature,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  Building,
  Calendar,
  ExternalLink,
  ChevronRight,
  FolderKanban,
} from "lucide-react";

interface ContractsTableClientProps {
  initialContracts: any[];
}

export default function ContractsTableClient({
  initialContracts,
}: ContractsTableClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewingContract, setViewingContract] = useState<any>(null);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [deletingContract, setDeletingContract] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editForm, setEditForm] = useState({
    contractValue: 0,
    startDate: "",
    completionDate: "",
    paymentTerms: "",
    clientPoNumber: "",
    agreedScope: "",
    status: "Active",
  });

  const filteredContracts = initialContracts.filter((c) => {
    return (
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.businessEntity?.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.clientPoNumber && c.clientPoNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleOpenEdit = (c: any) => {
    setEditForm({
      contractValue: c.contractValue || 0,
      startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "",
      completionDate: c.completionDate
        ? new Date(c.completionDate).toISOString().split("T")[0]
        : "",
      paymentTerms: c.paymentTerms || "",
      clientPoNumber: c.clientPoNumber || "",
      agreedScope: c.agreedScope || "",
      status: c.status || "Active",
    });
    setEditingContract(c);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    setIsSaving(true);
    const res = await updateContract(editingContract.id, {
      contractValue: Number(editForm.contractValue),
      startDate: editForm.startDate,
      completionDate: editForm.completionDate,
      paymentTerms: editForm.paymentTerms,
      clientPoNumber: editForm.clientPoNumber,
      agreedScope: editForm.agreedScope,
      status: editForm.status,
    });
    setIsSaving(false);

    if (res.success) {
      showToast(`Contract ${editingContract.contractNumber} updated!`, "success");
      setEditingContract(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update contract", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingContract) return;

    setIsDeleting(true);
    const res = await deleteContract(deletingContract.id);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Contract ${deletingContract.contractNumber} deleted!`, "success");
      setDeletingContract(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete contract", "error");
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
            placeholder="Search contracts by contract #, client, tender, PO..."
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
                <th className="py-3.5 px-5">Contract #</th>
                <th className="py-3.5 px-4">Tender & Client</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4 text-right">Contract Value</th>
                <th className="py-3.5 px-4">Timeline</th>
                <th className="py-3.5 px-4">Active Project</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileSignature className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <span className="font-bold text-slate-700 block">No awarded contracts found</span>
                    <span className="text-xs text-slate-400">
                      Contracts are created when a GM-approved quotation is accepted by the client.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      <span className="text-blue-600">{c.contractNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{c.tender?.title}</div>
                      <div className="text-[11px] text-slate-500">{c.customer?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${c.businessEntity?.color || "#2563eb"}15`,
                          color: c.businessEntity?.color || "#2563eb",
                          borderColor: `${c.businessEntity?.color || "#2563eb"}30`,
                        }}
                      >
                        {c.businessEntity?.shortName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatAED(c.contractValue)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {new Date(c.startDate).toLocaleDateString("en-GB")} →{" "}
                      {new Date(c.completionDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.projects && c.projects.length > 0 ? (
                        <Link
                          href={`/projects/${c.projects[0].id}`}
                          className="font-mono text-[11px] text-blue-600 font-bold hover:underline"
                        >
                          {c.projects[0].projectNumber}
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic">Not initialized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1. View Details (Direct Dedicated Workspace) */}
                        <Link
                          href={`/contracts/${c.id}`}
                          title="View Contract Workspace"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>

                        {/* 2. Edit Contract */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Contract Terms"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>

                        {/* 3. Delete Contract */}
                        {(!c.projects || c.projects.length === 0) && (
                          <button
                            type="button"
                            onClick={() => setDeletingContract(c)}
                            title="Delete Contract"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        )}

                        {/* 4. Manage Link */}
                        <Link
                          href={`/contracts/${c.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition shrink-0"
                        >
                          <span>Manage →</span>
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

      {/* View Contract Modal */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {viewingContract.contractNumber}
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  {viewingContract.tender?.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {viewingContract.businessEntity?.name} • Client: {viewingContract.customer?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingContract(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {viewingContract.status}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Contract Value</span>
                <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                  {formatAED(viewingContract.contractValue)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Start Date</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {new Date(viewingContract.startDate).toLocaleDateString("en-GB")}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Completion Date</span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {new Date(viewingContract.completionDate).toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div><strong>Client PO Number:</strong> {viewingContract.clientPoNumber || "Pending Issuance"}</div>
              <div><strong>Payment Terms:</strong> {viewingContract.paymentTerms || "Standard 30 Days"}</div>
              {viewingContract.agreedScope && (
                <div>
                  <strong>Agreed Scope:</strong>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{viewingContract.agreedScope}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link
                href={`/contracts/${viewingContract.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
              >
                <span>Open Contract Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setViewingContract(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contract Modal */}
      {editingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Edit Contract: {editingContract.contractNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  Update contract value, timelines, and PO references
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingContract(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contract Value (AED) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={editForm.contractValue}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contractValue: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.completionDate}
                    onChange={(e) => setEditForm({ ...editForm, completionDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Client PO Number
                </label>
                <input
                  type="text"
                  value={editForm.clientPoNumber}
                  onChange={(e) => setEditForm({ ...editForm, clientPoNumber: e.target.value })}
                  placeholder="e.g. PO-DM-2026-991"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
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
                  placeholder="e.g. 10% Advance, 90% progress billing"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Agreed Scope
                </label>
                <textarea
                  rows={3}
                  value={editForm.agreedScope}
                  onChange={(e) => setEditForm({ ...editForm, agreedScope: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
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
                  <span>{isSaving ? "Saving..." : "Save Contract"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Awarded Contract</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete contract <strong className="text-slate-900 font-bold">{deletingContract.contractNumber}</strong>?
              <span className="block mt-1 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ Note: This will delete the contract record. Any linked operational projects must be deleted first.
              </span>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingContract(null)}
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
