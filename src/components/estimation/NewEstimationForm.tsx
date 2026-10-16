"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createEstimation } from "@/actions/estimationActions";
import { calculateEstimation, formatAED } from "@/lib/calculations";
import { useApp } from "@/context/AppContext";
import {
  Plus,
  Trash2,
  Calculator,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";

export interface LineItem {
  id: string;
  costCategory: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
}

const COST_CATEGORIES = [
  "Materials",
  "Labour",
  "Equipment",
  "Transportation",
  "Subcontracting",
  "Other direct costs",
];

// Helper to generate dynamic, authentic BOQ items from tender technical specifications
export function generateBOQFromTender(tender: any): {
  lineItems: LineItem[];
  defaultOverheads: number;
  defaultContingency: number;
  notes: string;
  specSummary: string[];
} {
  if (!tender) {
    return {
      lineItems: [],
      defaultOverheads: 5000,
      defaultContingency: 3000,
      notes: "Standard commercial estimation.",
      specSummary: [],
    };
  }

  let specific: Record<string, any> = {};
  if (tender.specificFieldsJson) {
    try {
      specific =
        typeof tender.specificFieldsJson === "string"
          ? JSON.parse(tender.specificFieldsJson)
          : tender.specificFieldsJson;
    } catch {
      specific = {};
    }
  }

  const code = tender.businessEntity?.code || "";
  let items: LineItem[] = [];
  const specSummary: string[] = [];

  if (code === "HR_WORKFORCE") {
    const category =
      specific.workforceCategory || "Civil & Structural Tradesmen (Masons, Carpenters, Steel Fixers)";
    const headcount = Number(specific.headcountRequired) || 100;
    const durationMonths = Number(specific.deploymentDurationMonths) || 6;
    const ratePerWorker = Number(specific.monthlyRatePerWorker) || 200;
    const camp = specific.campAccommodation || "Fala Central Staff Camp (Jebel Ali / Al Quoz)";
    const transport = specific.transportationScope || "Provided by Fala Dedicated AC Bus Fleet";
    const visa =
      specific.visaInsuranceStatus ||
      "100% Fala Company Visa & Comprehensive Medical Insurance (MOHRE Compliant)";
    const shift = specific.workingShiftPattern || "8-Hour Base Shift + Approved Overtime";

    specSummary.push(`Headcount: ${headcount} Personnel`);
    specSummary.push(`Duration: ${durationMonths} Months`);
    specSummary.push(`Rate: AED ${ratePerWorker}/month`);
    specSummary.push(`Trades: ${category.slice(0, 32)}...`);

    items = [
      {
        id: "hr-1",
        costCategory: "Labour",
        description: `Direct Manpower Deployment: ${category} (${headcount} Personnel × ${durationMonths} Months)`,
        quantity: headcount * durationMonths,
        unit: "man-months",
        unitRate: ratePerWorker,
      },
      {
        id: "hr-2",
        costCategory: "Transportation",
        description: `Site Transportation Logistics: ${transport}`,
        quantity: durationMonths,
        unit: "months",
        unitRate: Math.max(600, Math.round(headcount * (ratePerWorker > 500 ? 80 : 15))),
      },
      {
        id: "hr-3",
        costCategory: "Other direct costs",
        description: `Staff Camp Housing, Catering & Utilities: ${camp}`,
        quantity: durationMonths,
        unit: "months",
        unitRate: Math.max(1000, Math.round(headcount * (ratePerWorker > 500 ? 150 : 25))),
      },
      {
        id: "hr-4",
        costCategory: "Other direct costs",
        description: `MOHRE Work Permits, Medical Insurance & Coverage: ${visa}`,
        quantity: headcount,
        unit: "personnel",
        unitRate: Math.max(50, Math.round(ratePerWorker * 0.4)),
      },
      {
        id: "hr-5",
        costCategory: "Labour",
        description: `Site Supervisors, HSE Officers & Shift Timekeeping: ${shift}`,
        quantity: durationMonths,
        unit: "months",
        unitRate: Math.max(800, Math.round(headcount * (ratePerWorker > 500 ? 60 : 12))),
      },
    ];
  } else if (code === "ROAD_INFRA") {
    const lengthKm = Number(specific.roadLengthKm) || 2.5;
    const widthM = Number(specific.roadWidthM) || 12;
    const areaSqm = Number(specific.workAreaSqm) || Math.round(lengthKm * widthM * 1000);
    const excavationM3 = Number(specific.excavationVolumeM3) || Math.round(areaSqm * 0.25);
    const layers =
      specific.pavementLayers || "Standard 60mm Wearing + 80mm Binder + 150mm Wet Mix";
    const durationDays = Number(specific.estimatedDurationDays) || 180;

    specSummary.push(`Length: ${lengthKm} km`);
    specSummary.push(`Width: ${widthM} m`);
    specSummary.push(`Area: ${areaSqm.toLocaleString()} m²`);
    specSummary.push(`Duration: ${durationDays} Days`);

    items = [
      {
        id: "rd-1",
        costCategory: "Materials",
        description: `Granular Sub-base Class A 150mm Pavement Preparation (${areaSqm} m2)`,
        quantity: Math.max(500, Math.round(areaSqm * 0.15)),
        unit: "m3",
        unitRate: 48,
      },
      {
        id: "rd-2",
        costCategory: "Materials",
        description: `Bituminous Asphalt Pavement: ${layers}`,
        quantity: Math.max(400, Math.round(areaSqm * 0.14)),
        unit: "ton",
        unitRate: 165,
      },
      {
        id: "rd-3",
        costCategory: "Labour",
        description: `Site Earthworks & Compaction Crew (${excavationM3} m3 cut/fill)`,
        quantity: Math.max(30, Math.round(durationDays / 2)),
        unit: "days",
        unitRate: 1200,
      },
      {
        id: "rd-4",
        costCategory: "Equipment",
        description: `Asphalt Paver, Heavy Dynapac Vibratory Rollers & Grader Spread`,
        quantity: Math.max(1, Math.round(durationDays / 30)),
        unit: "months",
        unitRate: 28000,
      },
      {
        id: "rd-5",
        costCategory: "Subcontracting",
        description: `Stormwater precast drainage culverts & thermoplastic road marking (${lengthKm} km)`,
        quantity: Math.max(1, Math.round(lengthKm)),
        unit: "km",
        unitRate: 42000,
      },
    ];
  } else if (code === "EXP_MFG") {
    const product = specific.productName || "Precast Box Culverts & Structural Girders";
    const hsCode = specific.productCode || "HS-6810.91";
    const qty = Number(specific.orderQuantity) || 250;
    const unitCost = Number(specific.unitProductionCost) || 2850;
    const dest = specific.exportDestination || "Dammam Port, KSA";
    const terms = specific.incoterms || "FOB Jebel Ali";
    const pkg = specific.packagingSpec || "Heavy-duty steel strapping with moisture barrier";

    specSummary.push(`Product: ${product}`);
    specSummary.push(`Quantity: ${qty} units`);
    specSummary.push(`Destination: ${dest}`);
    specSummary.push(`Terms: ${terms}`);

    items = [
      {
        id: "exp-1",
        costCategory: "Materials",
        description: `Structural High-Strength Concrete & Rebar Fabrication for ${product} (${hsCode})`,
        quantity: qty,
        unit: "units",
        unitRate: Math.round(unitCost * 0.65),
      },
      {
        id: "exp-2",
        costCategory: "Labour",
        description: `Factory Precast Casting, Curing & Quality Control Inspection Crew`,
        quantity: qty,
        unit: "units",
        unitRate: Math.round(unitCost * 0.22),
      },
      {
        id: "exp-3",
        costCategory: "Other direct costs",
        description: `Seaworthy Export Packaging & Specialized Palletization (${pkg})`,
        quantity: qty,
        unit: "units",
        unitRate: Math.round(unitCost * 0.08),
      },
      {
        id: "exp-4",
        costCategory: "Transportation",
        description: `Port Haulage & Customs Clearance (${terms} to ${dest})`,
        quantity: 1,
        unit: "lot",
        unitRate: Math.max(6000, Math.round(qty * 85)),
      },
    ];
  } else if (code === "BLD_MAT") {
    const category = specific.materialCategory || "Road Base Class A";
    const grade = specific.materialGrade || "ASTM C33 / RTA Heavy Spec CBR > 80%";
    const tons = Number(specific.orderQuantityTons) || 15000;
    const cost = Number(specific.unitCost) || 28.5;
    const transport = Number(specific.transportationCostPerTon) || 9.5;
    const location = specific.deliveryLocation || "Client Project Site Batching Plant";

    specSummary.push(`Category: ${category}`);
    specSummary.push(`Quantity: ${tons.toLocaleString()} Tons`);
    specSummary.push(`Target Quarry Cost: AED ${cost}/Ton`);
    specSummary.push(`Haulage: AED ${transport}/Ton`);

    items = [
      {
        id: "mat-1",
        costCategory: "Materials",
        description: `Quarry Direct Extraction & Crushing: ${category} (${grade})`,
        quantity: tons,
        unit: "Tons",
        unitRate: cost,
      },
      {
        id: "mat-2",
        costCategory: "Transportation",
        description: `Heavy Dump Tipper Haulage & Logistics to ${location}`,
        quantity: tons,
        unit: "Tons",
        unitRate: transport,
      },
      {
        id: "mat-3",
        costCategory: "Other direct costs",
        description: `Weighbridge Certification, Sieve Analysis & Laboratory Compaction QA`,
        quantity: 1,
        unit: "lot",
        unitRate: 4500,
      },
    ];
  } else if (code === "MED") {
    const scope = specific.medicalCategory || "Hospital Wing Civil Fit-out";
    const hospital = specific.facilityName || "Specialist Healthcare Facility";
    const compliance = specific.complianceAuthority || "DHA (Dubai Health Authority) Approved";
    const containment = specific.specialHandling || "ICRA Class IV containment, negative air pressure";
    const days = Number(specific.serviceDurationDays) || 90;

    specSummary.push(`Scope: ${scope}`);
    specSummary.push(`Facility: ${hospital}`);
    specSummary.push(`Compliance: ${compliance}`);
    specSummary.push(`Duration: ${days} Days`);

    items = [
      {
        id: "med-1",
        costCategory: "Materials",
        description: `Modular Anti-Microbial Cleanroom Partitions & Lead-Lined Walls for ${hospital}`,
        quantity: 1,
        unit: "lot",
        unitRate: Math.max(45000, days * 850),
      },
      {
        id: "med-2",
        costCategory: "Labour",
        description: `Specialized Healthcare Civil Fitters & Medical Gas Trenching Team (${scope})`,
        quantity: days,
        unit: "days",
        unitRate: 1450,
      },
      {
        id: "med-3",
        costCategory: "Other direct costs",
        description: `Infection Control Containment & HEPA Air Scrubbers (${containment})`,
        quantity: 1,
        unit: "lot",
        unitRate: 16000,
      },
      {
        id: "med-4",
        costCategory: "Subcontracting",
        description: `Statutory Commissioning & Air Purity Validation (${compliance})`,
        quantity: 1,
        unit: "cert",
        unitRate: 9500,
      },
    ];
  } else if (code === "REAL_EST") {
    const property = specific.propertyName || "Logistics Park Industrial Plot";
    const area = Number(specific.builtUpArea) || 35000;
    const units = Number(specific.numberOfUnits) || 4;
    const months = Number(specific.estimatedProjectDurationMonths) || 12;

    specSummary.push(`Property: ${property}`);
    specSummary.push(`Plot Area: ${area.toLocaleString()} sq.ft`);
    specSummary.push(`Bays: ${units} Units`);
    specSummary.push(`Timeline: ${months} Months`);

    items = [
      {
        id: "re-1",
        costCategory: "Materials",
        description: `Civil Superstructure, Concrete Foundation & Steel Framing for ${property} (${area} sq.ft)`,
        quantity: area,
        unit: "sq.ft",
        unitRate: 75,
      },
      {
        id: "re-2",
        costCategory: "Labour",
        description: `Site Engineering, Project Management & Construction Operations`,
        quantity: months,
        unit: "months",
        unitRate: 38000,
      },
      {
        id: "re-3",
        costCategory: "Subcontracting",
        description: `MEP Infrastructure, Industrial Flooring & Fire Life Safety System (${units} Units)`,
        quantity: units,
        unit: "bays",
        unitRate: 35000,
      },
      {
        id: "re-4",
        costCategory: "Other direct costs",
        description: `Building Permits, DM Statutory NOCs, Soil Compaction & Testing`,
        quantity: 1,
        unit: "lot",
        unitRate: 28000,
      },
    ];
  } else if (code === "FLEET_WS") {
    const request = specific.requestType || "Heavy Equipment Maintenance";
    const equipment = specific.equipmentType || "Caterpillar Asphalt Paver";
    const asset = specific.assetRegistrationNumber || "FL-EQ-408";
    const partsCost = Number(specific.partsCostEstimate) || 18500;
    const downtime = Number(specific.estimatedDowntimeDays) || 5;
    const yard = specific.workshopLocation || "Central Workshop - Al Quoz Yard";

    specSummary.push(`Machine: ${equipment}`);
    specSummary.push(`Plate: ${asset}`);
    specSummary.push(`Downtime: ${downtime} Days`);
    specSummary.push(`Yard: ${yard}`);

    items = [
      {
        id: "fl-1",
        costCategory: "Materials",
        description: `OEM Replacement Components, Hydraulic Packs & Consumables for ${equipment} (${asset})`,
        quantity: 1,
        unit: "kit",
        unitRate: partsCost > 0 ? partsCost : 18500,
      },
      {
        id: "fl-2",
        costCategory: "Labour",
        description: `Master Mechanical Overhaul & Hydraulic Specialist Technicians (${yard})`,
        quantity: downtime,
        unit: "days",
        unitRate: 1800,
      },
      {
        id: "fl-3",
        costCategory: "Other direct costs",
        description: `Diagnostic Pressure Testing, Fluid Flushing & Re-commissioning QA Certification`,
        quantity: 1,
        unit: "lot",
        unitRate: 3200,
      },
    ];
  } else if (code === "RDY_MIX") {
    const grade = specific.concreteGrade || "C40/50 (Bridge Deck & Columns)";
    const spec = specific.mixSpecification || "OPC + 35% GGBS Slag replacement";
    const volume = Number(specific.volumeM3) || 5000;
    const rate = Number(specific.unitSellingPrice) || 285;

    specSummary.push(`Grade: ${grade}`);
    specSummary.push(`Mix: ${spec}`);
    specSummary.push(`Volume: ${volume.toLocaleString()} cu.m`);
    specSummary.push(`Target Rate: AED ${rate}/cu.m`);

    items = [
      {
        id: "rm-1",
        costCategory: "Materials",
        description: `Batching Aggregates, Cement, GGBS Slag & Retarding Admixtures (${grade})`,
        quantity: volume,
        unit: "cu.m",
        unitRate: Math.round(rate * 0.7),
      },
      {
        id: "rm-2",
        costCategory: "Transportation",
        description: `Transit Mixer Fleet Batching & On-Site Timed Delivery`,
        quantity: volume,
        unit: "cu.m",
        unitRate: Math.round(rate * 0.15),
      },
      {
        id: "rm-3",
        costCategory: "Equipment",
        description: `Stationary / 42m Mobile Boom Pump Pouring Operations`,
        quantity: volume,
        unit: "cu.m",
        unitRate: Math.round(rate * 0.08),
      },
      {
        id: "rm-4",
        costCategory: "Other direct costs",
        description: `Compressive Cube Tests (7 & 28 Days), Slump Flow Audits & Batch QA Reports`,
        quantity: 1,
        unit: "lot",
        unitRate: 4800,
      },
    ];
  } else {
    // General fallback
    const estVal = Number(tender.estimatedValue) || 100000;
    specSummary.push(`Estimated Scope: ${tender.title}`);
    specSummary.push(`Budget Baseline: AED ${estVal.toLocaleString()}`);

    items = [
      {
        id: "gen-1",
        costCategory: "Materials",
        description: `Primary Scope Materials for: ${tender.title}`,
        quantity: 1,
        unit: "lot",
        unitRate: Math.round(estVal * 0.58),
      },
      {
        id: "gen-2",
        costCategory: "Labour",
        description: `Technical Execution & Supervisory Workforce`,
        quantity: 1,
        unit: "lot",
        unitRate: Math.round(estVal * 0.24),
      },
      {
        id: "gen-3",
        costCategory: "Equipment",
        description: `Equipment & Machinery Deployment`,
        quantity: 1,
        unit: "lot",
        unitRate: Math.round(estVal * 0.1),
      },
      {
        id: "gen-4",
        costCategory: "Other direct costs",
        description: `Mobilization, Testing & Site Administration`,
        quantity: 1,
        unit: "lot",
        unitRate: Math.round(estVal * 0.08),
      },
    ];
  }

  const directSum = items.reduce((acc, i) => acc + i.quantity * i.unitRate, 0);
  const defaultOverheads = Math.round(directSum * 0.04);
  const defaultContingency = Math.round(directSum * 0.02);
  const notes = `Commercial rates and itemized BOQ evaluated for ${
    tender.businessEntity?.name || "project"
  } (${tender.title}) based on tender technical specifications.`;

  return {
    lineItems: items,
    defaultOverheads,
    defaultContingency,
    notes,
    specSummary,
  };
}

export default function NewEstimationForm({
  tenders,
  selectedTenderId,
}: {
  tenders: any[];
  selectedTenderId?: string;
}) {
  const router = useRouter();
  const { showToast } = useApp();

  const initialTender =
    tenders.find((t) => t.id === (selectedTenderId || tenders[0]?.id)) || tenders[0];
  const initialData = generateBOQFromTender(initialTender);

  const [tenderId, setTenderId] = useState(initialTender?.id || "");
  const [targetMargin, setTargetMargin] = useState<number>(15.0);
  const [overheads, setOverheads] = useState<number>(initialData.defaultOverheads);
  const [contingency, setContingency] = useState<number>(initialData.defaultContingency);
  const [preparedBy, setPreparedBy] = useState("Eng. Tariq Al-Nuaimi");
  const [notes, setNotes] = useState(initialData.notes);
  const [lineItems, setLineItems] = useState<LineItem[]>(initialData.lineItems);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeTender = tenders.find((t) => t.id === tenderId) || initialTender;
  const activeGeneratedData = generateBOQFromTender(activeTender);

  // Handle tender change: automatically load the line items based on the new tender's technical specifications
  const handleTenderChange = (newTenderId: string) => {
    setTenderId(newTenderId);
    const selected = tenders.find((t) => t.id === newTenderId);
    if (selected) {
      const generated = generateBOQFromTender(selected);
      setLineItems(generated.lineItems);
      setOverheads(generated.defaultOverheads);
      setContingency(generated.defaultContingency);
      setNotes(generated.notes);
      showToast(
        `BOQ line items auto-generated from ${selected.businessEntity?.name} technical specifications.`,
        "info"
      );
    }
  };

  // Re-generate from tender specifications on demand
  const handleResetToTenderSpecs = () => {
    if (activeTender) {
      const generated = generateBOQFromTender(activeTender);
      setLineItems(generated.lineItems);
      setOverheads(generated.defaultOverheads);
      setContingency(generated.defaultContingency);
      setNotes(generated.notes);
      showToast(
        `Restored line items from ${activeTender.businessEntity?.name} technical specifications.`,
        "success"
      );
    }
  };

  // Client-side preview calculation
  const calc = calculateEstimation({
    lineItems,
    overheads,
    contingency,
    targetMarginPercent: targetMargin,
    taxRatePercent: 5.0,
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Math.random().toString(),
        costCategory: "Labour",
        description: "",
        quantity: 1,
        unit: "unit",
        unitRate: 100,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderId) {
      setErrorMsg("Please select a tender.");
      return;
    }
    if (lineItems.length === 0) {
      setErrorMsg("Please add at least one line item.");
      return;
    }
    if (targetMargin >= 100) {
      setErrorMsg("Target margin must be strictly less than 100%.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res = await createEstimation({
      tenderId,
      preparedBy,
      targetMargin: Number(targetMargin),
      overheads: Number(overheads),
      contingency: Number(contingency),
      notes,
      lineItems: lineItems.map((li) => ({
        costCategory: li.costCategory,
        description: li.description,
        quantity: Number(li.quantity),
        unit: li.unit,
        unitRate: Number(li.unitRate),
      })),
    });

    setSubmitting(false);

    if (res.success && res.estimation) {
      showToast(`Estimation ${res.estimation.estimationNumber} created successfully!`, "success");
      router.push(`/estimation/${res.estimation.id}`);
    } else {
      setErrorMsg(res.error || "Failed to create estimation.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Tender Selection & Meta */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Estimation Setup & Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Tender <span className="text-rose-500">*</span>
            </label>
            <select
              value={tenderId}
              onChange={(e) => handleTenderChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderNumber} - {t.title} ({t.businessEntity.shortName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Prepared By</label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Target Margin (% of Selling Price) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="95"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {activeTender && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">Customer: </span>
                <strong className="text-slate-800">{activeTender.customer?.name}</strong> •{" "}
                <span className="text-slate-500">Division: </span>
                <strong className="text-blue-700">{activeTender.businessEntity?.name}</strong>
              </div>
              <span className="font-mono text-slate-500">Currency: AED</span>
            </div>

            {/* Live Technical Specification Badges */}
            {activeGeneratedData.specSummary.length > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-blue-600" />
                    Tender Specifications Loaded:
                  </span>
                  {activeGeneratedData.specSummary.map((spec, i) => (
                    <span
                      key={i}
                      className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 shadow-2xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResetToTenderSpecs}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                  title="Reload BOQ items from tender technical specifications"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reload Specs</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOQ Cost Line Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Direct Cost BOQ Line Items</h2>
            <p className="text-xs text-slate-500">
              Auto-generated from tender technical parameters. Quantity × Unit Rate = Direct Cost.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToTenderSpecs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset to Specs</span>
            </button>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add BOQ Item</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 w-24">Qty</th>
                <th className="py-2.5 px-3 w-20">Unit</th>
                <th className="py-2.5 px-3 w-28 text-right">Unit Rate (AED)</th>
                <th className="py-2.5 px-3 w-32 text-right">Line Total (AED)</th>
                <th className="py-2.5 px-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((item, idx) => {
                const lineTotal = Math.round(Number(item.quantity || 0) * Number(item.unitRate || 0) * 100) / 100;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <select
                        value={item.costCategory}
                        onChange={(e) => updateLineItem(idx, "costCategory", e.target.value)}
                        className="rounded border border-slate-200 p-1.5 text-xs w-32"
                      >
                        {COST_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        placeholder="Item scope or material description..."
                        className="w-full rounded border border-slate-200 p-1.5 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", Number(e.target.value))}
                        className="w-full rounded border border-slate-200 p-1.5 text-xs text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateLineItem(idx, "unit", e.target.value)}
                        className="w-full rounded border border-slate-200 p-1.5 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={item.unitRate}
                        onChange={(e) => updateLineItem(idx, "unitRate", Number(e.target.value))}
                        className="w-full rounded border border-slate-200 p-1.5 text-xs text-right"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {formatAED(lineTotal)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indirect Costs & Financial Recalculation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Indirect Overheads */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Indirect Costs & Provisions</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Site Overheads & Management (AED)
              </label>
              <input
                type="number"
                value={overheads}
                onChange={(e) => setOverheads(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contingency & Risk Allowance (AED)
              </label>
              <input
                type="number"
                value={contingency}
                onChange={(e) => setContingency(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimation Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Realtime Financial Calculations Card */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-6 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-blue-950">Authoritative Financial Summary</h3>
          <div className="space-y-2 border-b border-blue-200/60 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Direct BOQ Cost</span>
              <span className="font-semibold text-slate-800">{formatAED(calc.totalDirectCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Site Overheads + Contingency</span>
              <span className="font-semibold text-slate-800">
                {formatAED(calc.overheads + calc.contingency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-blue-100">
              <span>Estimated Total Cost</span>
              <span>{formatAED(calc.totalCost)}</span>
            </div>
          </div>

          <div className="space-y-2 border-b border-blue-200/60 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Target Profit Margin</span>
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                {targetMargin}% of Selling Price
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Estimated Gross Profit</span>
              <span className="font-bold text-emerald-700">{formatAED(calc.estimatedProfit)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span>Selling Price Before Tax</span>
              <span>{formatAED(calc.sellingPriceBeforeTax)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>UAE VAT (5%)</span>
              <span>{formatAED(calc.taxAmount)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm font-extrabold text-blue-900">
            <span>Total Offer Price (Inc. VAT)</span>
            <span className="text-base">{formatAED(calc.finalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-600/20"
        >
          {submitting ? (
            <span>Saving Estimation...</span>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Save & Finalize Cost Estimation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
