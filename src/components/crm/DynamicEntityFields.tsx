"use client";

import React from "react";
import { getEntityByCode, BusinessFieldDef } from "@/lib/business-entities";
import {
  Pencil,
  Ruler,
  Layers,
  Gauge,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Sliders,
  Shield,
  Tag,
  FileText,
  Boxes,
  Truck,
  HardHat,
} from "lucide-react";

interface DynamicEntityFieldsProps {
  entityCode: string;
  values: Record<string, any>;
  onChange?: (key: string, value: any) => void;
  readOnly?: boolean;
  onEdit?: () => void;
  variant?: "cards" | "table";
}

export default function DynamicEntityFields({
  entityCode,
  values,
  onChange,
  readOnly = false,
  onEdit,
  variant = "table",
}: DynamicEntityFieldsProps) {
  const entity = getEntityByCode(entityCode);

  if (!entity) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 font-medium">
        Please select a Business Unit to configure division-specific technical specifications.
      </div>
    );
  }

  const fields = entity.fields || [];

  if (fields.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 font-medium">
        No technical specification parameters defined for this business division.
      </div>
    );
  }

  // Helper to pick an appropriate icon for each dynamic field
  const getFieldIcon = (f: BusinessFieldDef) => {
    const k = (f.key || "").toLowerCase();
    const l = (f.label || "").toLowerCase();
    if (k.includes("date") || l.includes("date") || f.type === "date") return <Calendar className="w-4 h-4" />;
    if (k.includes("length") || k.includes("width") || k.includes("depth") || k.includes("thickness") || k.includes("chainage") || l.includes("dimension")) {
      return <Ruler className="w-4 h-4" />;
    }
    if (k.includes("mix") || k.includes("concrete") || k.includes("asphalt") || k.includes("material") || k.includes("grade")) {
      return <HardHat className="w-4 h-4" />;
    }
    if (k.includes("pressure") || k.includes("speed") || k.includes("load") || k.includes("flow")) {
      return <Gauge className="w-4 h-4" />;
    }
    if (k.includes("area") || k.includes("volume") || k.includes("layer") || k.includes("scope")) {
      return <Layers className="w-4 h-4" />;
    }
    if (k.includes("location") || k.includes("zone") || k.includes("sector") || k.includes("site")) {
      return <MapPin className="w-4 h-4" />;
    }
    if (k.includes("vehicle") || k.includes("truck") || k.includes("fleet")) {
      return <Truck className="w-4 h-4" />;
    }
    if (k.includes("cost") || k.includes("rate") || k.includes("price") || k.includes("budget")) {
      return <DollarSign className="w-4 h-4" />;
    }
    if (k.includes("asset") || k.includes("item") || k.includes("quantity")) {
      return <Boxes className="w-4 h-4" />;
    }
    return <Briefcase className="w-4 h-4" />;
  };

  // 1. CARDS / FLOATING INPUTS VARIANT (EXACT MATCH TO IMAGE 2)
  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
        {fields.map((f: BusinessFieldDef) => {
          const rawVal = values ? values[f.key] : undefined;
          const hasVal = rawVal !== undefined && rawVal !== null && rawVal !== "";
          const displayVal = hasVal
            ? `${rawVal}${f.unit ? ` ${f.unit}` : ""}`
            : "Not Specified";
          const val = values ? values[f.key] ?? "" : "";
          const isFullWidth = f.type === "textarea";

          return (
            <div
              key={f.key}
              className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}
            >
              {/* Field Label */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center">
                  {!readOnly && f.required && (
                    <span className="text-rose-500 font-bold mr-1">*</span>
                  )}
                  <span>{f.label}</span>
                  {f.unit && (
                    <span className="ml-1 text-[11px] text-slate-400 font-normal">
                      ({f.unit})
                    </span>
                  )}
                </label>
                {readOnly && onEdit && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="text-[10px] text-slate-400 hover:text-blue-600 transition flex items-center gap-0.5 cursor-pointer"
                    title="Click to edit specifications"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Input or Read-Only Card Box (Matching Image 2 inputs with left icon) */}
              <div className="relative rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-2xs">
                <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                  {getFieldIcon(f)}
                </div>

                {readOnly ? (
                  <div
                    onClick={onEdit}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-semibold cursor-pointer select-none truncate ${
                      hasVal ? "text-slate-900" : "text-slate-400 italic"
                    }`}
                  >
                    {displayVal}
                  </div>
                ) : f.type === "select" ? (
                  <select
                    value={val}
                    onChange={(e) => onChange?.(f.key, e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 bg-transparent rounded-lg focus:outline-hidden appearance-none cursor-pointer"
                  >
                    <option value="">Select {f.label}...</option>
                    {f.options?.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={val}
                    onChange={(e) => onChange?.(f.key, e.target.value)}
                    placeholder={f.placeholder || `Enter ${f.label}`}
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-transparent rounded-lg focus:outline-hidden resize-none placeholder:text-slate-400"
                  />
                ) : f.type === "number" ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) =>
                        onChange?.(
                          f.key,
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder={f.placeholder || "0"}
                      className="w-full pl-9 pr-14 py-2 text-xs font-mono font-bold text-slate-900 bg-transparent rounded-lg focus:outline-hidden placeholder:text-slate-400"
                    />
                    {f.unit && (
                      <span className="absolute right-3 text-[11px] font-semibold text-slate-400 pointer-events-none">
                        {f.unit}
                      </span>
                    )}
                  </div>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => onChange?.(f.key, e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 bg-transparent rounded-lg focus:outline-hidden"
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onChange?.(f.key, e.target.value)}
                    placeholder={f.placeholder || `Enter ${f.label}`}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 bg-transparent rounded-lg focus:outline-hidden placeholder:text-slate-400"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. TABLE VARIANT (FALLBACK FOR LEGACY SALESFORCE TABULAR VIEWS)
  const leftFields = fields.filter((_, idx) => idx % 2 === 0);
  const rightFields = fields.filter((_, idx) => idx % 2 === 1);

  const renderFieldRow = (f: BusinessFieldDef) => {
    const rawVal = values ? values[f.key] : undefined;
    const hasVal = rawVal !== undefined && rawVal !== null && rawVal !== "";
    const displayVal = hasVal
      ? `${rawVal}${f.unit ? ` ${f.unit}` : ""}`
      : "Not Specified";
    const val = values ? values[f.key] ?? "" : "";

    return (
      <div
        key={f.key}
        className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group"
      >
        <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
          {!readOnly && f.required && (
            <span className="text-rose-500 font-bold mr-1">*</span>
          )}
          <span>{f.label}</span>
          {f.unit && (
            <span className="ml-1 text-[11px] text-slate-400 font-normal">
              ({f.unit})
            </span>
          )}
        </label>

        <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
          {readOnly ? (
            <>
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={`text-xs font-bold truncate ${
                    hasVal ? "text-slate-900" : "text-slate-400 italic font-medium"
                  }`}
                  title={hasVal ? String(displayVal) : "Not Specified"}
                >
                  {displayVal}
                </span>
              </div>
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                  title="Click to edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full">
              {f.type === "select" ? (
                <select
                  value={val}
                  onChange={(e) => onChange?.(f.key, e.target.value)}
                  className="w-full text-xs text-slate-900 font-bold px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                >
                  <option value="">Select {f.label}...</option>
                  {f.options?.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  rows={2}
                  value={val}
                  onChange={(e) => onChange?.(f.key, e.target.value)}
                  placeholder={f.placeholder || `Enter ${f.label}`}
                  className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs font-bold placeholder:font-normal placeholder:text-slate-400"
                />
              ) : f.type === "number" ? (
                <div className="relative w-full">
                  <input
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) =>
                      onChange?.(
                        f.key,
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder={f.placeholder || "0"}
                    className="w-full text-xs text-slate-900 font-mono font-bold px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs pr-12 placeholder:font-normal placeholder:text-slate-400"
                  />
                  {f.unit && (
                    <span className="absolute right-2.5 top-1.5 text-[11px] font-semibold text-slate-400 pointer-events-none">
                      {f.unit}
                    </span>
                  )}
                </div>
              ) : f.type === "date" ? (
                <input
                  type="date"
                  value={val}
                  onChange={(e) => onChange?.(f.key, e.target.value)}
                  className="w-full text-xs text-slate-900 font-bold px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => onChange?.(f.key, e.target.value)}
                  placeholder={f.placeholder || `Enter ${f.label}`}
                  className="w-full text-xs text-slate-900 font-bold px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs placeholder:font-normal placeholder:text-slate-400"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
      <div className="divide-y divide-slate-100">
        {leftFields.map(renderFieldRow)}
      </div>
      <div className="divide-y divide-slate-100">
        {rightFields.map(renderFieldRow)}
      </div>
    </div>
  );
}
