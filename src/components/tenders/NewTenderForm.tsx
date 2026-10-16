"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BUSINESS_ENTITIES, BusinessEntityConfig } from "@/lib/business-entities";
import { createTender } from "@/actions/tenderActions";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Truck,
  Globe,
  Layers,
  Activity,
  Home,
  Wrench,
  Package,
  HardHat,
  AlertCircle,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Truck,
  Globe,
  Layers,
  Activity,
  Home,
  Wrench,
  Package,
  HardHat,
};

export default function NewTenderForm({
  customers,
  initialEntityCode,
}: {
  customers: any[];
  initialEntityCode?: string;
}) {
  const router = useRouter();
  const { showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedEntity, setSelectedEntity] = useState<BusinessEntityConfig>(
    BUSINESS_ENTITIES.find((e) => e.code === initialEntityCode) || BUSINESS_ENTITIES[0]
  );

  const [isNewCustomer, setIsNewCustomer] = useState(customers.length === 0);
  const [newCustomerName, setNewCustomerName] = useState("");

  // Common Fields
  const [formData, setFormData] = useState({
    title: "",
    customerId: customers[0]?.id || "",
    recordType: "Tender",
    branch: "Dubai Main Operations",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    clientReference: "",
    submissionDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    expectedClosingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    ownerName: "Eng. Tariq Al-Nuaimi",
    location: "Dubai, United Arab Emirates",
    currency: "AED",
    description: "",
    scopeOfWork: "",
    estimatedValue: 0,
    supportingDocs: "",
    internalNotes: "",
  });

  // Dynamic entity-specific fields
  const [specificFields, setSpecificFields] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectEntity = (entity: BusinessEntityConfig) => {
    if (entity.code === selectedEntity.code) return;
    const hasExistingData = Object.keys(specificFields).length > 0;
    if (hasExistingData) {
      if (!confirm(`Switching to ${entity.name} will configure fields specific to that division. Proceed?`)) {
        return;
      }
    }
    setSelectedEntity(entity);
    setSpecificFields({});
  };

  const handleCustomerChange = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    setFormData((prev) => ({
      ...prev,
      customerId,
      contactPerson: cust?.primaryContact || "",
      contactEmail: cust?.email || "",
      contactPhone: cust?.phone || "",
    }));
  };

  const handleSpecificFieldChange = (key: string, value: any) => {
    setSpecificFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const clientName = isNewCustomer ? newCustomerName.trim() : formData.customerId;
    if (!formData.title || !clientName) {
      setErrorMsg("Please fill in all required fields (Tender Title & Customer).");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const result = await createTender({
      businessEntityCode: selectedEntity.code,
      customerId: isNewCustomer ? undefined : formData.customerId,
      newCustomerName: isNewCustomer ? newCustomerName : undefined,
      recordType: formData.recordType,
      branch: formData.branch,
      title: formData.title,
      contactPerson: formData.contactPerson || "Primary Contact",
      contactEmail: formData.contactEmail || "contact@client.ae",
      contactPhone: formData.contactPhone || "+971 4 000 0000",
      clientReference: formData.clientReference,
      submissionDeadline: formData.submissionDeadline,
      expectedClosingDate: formData.expectedClosingDate,
      ownerName: formData.ownerName,
      location: formData.location,
      currency: formData.currency,
      description: formData.description,
      scopeOfWork: formData.scopeOfWork,
      estimatedValue: Number(formData.estimatedValue || 0),
      specificFields,
      supportingDocs: formData.supportingDocs,
      internalNotes: formData.internalNotes,
    });

    setSubmitting(false);

    if (result.success && result.tender) {
      showToast(`Tender ${result.tender.tenderNumber} created successfully!`, "success");
      router.push(`/tenders/${result.tender.id}`);
    } else {
      setErrorMsg(result.error || "Failed to create tender. Please verify inputs.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Steps Progress Header */}
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 sm:px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
              {step}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {step === 1 && "Step 1: Select Fala Business Entity"}
              {step === 2 && "Step 2: Common Tender Information"}
              {step === 3 && `Step 3: ${selectedEntity.name} Specific Fields`}
              {step === 4 && "Step 4: Review & Final Submission"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`h-2 rounded-full transition-all ${
                  s === step ? "w-7 sm:w-8 bg-blue-600" : s < step ? "w-3 sm:w-4 bg-emerald-500" : "w-3 sm:w-4 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: BUSINESS ENTITY SELECTION */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Select Business Unit for Tender Creation
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Selecting an entity activates tailored engineering fields, equipment schedules, and BOQ templates.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>8 Operating Units</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {BUSINESS_ENTITIES.map((entity) => {
                const isSelected = selectedEntity.code === entity.code;
                const Icon = ICON_MAP[entity.iconName] || Building2;

                return (
                  <button
                    key={entity.code}
                    type="button"
                    onClick={() => handleSelectEntity(entity)}
                    className={`flex flex-col text-left p-2.5 sm:p-3 rounded-lg border-2 transition relative ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: entity.color }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                          {entity.code}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 leading-tight mb-0.5 line-clamp-1">
                      {entity.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight h-[28px] mb-2">
                      {entity.description}
                    </p>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 mt-auto">
                      <span>{entity.fields.length} dynamic fields</span>
                      <span className={`font-semibold ${isSelected ? "text-blue-600" : "text-slate-500"}`}>
                        {isSelected ? "Active ✓" : "Select →"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Action Ribbon embedded directly inside the card for 1-screen fit */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 text-[11px]">Selected:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: selectedEntity.color }}
                  />
                  {selectedEntity.name} ({selectedEntity.code})
                </span>
                <span className="text-slate-400 hidden md:inline">•</span>
                <span className="text-slate-500 hidden md:inline text-[11px]">
                  {selectedEntity.fields.length} dynamic engineering fields ready
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm shrink-0"
              >
                <span>Continue to Common Details</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: COMMON TENDER FIELDS */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-base font-bold text-slate-900">Common Tender Information</h2>
              <p className="text-xs text-slate-500">
                Core client, reference, and commercial parameters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tender Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Al Khail Road Expansion and Stormwater Drainage Package"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Customer / Employer <span className="text-rose-500">*</span>
                  </label>
                  {customers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsNewCustomer(!isNewCustomer)}
                      className="text-[11px] text-blue-600 font-semibold hover:underline"
                    >
                      {isNewCustomer ? "Select Existing" : "+ New Client"}
                    </button>
                  )}
                </div>

                {isNewCustomer || customers.length === 0 ? (
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Enter Employer Name (e.g. Dubai RTA / Emaar)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                ) : (
                  <select
                    value={formData.customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Record Type
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="Tender">Competitive Tender</option>
                  <option value="Direct Opportunity">Direct Negotiation / Opportunity</option>
                  <option value="Service Request">Service Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client Reference #
                </label>
                <input
                  type="text"
                  value={formData.clientReference}
                  onChange={(e) => setFormData({ ...formData, clientReference: e.target.value })}
                  placeholder="e.g. RFP-RTA-2026-99"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Al Khail Road Junction 4, Dubai"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Value ({formData.currency})
                </label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of road and infrastructure scope..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scope of Work Breakdown
                </label>
                <textarea
                  rows={2}
                  value={formData.scopeOfWork}
                  onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
                  placeholder="Earthworks, sub-base preparation, dense bitumen base course, wearing course, drainage lines..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Entity Selection</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!formData.title) {
                  setErrorMsg("Please enter a Tender Title.");
                  return;
                }
                if (isNewCustomer && !newCustomerName.trim()) {
                  setErrorMsg("Please enter a Client / Employer Name.");
                  return;
                }
                setErrorMsg(null);
                setStep(3);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <span>Continue to Dynamic Fields</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DYNAMIC BUSINESS ENTITY SPECIFIC FIELDS */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedEntity.color }}
                  />
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedEntity.name} — Technical & BOQ Specifications
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic fields configured specifically for {selectedEntity.name}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {selectedEntity.code}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedEntity.fields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === "textarea" ? "md:col-span-2" : ""}
                >
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                    {field.unit && <span className="text-slate-400 font-normal"> ({field.unit})</span>}
                  </label>

                  {field.type === "select" ? (
                    <select
                      value={specificFields[field.key] || ""}
                      onChange={(e) => handleSpecificFieldChange(field.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Select option --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      rows={2}
                      value={specificFields[field.key] || ""}
                      onChange={(e) => handleSpecificFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={specificFields[field.key] || ""}
                      onChange={(e) => handleSpecificFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Common Info</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <span>Review & Confirm</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-base font-bold text-slate-900">Review & Confirm Tender Details</h2>
              <p className="text-xs text-slate-500">
                Please verify the tender parameters before saving.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Business Entity
                </span>
                <span className="font-bold text-slate-800 text-sm">{selectedEntity.name}</span>
                <span className="text-slate-500 block text-[11px]">{selectedEntity.code}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Target Customer
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {isNewCustomer
                    ? newCustomerName
                    : customers.find((c) => c.id === formData.customerId)?.name || "New Client"}
                </span>
                <span className="text-slate-500 block text-[11px]">{formData.location}</span>
              </div>

              <div className="md:col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Tender Title
                </span>
                <span className="font-bold text-slate-900 text-sm">{formData.title}</span>
              </div>
            </div>

            {/* Dynamic Fields Summary */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
              <h3 className="text-xs font-bold text-blue-900 mb-2">
                Division Technical Parameters ({selectedEntity.shortName})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {Object.entries(specificFields).map(([k, val]) => (
                  <div key={k}>
                    <span className="text-[10px] text-slate-400 block capitalize font-medium">
                      {k.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {String(val || "N/A")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Edit Fields</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-600/20"
            >
              {submitting ? (
                <span>Saving Tender...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Create & Register Tender</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
