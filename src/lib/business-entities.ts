export interface BusinessFieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  options?: string[];
  placeholder?: string;
  unit?: string;
  required?: boolean;
  help?: string;
}

export interface BusinessEntityConfig {
  id: string; // canonical cuid or code
  code: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  fields: BusinessFieldDef[];
}

export const BUSINESS_ENTITIES: BusinessEntityConfig[] = [
  {
    code: "ROAD_INFRA",
    id: "entity-road-infra",
    name: "Road & Infrastructure",
    shortName: "Roads & Infra",
    description: "Highways, arterial roads, drainage networks, bridges, and municipal infrastructure works.",
    color: "#2563eb", // Royal Blue
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconName: "Truck",
    fields: [
      {
        key: "projectCategory",
        label: "Project Category",
        type: "select",
        options: ["Highway Construction", "Internal Road Network", "Stormwater Drainage", "Asphalt Milling & Paving", "Substation Access Roads"],
        required: true,
      },
      {
        key: "siteLocation",
        label: "Site Location / Chainage",
        type: "text",
        placeholder: "e.g. Al Khail Road Expansion - Chainage 12+500 to 18+200, Dubai",
        required: true,
      },
      {
        key: "roadLengthKm",
        label: "Road Length",
        type: "number",
        placeholder: "12.5",
        unit: "km",
        required: true,
      },
      {
        key: "roadWidthM",
        label: "Pavement Width",
        type: "number",
        placeholder: "14.0",
        unit: "m",
        required: true,
      },
      {
        key: "workAreaSqm",
        label: "Total Work Area",
        type: "number",
        placeholder: "175000",
        unit: "sq.m",
        required: true,
      },
      {
        key: "excavationVolumeM3",
        label: "Excavation / Cut-Fill Volume",
        type: "number",
        placeholder: "45000",
        unit: "cu.m",
      },
      {
        key: "pavementLayers",
        label: "Pavement Layer Spec",
        type: "select",
        options: ["Standard 60mm Wearing + 80mm Binder + 150mm Wet Mix", "Heavy Axle Heavy Duty Asphalt Spec", "Standard Municipal Residential Spec", "Rigid Concrete Pavement"],
      },
      {
        key: "estimatedDurationDays",
        label: "Estimated Duration",
        type: "number",
        placeholder: "180",
        unit: "days",
        required: true,
      },
      {
        key: "siteConditions",
        label: "Site Conditions & Traffic Diversions",
        type: "textarea",
        placeholder: "Live traffic management required, NOC from RTA / DEWA / DM secured, sandy subgrade.",
      },
      {
        key: "equipmentRequirements",
        label: "Key Heavy Equipment Assigned",
        type: "text",
        placeholder: "Asphalt pavers (x2), Dynapac pneumatic rollers, CAT 330 excavators, Graders (x3)",
      },
    ],
  },
  {
    code: "EXP_MFG",
    id: "entity-exp-mfg",
    name: "Export Manufacturing",
    shortName: "Export Mfg",
    description: "Industrial manufacturing and overseas export of specialized precast, culverts, and structural elements.",
    color: "#059669", // Emerald
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconName: "Globe",
    fields: [
      {
        key: "productName",
        label: "Export Product Description",
        type: "text",
        placeholder: "e.g. Pre-stressed Bridge Girders / Precast Box Culverts",
        required: true,
      },
      {
        key: "productCode",
        label: "HS / Product Code",
        type: "text",
        placeholder: "HS-6810.91",
        required: true,
      },
      {
        key: "orderQuantity",
        label: "Export Quantity",
        type: "number",
        placeholder: "450",
        unit: "units",
        required: true,
      },
      {
        key: "exportDestination",
        label: "Destination Port / Country",
        type: "text",
        placeholder: "e.g. King Abdulaziz Port, Dammam, KSA",
        required: true,
      },
      {
        key: "incoterms",
        label: "Delivery Terms (Incoterms)",
        type: "select",
        options: ["FOB Jebel Ali", "CIF Dammam", "DAP Riyadh", "EXW Dubai Facility", "CFR Doha"],
        required: true,
      },
      {
        key: "unitProductionCost",
        label: "Unit Production Cost",
        type: "number",
        placeholder: "2850",
        unit: "AED",
      },
      {
        key: "leadTimeWeeks",
        label: "Manufacturing Lead Time",
        type: "number",
        placeholder: "6",
        unit: "weeks",
        required: true,
      },
      {
        key: "packagingSpec",
        label: "Seaworthy Packaging Specification",
        type: "text",
        placeholder: "Heavy-duty steel strapping with moisture barrier crates",
      },
    ],
  },
  {
    code: "BLD_MAT",
    id: "entity-bld-mat",
    name: "Building Materials",
    shortName: "Building Mat.",
    description: "Quarry aggregates, road base, sub-base, crushed rock, and certified construction supplies.",
    color: "#d97706", // Amber
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconName: "Layers",
    fields: [
      {
        key: "materialCategory",
        label: "Material Category",
        type: "select",
        options: ["Crushed Aggregates (10mm / 20mm)", "Road Base Class A", "Sub-base Material", "Manufactured Sand", "Armour Rock / Riprap"],
        required: true,
      },
      {
        key: "materialGrade",
        label: "Specification / Technical Grade",
        type: "text",
        placeholder: "ASTM C33 / RTA Heavy Traffic Spec 150mm CBR > 80%",
        required: true,
      },
      {
        key: "orderQuantityTons",
        label: "Quantity",
        type: "number",
        placeholder: "25000",
        unit: "Tons",
        required: true,
      },
      {
        key: "unitCost",
        label: "Quarry Production Cost",
        type: "number",
        placeholder: "28.5",
        unit: "AED/Ton",
      },
      {
        key: "sellingRate",
        label: "Target Selling Rate",
        type: "number",
        placeholder: "38.0",
        unit: "AED/Ton",
        required: true,
      },
      {
        key: "deliveryLocation",
        label: "Delivery Quarry / Site Dump",
        type: "text",
        placeholder: "Ras Al Khaimah Quarry to Jebel Ali Batching Plant",
        required: true,
      },
      {
        key: "transportationCostPerTon",
        label: "Haulage / Transport Cost",
        type: "number",
        placeholder: "9.5",
        unit: "AED/Ton",
      },
    ],
  },
  {
    code: "MED",
    id: "entity-med",
    name: "Medical",
    shortName: "Medical Division",
    description: "Hospital infrastructure civil works, clean room modular partitions, and medical gas pipeline civil support.",
    color: "#e11d48", // Rose
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    iconName: "Activity",
    fields: [
      {
        key: "medicalCategory",
        label: "Medical Infrastructure Scope",
        type: "select",
        options: ["Hospital Wing Civil Fit-out", "Clean Room Modular Construction", "Medical Gas Pipeline Civil Trenching", "Radiation Shielding Bunker Walls", "Healthcare Facility Maintenance"],
        required: true,
      },
      {
        key: "facilityName",
        label: "Healthcare Facility / Hospital",
        type: "text",
        placeholder: "e.g. Dubai Healthcare City Specialist Hospital - Wing C",
        required: true,
      },
      {
        key: "complianceAuthority",
        label: "Regulatory Compliance Standard",
        type: "select",
        options: ["DHA (Dubai Health Authority) Approved", "MOHAP Certified", "DoH Abu Dhabi Standard", "ISO 14644 Cleanroom Class 5"],
        required: true,
      },
      {
        key: "specialHandling",
        label: "Special Containment & Infection Control",
        type: "textarea",
        placeholder: "ICRA Class IV containment, negative air pressure barriers, Hepa filter protection during execution.",
      },
      {
        key: "serviceDurationDays",
        label: "Contract Duration",
        type: "number",
        placeholder: "90",
        unit: "days",
      },
    ],
  },
  {
    code: "REAL_EST",
    id: "entity-real-est",
    name: "Real Estate",
    shortName: "Real Estate",
    description: "Property development, civil contracting for residential complexes, logistics warehouses, and commercial plots.",
    color: "#7c3aed", // Violet
    textColor: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    iconName: "Home",
    fields: [
      {
        key: "opportunityType",
        label: "Development Opportunity Type",
        type: "select",
        options: ["Commercial Warehouse Development", "Residential Community Infrastructure", "Industrial Yard Civil Works", "Commercial Plaza Groundworks"],
        required: true,
      },
      {
        key: "propertyName",
        label: "Property / Development Name",
        type: "text",
        placeholder: "e.g. Dubai South Logistics Park - Plot 543",
        required: true,
      },
      {
        key: "builtUpArea",
        label: "Built-up / Plot Area",
        type: "number",
        placeholder: "48000",
        unit: "sq.ft",
        required: true,
      },
      {
        key: "numberOfUnits",
        label: "Number of Units / Bays",
        type: "number",
        placeholder: "8",
      },
      {
        key: "estimatedProjectDurationMonths",
        label: "Estimated Completion Time",
        type: "number",
        placeholder: "12",
        unit: "months",
        required: true,
      },
      {
        key: "targetCompletionDate",
        label: "Target Handover Date",
        type: "date",
      },
    ],
  },
  {
    code: "FLEET_WS",
    id: "entity-fleet-ws",
    name: "Fleet & Workshop",
    shortName: "Fleet & Workshop",
    description: "Heavy plant machinery, fleet repairs, preventive overhauls, equipment mobilization and hydraulic services.",
    color: "#0891b2", // Cyan
    textColor: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    iconName: "Wrench",
    fields: [
      {
        key: "requestType",
        label: "Service / Fleet Request Type",
        type: "select",
        options: ["Heavy Equipment Maintenance", "Asphalt Paver Engine Overhaul", "Hydraulic Cylinder Rebuilding", "Fleet Mobilization for Contract", "Annual Preventive Service"],
        required: true,
      },
      {
        key: "equipmentType",
        label: "Equipment / Machine Category",
        type: "select",
        options: ["Caterpillar AP1055F Asphalt Paver", "Komatsu PC400 Excavator", "Dynapac CC6200 Roller", "Mercedes Actros 4040 Tipper Truck", "CAT 140M Motor Grader"],
        required: true,
      },
      {
        key: "assetRegistrationNumber",
        label: "Asset / Fleet Registration Number",
        type: "text",
        placeholder: "FL-EQ-408 / Dubai Plate 49821",
        required: true,
      },
      {
        key: "operatingHours",
        label: "Operating Hours / Odometer",
        type: "number",
        placeholder: "6450",
        unit: "hrs",
      },
      {
        key: "estimatedDowntimeDays",
        label: "Estimated Downtime",
        type: "number",
        placeholder: "5",
        unit: "days",
        required: true,
      },
      {
        key: "partsCostEstimate",
        label: "Estimated Parts & Hydraulics Cost",
        type: "number",
        placeholder: "18500",
        unit: "AED",
      },
      {
        key: "workshopLocation",
        label: "Service Yard Location",
        type: "select",
        options: ["Central Workshop - Al Quoz Yard", "On-site Mobile Workshop - Jebel Ali", "Sharjah Industrial Depot"],
      },
    ],
  },
  {
    code: "RDY_MIX",
    id: "entity-rdy-mix",
    name: "Ready-Mix Manufacturing",
    shortName: "Ready-Mix",
    description: "Certified ready-mix concrete batching, high-performance mixes, stationary and boom pumping logistics.",
    color: "#ea580c", // Orange
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconName: "Package",
    fields: [
      {
        key: "concreteGrade",
        label: "Concrete Grade / Design Strength",
        type: "select",
        options: ["C30/37 (Standard Substructure)", "C40/50 (Bridge Deck & Columns)", "C50/60 (High Durability Marine)", "C60/75 (High Strength Structural)", "Lean Concrete C15/20"],
        required: true,
      },
      {
        key: "mixSpecification",
        label: "Mix Binder & Admixture Spec",
        type: "select",
        options: ["OPC 100% with retarder", "SRC (Sulphate Resisting Cement)", "OPC + 35% GGBS Slag replacement", "Microsilica + Fly Ash Special Mix"],
        required: true,
      },
      {
        key: "volumeM3",
        label: "Order Volume",
        type: "number",
        placeholder: "8500",
        unit: "cu.m",
        required: true,
      },
      {
        key: "unitSellingPrice",
        label: "Selling Rate",
        type: "number",
        placeholder: "245",
        unit: "AED/m3",
        required: true,
      },
      {
        key: "pumpingRequirement",
        label: "Pumping Logistics",
        type: "select",
        options: ["56m Mobile Boom Pump", "42m Boom Pump", "Stationary High-Pressure Line Pump", "Direct Chute Pour (No Pump)"],
        required: true,
      },
      {
        key: "numberOfMixerLoads",
        label: "Estimated Transit Mixer Trips (9m3 each)",
        type: "number",
        placeholder: "945",
        unit: "loads",
      },
      {
        key: "batchingPlantLocation",
        label: "Origin Batching Plant",
        type: "select",
        options: ["Plant 1 - Jebel Ali Industrial", "Plant 2 - Dubai Industrial City (DIC)", "Plant 3 - Al Quoz Central"],
      },
      {
        key: "testingRequirements",
        label: "Testing & Quality Control",
        type: "text",
        placeholder: "7 & 28-day cube compression test, temperature limit <32°C, slump 160±25mm",
      },
    ],
  },
  {
    code: "HR_WORKFORCE",
    id: "entity-hr-workforce",
    name: "HR & Technical Workforce",
    shortName: "HR & Workforce",
    description: "Infrastructure manpower supply, civil labor deployment, certified equipment operators, and site technical supervision.",
    color: "#0d9488", // Teal
    textColor: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    iconName: "HardHat",
    fields: [
      {
        key: "workforceCategory",
        label: "Manpower / Trade Category",
        type: "select",
        options: [
          "Civil & Structural Tradesmen (Masons, Carpenters, Steel Fixers)",
          "Heavy Equipment & Plant Operators (Excavator, Grader, Roller)",
          "Asphalt & Paving Specialized Crew",
          "MEP & Utilities Technicians (Pipelayers, Electricians)",
          "HSE Officers, Surveyors & Site Supervisory Staff",
          "General Infrastructure Construction Labor",
        ],
        required: true,
      },
      {
        key: "headcountRequired",
        label: "Required Headcount / Quantity",
        type: "number",
        placeholder: "120",
        unit: "personnel",
        required: true,
      },
      {
        key: "deploymentDurationMonths",
        label: "Deployment Duration",
        type: "number",
        placeholder: "12",
        unit: "months",
        required: true,
      },
      {
        key: "campAccommodation",
        label: "Camp & Accommodation Logistics",
        type: "select",
        options: [
          "Fala Central Staff Camp (Jebel Ali / Al Quoz)",
          "Client-Furnished Site Accommodation",
          "Project Mobilization Camp Allowance",
        ],
        required: true,
      },
      {
        key: "transportationScope",
        label: "Site Transportation Logistics",
        type: "select",
        options: [
          "Provided by Fala Dedicated AC Bus Fleet",
          "Client-Arranged Site Shuttles",
          "Included in Direct Hourly Rate",
        ],
        required: true,
      },
      {
        key: "visaInsuranceStatus",
        label: "Visa & Insurance Compliance",
        type: "select",
        options: [
          "100% Fala Company Visa & Comprehensive Medical Insurance (MOHRE Compliant)",
          "Client Project Visa Allocation",
          "Mission Work Permit",
        ],
        required: true,
      },
      {
        key: "workingShiftPattern",
        label: "Shift Schedule & Overtime Policy",
        type: "select",
        options: [
          "Standard 10-Hour Shift (6 Days/Week)",
          "Continuous 24/7 Day & Night Rotational Shifts",
          "8-Hour Base Shift + Approved Overtime",
        ],
      },
      {
        key: "monthlyRatePerWorker",
        label: "Estimated Average Rate per Personnel",
        type: "number",
        placeholder: "2850",
        unit: "AED/month",
        required: true,
      },
      {
        key: "tradeCertification",
        label: "Trade Tests & Compliance Standards",
        type: "text",
        placeholder: "Third-party competency cards, RTA gate passes, CID security clearances, EHS induction",
      },
    ],
  },
];

export const CORE_BUSINESS_ENTITIES: BusinessEntityConfig[] = BUSINESS_ENTITIES;

export function getEntityByCode(code?: string): BusinessEntityConfig | undefined {
  if (!code) return undefined;
  return BUSINESS_ENTITIES.find((e) => e.code === code || e.id === code);
}
