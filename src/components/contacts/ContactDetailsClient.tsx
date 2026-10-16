"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { updateContact, deleteContact } from "@/actions/crmActions";
import { formatAED } from "@/lib/calculations";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Save,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  FolderKanban,
  X,
  UserCheck,
  Pencil,
  ChevronDown,
  Eye,
  User,
} from "lucide-react";

interface ContactDetailsClientProps {
  contact: any;
  accountsList: any[];
  entityList?: any[];
}

export default function ContactDetailsClient({
  contact,
  accountsList,
  entityList,
}: ContactDetailsClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [savingContact, setSavingContact] = useState(false);
  const [deletingContactState, setDeletingContactState] = useState(false);

  // Salesforce Inline Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);

  // Contact Details Form State
  const [name, setName] = useState(contact.name || "");
  const [designation, setDesignation] = useState(contact.designation || "");
  const [email, setEmail] = useState(contact.email || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [customerId, setCustomerId] = useState(contact.customerId || "");
  const [notes, setNotes] = useState(contact.notes || "");
  const [location, setLocation] = useState(contact.customer?.city ? `${contact.customer.city}, UAE` : "Dubai, UAE");

  const selectedAccount =
    accountsList.find((a) => a.id === customerId) || contact.customer;
  const opportunities = contact.opportunities || [];
  const totalDealValue = opportunities.reduce(
    (sum: number, opp: any) => sum + (opp.expectedValue || 0),
    0
  );

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setName(contact.name || "");
    setDesignation(contact.designation || "");
    setEmail(contact.email || "");
    setPhone(contact.phone || "");
    setCustomerId(contact.customerId || "");
    setNotes(contact.notes || "");
    setLocation(contact.customer?.city ? `${contact.customer.city}, UAE` : "Dubai, UAE");
    setIsEditing(false);
  };

  const handleSaveContact = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim() || !designation.trim() || !email.trim() || !phone.trim()) {
      showToast("Contact name, designation, email, and phone are required.", "error");
      return;
    }

    setSavingContact(true);
    const res = await updateContact(contact.id, {
      name,
      designation,
      email,
      phone,
      notes,
      customerId,
    });
    setSavingContact(false);

    if (res.success) {
      showToast("Contact details updated successfully!", "success");
      setIsEditing(false);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update contact", "error");
    }
  };

  const handleDeleteContact = async () => {
    if (
      !confirm(
        `Are you sure you want to delete stakeholder contact "${contact.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingContactState(true);
    const res = await deleteContact(contact.id, true);
    setDeletingContactState(false);

    if (res.success) {
      showToast("Contact deleted successfully.", "success");
      router.push("/contacts");
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete contact", "error");
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Closed Won":
      case "Qualification":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const initials = (name || contact.name || "CT")
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4 pb-20">
      {/* 1. SALESFORCE TOP RECORD BANNER (exact match to Leads and Accounts) */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/contacts"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
            title="Back to Contacts Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <h1 className="text-xl font-black text-slate-900 tracking-tight truncate">
                {name || contact.name}
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {designation || contact.designation || "Stakeholder"}
              </span>
              {selectedAccount?.name && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>{selectedAccount.name}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              Organization: <strong className="text-slate-800">{selectedAccount?.name || "Corporate Account"}</strong> • Phone:{" "}
              <span className="font-mono text-slate-700">{phone || contact.phone}</span> • Email:{" "}
              <span className="text-slate-700">{email || contact.email}</span> • ID:{" "}
              <span className="font-mono text-slate-400">#{contact.id.slice(-6)}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
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
                onClick={() => handleSaveContact()}
                disabled={savingContact}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingContact ? "Saving..." : "Save"}</span>
              </button>
            </div>
          )}

          {contact.customerId && (
            <Link
              href={`/accounts/${contact.customerId}`}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Employer Account</span>
            </Link>
          )}

          <Link
            href="/opportunities"
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>New Opportunity</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteContact}
            disabled={deletingContactState}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SALESFORCE HIGHLIGHTS 4-KPI RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Employer Account
            </span>
            <span className="text-sm font-black text-slate-900 truncate block">
              {selectedAccount?.name || "Corporate Client"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Job Designation
            </span>
            <span className="text-sm font-black text-slate-900 truncate block">
              {designation || contact.designation || "Representative"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Linked Opportunities
            </span>
            <span className="text-base font-black text-slate-900 font-mono truncate block">
              {opportunities.length} Commercial {opportunities.length === 1 ? "Deal" : "Deals"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Stakeholder Status
            </span>
            <span className="text-sm font-black text-slate-900 truncate block">
              Active Key Contact
            </span>
          </div>
        </div>
      </div>

      {/* 3. SALESFORCE UNIFIED FULL-SCREEN RECORD DETAIL CONTAINER */}
      <form
        onSubmit={handleSaveContact}
        className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden"
      >
        {/* Collapsible Section Header (exact match to Leads and Accounts) */}
        <div
          onClick={() => setSectionOpen(!sectionOpen)}
          className="bg-slate-100/75 hover:bg-slate-100/90 transition px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                sectionOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Contact Information
            </span>
            <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
              #{contact.id.slice(-6)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Primary stakeholder credentials, organization link, and direct contact details
          </span>
        </div>

        {sectionOpen && (
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
              {/* LEFT COLUMN: Stakeholder Profile & Organization */}
              <div className="divide-y divide-slate-100">
                {/* Contact Owner / ID */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Contact Record ID
                  </span>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      #{contact.id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Contact Person Name */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Contact Name</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Arshad"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs font-bold"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-900 truncate">
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

                {/* Job Title / Designation */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Designation / Role</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Procurement Director"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {designation || "Procurement Director"}
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

                {/* Employer / Customer Organization */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Employer Organization</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs cursor-pointer"
                      >
                        {accountsList.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.code})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {selectedAccount?.name || "Corporate Account"}
                          </span>
                        </div>
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

                {/* Stakeholder Relationship Notes */}
                <div className="flex items-start min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 pt-1">
                    Relationship Notes
                  </label>
                  <div className="w-7/12 flex items-start justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Key background context, decision authority, engagement scope..."
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs resize-none"
                      />
                    ) : (
                      <>
                        <span className="text-xs text-slate-700 leading-relaxed py-0.5">
                          {notes || "Converted from Lead Arshad"}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 mt-0.5"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Contact Details & Financial Parameters */}
              <div className="divide-y divide-slate-100">
                {/* Phone / Mobile Number */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Phone / Mobile</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="099090909"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs font-mono"
                      />
                    ) : (
                      <>
                        <span className="font-mono text-xs font-semibold text-slate-800 truncate">
                          {phone || "--"}
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

                {/* Official Email Address */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Official Email</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Arshad@penta.com"
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
                        <span className="text-xs font-medium text-slate-800">
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

                {/* Stakeholder Influence Tier */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Influence Tier
                  </span>
                  <div className="w-7/12 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <UserCheck className="w-3 h-3 text-[#0176d3]" />
                      <span>Key Decision Maker</span>
                    </span>
                  </div>
                </div>

                {/* Linked Deals Value */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Pipeline Influence
                  </span>
                  <div className="w-7/12">
                    <span className="font-mono text-xs font-black text-slate-900">
                      {formatAED(totalDealValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer inside Container (exact match to Leads and Accounts) */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/contacts"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            <span>← Back to Contacts</span>
          </Link>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Contact Details</span>
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
                  disabled={savingContact}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingContact ? "Saving..." : "Save"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
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
            onClick={() => handleSaveContact()}
            disabled={savingContact}
            className="px-6 py-1.5 text-xs font-semibold text-white bg-[#0176d3] hover:bg-[#014486] active:bg-[#00396b] rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {savingContact ? (
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

      {/* 5. SALESFORCE RELATED OBJECTS SECTION (STACKED FULL WIDTH BELOW CONTACT INFO) */}
      <div className="space-y-4">
        {/* RELATED COMMERCIAL OPPORTUNITIES */}
        <div className="w-full rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Related Commercial Opportunities
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {opportunities.length}
              </span>
            </div>

            <Link
              href="/opportunities"
              className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Deal</span>
            </Link>
          </div>

          {/* Opportunities Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                <tr>
                  <th className="px-5 py-3">Opportunity Name</th>
                  <th className="px-4 py-3">Business Unit</th>
                  <th className="px-4 py-3">Est. Value</th>
                  <th className="px-4 py-3">Target Date</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No records to display.
                    </td>
                  </tr>
                ) : (
                  opportunities.map((opp: any) => (
                    <tr key={opp.id} className="hover:bg-slate-50/90 transition group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {opp.oppNumber}
                          </span>
                          <Link
                            href={`/opportunities/${opp.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600"
                          >
                            {opp.name}
                          </Link>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {opp.businessEntity ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {opp.businessEntity.shortName || opp.businessEntity.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                        {opp.expectedValue ? formatAED(opp.expectedValue) : "AED 0.00"}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium text-xs">
                        {opp.expectedCloseDate
                          ? new Date(opp.expectedCloseDate).toLocaleDateString()
                          : "30/10/2026"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStageColor(
                            opp.status
                          )}`}
                        >
                          {opp.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
