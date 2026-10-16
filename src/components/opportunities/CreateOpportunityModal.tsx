"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { createOpportunity } from "@/actions/opportunityActions";
import { CORE_BUSINESS_ENTITIES } from "@/lib/business-entities";
import { OPPORTUNITY_STAGES } from "@/lib/types";
import {
  X,
  TrendingUp,
  Building,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  User,
  FileText,
  BadgeCheck,
} from "lucide-react";

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountsList: any[];
  entityList?: any[];
}

export default function CreateOpportunityModal({
  isOpen,
  onClose,
  accountsList,
  entityList,
}: CreateOpportunityModalProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [selectedEntityCode, setSelectedEntityCode] = useState("ROAD_INFRA");

  // Deal Details
  const [name, setName] = useState("");
  const [expectedValue, setExpectedValue] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [status, setStatus] = useState("Qualification");
  const [location, setLocation] = useState("Dubai, UAE");
  const [scopeOfWork, setScopeOfWork] = useState("");

  // Account & Contact
  const [accountMode, setAccountMode] = useState<"existing" | "new">("existing");
  const [selectedAccountId, setSelectedAccountId] = useState(accountsList[0]?.id || "");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactDesignation, setContactDesignation] = useState("Project Representative");

  // Helper: auto-populate details when an account is selected
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    const acc = accountsList.find((a) => a.id === accountId);
    if (!acc) return;

    // Auto-populate location from account
    if (acc.address || acc.city) {
      setLocation(acc.address || acc.city || "Dubai, UAE");
    }

    // Auto-populate contacts from account
    const contacts = acc.contacts || [];
    if (contacts.length > 0) {
      const primary = contacts.find((c: any) => c.isPrimary) || contacts[0];
      setSelectedContactId(primary.id);
      setContactName(primary.name || "");
      setContactEmail(primary.email || "");
      setContactPhone(primary.phone || "");
      setContactDesignation(primary.designation || "Project Representative");
    } else {
      setSelectedContactId("primary");
      setContactName(acc.primaryContact || "");
      setContactEmail(acc.email || "");
      setContactPhone(acc.phone || "");
      setContactDesignation("Primary Contact");
    }
  };

  // Helper: auto-populate details when a contact is selected
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const acc = accountsList.find((a) => a.id === selectedAccountId);
    if (!acc) return;

    if (contactId === "custom") {
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactDesignation("Project Representative");
      return;
    }

    if (contactId === "primary") {
      setContactName(acc.primaryContact || "");
      setContactEmail(acc.email || "");
      setContactPhone(acc.phone || "");
      setContactDesignation("Primary Contact");
      return;
    }

    const contacts = acc.contacts || [];
    const foundContact = contacts.find((c: any) => c.id === contactId);
    if (foundContact) {
      setContactName(foundContact.name || "");
      setContactEmail(foundContact.email || "");
      setContactPhone(foundContact.phone || "");
      setContactDesignation(foundContact.designation || "Project Representative");
    }
  };

  // Auto-initialize when modal opens
  useEffect(() => {
    if (isOpen && accountsList && accountsList.length > 0) {
      const initialAcc = accountsList[0];
      handleAccountSelect(initialAcc.id);
    }
  }, [isOpen, accountsList]);

  if (!isOpen) return null;

  const currentSelectedAccount = accountsList.find((a) => a.id === selectedAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Please enter the opportunity / project title.", "error");
      return;
    }

    if (accountMode === "new" && !newAccountName.trim()) {
      showToast("Please enter client / company name.", "error");
      return;
    }

    if (accountMode === "existing" && !selectedAccountId) {
      showToast("Please select an existing account.", "error");
      return;
    }

    setLoading(true);

    try {
      let businessEntityId = "";
      if (entityList && entityList.length > 0) {
        const found = entityList.find(
          (e) => e.code === selectedEntityCode || e.id === selectedEntityCode
        );
        if (found) businessEntityId = found.id;
      }
      if (!businessEntityId) {
        businessEntityId = selectedEntityCode;
      }

      const res = await createOpportunity({
        name,
        customerId: accountMode === "existing" ? selectedAccountId : undefined,
        accountName: accountMode === "new" ? newAccountName : undefined,
        contactId: selectedContactId !== "custom" && selectedContactId !== "primary" ? selectedContactId : undefined,
        contactName: contactName || currentSelectedAccount?.primaryContact || undefined,
        contactEmail: contactEmail || currentSelectedAccount?.email || undefined,
        contactPhone: contactPhone || currentSelectedAccount?.phone || undefined,
        contactDesignation: contactDesignation || undefined,
        businessEntityId,
        expectedValue: expectedValue ? Number(expectedValue) : 0,
        expectedCloseDate: expectedCloseDate || undefined,
        status,
        scopeOfWork,
        location,
        ownerName: "Tender Dept",
      });

      if (res.success) {
        showToast(`Opportunity "${name}" registered successfully!`, "success");
        onClose();
        router.refresh();
      } else {
        showToast(res.error || "Failed to create opportunity", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Create Commercial Opportunity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new pipeline deal with auto-fetched account & contact specifications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION 1: Opportunity & Commercial Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Opportunity & Commercial Details
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opportunity / Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Al Maktoum Airport Expansion Package B"
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Value (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">
                    AED
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    placeholder="250000.00"
                    className="w-full pl-12 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-mono font-bold placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Closing Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-semibold"
                >
                  {OPPORTUNITY_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Emirate (Auto-fetched from Account)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Dubai, UAE"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scope of Work / Project Description
              </label>
              <textarea
                rows={2}
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                placeholder="High-level commercial scope, tender specifications, or deliverables..."
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* SECTION 2: Client & Contact with Auto-Fetch */}
          <div className="space-y-3 p-4 rounded-xl border border-blue-100 bg-blue-50/20">
            <div className="flex items-center justify-between pb-1 border-b border-blue-100">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Client & Contact Person (Auto-Fetched)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMode("existing");
                    if (accountsList.length > 0) handleAccountSelect(accountsList[0].id);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                    accountMode === "existing"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Existing Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMode("new");
                    setSelectedContactId("");
                    setContactName("");
                    setContactEmail("");
                    setContactPhone("");
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                    accountMode === "new"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  + New Account
                </button>
              </div>
            </div>

            {accountMode === "existing" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Account Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Account <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => handleAccountSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-semibold"
                  >
                    {accountsList.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Contact Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => handleContactSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-semibold"
                  >
                    {currentSelectedAccount?.contacts && currentSelectedAccount.contacts.length > 0 ? (
                      <>
                        {currentSelectedAccount.contacts.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.designation ? `(${c.designation})` : ""} {c.isPrimary ? "• Primary" : ""}
                          </option>
                        ))}
                        <option value="custom">+ Other / New Contact</option>
                      </>
                    ) : (
                      <>
                        <option value="primary">
                          {currentSelectedAccount?.primaryContact || "Primary Contact"} (Account Default)
                        </option>
                        <option value="custom">+ Other / New Contact</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Client / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={accountMode === "new"}
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g. Emaar Properties PJSC"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Auto-Fetched Contact Details (Visible & Editable) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Contact Name</span>
                  {selectedContactId !== "custom" && (
                    <span className="text-[10px] text-blue-600 font-bold">Auto-Fetched</span>
                  )}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  {selectedContactId !== "custom" && (
                    <span className="text-[10px] text-blue-600 font-bold">Auto-Fetched</span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@client.ae"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Phone Number</span>
                  {selectedContactId !== "custom" && (
                    <span className="text-[10px] text-blue-600 font-bold">Auto-Fetched</span>
                  )}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+971 4 000 0000"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Business Unit Selection (8 Operating Units - Kept in Last) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>3. Business Unit Selection</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                8 Operating Units
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CORE_BUSINESS_ENTITIES.map((ent) => {
                const isSelected = selectedEntityCode === ent.code;
                return (
                  <button
                    key={ent.code}
                    type="button"
                    onClick={() => setSelectedEntityCode(ent.code)}
                    className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-3 h-3 rounded-full ring-2 ring-white shadow-2xs ${
                          isSelected ? "bg-[#0176d3]" : "bg-slate-300"
                        }`}
                      />
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#0176d3]" />
                      )}
                    </div>
                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {ent.shortName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {ent.code}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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
                  <span>Registering Deal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Create Commercial Opportunity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
