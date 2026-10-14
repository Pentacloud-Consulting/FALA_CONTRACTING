"use client";

import React, { useState } from "react";
import Image from "next/image";
import LoginModal from "./LoginModal";
import {
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Globe,
  Layers,
  Activity,
  Home,
  Wrench,
  Package,
  HardHat,
  ChevronRight,
  MapPin,
  Menu,
  X,
  Sparkles,
  Phone,
  Mail,
  Award,
  Users,
  TrendingUp,
  FileSpreadsheet,
  Check,
} from "lucide-react";

const DIVISIONS = [
  {
    id: "roads",
    name: "Roads & Infrastructure",
    description:
      "Arterial highways, municipal stormwater drainage, bridges, and asphalt paving constructed to RTA and Dubai Municipality specifications.",
    icon: Truck,
    badge: "ROAD_INFRA",
    accent: "#155EEF",
  },
  {
    id: "export",
    name: "Export Manufacturing",
    description:
      "Industrial precast culverts, bridge girders, and structural components manufactured and exported across the GCC (HS-6810.91).",
    icon: Globe,
    badge: "EXP_MFG",
    accent: "#059669",
  },
  {
    id: "materials",
    name: "Building Materials",
    description:
      "Quarry-direct aggregate extraction, Sub-base Class A crushing, and specialized heavy tipper haulage logistics across the Emirates.",
    icon: Layers,
    badge: "BLD_MAT",
    accent: "#D97706",
  },
  {
    id: "medical",
    name: "Medical & Cleanroom Solutions",
    description:
      "Turnkey healthcare civil and MEP fit-outs, ICRA Class IV negative pressure containment, and medical gas trenching systems.",
    icon: Activity,
    badge: "MED",
    accent: "#0284C7",
  },
  {
    id: "realestate",
    name: "Real Estate",
    description:
      "Prime industrial logistics plots, turnkey warehouse superstructures, steel structural framing, and industrial development bays.",
    icon: Home,
    badge: "REAL_EST",
    accent: "#4F46E5",
  },
  {
    id: "fleet",
    name: "Fleet & Workshop",
    description:
      "Over 200 heavy plant assets, CAT pavers, Dynapac rollers, mobile hydraulic repair yards, and rapid diagnostic engineering overhaul.",
    icon: Wrench,
    badge: "FLEET_WS",
    accent: "#475569",
  },
  {
    id: "readymix",
    name: "Ready-Mix Concrete",
    description:
      "High-performance certified C30/37 to C60/75 mix designs, central batching plants, and 56m mobile boom pumping operations.",
    icon: Package,
    badge: "RDY_MIX",
    accent: "#EA580C",
  },
  {
    id: "workforce",
    name: "Workforce & Manpower",
    description:
      "100% MOHRE and WPS visa compliance, certified civil tradesmen, centralized staff camps, and dedicated AC bus transit fleets.",
    icon: HardHat,
    badge: "HR_WORKFORCE",
    accent: "#0D9488",
  },
];

const CAPABILITIES = [
  {
    title: "Infrastructure & Highway Development",
    detail: "Heavy civil earthworks, multi-lane asphalt paving, and stormwater drainage networks.",
  },
  {
    title: "Manufacturing & Building Materials",
    detail: "Precast girder casting, quarry extraction, and certified ready-mix concrete batching.",
  },
  {
    title: "Project & Contract Management",
    detail: "Automated cost estimation BOQ, FIDIC awarded contracts, and milestone progress tracking.",
  },
  {
    title: "Procurement & Inventory",
    detail: "Digital three-way match workflow from Purchase Requisitions (PR) to PO and GRN.",
  },
  {
    title: "Finance & Commercial Operations",
    detail: "Attendance-backed monthly billing, IPC verification, and executive P&L margin realization.",
  },
  {
    title: "Workforce & Fleet Management",
    detail: "MOHRE visa management, central residential camps, and heavy plant diagnostic overhaul.",
  },
];

export default function PublicHomePage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#101828] selection:bg-[#EFF6FF] selection:text-[#155EEF] font-sans antialiased">
      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* =========================================================
          HEADER & NAVIGATION
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5EAF2] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#155EEF] to-[#123B82] text-white flex items-center justify-center font-black text-xl shadow-sm shadow-[#155EEF]/20">
              F
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-[#101828] block leading-tight">
                FALA ROAD CONTRACTING
              </span>
              <span className="text-[11px] font-semibold text-[#667085] block">
                Infrastructure & Conglomerate Group · UAE
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#667085]">
            <button
              onClick={() => scrollTo("hero")}
              className="hover:text-[#155EEF] transition py-1"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo("divisions")}
              className="hover:text-[#155EEF] transition py-1"
            >
              Divisions
            </button>
            <button
              onClick={() => scrollTo("capabilities")}
              className="hover:text-[#155EEF] transition py-1"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollTo("stats")}
              className="hover:text-[#155EEF] transition py-1"
            >
              Enterprise Solutions
            </button>
          </nav>

          {/* Right Action: ERP Portal Login Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#155EEF] hover:bg-[#123B82] px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#155EEF]/25 hover:shadow-md transition active:scale-[0.98]"
            >
              <Lock className="h-3.5 w-3.5 text-white/90" />
              <span>ERP Portal Login</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#155EEF] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              <Lock className="h-3 w-3" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#F7F9FC]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5EAF2] bg-white px-4 py-4 space-y-3 shadow-lg">
            <button
              onClick={() => scrollTo("hero")}
              className="block w-full text-left py-2 text-sm font-semibold text-[#101828] hover:text-[#155EEF]"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo("divisions")}
              className="block w-full text-left py-2 text-sm font-semibold text-[#101828] hover:text-[#155EEF]"
            >
              Divisions
            </button>
            <button
              onClick={() => scrollTo("capabilities")}
              className="block w-full text-left py-2 text-sm font-semibold text-[#101828] hover:text-[#155EEF]"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollTo("stats")}
              className="block w-full text-left py-2 text-sm font-semibold text-[#101828] hover:text-[#155EEF]"
            >
              Enterprise Solutions
            </button>
            <div className="pt-2 border-t border-[#E5EAF2]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLoginModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] py-2.5 text-xs font-bold text-white"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>ERP Portal Login</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          SECTION 1: PREMIUM HERO
      ========================================================= */}
      <section
        id="hero"
        className="relative bg-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#E5EAF2]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (Content) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#155EEF]/20 text-[#155EEF] text-xs font-bold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
                <span>UAE INFRASTRUCTURE & ENGINEERING</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#101828] tracking-tight leading-[1.12]">
                Building the Infrastructure That{" "}
                <span className="text-[#155EEF]">Moves the UAE Forward.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-2xl font-normal">
                Delivering integrated infrastructure, engineering, manufacturing, and
                operational solutions that support the UAE's growth.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollTo("divisions")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] hover:bg-[#123B82] px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-[#155EEF]/20 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Explore Our Divisions</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100/80 border border-[#155EEF]/25 px-6 py-3.5 text-sm font-bold text-[#155EEF] transition"
                >
                  <Lock className="h-4 w-4 text-[#155EEF]" />
                  <span>ERP Portal Login</span>
                </button>
              </div>

              {/* Location Indicator */}
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#667085]">
                <MapPin className="h-4 w-4 text-[#155EEF]" />
                <span>Dubai, United Arab Emirates</span>
                <span className="text-slate-300">·</span>
                <span>Operating across Dubai, Abu Dhabi & Northern Emirates</span>
              </div>
            </div>

            {/* Right Column (High-Quality UAE Infrastructure Visual) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-[#E5EAF2] shadow-xl bg-[#F7F9FC]">
                {/* Real High-Resolution Dubai Highway Interchange Photo */}
                <Image
                  src="/images/uae-highway-hero.jpg"
                  alt="Modern UAE multi-level highway interchange and engineering infrastructure in Dubai"
                  width={1200}
                  height={800}
                  priority
                  className="w-full h-[360px] sm:h-[440px] lg:h-[480px] object-cover object-center transform hover:scale-[1.02] transition duration-700 ease-out"
                />

                {/* Subtle Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/50 via-transparent to-transparent pointer-events-none" />

                {/* Floating Information Panel: 8 Operating Divisions */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-[#E5EAF2] shadow-lg flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center font-bold text-sm shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[#101828]">8 Operating Divisions</span>
                    </div>
                    <p className="text-[11px] text-[#667085] leading-tight">
                      Civil, industrial, materials & workforce
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 2: ENTERPRISE STATISTICS
      ========================================================= */}
      <section id="stats" className="py-12 sm:py-16 bg-white border-b border-[#E5EAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
            {/* Stat 1 */}
            <div className="lg:pr-8 lg:border-r border-[#E5EAF2] space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-[#155EEF]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  Contract Pipeline
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#155EEF] font-mono tracking-tight">
                AED 6.2B+
              </div>
              <p className="text-sm font-bold text-[#101828]">Active & Delivered Tenders</p>
              <p className="text-xs text-[#667085]">Strategic UAE civil packages</p>
            </div>

            {/* Stat 2 */}
            <div className="lg:px-8 lg:border-r border-[#E5EAF2] space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-[#155EEF]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  Subsidiary Network
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#155EEF] font-mono tracking-tight">
                8
              </div>
              <p className="text-sm font-bold text-[#101828]">Operating Divisions</p>
              <p className="text-xs text-[#667085]">End-to-end conglomerate synergy</p>
            </div>

            {/* Stat 3 */}
            <div className="lg:px-8 lg:border-r border-[#E5EAF2] space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-[#155EEF]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  Certified Manpower
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#155EEF] font-mono tracking-tight">
                15,000+
              </div>
              <p className="text-sm font-bold text-[#101828]">Workforce & Plant Operators</p>
              <p className="text-xs text-[#667085]">100% MOHRE & WPS compliant</p>
            </div>

            {/* Stat 4 */}
            <div className="lg:pl-8 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-[#155EEF]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  Governance Quality
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#155EEF] font-mono tracking-tight">
                99.4%
              </div>
              <p className="text-sm font-bold text-[#101828]">Quality & Safety Delivery</p>
              <p className="text-xs text-[#667085]">RTA & Dubai Municipality standard</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 3: OUR OPERATING DIVISIONS
      ========================================================= */}
      <section id="divisions" className="py-20 bg-[#F7F9FC] border-b border-[#E5EAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#155EEF] bg-[#EFF6FF] px-3.5 py-1 rounded-full border border-[#155EEF]/20">
              Conglomerate Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Eight Divisions. One Connected Enterprise.
            </h2>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              A diverse portfolio of specialized businesses working together to deliver
              integrated infrastructure and operational solutions across the UAE.
            </p>
          </div>

          {/* 8-Card Grid (4 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DIVISIONS.map((div) => {
              const Icon = div.icon;
              return (
                <div
                  key={div.id}
                  className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs hover:shadow-md hover:border-[#155EEF]/50 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center group-hover:bg-[#155EEF] group-hover:text-white transition-colors duration-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold text-[#667085] bg-[#F7F9FC] px-2 py-0.5 rounded border border-[#E5EAF2]">
                        {div.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-[#101828] group-hover:text-[#155EEF] transition-colors">
                        {div.name}
                      </h3>
                      <p className="text-xs text-[#667085] leading-relaxed line-clamp-3">
                        {div.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E5EAF2] flex items-center justify-between text-xs font-semibold text-[#155EEF]">
                    <span>Explore Division</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 4: INTEGRATED CAPABILITIES & ENTERPRISE SOLUTIONS
      ========================================================= */}
      <section id="capabilities" className="py-20 bg-white border-b border-[#E5EAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Side: Capabilities & Strategy */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#155EEF] bg-[#EFF6FF] px-3.5 py-1 rounded-full border border-[#155EEF]/20">
                End-to-End Delivery
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight leading-tight">
                From Infrastructure Delivery to Intelligent Operations.
              </h2>

              <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
                Connect project execution, commercial operations, procurement, finance,
                and workforce management through an integrated enterprise approach.
              </p>

              {/* Concise Capabilities Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {CAPABILITIES.map((cap, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-[#E5EAF2] bg-[#F7F9FC] space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <h4 className="text-xs font-bold text-[#101828] leading-tight">
                        {cap.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#667085] pl-7 leading-relaxed">
                      {cap.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#155EEF] hover:bg-[#123B82] px-6 py-3 text-xs font-bold text-white shadow-sm shadow-[#155EEF]/20 transition"
                >
                  <Lock className="h-3.5 w-3.5 text-white/90" />
                  <span>Explore Our Capabilities</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Side: Realistic Browser-Style ERP Dashboard Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#E5EAF2] bg-white shadow-xl overflow-hidden">
                {/* Browser Title Bar */}
                <div className="bg-[#F7F9FC] border-b border-[#E5EAF2] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#F04438]" />
                    <span className="w-3 h-3 rounded-full bg-[#F79009]" />
                    <span className="w-3 h-3 rounded-full bg-[#12B76A]" />
                  </div>
                  <div className="px-4 py-1 rounded-md bg-white border border-[#E5EAF2] text-[11px] font-mono text-[#667085] flex items-center gap-2 shadow-2xs">
                    <Lock className="h-3 w-3 text-[#12B76A]" />
                    <span>fala.cloud/erp/operations</span>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Dashboard Frame Content */}
                <div className="p-5 sm:p-6 space-y-4 bg-white">
                  {/* Top Bar inside frame */}
                  <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-[#155EEF] text-white flex items-center justify-center font-bold text-xs">
                        F
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#101828] block">
                          Executive CRM & ERP Operations
                        </span>
                        <span className="text-[10px] text-[#667085]">
                          Consolidated Group Portfolio
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#EFF6FF] text-[#155EEF] font-bold px-2 py-0.5 rounded border border-[#155EEF]/20">
                      LIVE PLATFORM
                    </span>
                  </div>

                  {/* 3 Metric Cards inside frame */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
                      <span className="text-[10px] text-[#667085] font-semibold block uppercase">
                        Active Bids
                      </span>
                      <span className="text-sm font-extrabold text-[#101828] font-mono">
                        AED 5.27M
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
                      <span className="text-[10px] text-[#667085] font-semibold block uppercase">
                        Target Margin
                      </span>
                      <span className="text-sm font-extrabold text-[#059669] font-mono">
                        15.0% - 18.5%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
                      <span className="text-[10px] text-[#667085] font-semibold block uppercase">
                        GM Approval
                      </span>
                      <span className="text-sm font-extrabold text-[#155EEF] font-mono">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Active Tenders Mini Table */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#101828] uppercase tracking-wider block">
                      Active Multi-Division Tenders
                    </span>
                    <div className="rounded-xl border border-[#E5EAF2] divide-y divide-[#E5EAF2] text-xs">
                      <div className="p-2.5 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#155EEF]">
                            TND-2026-0001
                          </span>
                          <span className="font-semibold text-[#101828]">Pentacloud Arterial</span>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                          Roads & Infra
                        </span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#0D9488]">
                            TND-2026-0002
                          </span>
                          <span className="font-semibold text-[#101828]">Pentahouse Workforce</span>
                        </div>
                        <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded">
                          100 Personnel
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle Process Pill */}
                  <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#155EEF]/20 flex items-center justify-between text-[11px] text-[#123B82] font-semibold">
                    <span>Lifecycle: Tender → BOQ → GM Gate → Awarded Contract</span>
                    <span className="text-[#155EEF] font-bold">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 5: PREMIUM CLOSING CTA
      ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#EFF6FF] via-white to-[#EFF6FF] border border-[#E5EAF2] p-10 sm:p-16 text-center space-y-6 shadow-sm relative overflow-hidden">
            {/* Subtle decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#155EEF] bg-white px-3.5 py-1 rounded-full border border-[#155EEF]/20 shadow-2xs">
                Forward Together
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-[#101828] tracking-tight">
                Ready to Build What's Next?
              </h2>

              <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl mx-auto">
                Discover how FALA ROAD's integrated capabilities can support your next
                infrastructure or engineering project.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => scrollTo("divisions")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] hover:bg-[#123B82] px-7 py-3.5 text-xs font-bold text-white shadow-sm shadow-[#155EEF]/25 transition"
                >
                  <span>Explore Our Divisions</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#E5EAF2] px-7 py-3.5 text-xs font-bold text-[#155EEF] transition shadow-2xs"
                >
                  <Lock className="h-4 w-4 text-[#155EEF]" />
                  <span>Access ERP Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-white border-t border-[#E5EAF2] py-12 text-[#667085] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E5EAF2]">
            {/* Logo & Info */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#155EEF] text-white flex items-center justify-center font-black text-base shadow-xs">
                F
              </div>
              <div>
                <span className="text-sm font-black text-[#101828] block leading-tight">
                  FALA ROAD CONTRACTING
                </span>
                <span className="text-[11px] text-[#667085]">
                  Infrastructure & Conglomerate Group · UAE
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-6 font-semibold text-xs text-[#101828]">
              <button onClick={() => scrollTo("hero")} className="hover:text-[#155EEF] transition">
                Home
              </button>
              <button onClick={() => scrollTo("divisions")} className="hover:text-[#155EEF] transition">
                Divisions
              </button>
              <button onClick={() => scrollTo("capabilities")} className="hover:text-[#155EEF] transition">
                Capabilities
              </button>
              <button onClick={() => scrollTo("stats")} className="hover:text-[#155EEF] transition">
                Enterprise Solutions
              </button>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="text-[#155EEF] hover:underline transition font-bold"
              >
                ERP Portal Login
              </button>
            </div>
          </div>

          {/* Bottom Bar: Contacts & Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex flex-wrap items-center gap-6 text-[#667085]">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#155EEF]" />
                P.O. Box 48190, Dubai, United Arab Emirates
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#155EEF]" />
                +971 4 347 8800
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#155EEF]" />
                contracts@falaroad.ae
              </span>
            </div>

            <p>© 2026 FALA ROAD CONTRACTING. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
