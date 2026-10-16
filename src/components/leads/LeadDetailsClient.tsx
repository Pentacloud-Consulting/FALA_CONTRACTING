"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { updateLeadStage, updateLeadDetails } from "@/actions/leadActions";
import { CORE_BUSINESS_ENTITIES } from "@/lib/business-entities";
import { formatAED } from "@/lib/calculations";
import ConvertLeadModal from "./ConvertLeadModal";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  UserCheck,
  XCircle,
  Save,
  Pencil,
  ChevronDown,
  Copy,
  ExternalLink,
  User,
  Clock,
  RotateCcw,
  Check,
} from "lucide-react";

interface LeadDetailsClientProps {
  lead: any;
  accountsList: any[];
  entityList?: any[];
}

const QUALIFICATION_STAGES = [
  "New",
  "Contacted",
  "Under Qualification",
  "Qualified",
] as const;

export default function LeadDetailsClient({
  lead,
  accountsList,
  entityList,
}: LeadDetailsClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [loadingStage, setLoadingStage] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

  // Salesforce Inline Edit Mode Toggle
  const [isEditing, setIsEditing] = useState(false);

  // Salesforce Tabs & Accordion State
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [leadInfoOpen, setLeadInfoOpen] = useState(true);
  const [businessUnitOpen, setBusinessUnitOpen] = useState(true);

  // SECTION 1: Prospective Client & Contact Details State
  const [company, setCompany] = useState(lead.company || "");
  const [name, setName] = useState(lead.name || "");
  const [email, setEmail] = useState(lead.email || "");
  const [phone, setPhone] = useState(lead.phone || "");
  const [jobTitle, setJobTitle] = useState(lead.jobTitle || "");
  const [source, setSource] = useState(lead.source || "Direct");

  // SECTION 2: Commercial Parameters & Project Scope State (Start Date & End Date)
  let initialStartDate = "";
  let initialEndDate = lead.expectedClosingDate
    ? new Date(lead.expectedClosingDate).toISOString().split("T")[0]
    : "";

  if (lead.specificFieldsJson) {
    try {
      const parsed = JSON.parse(lead.specificFieldsJson);
      if (parsed.startDate) initialStartDate = parsed.startDate;
      if (parsed.endDate) initialEndDate = parsed.endDate;
    } catch (err) {}
  }

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [location, setLocation] = useState(lead.location || "Dubai, UAE");
  const [requirement, setRequirement] = useState(lead.requirement || "");

  // SECTION 3: Business Unit Selection State
  const [selectedEntityCode, setSelectedEntityCode] = useState(
    lead.businessEntity?.code || lead.businessEntityId || "ROAD_INFRA"
  );

  const isConverted = lead.status === "Converted";
  const isDropped = lead.status === "Dropped";
  const isQualified = lead.status === "Qualified";

  const currentStageIndex = QUALIFICATION_STAGES.indexOf(lead.status as any);

  // Use database entities if available, else fallback
  const displayEntities =
    entityList && entityList.length > 0 ? entityList : CORE_BUSINESS_ENTITIES;

  const currentSelectedEntity =
    displayEntities.find(
      (e: any) => e.code === selectedEntityCode || e.id === selectedEntityCode
    ) || displayEntities[0];

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Revert form state back to original lead values
    setCompany(lead.company || "");
    setName(lead.name || "");
    setEmail(lead.email || "");
    setPhone(lead.phone || "");
    setJobTitle(lead.jobTitle || "");
    setSource(lead.source || "Direct");
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setLocation(lead.location || "Dubai, UAE");
    setRequirement(lead.requirement || "");
    setSelectedEntityCode(
      lead.businessEntity?.code || lead.businessEntityId || "ROAD_INFRA"
    );
    setIsEditing(false);
  };

  const handleAdvanceStage = async (nextStatus: string) => {
    setLoadingStage(true);
    const res = await updateLeadStage(lead.id, nextStatus);
    setLoadingStage(false);

    if (res.success) {
      showToast(`Lead stage updated to ${nextStatus}`, "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed to update stage", "error");
    }
  };

  const handleSaveLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!company.trim() || !name.trim() || !email.trim() || !phone.trim()) {
      showToast("Company, contact name, email, and phone are required.", "error");
      return;
    }

    setSavingLead(true);
    let resolvedEntityId = selectedEntityCode;
    if (entityList && entityList.length > 0) {
      const found = entityList.find(
        (ent: any) =>
          ent.code === selectedEntityCode || ent.id === selectedEntityCode
      );
      if (found) resolvedEntityId = found.id;
    }

    // Preserve existing extra fields in specificFieldsJson while updating dates
    const specificObj: any = {};
    if (lead.specificFieldsJson) {
      try {
        Object.assign(specificObj, JSON.parse(lead.specificFieldsJson));
      } catch (err) {}
    }
    if (startDate) specificObj.startDate = startDate;
    if (endDate) specificObj.endDate = endDate;

    const res = await updateLeadDetails(lead.id, {
      company,
      name,
      email,
      phone,
      jobTitle,
      source,
      businessEntityId: resolvedEntityId,
      expectedClosingDate: endDate || undefined,
      specificFieldsJson: JSON.stringify(specificObj),
      location,
      requirement,
    });

    setSavingLead(false);

    if (res.success) {
      showToast("Lead details updated successfully!", "success");
      setIsEditing(false);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update lead", "error");
    }
  };

  const copyLeadId = () => {
    navigator.clipboard.writeText(lead.id);
    showToast("Lead ID copied to clipboard", "info");
  };

  const getSourceLabel = (src: string) => {
    switch (src) {
      case "Direct":
        return "Direct Client Inquiry";
      case "RTA Portal":
        return "RTA / Gov Tender Portal";
      case "Referral":
        return "Executive Referral";
      case "Expo":
        return "Industry Expo / Exhibition";
      case "Website":
        return "Digital Website Form";
      default:
        return src || "--";
    }
  };

  return (
    <div className="space-y-3 pb-16">
      {/* 1. TOP HEADER SECTION: SALESFORCE RECORD BANNER */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/leads"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
            title="Back to Leads Register"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <h1 className="text-xl font-black text-slate-900 tracking-tight truncate">
                {company || lead.company}
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0176d3]" />
                {currentSelectedEntity?.shortName || currentSelectedEntity?.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              Contact: <strong className="text-slate-800">{name || lead.name}</strong> • Phone:{" "}
              <span className="font-mono text-slate-700">{phone || lead.phone}</span> • Email:{" "}
              <span className="text-slate-700">{email || lead.email}</span> • Lead ID:{" "}
              <span className="font-mono text-slate-400">#{lead.id.slice(-6)}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isQualified && !isConverted && (
            <button
              type="button"
              onClick={() => setShowConvertModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Convert to Opportunity</span>
            </button>
          )}

          {isConverted && lead.opportunity?.id && (
            <Link
              href={`/opportunities/${lead.opportunity.id}`}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Open Commercial Deal ↗</span>
            </Link>
          )}

          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Lead</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveLead()}
                disabled={savingLead}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingLead ? "Saving..." : "Save"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SALESFORCE-STYLE CHEVRON PIPELINE PATH */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-2xs space-y-2">
        <div className="flex items-center w-full overflow-x-auto no-scrollbar py-0.5">
          {QUALIFICATION_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx || isConverted;
            const isCurrent = lead.status === stage;
            const isFirst = idx === 0;
            const isLast = idx === QUALIFICATION_STAGES.length - 1;

            return (
              <button
                key={stage}
                type="button"
                onClick={() => !isConverted && !isDropped && handleAdvanceStage(stage)}
                disabled={loadingStage || isConverted || isDropped}
                style={{
                  clipPath: isFirst
                    ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
                    : isLast
                    ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)"
                    : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
                }}
                className={`relative flex-1 min-w-[125px] sm:min-w-0 py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-default select-none ${
                  idx > 0 ? "-ml-2" : ""
                } ${
                  isCurrent
                    ? "bg-[#032d60] text-white z-20 shadow-xs"
                    : isCompleted
                    ? "bg-[#0176d3] text-white z-10 hover:bg-[#015ba5]"
                    : "bg-[#eef4f9] text-slate-700 hover:bg-[#dce8f5] z-0"
                }`}
                title={`Click to set stage to ${stage}`}
              >
                {isCompleted && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                )}
                <span className="truncate">{stage}</span>
              </button>
            );
          })}
        </div>

        {/* Pipeline Stage Action Bar */}
        <div className="flex items-center justify-between px-1.5 pt-1 text-xs">
          <div>
            {!isDropped && !isConverted ? (
              <button
                type="button"
                onClick={() => handleAdvanceStage("Dropped")}
                disabled={loadingStage}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                title="Mark Lead as Dropped"
              >
                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Mark Lead as Dropped</span>
              </button>
            ) : isDropped ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-slate-400" /> Lead Dropped
                </span>
                <button
                  type="button"
                  onClick={() => handleAdvanceStage("New")}
                  disabled={loadingStage}
                  className="text-[#0176d3] hover:underline font-semibold cursor-pointer"
                >
                  Reopen Lead
                </button>
              </div>
            ) : (
              <span className="text-blue-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0176d3]" /> Lead Converted
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isConverted && !isDropped && (
              <>
                {lead.status === "New" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStage("Contacted")}
                    disabled={loadingStage}
                    className="px-3.5 py-1 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    Mark as Contacted →
                  </button>
                )}
                {lead.status === "Contacted" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStage("Under Qualification")}
                    disabled={loadingStage}
                    className="px-3.5 py-1 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    To Under Qualification →
                  </button>
                )}
                {lead.status === "Under Qualification" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStage("Qualified")}
                    disabled={loadingStage}
                    className="px-3.5 py-1 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Qualified</span>
                  </button>
                )}
                {lead.status === "Qualified" && (
                  <button
                    type="button"
                    onClick={() => setShowConvertModal(true)}
                    className="px-3.5 py-1 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Convert</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. SALESFORCE UNIFIED FULL-SCREEN RECORD DETAIL CONTAINER */}
      <form
        onSubmit={handleSaveLead}
        className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden"
      >
        {/* Salesforce Lightning Tab Header */}
        <div className="flex items-center gap-6 border-b border-slate-200 px-5 pt-1 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "details"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "activity"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Activity</span>
          </button>
        </div>

        {activeTab === "activity" ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium text-slate-600">Lead Activity Log & Timeline</p>
            <p className="text-[11px] text-slate-400">
              Created on {new Date(lead.createdAt).toLocaleDateString()} • Current Stage:{" "}
              {lead.status}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/90">
            {/* COLLAPSIBLE SECTION 1: Lead Information (2-Column Salesforce Key-Value Grid) */}
            <div>
              <div
                onClick={() => setLeadInfoOpen(!leadInfoOpen)}
                className="bg-slate-100/75 hover:bg-slate-100/90 transition px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                      leadInfoOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-900 tracking-tight">
                    Lead Information
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Primary corporate stakeholder, decision-maker, and channel acquisition source
                </span>
              </div>

              {leadInfoOpen && (
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
                    {/* LEFT COLUMN: Client & Stakeholder Profile */}
                    <div className="divide-y divide-slate-100">
                      {/* Lead Owner */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                        <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Lead Owner
                        </span>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {lead.ownerName || "Sales Team"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                          {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                          <span>Company</span>
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              required
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="e.g. Pentacloud Consulting"
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {company || "--"}
                              </span>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Primary Contact Person (Name) */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                          {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                          <span>Name</span>
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Eng. Sultan Al Shamsi"
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <span className="text-xs font-medium text-slate-800 truncate">
                                {name || "--"}
                              </span>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                          {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                          <span>Email</span>
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="sultan.alshamsi@rta.ae"
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <a
                                href={`mailto:${email}`}
                                className="text-xs font-medium text-[#0176d3] hover:underline truncate"
                              >
                                {email || "--"}
                              </a>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                          {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                          <span>Phone</span>
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+971 4 284 4444"
                              className="w-full text-xs text-slate-900 font-mono font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <a
                                href={`tel:${phone}`}
                                className="text-xs font-mono font-medium text-[#0176d3] hover:underline truncate"
                              >
                                {phone || "--"}
                              </a>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Job Title / Designation */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Job Title / Designation
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              placeholder="e.g. Director of Infrastructure Projects"
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <span className="text-xs text-slate-800 truncate">
                                {jobTitle || "--"}
                              </span>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Lead Acquisition Source */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Lead Source
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <select
                              value={source}
                              onChange={(e) => setSource(e.target.value)}
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs cursor-pointer"
                            >
                              <option value="Direct">Direct Client Inquiry</option>
                              <option value="RTA Portal">RTA / Gov Tender Portal</option>
                              <option value="Referral">Executive Referral</option>
                              <option value="Expo">Industry Expo / Exhibition</option>
                              <option value="Website">Digital Website Form</option>
                            </select>
                          ) : (
                            <>
                              <span className="text-xs text-slate-800 truncate">
                                {getSourceLabel(source)}
                              </span>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Lead Reference ID */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                        <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Lead Reference ID
                        </span>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            #{lead.id.slice(-6)}
                          </span>
                          <button
                            type="button"
                            onClick={copyLeadId}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                            title="Copy full Lead ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Commercial Parameters & Status */}
                    <div className="divide-y divide-slate-100">
                      {/* Lead Status */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                        <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Lead Status
                        </span>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {lead.status}
                          </span>
                        </div>
                      </div>

                      {/* Operating Business Unit */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                          {isEditing && <span className="text-[#0176d3] font-bold mr-1">*</span>}
                          <span>Operating Division</span>
                        </span>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-[#0176d3]" />
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {currentSelectedEntity?.shortName || currentSelectedEntity?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              ({currentSelectedEntity?.code})
                            </span>
                          </div>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={handleStartEdit}
                              className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                              title="Click to change operating unit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Start Date */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Start Date (Optional)
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <span className="text-xs text-slate-800">
                                {startDate ? new Date(startDate).toLocaleDateString() : "--"}
                              </span>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          End Date (Optional)
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <span className="text-xs text-slate-800">
                                {endDate ? new Date(endDate).toLocaleDateString() : "--"}
                              </span>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Location / Emirate */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Location / Emirate
                        </label>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="Dubai, UAE"
                              className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                            />
                          ) : (
                            <>
                              <span className="text-xs text-slate-800 truncate">
                                {location || "Dubai, UAE"}
                              </span>
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0"
                                title="Click to edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Estimated Value */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                        <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Estimated Value (AED)
                        </span>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {lead.estimatedValue > 0
                              ? formatAED(lead.estimatedValue)
                              : "Flexible / TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                        <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Created Date
                        </span>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          <span className="text-xs text-slate-700">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Converted Deal */}
                      <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                        <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                          Converted Deal
                        </span>
                        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                          {lead.opportunity?.id ? (
                            <Link
                              href={`/opportunities/${lead.opportunity.id}`}
                              className="text-xs font-bold text-[#0176d3] hover:underline flex items-center gap-1"
                            >
                              <span>{lead.opportunity.oppNumber || "Open Deal"}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not Converted</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FULL-WIDTH SCOPE ROW */}
                  <div className="p-4 bg-white hover:bg-slate-50/50 transition group space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-500 font-medium">
                        Project Requirement / Scope of Work Overview
                      </label>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        placeholder="Briefly describe client requirements, tender package, or site specifications..."
                        className="w-full text-xs text-slate-900 font-medium px-3 py-2 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs resize-none"
                      />
                    ) : (
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-2.5 rounded border border-slate-100">
                        {requirement || "--"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* COLLAPSIBLE SECTION 2: Business Unit Selection (8 Operating Units Full Width) */}
            <div>
              <div
                onClick={() => setBusinessUnitOpen(!businessUnitOpen)}
                className="bg-slate-100/75 hover:bg-slate-100/90 transition px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                      businessUnitOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-900 tracking-tight">
                    3. Business Unit Selection <span className="text-[#0176d3]">*</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  8 Operating Units
                </span>
              </div>

              {businessUnitOpen && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                    {displayEntities.map((ent: any) => {
                      const isSelected =
                        selectedEntityCode === ent.code ||
                        selectedEntityCode === ent.id ||
                        lead.businessEntityId === ent.id;

                      return (
                        <button
                          key={ent.code || ent.id}
                          type="button"
                          onClick={() => {
                            setSelectedEntityCode(ent.code || ent.id);
                            if (!isEditing) setIsEditing(true);
                          }}
                          className={`p-2.5 rounded-xl text-left border transition relative flex flex-col justify-between cursor-pointer min-h-[64px] ${
                            isSelected
                              ? "border-[#0176d3] bg-blue-50/80 shadow-2xs ring-2 ring-blue-500/20"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`w-2 h-2 rounded-full ring-2 ring-white shrink-0 ${
                                isSelected ? "bg-[#0176d3]" : "bg-slate-300"
                              }`}
                            />
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0176d3] shrink-0" />
                            )}
                          </div>
                          <div className="mt-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                              {ent.shortName || ent.name}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {ent.code}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION FOOTER INSIDE SALESFORCE CONTAINER */}
            <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <Link
                href="/leads"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
              >
                <span>← Back to Leads</span>
              </Link>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Lead</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingLead}
                      className="px-5 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingLead ? "Saving..." : "Save"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* 4. SALESFORCE EDIT MODE STICKY BOTTOM DOCK (CANCEL / SAVE) */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 shadow-2xl flex items-center justify-center gap-3 animate-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100 shadow-2xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSaveLead()}
            disabled={savingLead}
            className="px-6 py-1.5 text-xs font-semibold text-white bg-[#0176d3] hover:bg-[#014486] active:bg-[#00396b] rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {savingLead ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      )}

      {/* Convert Lead Modal */}
      {showConvertModal && (
        <ConvertLeadModal
          isOpen={true}
          lead={lead}
          existingAccounts={accountsList}
          onClose={() => setShowConvertModal(false)}
        />
      )}
    </div>
  );
}
