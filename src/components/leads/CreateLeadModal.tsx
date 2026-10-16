"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { createLead } from "@/actions/leadActions";
import { CORE_BUSINESS_ENTITIES } from "@/lib/business-entities";
import {
  X,
  UserPlus,
  Building,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityList?: any[];
}

export default function CreateLeadModal({ isOpen, onClose, entityList }: CreateLeadModalProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [selectedEntityCode, setSelectedEntityCode] = useState("ROAD_INFRA");

  // Basic Form State
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [source, setSource] = useState("Direct");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [requirement, setRequirement] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleEntityChange = (newCode: string) => {
    setSelectedEntityCode(newCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !company.trim() || !email.trim() || !phone.trim()) {
      showToast("Please fill in contact name, company, email, and phone.", "error");
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

      const specificObj: any = {};
      if (startDate) specificObj.startDate = startDate;
      if (endDate) specificObj.endDate = endDate;

      const res = await createLead({
        name,
        company,
        email,
        phone,
        jobTitle,
        source,
        businessEntityId,
        estimatedValue: 0,
        location,
        requirement,
        notes,
        expectedClosingDate: endDate || undefined,
        specificFieldsJson: JSON.stringify(specificObj),
        ownerName: "Sales Team",
      });

      if (res.success) {
        showToast(`Lead for "${company}" created successfully!`, "success");
        onClose();
        router.refresh();
      } else {
        showToast(res.error || "Failed to create lead", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Crisp Clean White Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Create New Commercial Lead
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Capture prospective client contact details, commercial scope, and business unit selection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean White Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          {/* SECTION 1: Client & Contact Details */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
              <Building className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                1. Prospective Client & Contact Details
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Dubai Roads & Transport Authority (RTA)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eng. Sultan Al Shamsi"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sultan.alshamsi@rta.ae"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone / Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 4 284 4444"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Designation
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Director of Infrastructure Projects"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Acquisition Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                >
                  <option value="Direct">Direct Client Inquiry</option>
                  <option value="RTA Portal">RTA / Gov Tender Portal</option>
                  <option value="Referral">Executive Referral</option>
                  <option value="Expo">Industry Expo / Exhibition</option>
                  <option value="Website">Digital Website Form</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Commercial Estimates */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                2. Commercial Parameters & Project Scope
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Emirate
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dubai, UAE"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Requirement / Scope of Work Overview
              </label>
              <textarea
                rows={2}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Briefly describe client requirements, tender package, or site specifications..."
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-100 shadow-2xs font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* SECTION 3: Business Unit Selection (7 Core Units - Keep in Last) */}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {CORE_BUSINESS_ENTITIES.map((ent) => {
                const isSelected = selectedEntityCode === ent.code;
                return (
                  <button
                    key={ent.code}
                    type="button"
                    onClick={() => handleEntityChange(ent.code)}
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
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
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
                  <span>Saving Lead...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Commercial Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
