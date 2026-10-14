"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAED } from "@/lib/calculations";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { createCustomer } from "@/actions/crmActions";
import { useApp } from "@/context/AppContext";
import {
  FileSpreadsheet,
  ShieldAlert,
  FileSignature,
  FolderKanban,
  ArrowUpRight,
  ChevronRight,
  Building2,
  Plus,
  Target,
  Phone,
  Mail,
  X,
  ShieldCheck,
  Search,
  BarChart2,
  Users,
} from "lucide-react";

interface UnifiedExecutiveCRMProps {
  dashboardData: any;
  crmData: any;
  entityFilter: string;
  initialTab?: string;
}

export default function UnifiedExecutiveCRM({
  dashboardData,
  crmData,
  entityFilter,
  initialTab,
}: UnifiedExecutiveCRMProps) {
  const router = useRouter();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "crm">(
    initialTab === "crm" ? "crm" : "overview"
  );
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [submittingCustomer, setSubmittingCustomer] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    code: "",
    type: "Government / Authority",
    primaryContact: "",
    phone: "",
    email: "",
    city: "Dubai",
    address: "",
  });

  const { kpi, charts, recentTenders, pendingApprovals, entityBreakdown } = dashboardData;
  const { leads, customers, contacts, opportunities } = crmData;

  const handleTabChange = (tab: "overview" | "crm") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "crm") {
      url.searchParams.set("tab", "crm");
    } else {
      url.searchParams.delete("tab");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) {
      showToast("Please provide a Customer / Client name.", "error");
      return;
    }
    setSubmittingCustomer(true);
    const generatedCode =
      newCustomer.code.trim() ||
      `CUST-${newCustomer.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const res = await createCustomer({
      name: newCustomer.name,
      code: generatedCode,
      type: newCustomer.type,
      primaryContact: newCustomer.primaryContact || "General Inquiries",
      phone: newCustomer.phone || "+971 4 000 0000",
      email: newCustomer.email || "info@client.ae",
      city: newCustomer.city || "Dubai",
      address: newCustomer.address || "United Arab Emirates",
    });

    setSubmittingCustomer(false);
    if (res.success) {
      showToast(`Customer "${newCustomer.name}" registered successfully!`, "success");
      setShowAddCustomerModal(false);
      setNewCustomer({
        name: "",
        code: "",
        type: "Government / Authority",
        primaryContact: "",
        phone: "",
        email: "",
        city: "Dubai",
        address: "",
      });
      router.refresh();
    } else {
      showToast(res.error || "Failed to register customer.", "error");
    }
  };

  const filteredCustomers = customers.filter((c: any) => {
    return (
      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      c.primaryContact.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-3">
      {/* ========================================================================= */}
      {/* 1. CLEAN EXECUTIVE DASHBOARD PAGE HEADER                                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {activeTab === "crm" ? "CRM & Customer Accounts" : "Executive Dashboard"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === "crm"
              ? "Authorized employer directory, commercial leads, and pre-tender pipeline"
              : "Overview of CRM, Tender Pipeline, Project Execution and Business Performance"}
          </p>
        </div>

        {/* Tab Switcher between Executive Dashboard & CRM */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Executive Dashboard
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("crm")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "crm"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>CRM & Accounts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                activeTab === "crm" ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
              }`}
            >
              {customers.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ENTERPRISE EPC CYCLE RIBBON                                           */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-2 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            ENTERPRISE EPC CYCLE:
          </span>
          <div className="flex items-center gap-2 text-xs font-medium shrink-0">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                1
              </span>
              <span>Tender Genesis</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <Link
              href="/estimation"
              className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                2
              </span>
              <span>BOQ Estimation</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <Link
              href="/approvals"
              className="inline-flex items-center gap-1 text-amber-600 font-semibold hover:underline"
            >
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[9px] font-bold">
                3
              </span>
              <span>GM Governance Gate</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <Link
              href="/contracts"
              className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold">
                4
              </span>
              <span>Commercial Contract</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-purple-600 font-semibold hover:underline"
            >
              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[9px] font-bold">
                5
              </span>
              <span>Site Execution</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <Link
              href="/procurement"
              className="inline-flex items-center gap-1 text-cyan-600 font-semibold hover:underline"
            >
              <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[9px] font-bold">
                6
              </span>
              <span>Procurement (PO/GRN)</span>
            </Link>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-500 shrink-0 pl-3">
          <span>Demo Flow Active</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: EXECUTIVE OVERVIEW (EXACT REPLICA OF SAMPLE DESIGN)              */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {/* 4 KPI Cards (Generous & Prestigious Proportions) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Active Bidding Pipeline */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    ACTIVE BIDDING PIPELINE
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-slate-900 tracking-tight">
                  {formatAED(kpi.totalTenderValue)}
                </div>
                <div className="text-xs mt-1">
                  <span className="font-bold text-blue-600">{kpi.activeTendersCount} Active</span>{" "}
                  <span className="text-slate-400">• {kpi.totalTendersCount} Total Bids</span>
                </div>
              </div>
            </div>

            {/* KPI 2: GM Governance Gate */}
            <Link
              href="/approvals"
              className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-amber-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    GM GOVERNANCE GATE
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {kpi.pendingApprovalsCount}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Offers Pending</span>
                </div>
                <div className="text-xs font-bold text-amber-600 mt-1 flex items-center gap-1">
                  <span>
                    {kpi.pendingApprovalsCount === 0
                      ? "100% Cleared & Compliant"
                      : "Mandatory Review Required"}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>

            {/* KPI 3: Awarded Contracts */}
            <Link
              href="/contracts"
              className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                    <FileSignature className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    AWARDED CONTRACTS
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <FileSignature className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-slate-900 tracking-tight">
                  {formatAED(kpi.totalContractValue)}
                </div>
                <div className="text-xs mt-1">
                  <span className="font-bold text-emerald-600">{kpi.contractsCount} Backed</span>{" "}
                  <span className="text-slate-400">• 100% Employer PO</span>
                </div>
              </div>
            </Link>

            {/* KPI 4: Project Execution */}
            <Link
              href="/projects"
              className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:border-purple-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                    <FolderKanban className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    PROJECT EXECUTION
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <BarChart2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {kpi.activeProjectsCount}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Active Site</span>
                </div>
                <div className="text-xs mt-1 text-slate-500">
                  Budget: <strong className="font-bold text-purple-700">{formatAED(kpi.totalProjectBudget)}</strong>
                </div>
              </div>
            </Link>
          </div>

          {/* Middle Row: Left Column (7 cols: Charts + Pipeline Table) & Right Column (5 cols: GM Approvals + Conglomerate Divisions) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Left Column (7 cols): Charts + Recent Tender Pipeline Table */}
            <div className="lg:col-span-7 space-y-3">
              <DashboardCharts
                tendersByEntity={charts.tendersByEntity}
                tenderStatus={charts.tenderStatus}
                projectStatus={charts.projectStatus}
              />

              {/* Recent Tender Pipeline Table (Directly under charts with generous row heights) */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 shadow-xs">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-none">
                        Recent Tender Pipeline
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Active and submitted bids across operating subsidiaries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange("crm")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                      CRM Clients ({customers.length})
                    </button>
                    <span className="text-slate-300">—</span>
                    <Link
                      href="/tenders"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                    >
                      <span>Full Register</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                        <th className="pb-2">TENDER #</th>
                        <th className="pb-2">TITLE &amp; CLIENT</th>
                        <th className="pb-2">DIVISION</th>
                        <th className="pb-2">STATUS</th>
                        <th className="pb-2 text-right">VALUE (AED)</th>
                        <th className="pb-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentTenders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            <FileSpreadsheet className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                            <span className="font-semibold text-slate-700 text-xs block">
                              No tenders registered yet
                            </span>
                          </td>
                        </tr>
                      ) : (
                        recentTenders.map((t: any) => (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5">
                              <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                                {t.tenderNumber}
                              </span>
                            </td>
                            <td className="py-2.5 pr-2">
                              <div className="font-bold text-slate-900 text-xs">{t.title}</div>
                              <div className="text-[11px] text-slate-400">{t.customer?.name || "Client"}</div>
                            </td>
                            <td className="py-2.5">
                              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">
                                {t.businessEntity.shortName}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  t.status === "Awarded"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : t.status === "Pending GM Approval"
                                    ? "bg-amber-100 text-amber-800"
                                    : t.status === "Approved"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono font-bold text-slate-900 text-xs">
                              {formatAED(t.estimatedValue)}
                            </td>
                            <td className="py-2.5 text-right">
                              <Link
                                href={`/tenders/${t.id}`}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                              >
                                <span>Open</span>
                                <ChevronRight className="h-3 w-3" />
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

            {/* Right Column (5 cols): Conglomerate Business Divisions */}
            <div className="lg:col-span-5 space-y-3">
              {/* Conglomerate Business Divisions (All 8 Active Entities - NO SCROLLBARS) */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-none">
                        Conglomerate Business Divisions
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Live pipeline contribution per commercial entity
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    8 Divisions
                  </span>
                </div>

                <div className="space-y-1">
                  {entityBreakdown && entityBreakdown.map((ent: any) => (
                    <Link
                      key={ent.id}
                      href={`/?entity=${ent.code}`}
                      className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50 transition text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: ent.color }}
                        />
                        <span className="font-semibold text-slate-800 truncate text-xs group-hover:text-blue-700 transition">
                          {ent.shortName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({ent.count})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${ent.percentage}%`,
                              backgroundColor: ent.color,
                            }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs w-24 text-right">
                          {ent.value > 0 ? formatAED(ent.value) : "AED 0"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: CRM & CUSTOMERS TAB                                              */}
      {/* ========================================================================= */}
      {activeTab === "crm" && (
        <div className="space-y-3.5">
          {/* 4 CRM Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Client Accounts
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight mt-0.5 block">
                  {customers.length}
                </span>
                <span className="text-[10px] text-slate-400">Government &amp; Tier-1 Developers</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Key Decision Makers
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight mt-0.5 block">
                  {contacts.length}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Project Directors &amp; Procurement</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                <Phone className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Commercial Leads
                </span>
                <span className="text-xl font-black text-amber-600 tracking-tight mt-0.5 block">
                  {leads.length}
                </span>
                <span className="text-[10px] text-slate-400">Inbound Requests for Proposal</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                <Mail className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pre-Tender Pipeline
                </span>
                <span className="text-xl font-black text-purple-700 tracking-tight mt-0.5 block">
                  {opportunities.length}
                </span>
                <span className="text-[10px] text-slate-400">Tracked Opportunities</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-xs">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Customers Register + Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Customers Register */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    Authorized Employer Directory
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Client database for competitive bidding and procurement
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="pl-7 pr-3 py-1 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:outline-none w-36 sm:w-44"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Client</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto flex-1 max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Client Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Primary Contact</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <Users className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                          <span className="font-semibold text-slate-600 text-xs block">
                            No matching clients found
                          </span>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700 text-xs">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                              {c.code}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {c.tenders?.length || 0} tenders • {c.contracts?.length || 0} contracts
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-700">
                              {c.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 text-[11px] font-medium">
                            <div className="font-bold">{c.primaryContact}</div>
                            <div className="text-[10px] text-slate-400">{c.phone}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{c.city}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pre-Tender Opportunities */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    Pre-Tender Opportunities
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Commercial pipeline before tender issuance
                  </p>
                </div>
                <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  {opportunities.length} Active
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {opportunities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <Target className="h-5 w-5 text-slate-300 mx-auto mb-1" />
                    <span>No active pre-tender opportunities recorded.</span>
                  </div>
                ) : (
                  opportunities.map((o: any) => (
                    <div
                      key={o.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-400">{o.oppNumber}</span>
                        <span
                          className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                          style={{
                            backgroundColor: `${o.businessEntity.color}15`,
                            color: o.businessEntity.color,
                          }}
                        >
                          {o.businessEntity.shortName}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 line-clamp-1 text-xs">{o.name}</h4>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{o.customer.name}</span>
                        <strong className="text-slate-900 font-bold">{formatAED(o.expectedValue)}</strong>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                        <span className="text-purple-700 font-semibold">{o.status}</span>
                        <span className="text-slate-400">
                          Target: {new Date(o.expectedCloseDate).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CUSTOMER MODAL                                                        */}
      {/* ========================================================================= */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Register New Client / Customer</h3>
                <p className="text-xs text-slate-500">
                  Add an employer or client account for bidding and contracting
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer / Employer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g. Dubai Roads &amp; Transport Authority (RTA)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Client Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCustomer.code}
                    onChange={(e) => setNewCustomer({ ...newCustomer, code: e.target.value })}
                    placeholder="e.g. RTA-DXB"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Client Type
                  </label>
                  <select
                    value={newCustomer.type}
                    onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Government / Authority">Government / Authority</option>
                    <option value="Semi-Government Developer">Semi-Government Developer</option>
                    <option value="Private Developer">Private Developer</option>
                    <option value="Tier-1 Main Contractor">Tier-1 Main Contractor</option>
                    <option value="Industrial / Commercial">Industrial / Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    value={newCustomer.primaryContact}
                    onChange={(e) => setNewCustomer({ ...newCustomer, primaryContact: e.target.value })}
                    placeholder="e.g. Eng. Tariq Al Mansoori"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+971 4 284 4444"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="tenders@rta.ae"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Emirate
                  </label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="Dubai"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCustomer}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm shadow-blue-500/20"
                >
                  {submittingCustomer ? "Registering..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
