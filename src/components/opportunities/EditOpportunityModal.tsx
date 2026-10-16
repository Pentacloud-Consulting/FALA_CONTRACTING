"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { updateOpportunity } from "@/actions/opportunityActions";
import { OPPORTUNITY_STAGES } from "@/lib/types";
import { CORE_BUSINESS_ENTITIES } from "@/lib/business-entities";
import {
  X,
  Save,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

interface EditOpportunityModalProps {
  isOpen: boolean;
  opp: any;
  accountsList?: any[];
  entityList?: any[];
  onClose: () => void;
}

export default function EditOpportunityModal({
  isOpen,
  opp,
  accountsList = [],
  entityList = [],
  onClose,
}: EditOpportunityModalProps) {
  const router = useRouter();
  const { showToast } = useApp();
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState(opp?.name || "");
  const [expectedValue, setExpectedValue] = useState(opp?.expectedValue || 0);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    opp?.expectedCloseDate
      ? new Date(opp.expectedCloseDate).toISOString().split("T")[0]
      : ""
  );
  const [status, setStatus] = useState(opp?.status || "Qualification");
  const [scopeOfWork, setScopeOfWork] = useState(opp?.scopeOfWork || "");
  const [location, setLocation] = useState(opp?.location || "Dubai, UAE");

  // Account & Contact selection
  const [selectedAccountId, setSelectedAccountId] = useState(
    opp?.customerId || opp?.account?.id || (accountsList[0]?.id || "")
  );
  const [selectedContactId, setSelectedContactId] = useState(
    opp?.contactId || opp?.contact?.id || ""
  );
  const [contactName, setContactName] = useState(
    opp?.contact?.name || opp?.account?.primaryContact || ""
  );
  const [contactEmail, setContactEmail] = useState(
    opp?.contact?.email || opp?.account?.email || ""
  );
  const [contactPhone, setContactPhone] = useState(
    opp?.contact?.phone || opp?.account?.phone || ""
  );
  const [selectedEntityCode, setSelectedEntityCode] = useState(
    opp?.businessEntity?.code || opp?.businessEntityId || "ROAD_INFRA"
  );

  // Auto-fetch when changing Account
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    const acc = accountsList.find((a) => a.id === accountId);
    if (!acc) return;

    if (acc.address || acc.city) {
      setLocation(acc.address || acc.city || "Dubai, UAE");
    }

    const contacts = acc.contacts || [];
    if (contacts.length > 0) {
      const primary = contacts.find((c: any) => c.isPrimary) || contacts[0];
      setSelectedContactId(primary.id);
      setContactName(primary.name || "");
      setContactEmail(primary.email || "");
      setContactPhone(primary.phone || "");
    } else {
      setSelectedContactId("primary");
      setContactName(acc.primaryContact || "");
      setContactEmail(acc.email || "");
      setContactPhone(acc.phone || "");
    }
  };

  // Auto-fetch when changing Contact
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const acc = accountsList.find((a) => a.id === selectedAccountId);
    if (!acc) return;

    if (contactId === "custom") {
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      return;
    }

    if (contactId === "primary") {
      setContactName(acc.primaryContact || "");
      setContactEmail(acc.email || "");
      setContactPhone(acc.phone || "");
      return;
    }

    const contacts = acc.contacts || [];
    const found = contacts.find((c: any) => c.id === contactId);
    if (found) {
      setContactName(found.name || "");
      setContactEmail(found.email || "");
      setContactPhone(found.phone || "");
    }
  };

  useEffect(() => {
    if (opp) {
      setName(opp.name || "");
      setExpectedValue(opp.expectedValue || 0);
      setExpectedCloseDate(
        opp.expectedCloseDate
          ? new Date(opp.expectedCloseDate).toISOString().split("T")[0]
          : ""
      );
      setStatus(opp.status || "Qualification");
      setScopeOfWork(opp.scopeOfWork || "");
      setLocation(opp.location || "Dubai, UAE");

      const initAccId = opp.customerId || opp.account?.id || (accountsList[0]?.id || "");
      setSelectedAccountId(initAccId);

      const initContactId = opp.contactId || opp.contact?.id || "";
      setSelectedContactId(initContactId);

      setContactName(opp.contact?.name || opp.account?.primaryContact || "");
      setContactEmail(opp.contact?.email || opp.account?.email || "");
      setContactPhone(opp.contact?.phone || opp.account?.phone || "");
      setSelectedEntityCode(opp.businessEntity?.code || opp.businessEntityId || "ROAD_INFRA");
    }
  }, [opp]);

  if (!isOpen || !opp) return null;

  const currentSelectedAccount = accountsList.find((a) => a.id === selectedAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Deal name is required.", "error");
      return;
    }

    setSaving(true);

    let resolvedEntityId = "";
    if (entityList && entityList.length > 0) {
      const found = entityList.find(
        (ent) => ent.code === selectedEntityCode || ent.id === selectedEntityCode
      );
      if (found) resolvedEntityId = found.id;
    }
    if (!resolvedEntityId) resolvedEntityId = selectedEntityCode;

    const res = await updateOpportunity(opp.id, {
      name,
      expectedValue: Number(expectedValue) || 0,
      expectedCloseDate: expectedCloseDate || undefined,
      status,
      scopeOfWork,
      location,
      customerId: selectedAccountId || undefined,
      contactId: selectedContactId !== "custom" && selectedContactId !== "primary" ? selectedContactId : undefined,
      businessEntityId: resolvedEntityId || undefined,
    });
    setSaving(false);

    if (res.success) {
      showToast("Opportunity updated successfully!", "success");
      onClose();
      router.refresh();
    } else {
      showToast(res.error || "Failed to update opportunity", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Edit Commercial Deal
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update {opp.oppNumber} parameters, client account, contact, and stage
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SECTION 1: Opportunity Details */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Deal / Opportunity Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Expected Value (AED)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={expectedValue}
                onChange={(e) => setExpectedValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Close Date</label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pipeline Stage (8 Stages)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
              >
                {OPPORTUNITY_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Location / Site</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>
          </div>

          {/* SECTION 2: Client & Contact Person (Auto-Fetched) */}
          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/20 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-blue-100">
              <Building className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Client & Contact Person (Auto-Fetched)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Dropdown */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Account *
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => handleAccountSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
                >
                  {accountsList.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Dropdown */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Contact Person *
                </label>
                <select
                  value={selectedContactId}
                  onChange={(e) => handleContactSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
                >
                  {currentSelectedAccount?.contacts && currentSelectedAccount.contacts.length > 0 ? (
                    <>
                      {currentSelectedAccount.contacts.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.designation ? `(${c.designation})` : ""} {c.isPrimary ? "• Primary" : ""}
                        </option>
                      ))}
                      <option value="custom">+ Other / Custom Contact</option>
                    </>
                  ) : (
                    <>
                      <option value="primary">
                        {currentSelectedAccount?.primaryContact || "Primary Contact"} (Account Default)
                      </option>
                      <option value="custom">+ Other / Custom Contact</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Auto-Fetched Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                  <span>Contact Name</span>
                  <span className="text-[10px] text-blue-600 font-bold">Auto-Fetched</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                  <span>Email</span>
                  <span className="text-[10px] text-blue-600 font-bold">Auto-Fetched</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                  <span>Phone</span>
                  <span className="text-[10px] text-blue-600 font-bold">Auto-Fetched</span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Scope of Work</label>
            <textarea
              rows={3}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
            />
          </div>

          {/* Business Unit Selection (8 Operating Units - Kept in Last) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Operating Business Unit (8 Operating Units)
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {CORE_BUSINESS_ENTITIES.map((ent) => {
                const isSelected = selectedEntityCode === ent.code;
                return (
                  <button
                    key={ent.code}
                    type="button"
                    onClick={() => setSelectedEntityCode(ent.code)}
                    className={`p-2.5 rounded-lg text-left border transition relative flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSelected ? "bg-[#0176d3]" : "bg-slate-300"
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {ent.shortName}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0176d3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
