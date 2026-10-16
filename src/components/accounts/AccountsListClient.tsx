"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatAED } from "@/lib/calculations";
import { updateAccount, deleteAccount, createAccount } from "@/actions/crmActions";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Users,
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  Save,
  CheckCircle2,
  FolderKanban,
  ExternalLink,
  CreditCard,
  Briefcase,
} from "lucide-react";

interface AccountsListClientProps {
  initialAccounts: any[];
}

export default function AccountsListClient({ initialAccounts }: AccountsListClientProps) {
  const router = useRouter();
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    code: "",
    type: "Corporate Client",
    trn: "",
    industry: "Real Estate",
    email: "",
    phone: "",
    address: "",
    city: "Dubai",
    primaryContact: "",
  });

  const filteredAccounts = initialAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.trn && acc.trn.includes(searchTerm)) ||
      (acc.primaryContact && acc.primaryContact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acc.city && acc.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "ALL" || acc.type === selectedType;
    const matchesStatus =
      selectedStatus === "ALL" || (acc.status || "Active") === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate Metrics
  const totalAccounts = initialAccounts.length;
  const activeCount = initialAccounts.filter(
    (a) => (a.status || "Active") === "Active"
  ).length;
  const totalContacts = initialAccounts.reduce(
    (acc, a) => acc + (a.contacts?.length || 0),
    0
  );
  const totalDeals = initialAccounts.reduce(
    (acc, a) => acc + (a.opportunities?.length || 0),
    0
  );
  const totalPipelineValue = initialAccounts.reduce((acc, a) => {
    const opps = a.opportunities || [];
    return acc + opps.reduce((sum: number, o: any) => sum + (o.expectedValue || 0), 0);
  }, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.primaryContact.trim() || !createForm.email.trim()) {
      showToast("Company name, primary contact, and email are required.", "error");
      return;
    }

    setIsSaving(true);
    const res = await createAccount(createForm);
    setIsSaving(false);

    if (res.success) {
      showToast("Customer Account created successfully!", "success");
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        code: "",
        type: "Corporate Client",
        trn: "",
        industry: "Real Estate",
        email: "",
        phone: "",
        address: "",
        city: "Dubai",
        primaryContact: "",
      });
      router.refresh();
    } else {
      showToast(res.error || "Failed to create account", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return;
    setIsDeleting(true);
    const res = await deleteAccount(deletingAccount.id, true);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Account "${deletingAccount.name}" deleted successfully.`, "success");
      setDeletingAccount(null);
      router.refresh();
    } else {
      showToast(res.error || "Failed to delete account", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. High-Contrast Crisp White KPI Ribbon (matching Leads) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Accounts
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalAccounts}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Clients
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activeCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Registered Contacts
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalContacts}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Linked Deals
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalDeals}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs col-span-2 md:col-span-1 hover:border-slate-300 transition">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pipeline Value
          </div>
          <div className="text-lg font-black text-slate-900 mt-1 truncate">
            {formatAED(totalPipelineValue)}
          </div>
        </div>
      </div>

      {/* 2. Filter and Action Bar (matching Leads) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search accounts by name, code, TRN, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Account Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Account Types</option>
            <option value="Government / Authority">Government / Authority</option>
            <option value="Master Developer">Master Developer</option>
            <option value="Main Contractor">Main Contractor</option>
            <option value="Corporate Client">Corporate Client</option>
            <option value="Semi-Gov">Semi-Government</option>
            <option value="Private">Private Entity</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0176d3] focus:ring-2 focus:ring-blue-100 font-medium shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Clients</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Create Account Button */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Account</span>
        </button>
      </div>

      {/* 3. Data Table of Accounts (matching Leads Table layout) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Account / Company</th>
                <th className="px-4 py-3.5">Type &amp; Industry</th>
                <th className="px-4 py-3.5">Primary Contact</th>
                <th className="px-4 py-3.5">TRN Number</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Deals &amp; Contacts</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No customer accounts found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/90 transition group">
                    {/* Account / Company Name & Code */}
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="font-bold text-slate-900 hover:text-[#0176d3] block text-sm"
                      >
                        {acc.name}
                      </Link>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block mt-0.5">
                        {acc.code}
                      </span>
                    </td>

                    {/* Type & Industry */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {acc.type || "Corporate Client"}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {acc.industry || "General Contracting"}
                      </div>
                    </td>

                    {/* Primary Contact Person */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {acc.primaryContact || "General Representative"}
                      </div>
                      <div className="text-[11px] text-slate-500">{acc.email || acc.phone}</div>
                    </td>

                    {/* TRN Number */}
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800">
                      {acc.trn || "100293847500003"}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5 text-slate-600 text-xs font-medium">
                      {acc.city || "Dubai"}, {acc.country || "UAE"}
                    </td>

                    {/* Deals & Contacts */}
                    <td className="px-4 py-3.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0176d3]">
                          {acc.opportunities?.length || 0} Deals
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">
                          {acc.contacts?.length || 0} Contacts
                        </span>
                      </div>
                    </td>

                    {/* Actions: View & Delete */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Link
                          href={`/accounts/${acc.id}`}
                          title="View Account Details"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeletingAccount(acc)}
                          title="Delete Account"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-black text-slate-900">Create New Customer Account</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Company / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai Roads & Transport Authority (RTA)"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
                  >
                    <option value="Government / Authority">Government / Authority</option>
                    <option value="Master Developer">Master Developer</option>
                    <option value="Main Contractor">Main Contractor</option>
                    <option value="Corporate Client">Corporate Client</option>
                    <option value="Semi-Gov">Semi-Government</option>
                    <option value="Private">Private Entity</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Real Estate"
                    value={createForm.industry}
                    onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Primary Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eng. Sultan Al Shamsi"
                    value={createForm.primaryContact}
                    onChange={(e) => setCreateForm({ ...createForm, primaryContact: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Official Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="info@rta.ae"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+971 4 000 0000"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">TRN (15 Digits)</label>
                  <input
                    type="text"
                    placeholder="100293847500003"
                    value={createForm.trn}
                    onChange={(e) => setCreateForm({ ...createForm, trn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Registered Address</label>
                <input
                  type="text"
                  placeholder="Dubai, UAE"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Create Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-rose-600">Delete Customer Account</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete customer account{" "}
              <strong className="text-slate-900">{deletingAccount.name}</strong> ({deletingAccount.code})?
              This will remove the account registration from the system.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
