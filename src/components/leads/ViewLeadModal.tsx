"use client";

import React from "react";
import Link from "next/link";
import { formatAED } from "@/lib/calculations";
import {
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Target,
  FileText,
  Sparkles,
  ExternalLink,
  Edit,
} from "lucide-react";

interface ViewLeadModalProps {
  isOpen: boolean;
  lead: any;
  onClose: () => void;
  onEdit?: () => void;
  onConvert?: () => void;
}

export default function ViewLeadModal({
  isOpen,
  lead,
  onClose,
  onEdit,
  onConvert,
}: ViewLeadModalProps) {
  if (!isOpen || !lead) return null;

  const isQualified = lead.status === "Qualified";
  const isConverted = lead.status === "Converted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {lead.businessEntity?.shortName || "Commercial Lead"}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  lead.status === "Qualified" || lead.status === "Converted"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {lead.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
              {lead.company}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Created on {new Date(lead.createdAt).toLocaleDateString("en-GB")} by {lead.ownerName || "Sales Team"}
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

        {/* Lead Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Contact Person Card */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Key Contact Person
            </span>
            <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
            <div className="text-slate-500 text-[11px]">{lead.jobTitle || "Client Representative"}</div>

            <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline truncate">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{lead.location || "Dubai, UAE"}</span>
              </div>
            </div>
          </div>

          {/* Commercial Scope Card */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Commercial Estimate
            </span>
            <div className="text-xl font-black text-slate-900">
              {lead.estimatedValue ? formatAED(lead.estimatedValue) : "AED 0"}
            </div>
            <div className="text-[11px] text-slate-500">Lead Source: <strong>{lead.source || "Direct"}</strong></div>

            <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Target Close:{" "}
                  <strong>
                    {lead.expectedClosingDate
                      ? new Date(lead.expectedClosingDate).toLocaleDateString("en-GB")
                      : "Not set"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Division: <strong>{lead.businessEntity?.name || "General"}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements & Notes */}
        {(lead.requirement || lead.notes) && (
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2 text-xs">
            {lead.requirement && (
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Project Scope / Requirement:</span>
                <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {lead.requirement}
                </p>
              </div>
            )}
            {lead.notes && (
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Internal Notes:</span>
                <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Converted Deal Notice */}
        {isConverted && lead.opportunity?.id && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-blue-900 block">Lead Converted to Commercial Deal</span>
              <span className="text-blue-700 text-[11px]">
                Linked Opportunity: {lead.opportunity.oppNumber || lead.opportunity.name}
              </span>
            </div>
            <Link
              href={`/opportunities/${lead.opportunity.id}`}
              className="px-3 py-1.5 rounded-lg bg-[#0176d3] text-white font-bold hover:bg-[#015ba5] transition flex items-center gap-1 shrink-0"
            >
              <span>View Deal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href={`/leads/${lead.id}`}
            className="text-xs font-semibold text-[#0176d3] hover:underline flex items-center gap-1"
          >
            <span>Open Dedicated Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Lead</span>
              </button>
            )}

            {isQualified && onConvert && (
              <button
                type="button"
                onClick={onConvert}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Convert Lead</span>
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
