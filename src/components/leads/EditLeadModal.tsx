"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { updateLeadDetails, updateLeadStage } from "@/actions/leadActions";
import { X, Save, Building, User, Mail, Phone, MapPin, DollarSign } from "lucide-react";

interface EditLeadModalProps {
  isOpen: boolean;
  lead: any;
  onClose: () => void;
}

export default function EditLeadModal({ isOpen, lead, onClose }: EditLeadModalProps) {
  const router = useRouter();
  const { showToast } = useApp();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company: lead?.company || "",
    name: lead?.name || "",
    jobTitle: lead?.jobTitle || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    estimatedValue: lead?.estimatedValue || 0,
    location: lead?.location || "Dubai, UAE",
    source: lead?.source || "Direct",
    status: lead?.status || "New",
    requirement: lead?.requirement || "",
    notes: lead?.notes || "",
    expectedClosingDate: lead?.expectedClosingDate
      ? new Date(lead.expectedClosingDate).toISOString().split("T")[0]
      : "",
  });

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.name.trim()) {
      showToast("Company name and contact person are required.", "error");
      return;
    }

    setSaving(true);
    try {
      // 1. Update lead details
      const res = await updateLeadDetails(lead.id, {
        company: formData.company,
        name: formData.name,
        jobTitle: formData.jobTitle,
        email: formData.email,
        phone: formData.phone,
        estimatedValue: Number(formData.estimatedValue) || 0,
        location: formData.location,
        requirement: formData.requirement,
        notes: formData.notes,
        expectedClosingDate: formData.expectedClosingDate || undefined,
      });

      // 2. If status changed and not converted, update stage
      if (formData.status !== lead.status && lead.status !== "Converted") {
        await updateLeadStage(lead.id, formData.status);
      }

      setSaving(false);
      if (res.success) {
        showToast("Lead updated successfully!", "success");
        onClose();
        router.refresh();
      } else {
        showToast(res.error || "Failed to update lead", "error");
      }
    } catch (err: any) {
      setSaving(false);
      showToast(err.message || "Failed to update lead", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Edit Commercial Lead</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update prospect profile, contact info, and qualification status
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Company */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company / Client *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Job Title / Designation</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Estimated Value */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Estimated Value (AED)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Location */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location / Emirate</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Stage */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Qualification Stage</label>
              <select
                disabled={lead.status === "Converted"}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden bg-white"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Under Qualification">Under Qualification</option>
                <option value="Qualified">Qualified (Ready for Conversion)</option>
                <option value="Dropped">Dropped</option>
                {lead.status === "Converted" && <option value="Converted">Converted (Locked)</option>}
              </select>
            </div>
          </div>

          {/* Project Requirement */}
          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Project Scope & Requirements</label>
            <textarea
              rows={2}
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
            />
          </div>

          {/* Internal Notes */}
          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-hidden"
            />
          </div>

          {/* Footer Buttons */}
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
