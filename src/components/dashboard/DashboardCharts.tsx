"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatAED } from "@/lib/calculations";
import {
  FileSpreadsheet,
  Plus,
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const COLORS = [
  "#2563eb", // Roads - Blue
  "#059669", // Export - Emerald
  "#d97706", // Building Mat - Amber
  "#e11d48", // Medical - Rose
  "#7c3aed", // Real Estate - Purple
  "#0891b2", // Fleet - Cyan
  "#ea580c", // Ready Mix - Orange
  "#0d9488", // HR - Teal
];

// Short codes for clean, uncrowded X-axis labels
const SHORT_CODE_MAP: Record<string, string> = {
  "Roads & Infra": "Roads",
  "Export Mfg": "Export",
  "Building Mat.": "Materials",
  "Medical": "Medical",
  "Real Estate": "Real Est",
  "Fleet & Workshop": "Fleet",
  "Ready-Mix": "R-Mix",
  "HR & Workforce": "Workforce",
};

// Canonical 4-stage EPC governance lifecycle stages
const GOVERNANCE_STAGES = [
  {
    id: "Awarded",
    label: "Awarded & Won",
    color: "#2563eb",
    matches: ["Awarded", "Contract Signed", "Won"],
  },
  {
    id: "Pending GM Approval",
    label: "GM Review Gate",
    color: "#d97706",
    matches: ["Pending GM Approval", "Under Review"],
  },
  {
    id: "Under Estimation",
    label: "BOQ Estimation",
    color: "#7c3aed",
    matches: ["Under Estimation", "Estimation Completed", "Quotation in Preparation"],
  },
  {
    id: "Draft",
    label: "Tender Genesis",
    color: "#64748b",
    matches: ["Draft", "Registered"],
  },
];

export default function DashboardCharts({
  tendersByEntity,
  tenderStatus,
}: {
  tendersByEntity: any[];
  tenderStatus: any[];
  projectStatus: any[];
}) {
  const [chartView, setChartView] = useState<"bar" | "ranking">("bar");
  const hasEntityData = tendersByEntity && tendersByEntity.some((e) => e.value > 0);
  const totalStatusCount = tenderStatus ? tenderStatus.reduce((sum, s) => sum + s.value, 0) : 0;

  // Format data for bar chart with clean short names
  const formattedBarData =
    tendersByEntity?.map((item) => ({
      ...item,
      shortName: SHORT_CODE_MAP[item.name] || item.name.slice(0, 8),
    })) || [];

  // Top subsidiary contributor
  const sortedEntities = [...formattedBarData].sort((a, b) => b.value - a.value);
  const topEntity = sortedEntities[0];
  const totalPipelineVal = formattedBarData.reduce((sum, e) => sum + e.value, 0);
  const topEntityPct =
    totalPipelineVal > 0 && topEntity ? Math.round((topEntity.value / totalPipelineVal) * 100) : 0;

  // Map out the 4 governance stages so all 4 rows are always populated
  const stagesData = GOVERNANCE_STAGES.map((stage) => {
    const matched = tenderStatus?.find(
      (s) => stage.matches.includes(s.name) || s.name === stage.id
    );
    const count = matched ? matched.value : 0;
    const pct = totalStatusCount > 0 ? Math.round((count / totalStatusCount) * 100) : 0;
    return {
      ...stage,
      count,
      pct,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* ========================================================================= */}
      {/* Chart 1: Tender Value by Division                                         */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shadow-xs">
                <BarChart2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-none">
                  Tender Value by Division
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Financial pipeline across Fala subsidiaries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                type="button"
                onClick={() => setChartView("bar")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                  chartView === "bar"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Chart
              </button>
              <button
                type="button"
                onClick={() => setChartView("ranking")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                  chartView === "ranking"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Ranks
              </button>
            </div>
          </div>

          {/* Chart Content */}
          <div className="h-44 w-full">
            {hasEntityData ? (
              chartView === "bar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formattedBarData}
                    margin={{ top: 12, right: 6, left: -14, bottom: 2 }}
                  >
                    <XAxis
                      dataKey="shortName"
                      interval={0}
                      tick={{ fontSize: 9.5, fill: "#475569", fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 9.5, fill: "#94a3b8" }}
                      tickFormatter={(val) =>
                        val >= 1000000
                          ? `${(val / 1000000).toFixed(1)}M`
                          : val > 0
                          ? `${val / 1000}k`
                          : "0k"
                      }
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value: any, _name: any, props: any) => [
                        formatAED(Number(value)),
                        props?.payload?.name || "Tender Value",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "11px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        backgroundColor: "#ffffff",
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                      background={{ fill: "#f8fafc" }}
                    >
                      {formattedBarData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.value > 0 ? COLORS[index % COLORS.length] : "#e2e8f0"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full overflow-y-auto space-y-1.5 pr-1">
                  {sortedEntities.map((item, idx) => {
                    const pct =
                      totalPipelineVal > 0 ? Math.round((item.value / totalPipelineVal) * 100) : 0;
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-slate-400 w-4">
                            #{idx + 1}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span className="font-semibold text-slate-800 text-[11px] truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-slate-400 font-medium">{pct}%</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {item.value > 0 ? formatAED(item.value) : "AED 0"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-3 border border-dashed border-slate-200 rounded-xl">
                <FileSpreadsheet className="h-5 w-5 text-slate-300 mb-1" />
                <p className="text-[11px] font-semibold text-slate-700">No active tenders in pipeline</p>
                <Link
                  href="/tenders/new"
                  className="inline-flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition mt-1.5"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Tender</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Executive Subsidiary Insight Footer */}
        <div className="border-t border-slate-100 pt-2.5 mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-400 text-[11px]">Leading Subsidiary:</span>
            <span className="font-bold text-slate-900 text-xs truncate">
              {topEntity ? topEntity.name : "Roads & Infra"}
            </span>
            <span className="font-mono font-bold text-blue-700 text-xs">
              ({topEntity ? formatAED(topEntity.value) : "AED 0"} • {topEntityPct}%)
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            1 of 8 Active
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Chart 2: Workflow Stage Breakdown (Full 4-Stage EPC Funnel + KPI Pills)   */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shadow-xs">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-none">
                  Workflow Stage Breakdown
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Governance progression (Draft → GM Gate → Awarded)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
              {totalStatusCount} Total Bids
            </span>
          </div>

          {/* Middle: Donut (5 cols) + 4 EPC Governance Stages (7 cols) */}
          <div className="h-44 w-full grid grid-cols-12 items-center">
            {/* Donut with Centered Number (5 cols) */}
            <div className="col-span-5 h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalStatusCount > 0 ? tenderStatus : [{ name: "None", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={52}
                    paddingAngle={totalStatusCount > 1 ? 3 : 0}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {totalStatusCount > 0 ? (
                      tenderStatus.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    ) : (
                      <Cell fill="#f1f5f9" />
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Tenders`, name]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "11px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered KPI */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {totalStatusCount}
                </span>
                <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                  Tenders
                </span>
              </div>
            </div>

            {/* Complete 4-Stage Governance Funnel (7 cols) */}
            <div className="col-span-7 pl-3 space-y-2">
              {stagesData.map((stage) => {
                const isZero = stage.count === 0;
                return (
                  <div key={stage.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isZero ? "bg-slate-300" : ""
                          }`}
                          style={!isZero ? { backgroundColor: stage.color } : undefined}
                        />
                        <span
                          className={`truncate text-[11px] ${
                            isZero ? "text-slate-400 font-medium" : "text-slate-800 font-semibold"
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-[11px] shrink-0 ${
                          isZero ? "text-slate-400" : "font-bold text-slate-900"
                        }`}
                      >
                        {stage.count} ({stage.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${isZero ? 0 : stage.pct}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Executive Commercial Velocity Strip */}
        <div className="border-t border-slate-100 pt-2.5 mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-50/80 py-1.5 px-2 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">
              Win Rate
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 leading-tight mt-0.5">
              100% Won
            </span>
          </div>

          <div className="rounded-lg bg-slate-50/80 py-1.5 px-2 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">
              Cycle Speed
            </span>
            <span className="text-xs font-mono font-bold text-blue-600 leading-tight mt-0.5">
              2.4 Days
            </span>
          </div>

          <div className="rounded-lg bg-slate-50/80 py-1.5 px-2 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">
              PO Backing
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 leading-tight mt-0.5">
              100% Realized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

