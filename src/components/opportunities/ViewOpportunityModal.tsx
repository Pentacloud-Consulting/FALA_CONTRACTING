"use client";

import React from "react";
import Link from "next/link";
import { formatAED } from "@/lib/calculations";
import {
  X,
  FolderKanban,
  Building,
  User,
  Calendar,
  DollarSign,
  MapPin,
  ExternalLink,
  Edit2,
  FileSpreadsheet,
  FileCheck2,
  FileSignature,
} from "lucide-react";

interface ViewOpportunityModalProps {
  isOpen: boolean;
  opp: any;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ViewOpportunityModal({
  isOpen,
  opp,
  onClose,
  onEdit,
}: ViewOpportunityModalProps) {
  if (!isOpen || !opp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {opp.oppNumber}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Stage: {opp.status}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {opp.businessEntity?.shortName}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
              {opp.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Account: <strong className="text-slate-800">{opp.account?.name || "Client"}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Commercial Deal Terms
            </span>
            <div className="text-xl font-black text-slate-900">
              {formatAED(opp.expectedValue)}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Expected Close: <strong>{new Date(opp.expectedCloseDate).toLocaleDateString("en-GB")}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{opp.location || "Dubai, UAE"}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Client & Representative
            </span>
            <div className="font-bold text-slate-900 text-sm">
              {opp.account?.name || "Client Account"}
            </div>
            <div className="text-slate-500 text-[11px]">
              Contact: <strong>{opp.contact?.name || opp.account?.primaryContact || "Designated Contact"}</strong>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-200/60 text-slate-600">
              <div>Email: {opp.contact?.email || opp.account?.email || "—"}</div>
              <div>Phone: {opp.contact?.phone || opp.account?.phone || "—"}</div>
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        {opp.scopeOfWork && (
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 block">Scope of Work:</span>
            <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
              {opp.scopeOfWork}
            </p>
          </div>
        )}

        {/* Linked Commercial Assets */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Linked Tender</span>
            <span className="font-bold text-slate-900 mt-1 block">
              {opp.tender ? opp.tender.tenderNumber : "Not Initiated"}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Quotations</span>
            <span className="font-bold text-slate-900 mt-1 block">
              {opp.quotations?.length || 0} Offers
            </span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Contracts</span>
            <span className="font-bold text-slate-900 mt-1 block">
              {opp.contracts?.length || 0} Backed
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href={`/opportunities/${opp.id}`}
            className="text-xs font-semibold text-[#0176d3] hover:underline flex items-center gap-1"
          >
            <span>Open Deal Workspace & Specifications</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Deal</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
