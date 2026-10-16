"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAED } from "@/lib/calculations";
import { CORE_BUSINESS_ENTITIES } from "@/lib/business-entities";
import { OPPORTUNITY_STAGES } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { deleteOpportunity } from "@/actions/opportunityActions";
import CreateOpportunityModal from "./CreateOpportunityModal";
import ViewOpportunityModal from "./ViewOpportunityModal";
import EditOpportunityModal from "./EditOpportunityModal";
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  Building,
  Calendar,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileCheck2,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";

interface OpportunitiesTableClientProps {
  initialOpportunities: any[];
  accountsList?: any[];
  entityList?: any[];
}

export default function OpportunitiesTableClient({
  initialOpportunities,
  accountsList = [],
  entityList = [],
}: OpportunitiesTableClientProps) {
  const router = useRouter();
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOpp, setViewingOpp] = useState<any>(null);
  const [editingOpp, setEditingOpp] = useState<any>(null);
  const [deletingOpp, setDeletingOpp] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeleteOpp = async () => {
    if (!deletingOpp) return;
    setIsDeleting(true);
    const res = await deleteOpportunity(deletingOpp.id, true);
    setIsDeleting(false);
    if (res.success) {
      showToast(`Opportunity "${deletingOpp.name}" deleted successfully!`, "success");
      setDeletingOpp(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete opportunity", "error");
    }
  };

  const filteredOpportunities = initialOpportunities.filter((opp) => {
    const matchesSearch =
      opp.oppNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.account?.name && opp.account.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opp.contact?.name && opp.contact.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEntity =
      selectedEntity === "ALL" ||
      opp.businessEntity?.code === selectedEntity ||
      opp.businessEntityId === selectedEntity;

    const matchesStage = selectedStage === "ALL" || opp.status === selectedStage;

    return matchesSearch && matchesEntity && matchesStage;
  });

  const totalDeals = initialOpportunities.length;
  const inGMApproval = initialOpportunities.filter((o) => o.status === "GM Approval").length;
  const wonDeals = initialOpportunities.filter((o) => o.status === "Closed Won").length;
  const totalPipelineValue = initialOpportunities.reduce(
    (acc, o) => acc + (o.expectedValue || 0),
    0
  );
  const wonPipelineValue = initialOpportunities
    .filter((o) => o.status === "Closed Won")
    .reduce((acc, o) => acc + (o.expectedValue || 0), 0);

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case "Closed Won":
      case "GM Approval":
        return "bg-blue-50 text-blue-700 border-blue-200 font-bold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Pipeline Deals
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalDeals}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            At GM Approval Gate
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {inGMApproval}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Closed Won (Awarded)
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {wonDeals}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Pipeline Value
          </div>
          <div className="text-lg font-black text-slate-900 mt-1 truncate">
            {formatAED(totalPipelineValue)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search opportunity #, deal name, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Business Unit Filter (8 Operating Units) */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
          >
            <option value="ALL">All Business Units (8)</option>
            {CORE_BUSINESS_ENTITIES.map((ent) => (
              <option key={ent.code} value={ent.code}>
                {ent.shortName}
              </option>
            ))}
          </select>

          {/* 8 Stages Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
          >
            <option value="ALL">All 8 Stages</option>
            {OPPORTUNITY_STAGES.map((stg) => (
              <option key={stg} value={stg}>
                {stg}
              </option>
            ))}
          </select>
        </div>

        {/* Create Opportunity Button */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Deal / Opportunity</th>
                <th className="px-4 py-3.5">Account & Contact</th>
                <th className="px-4 py-3.5">Business Unit</th>
                <th className="px-4 py-3.5">Expected Value</th>
                <th className="px-4 py-3.5">Close Target</th>
                <th className="px-4 py-3.5">Stage (8 Stages)</th>
                <th className="px-4 py-3.5">Commercial Assets</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No commercial opportunities found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => {
                  return (
                    <tr
                      key={opp.id}
                      className="hover:bg-slate-50/90 transition group"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] text-[#0176d3] font-bold block">
                          {opp.oppNumber}
                        </span>
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="font-bold text-slate-900 hover:text-[#0176d3] block truncate max-w-xs text-sm"
                        >
                          {opp.name}
                        </Link>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {opp.account?.name || "Client"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {opp.contact?.name || "Contact TBD"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                          {opp.businessEntity?.shortName}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {formatAED(opp.expectedValue)}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 text-xs font-medium">
                        {new Date(opp.expectedCloseDate).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStageBadgeColor(
                            opp.status
                          )}`}
                        >
                          {opp.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {opp.tender ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium" title={opp.tender.tenderNumber}>
                              TND
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                          {opp.quotations?.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
                              QT ({opp.quotations.length})
                            </span>
                          )}
                          {opp.contracts?.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium">
                              CON
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. View Details (Direct Dedicated Workspace) */}
                          <Link
                            href={`/opportunities/${opp.id}`}
                            title="View Deal Workspace"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </Link>

                          {/* 2. Edit Opportunity */}
                          <button
                            type="button"
                            onClick={() => setEditingOpp(opp)}
                            title="Edit Deal"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>

                          {/* 3. Delete Opportunity */}
                          <button
                            type="button"
                            onClick={() => setDeletingOpp(opp)}
                            title="Delete Deal"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
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

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <CreateOpportunityModal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          accountsList={accountsList}
          entityList={entityList}
        />
      )}

      {/* View Opportunity Modal */}
      {viewingOpp && (
        <ViewOpportunityModal
          isOpen={true}
          opp={viewingOpp}
          onClose={() => setViewingOpp(null)}
          onEdit={() => {
            const current = viewingOpp;
            setViewingOpp(null);
            setEditingOpp(current);
          }}
        />
      )}

      {/* Edit Opportunity Modal */}
      {editingOpp && (
        <EditOpportunityModal
          isOpen={true}
          opp={editingOpp}
          accountsList={accountsList}
          entityList={entityList}
          onClose={() => setEditingOpp(null)}
        />
      )}

      {/* Delete Opportunity Confirmation Modal */}
      {deletingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Commercial Opportunity</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete opportunity <strong className="text-slate-900 font-bold">{deletingOpp.name}</strong> ({deletingOpp.oppNumber})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingOpp(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOpp}
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
