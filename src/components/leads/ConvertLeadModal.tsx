"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { convertLeadAction } from "@/actions/leadActions";
import { formatAED } from "@/lib/calculations";
import {
  X,
  ArrowRight,
  Building,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ConvertLeadModalProps {
  lead: any;
  existingAccounts?: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvertLeadModal({
  lead,
  existingAccounts = [],
  isOpen,
  onClose,
}: ConvertLeadModalProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [loading, setLoading] = useState(false);

  // Section 1: Account Options
  const [accountMode, setAccountMode] = useState<"new" | "existing">("new");
  const [selectedAccountId, setSelectedAccountId] = useState(
    existingAccounts.length > 0 ? existingAccounts[0].id : ""
  );
  const [accountName, setAccountName] = useState(lead?.company || "");
  const [accountTrn, setAccountTrn] = useState("100293847500003");
  const [accountAddress, setAccountAddress] = useState(lead?.location || "Business Bay, Dubai");
  const [accountCity, setAccountCity] = useState("Dubai");
  const [accountIndustry, setAccountIndustry] = useState(
    lead?.businessEntity?.name || "Infrastructure Contracting"
  );

  // Section 2: Contact Options
  const [contactMode, setContactMode] = useState<"new" | "existing">("new");
  const [contactName, setContactName] = useState(lead?.name || "");
  const [contactDesignation, setContactDesignation] = useState(
    lead?.jobTitle || "Procurement Director"
  );
  const [contactEmail, setContactEmail] = useState(lead?.email || "");
  const [contactPhone, setContactPhone] = useState(lead?.phone || "");

  // Section 3: Opportunity
  const defaultCloseDate = lead?.expectedClosingDate
    ? new Date(lead.expectedClosingDate).toISOString().split("T")[0]
    : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [oppName, setOppName] = useState(
    `${lead?.company || "Client"} - ${lead?.businessEntity?.shortName || "Commercial Contract"}`
  );
  const [expectedValue, setExpectedValue] = useState(
    lead?.estimatedValue !== undefined ? String(lead.estimatedValue) : "0"
  );
  const [expectedCloseDate, setExpectedCloseDate] = useState(defaultCloseDate);
  const [scopeOfWork, setScopeOfWork] = useState(
    lead?.requirement || "Commercial Scope defined during lead qualification."
  );

  if (!isOpen || !lead) return null;

  // Specific dynamic fields count
  let dynamicFieldsCount = 0;
  if (lead.specificFieldsJson) {
    try {
      const parsed = JSON.parse(lead.specificFieldsJson);
      dynamicFieldsCount = Object.keys(parsed).length;
    } catch {
      dynamicFieldsCount = 0;
    }
  }

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await convertLeadAction({
        leadId: lead.id,
        existingAccountId: accountMode === "existing" ? selectedAccountId : undefined,
        accountName: accountMode === "new" ? accountName : undefined,
        accountTrn: accountMode === "new" ? accountTrn : undefined,
        accountAddress: accountMode === "new" ? accountAddress : undefined,
        accountCity: accountMode === "new" ? accountCity : undefined,
        accountIndustry: accountMode === "new" ? accountIndustry : undefined,
        contactName: contactMode === "new" ? contactName : undefined,
        contactDesignation: contactMode === "new" ? contactDesignation : undefined,
        contactEmail: contactMode === "new" ? contactEmail : undefined,
        contactPhone: contactMode === "new" ? contactPhone : undefined,
        opportunityName: oppName,
        expectedValue: Number(expectedValue) || 0,
        expectedCloseDate,
        scopeOfWork,
      });

      if (res.success) {
        const result = res as any;
        showToast(
          result.alreadyConverted
            ? "Lead was already converted. Opening opportunity..."
            : "Lead successfully converted to Account, Contact & Opportunity!",
          "success"
        );
        onClose();
        if (result.opportunity?.id) {
          router.push(`/opportunities/${result.opportunity.id}`);
        } else {
          router.push("/opportunities");
        }
      } else {
        showToast(res.error || "Failed to convert lead.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-[#0176d3] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Convert Qualified Lead</h2>
              <p className="text-xs text-blue-100">
                1-Action Atomic Conversion: Creates or links Account & Contact, and creates Opportunity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Business Unit Banner */}
        <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-200 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Business Unit Mapping:</strong> Division-specific technical specifications will be configured in the created Opportunity.
            </span>
          </div>
          <span className="font-semibold px-2 py-0.5 rounded bg-blue-200/70 text-blue-900 text-[11px]">
            {lead.businessEntity?.shortName}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConvert} className="p-6 space-y-6 max-h-[72vh] overflow-y-auto bg-white">
          {/* SECTION 1: Account */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Customer Account
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-slate-200/70 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setAccountMode("new")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    accountMode === "new"
                      ? "bg-white text-blue-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Create New Account
                </button>
                {existingAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAccountMode("existing")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      accountMode === "existing"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Link Existing
                  </button>
                )}
              </div>
            </div>

            {accountMode === "new" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax Registration Number (TRN)
                  </label>
                  <input
                    type="text"
                    value={accountTrn}
                    onChange={(e) => setAccountTrn(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    value={accountIndustry}
                    onChange={(e) => setAccountIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address / Emirate
                  </label>
                  <input
                    type="text"
                    value={accountAddress}
                    onChange={(e) => setAccountAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Existing Client Account <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                >
                  {existingAccounts.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name} ({acc.city || "Dubai"})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SECTION 2: Contact */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Authorized Contact Person
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500">Linked to Account</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={contactDesignation}
                  onChange={(e) => setContactDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Opportunity */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Commercial Opportunity (8-Stage Pipeline)
                </h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                Initial Stage: Qualification
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opportunity Deal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={oppName}
                  onChange={(e) => setOppName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Deal Value (AED)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono font-bold shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Close Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope of Work Overview
                </label>
                <textarea
                  rows={2}
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Lead status will become &quot;Converted&quot;.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <span>Convert Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
