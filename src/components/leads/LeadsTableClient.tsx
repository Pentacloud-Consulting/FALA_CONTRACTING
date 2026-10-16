"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAED } from "@/lib/calculations";
import { CORE_BUSINESS_ENTITIES } from "@/lib/business-entities";
import { useApp } from "@/context/AppContext";
import { deleteLead } from "@/actions/leadActions";
import CreateLeadModal from "./CreateLeadModal";
import ConvertLeadModal from "./ConvertLeadModal";
import EditLeadModal from "./EditLeadModal";
import {
  Search,
  Plus,
  Filter,
  ArrowRight,
  TrendingUp,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";

interface LeadsTableClientProps {
  initialLeads: any[];
  entityList: any[];
  accountsList: any[];
}

export default function LeadsTableClient({
  initialLeads,
  entityList,
  accountsList,
}: LeadsTableClientProps) {
  const router = useRouter();
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState<any>(null);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [deletingLead, setDeletingLead] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeleteLead = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    const res = await deleteLead(deletingLead.id);
    setIsDeleting(false);
    if (res.success) {
      showToast(`Lead "${deletingLead.company}" deleted successfully!`, "success");
      setDeletingLead(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete lead", "error");
    }
  };

  // Filtered Leads
  const filteredLeads = initialLeads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.jobTitle && l.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.location && l.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEntity =
      selectedEntity === "ALL" ||
      l.businessEntity?.code === selectedEntity ||
      l.businessEntityId === selectedEntity;

    const matchesStatus = selectedStatus === "ALL" || l.status === selectedStatus;

    return matchesSearch && matchesEntity && matchesStatus;
  });

  // Calculate Metrics
  const totalLeads = initialLeads.length;
  const inQualification = initialLeads.filter((l) =>
    ["New", "Contacted", "Under Qualification"].includes(l.status)
  ).length;
  const qualifiedCount = initialLeads.filter((l) => l.status === "Qualified").length;
  const convertedCount = initialLeads.filter((l) => l.status === "Converted").length;
  const totalValue = initialLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Qualified":
      case "Converted":
        return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      case "Contacted":
      case "Under Qualification":
        return "bg-slate-100 text-slate-800 border-slate-200 font-medium";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* High-Contrast Crisp White KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Leads
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalLeads}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            In Qualification
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {inQualification}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Qualified
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {qualifiedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Converted Deals
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {convertedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs col-span-2 md:col-span-1 hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pipeline Value
          </div>
          <div className="text-lg font-black text-slate-900 mt-1 truncate">
            {formatAED(totalValue)}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Business Unit Filter (8 Operating Units) */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
          >
            <option value="ALL">All Business Units (8)</option>
            {CORE_BUSINESS_ENTITIES.map((ent) => (
              <option key={ent.code} value={ent.code}>
                {ent.shortName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Under Qualification">Under Qualification</option>
            <option value="Qualified">Qualified (Ready to Convert)</option>
            <option value="Converted">Converted</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>

        {/* Create Lead Button */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Table of Leads */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Client / Company</th>
                <th className="px-4 py-3.5">Business Unit</th>
                <th className="px-4 py-3.5">Contact Person</th>
                <th className="px-4 py-3.5">Est. Value</th>
                <th className="px-4 py-3.5">Stage</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No commercial leads found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isQualified = lead.status === "Qualified";
                  const isConverted = lead.status === "Converted";

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/90 transition group"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block text-sm"
                        >
                          {lead.company}
                        </Link>
                        <span className="text-[11px] font-medium text-slate-400">
                          Created {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                          {lead.businessEntity?.shortName || "General"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{lead.jobTitle || lead.email}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {lead.estimatedValue ? formatAED(lead.estimatedValue) : "—"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 text-xs font-medium">
                        {lead.location || "Dubai, UAE"}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. View Details (Direct Dedicated Workspace) */}
                          <Link
                            href={`/leads/${lead.id}`}
                            title="View Dedicated Lead Workspace"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </Link>

                          {/* 2. Delete Lead */}
                          <button
                            type="button"
                            onClick={() => setDeletingLead(lead)}
                            title="Delete Lead"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        entityList={entityList}
      />

      {/* Convert Lead Modal */}
      {convertingLead && (
        <ConvertLeadModal
          isOpen={true}
          lead={convertingLead}
          existingAccounts={accountsList}
          onClose={() => setConvertingLead(null)}
        />
      )}


      {/* Edit Lead Modal */}
      {editingLead && (
        <EditLeadModal
          isOpen={true}
          lead={editingLead}
          onClose={() => setEditingLead(null)}
        />
      )}

      {/* Delete Lead Confirmation Modal */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Commercial Lead</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete lead <strong className="text-slate-900 font-bold">{deletingLead.company}</strong>?
              {deletingLead.status === "Converted" && (
                <span className="block mt-1 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  ⚠️ Note: This lead was converted into an Opportunity. Deleting it will permanently remove the lead intake record and safely unlink it from the deal.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLead}
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
