"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatAED } from "@/lib/calculations";
import { updateContact, deleteContact, createContact } from "@/actions/crmActions";
import {
  Users,
  Building,
  Mail,
  Phone,
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  FolderKanban,
  CheckCircle2,
  Briefcase,
} from "lucide-react";

interface ContactsListClientProps {
  initialContacts: any[];
  accountsList: any[];
}

export default function ContactsListClient({
  initialContacts,
  accountsList,
}: ContactsListClientProps) {
  const router = useRouter();
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("ALL");
  const [selectedDesignation, setSelectedDesignation] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingContact, setDeletingContact] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [createForm, setCreateForm] = useState({
    accountId: accountsList[0]?.id || "",
    name: "",
    designation: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Extract unique designations for filtering
  const uniqueDesignations = Array.from(
    new Set(
      initialContacts
        .map((c) => c.designation?.trim())
        .filter((d): d is string => Boolean(d))
    )
  );

  // Filtered Contacts
  const filteredContacts = initialContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.designation && c.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.customer?.name && c.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm));

    const matchesAccount =
      selectedAccountId === "ALL" || c.customerId === selectedAccountId || c.customer?.id === selectedAccountId;

    const matchesDesignation =
      selectedDesignation === "ALL" || c.designation === selectedDesignation;

    return matchesSearch && matchesAccount && matchesDesignation;
  });

  // Calculate Metrics
  const totalContacts = initialContacts.length;
  const distinctAccounts = new Set(initialContacts.map((c) => c.customerId || c.customer?.id).filter(Boolean)).size;
  const verifiedCount = initialContacts.filter((c) => c.email || c.phone).length;
  const totalLinkedDeals = initialContacts.reduce(
    (acc, c) => acc + (c.opportunities?.length || 0),
    0
  );
  const totalPipelineInfluence = initialContacts.reduce((acc, c) => {
    const opps = c.opportunities || [];
    return acc + opps.reduce((sum: number, o: any) => sum + (o.expectedValue || 0), 0);
  }, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.accountId) {
      showToast("Contact name and customer account are required", "error");
      return;
    }
    setIsSaving(true);
    const res = await createContact({
      ...createForm,
      designation: createForm.designation || "Representative",
      email: createForm.email || "info@client.ae",
      phone: createForm.phone || "+971 4 000 0000",
    });
    setIsSaving(false);

    if (res.success) {
      showToast(`Contact "${createForm.name}" created successfully!`, "success");
      setShowCreateModal(false);
      setCreateForm({
        accountId: accountsList[0]?.id || "",
        name: "",
        designation: "",
        email: "",
        phone: "",
        notes: "",
      });
      router.refresh();
    } else {
      showToast(res.error || "Failed to create contact", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingContact) return;
    setIsDeleting(true);
    const res = await deleteContact(deletingContact.id, true);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Contact "${deletingContact.name}" deleted successfully!`, "success");
      setDeletingContact(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete contact", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. High-Contrast Crisp White KPI Cards Row (matching Leads & Accounts) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Contacts
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalContacts}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Employer Accounts
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {distinctAccounts}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Verified Directory
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {verifiedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Linked Deals
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalLinkedDeals}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs col-span-2 md:col-span-1 hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pipeline Influence
          </div>
          <div className="text-lg font-black text-slate-900 mt-1 truncate">
            {formatAED(totalPipelineInfluence)}
          </div>
        </div>
      </div>

      {/* 2. Filter and Action Bar (matching Leads & Accounts) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search contacts by name, role, account, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Employer Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Employer Accounts ({accountsList.length})</option>
            {accountsList.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.code})
              </option>
            ))}
          </select>

          {/* Designation Filter */}
          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Designations</option>
            {uniqueDesignations.map((desig) => (
              <option key={desig} value={desig}>
                {desig}
              </option>
            ))}
          </select>
        </div>

        {/* Create Contact Button */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Contact</span>
        </button>
      </div>

      {/* 3. Data Table of Contacts (matching Leads Table layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Contact Person</th>
                <th className="px-4 py-3.5">Designation / Role</th>
                <th className="px-4 py-3.5">Employer Account</th>
                <th className="px-4 py-3.5">Communication</th>
                <th className="px-4 py-3.5">Linked Deals</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No client contacts found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const initials = contact.name
                    ? contact.name
                        .split(" ")
                        .map((part: string) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "CT";

                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-slate-50/90 transition group"
                    >
                      {/* Contact Person Name & Initials */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="font-bold text-slate-900 hover:text-[#0176d3] block text-sm"
                            >
                              {contact.name}
                            </Link>
                            <span className="text-[11px] font-medium text-slate-400">
                              Created {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Designation / Role */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                          {contact.designation || "Client Representative"}
                        </span>
                      </td>

                      {/* Employer Account */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {contact.customer?.name || "Corporate Account"}
                          </span>
                        </div>
                        {contact.customer?.code && (
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block mt-0.5">
                            {contact.customer.code}
                          </span>
                        )}
                      </td>

                      {/* Communication (Email & Phone) */}
                      <td className="px-4 py-3.5">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-[#0176d3] hover:underline block truncate max-w-[190px] text-xs font-medium"
                          >
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                            {contact.phone}
                          </span>
                        )}
                      </td>

                      {/* Linked Deals */}
                      <td className="px-4 py-3.5">
                        {contact.opportunities && contact.opportunities.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200">
                            <FolderKanban className="w-3.5 h-3.5" />
                            <span>{contact.opportunities.length} Deals</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 text-slate-600 text-xs font-medium">
                        {contact.customer?.city || "Dubai"}, UAE
                      </td>

                      {/* Actions: View & Delete */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. View Details */}
                          <Link
                            href={`/contacts/${contact.id}`}
                            title="View Contact Details"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </Link>

                          {/* 2. Delete Contact */}
                          <button
                            type="button"
                            onClick={() => setDeletingContact(contact)}
                            title="Delete Contact"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CONTACT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-black text-slate-900">Add New Contact Person</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Customer / Employer Account <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={createForm.accountId}
                  onChange={(e) => setCreateForm({ ...createForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
                >
                  {accountsList.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Representative Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eng. Ahmed Al-Mansouri"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Head of Procurement"
                  value={createForm.designation}
                  onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="ahmed@client.ae"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone / Mobile</label>
                <input
                  type="text"
                  placeholder="+971 50 000 0000"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Relationship Scope</label>
                <textarea
                  rows={2}
                  placeholder="Add key notes or relationship context..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSaving ? "Creating..." : "Add Contact"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Contact</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete contact <strong className="text-slate-900 font-bold">{deletingContact.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingContact(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/30 transition cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
