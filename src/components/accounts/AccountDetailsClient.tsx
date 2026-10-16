"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { updateAccount, deleteAccount, createContact } from "@/actions/crmActions";
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
  CreditCard,
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

interface AccountDetailsClientProps {
  account: any;
  entityList?: any[];
}

export default function AccountDetailsClient({
  account,
  entityList,
}: AccountDetailsClientProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [savingAccount, setSavingAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [addingContact, setAddingContact] = useState(false);

  // Salesforce Inline Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);

  // New Contact Form State
  const [newContactName, setNewContactName] = useState("");
  const [newContactDesignation, setNewContactDesignation] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactNotes, setNewContactNotes] = useState("");

  // Account Profile Form State
  const [name, setName] = useState(account.name || "");
  const [primaryContact, setPrimaryContact] = useState(account.primaryContact || "");
  const [email, setEmail] = useState(account.email || "");
  const [phone, setPhone] = useState(account.phone || "");
  const [type, setType] = useState(account.type || "Corporate Client");
  const [industry, setIndustry] = useState(account.industry || "Infrastructure Contracting");
  const [trn, setTrn] = useState(account.trn || "100293847500003");
  const [address, setAddress] = useState(account.address || "");
  const [city, setCity] = useState(account.city || "Dubai");
  const [country, setCountry] = useState(account.country || "United Arab Emirates");

  // Metrics
  const opportunities = account.opportunities || [];
  const contacts = account.contacts || [];
  const totalPipelineValue = opportunities.reduce(
    (sum: number, opp: any) => sum + (opp.expectedValue || 0),
    0
  );

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setName(account.name || "");
    setPrimaryContact(account.primaryContact || "");
    setEmail(account.email || "");
    setPhone(account.phone || "");
    setType(account.type || "Corporate Client");
    setIndustry(account.industry || "Infrastructure Contracting");
    setTrn(account.trn || "100293847500003");
    setAddress(account.address || "");
    setCity(account.city || "Dubai");
    setCountry(account.country || "United Arab Emirates");
    setIsEditing(false);
  };

  const handleSaveAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim() || !primaryContact.trim() || !email.trim() || !phone.trim()) {
      showToast("Company name, primary contact, email, and phone are required.", "error");
      return;
    }

    setSavingAccount(true);
    const res = await updateAccount(account.id, {
      name,
      primaryContact,
      email,
      phone,
      type,
      industry,
      trn,
      address,
      city,
      country,
      status: "Active",
    });
    setSavingAccount(false);

    if (res.success) {
      showToast("Account details updated successfully!", "success");
      setIsEditing(false);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update account", "error");
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactEmail.trim() || !newContactPhone.trim()) {
      showToast("Contact name, email, and phone are required.", "error");
      return;
    }

    setAddingContact(true);
    const res = await createContact({
      accountId: account.id,
      name: newContactName,
      designation: newContactDesignation || "Stakeholder Representative",
      email: newContactEmail,
      phone: newContactPhone,
      notes: newContactNotes,
    });
    setAddingContact(false);

    if (res.success) {
      showToast(`Contact "${newContactName}" added successfully!`, "success");
      setShowAddContactModal(false);
      setNewContactName("");
      setNewContactDesignation("");
      setNewContactEmail("");
      setNewContactPhone("");
      setNewContactNotes("");
      router.refresh();
    } else {
      showToast(res.error || "Failed to add contact", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        `Are you sure you want to delete customer account "${account.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingAccount(true);
    const res = await deleteAccount(account.id, true);
    setDeletingAccount(false);

    if (res.success) {
      showToast("Account deleted successfully.", "success");
      router.push("/accounts");
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete account", "error");
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

  return (
    <div className="space-y-4 pb-20">
      {/* 1. SALESFORCE TOP RECORD BANNER (exact match to Leads) */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/accounts"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
            title="Back to Customer Accounts Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <Building className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <h1 className="text-xl font-black text-slate-900 tracking-tight truncate">
                {name || account.name}
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {account.code}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {type || "Corporate Client"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              Contact: <strong className="text-slate-800">{primaryContact}</strong> • Phone:{" "}
              <span className="font-mono text-slate-700">{phone}</span> • Email:{" "}
              <span className="text-slate-700">{email}</span> • Location:{" "}
              <span className="text-slate-700">{city}, UAE</span>
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
                onClick={() => handleSaveAccount()}
                disabled={savingAccount}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingAccount ? "Saving..." : "Save"}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddContactModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Add Contact</span>
          </button>

          <Link
            href="/opportunities"
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>New Opportunity</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Delete Account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SALESFORCE HIGHLIGHTS 4-KPI RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Deal Pipeline
            </span>
            <span className="text-base font-black text-slate-900 font-mono truncate block">
              {totalPipelineValue > 0 ? formatAED(totalPipelineValue) : "AED 0.00"}
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
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Registered Contacts
            </span>
            <span className="text-base font-black text-slate-900 font-mono truncate block">
              {contacts.length} {contacts.length === 1 ? "Stakeholder" : "Stakeholders"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Account Status
            </span>
            <span className="text-base font-black text-slate-900 truncate block">
              {account.status || "Active"} Client
            </span>
          </div>
        </div>
      </div>

      {/* 3. SALESFORCE UNIFIED FULL-SCREEN RECORD DETAIL CONTAINER */}
      <form
        onSubmit={handleSaveAccount}
        className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden"
      >
        {/* Collapsible Section Header (exact match to Leads) */}
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
              Company Information
            </span>
            <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
              {account.code}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Primary corporate stakeholder, commercial entity, and tax parameters
          </span>
        </div>

        {sectionOpen && (
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
              {/* LEFT COLUMN: Client & Corporate Details */}
              <div className="divide-y divide-slate-100">
                {/* Account Owner / Code */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Account Code
                  </span>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {account.code}
                    </span>
                  </div>
                </div>

                {/* Company / Organization Name */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Company Name</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Pentahouse"
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

                {/* Account Type */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Account Type
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs cursor-pointer"
                      >
                        <option value="Government / Authority">Government / Authority</option>
                        <option value="Master Developer">Master Developer</option>
                        <option value="Main Contractor">Main Contractor</option>
                        <option value="Corporate Client">Corporate Client</option>
                        <option value="Semi-Government">Semi-Government</option>
                        <option value="Private Entity">Private Entity</option>
                      </select>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {type || "Corporate Client"}
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

                {/* Industry */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Industry
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. Real Estate"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {industry || "--"}
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

                {/* Primary Contact Person */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Primary Contact</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={primaryContact}
                        onChange={(e) => setPrimaryContact(e.target.value)}
                        placeholder="e.g. Arshad"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {primaryContact || "--"}
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

                {/* Registered Physical Address */}
                <div className="flex items-start min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 pt-1">
                    Registered Address
                  </label>
                  <div className="w-7/12 flex items-start justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Building name, commercial zone, and street address..."
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs resize-none"
                      />
                    ) : (
                      <>
                        <span className="text-xs text-slate-700 leading-relaxed py-0.5">
                          {address || "Dubai, UAE"}
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

              {/* RIGHT COLUMN: Contact, Financial & Location Details */}
              <div className="divide-y divide-slate-100">
                {/* Phone Number */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Phone Number</span>
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

                {/* TRN Tax Registration */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    TRN Number (15 Digits)
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={trn}
                        onChange={(e) => setTrn(e.target.value)}
                        placeholder="100293847500003"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs font-mono font-bold"
                      />
                    ) : (
                      <>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {trn || "100293847500003"}
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

                {/* City / Emirate */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    City / Emirate
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Dubai"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-800">
                          {city || "Dubai"}
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

                {/* Account Status */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Account Status
                  </span>
                  <div className="w-7/12 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="w-3 h-3 text-[#0176d3]" />
                      <span>{account.status || "Active"} Client</span>
                    </span>
                  </div>
                </div>

                {/* Cumulative Deal Value */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Pipeline Value
                  </span>
                  <div className="w-7/12">
                    <span className="font-mono text-xs font-black text-slate-900">
                      {formatAED(totalPipelineValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer inside Container (exact match to Leads) */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/accounts"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            <span>← Back to Accounts</span>
          </Link>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Account Details</span>
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
                  disabled={savingAccount}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingAccount ? "Saving..." : "Save"}</span>
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
            onClick={() => handleSaveAccount()}
            disabled={savingAccount}
            className="px-6 py-1.5 text-xs font-semibold text-white bg-[#0176d3] hover:bg-[#014486] active:bg-[#00396b] rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {savingAccount ? (
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

      {/* 5. SALESFORCE RELATED OBJECTS SECTION (STACKED FULL WIDTH BELOW ACCOUNT INFO) */}
      <div className="space-y-4">
        {/* RELATED OBJECT 1: RELATED COMMERCIAL OPPORTUNITIES */}
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

        {/* RELATED OBJECT 2: RELATED CONTACTS & STAKEHOLDERS */}
        <div className="w-full rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Related Contacts &amp; Stakeholders
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {contacts.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddContactModal(true)}
              className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                <tr>
                  <th className="px-5 py-3">Contact Name</th>
                  <th className="px-4 py-3">Designation / Role</th>
                  <th className="px-4 py-3">Official Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No records to display.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c: any) => {
                    const initials = c.name
                      ? c.name
                          .split(" ")
                          .map((part: string) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "AR";

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/90 transition group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                              {initials}
                            </div>
                            <Link
                              href={`/contacts/${c.id}`}
                              className="text-xs font-bold text-slate-900 hover:text-blue-600"
                            >
                              {c.name}
                            </Link>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {c.designation || "Procurement Director"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <a
                            href={`mailto:${c.email}`}
                            className="text-blue-600 hover:underline font-medium text-xs"
                          >
                            {c.email}
                          </a>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-slate-600 text-xs">
                          {c.phone}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 text-xs">
                          {city}, UAE
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/contacts/${c.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QUICK ADD CONTACT MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-black text-slate-900">
                  Add Contact for {account.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddContactModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Arshad"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-100 shadow-2xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Job Title / Designation
                </label>
                <input
                  type="text"
                  value={newContactDesignation}
                  onChange={(e) => setNewContactDesignation(e.target.value)}
                  placeholder="e.g. Procurement Director"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-100 shadow-2xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="Arshad@penta.com"
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="099090909"
                    className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-100 shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes / Role Overview
                </label>
                <textarea
                  rows={2}
                  value={newContactNotes}
                  onChange={(e) => setNewContactNotes(e.target.value)}
                  placeholder="Key liaison, tender decision maker..."
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-100 shadow-2xs font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingContact}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{addingContact ? "Adding..." : "Add Contact"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
