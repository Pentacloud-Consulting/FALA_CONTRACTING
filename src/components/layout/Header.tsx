"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DEMO_USERS } from "@/lib/types";
import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  ShieldCheck,
  UserCheck,
  HardHat,
  Filter,
  LogOut,
} from "lucide-react";

export default function Header() {
  const {
    currentUser,
    setCurrentUser,
    selectedEntityCode,
    setSelectedEntityCode,
    selectedEntityConfig,
    allEntities,
    showToast,
    logout,
  } = useApp();

  const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-white/80 print:hidden">
      {/* Left: Branding & Business Entity Selector */}
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm group-hover:bg-blue-800 transition">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-sm">FALA ROAD</span>
              <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-semibold text-blue-800 uppercase tracking-wide">
                CRM + ERP
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight block">
              Contracting & Infrastructure Conglomerate
            </span>
          </div>
        </Link>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Business Entity Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setEntityDropdownOpen(!entityDropdownOpen);
              setRoleDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-500">Business Unit:</span>
            {selectedEntityCode === "ALL" ? (
              <span className="font-semibold text-slate-900">All Businesses (Consolidated)</span>
            ) : (
              <span className="font-semibold text-blue-700 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: selectedEntityConfig?.color || "#2563eb" }}
                />
                {selectedEntityConfig?.name}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {entityDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Filter Across Fala Business Divisions
              </div>
              <button
                onClick={() => {
                  setSelectedEntityCode("ALL");
                  setEntityDropdownOpen(false);
                  showToast("Switched to All Businesses (Consolidated View)", "info");
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
                  selectedEntityCode === "ALL"
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>All Businesses (Consolidated)</span>
                {selectedEntityCode === "ALL" && <span className="text-blue-600">✓</span>}
              </button>

              <div className="my-1 border-t border-slate-100" />

              {allEntities.map((entity) => (
                <button
                  key={entity.code}
                  onClick={() => {
                    setSelectedEntityCode(entity.code);
                    setEntityDropdownOpen(false);
                    showToast(`Filtered to ${entity.name}`, "info");
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition text-left ${
                    selectedEntityCode === entity.code
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entity.color }}
                    />
                    <div>
                      <div className="leading-tight">{entity.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{entity.code}</div>
                    </div>
                  </div>
                  {selectedEntityCode === entity.code && <span className="text-blue-600">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Search, Demo Role Switcher, Quick Action, User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden xl:block w-52">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenders, contracts..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setEntityDropdownOpen(false);
            }}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition shadow-sm ${
              currentUser.role === "GM"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {currentUser.role === "GM" ? (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            ) : (
              <HardHat className="h-4 w-4 text-blue-600" />
            )}
            <div className="text-left hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">
                Local Demo Role
              </span>
              <span className="font-semibold">{currentUser.name}</span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                currentUser.role === "GM"
                  ? "bg-emerald-200 text-emerald-900"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {currentUser.role}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Switch Demo User & Role
                </span>
                <span className="text-[10px] text-slate-500">
                  Switch roles to test the GM Approval gate vs Estimator creation.
                </span>
              </div>
              <div className="my-1 border-t border-slate-100" />

              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setRoleDropdownOpen(false);
                    showToast(`Switched active demo user to ${user.name} (${user.role})`);
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-xs transition text-left ${
                    currentUser.role === user.role
                      ? "bg-blue-50 text-blue-900 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1 rounded ${
                      user.role === "GM" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role === "GM" ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{user.name}</span>
                      <span
                        className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase ${
                          user.role === "GM"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{user.title}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          title="Sign out of ERP and return to Public Home Page"
        >
          <LogOut className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
