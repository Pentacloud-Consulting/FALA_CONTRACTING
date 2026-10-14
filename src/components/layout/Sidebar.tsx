"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Calculator,
  FileCheck2,
  ShieldAlert,
  FileSignature,
  FolderKanban,
  ShoppingCart,
  BarChart3,
  Boxes,
  Landmark,
  HardHat,
  Truck,
  Sliders,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const isGM = currentUser?.role === "GM";

  const navigation: NavGroup[] = [
    {
      group: "Executive & Pipeline",
      items: [
        { name: "Executive Dashboard & CRM", href: "/", icon: LayoutDashboard },
        { name: "Tender Management", href: "/tenders", icon: FileSpreadsheet },
        { name: "Cost Estimation", href: "/estimation", icon: Calculator },
        { name: "Quotations & Offers", href: "/quotations", icon: FileCheck2 },
        ...(isGM
          ? [
              {
                name: "GM Approvals",
                href: "/approvals",
                icon: ShieldAlert,
                badge: "Mandatory",
                badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
              },
            ]
          : []),
      ],
    },
    {
      group: "Execution & Delivery",
      items: [
        { name: "Contracts Register", href: "/contracts", icon: FileSignature },
        { name: "Projects & Milestones", href: "/projects", icon: FolderKanban },
        { name: "Procurement (PR/PO/GRN)", href: "/procurement", icon: ShoppingCart },
        { name: "Executive Reports", href: "/reports", icon: BarChart3 },
      ],
    },
    {
      group: "Simplified Modules (Demo)",
      items: [
        { name: "Inventory", href: "/inventory", icon: Boxes },
        { name: "Finance & Accounts", href: "/finance", icon: Landmark },
        { name: "HR & Workforce", href: "/hr", icon: HardHat },
        { name: "Fleet & Workshop", href: "/fleet", icon: Truck },
        { name: "Administration", href: "/admin", icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 h-full bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between select-none print:hidden">
      <div className="py-4 overflow-y-auto flex-1">
        {/* Navigation Groups */}
        {navigation.map((group, groupIndex) => (
          <div key={group.group} className={groupIndex > 0 ? "mt-6" : ""}>
            <div className="px-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.group}
            </div>
            <nav className="space-y-0.5 px-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/" || pathname === "/crm"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge ? (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="h-3 w-3 text-blue-200" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">Fala Enterprise MVP</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
            SQLite v6.19
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Unified Operations Platform
        </p>
      </div>
    </aside>
  );
}
