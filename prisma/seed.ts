import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent seed for Fala Road Contracting CRM + ERP...");

  // 1. Seed Business Entities
  const entitiesData = [
    {
      code: "ROAD_INFRA",
      name: "Road & Infrastructure",
      shortName: "Roads & Infra",
      description: "Highways, arterial roads, drainage networks, bridges, and municipal infrastructure works.",
      color: "#2563eb",
      icon: "Truck",
    },
    {
      code: "EXP_MFG",
      name: "Export Manufacturing",
      shortName: "Export Mfg",
      description: "Industrial manufacturing and overseas export of specialized precast, culverts, and structural elements.",
      color: "#059669",
      icon: "Globe",
    },
    {
      code: "BLD_MAT",
      name: "Building Materials",
      shortName: "Building Mat.",
      description: "Quarry aggregates, road base, sub-base, crushed rock, and certified construction supplies.",
      color: "#d97706",
      icon: "Layers",
    },
    {
      code: "MED",
      name: "Medical",
      shortName: "Medical",
      description: "Hospital infrastructure civil works, clean room modular partitions, and medical gas pipeline civil support.",
      color: "#e11d48",
      icon: "Activity",
    },
    {
      code: "REAL_EST",
      name: "Real Estate",
      shortName: "Real Estate",
      description: "Property development, civil contracting for residential complexes, logistics warehouses, and commercial plots.",
      color: "#7c3aed",
      icon: "Home",
    },
    {
      code: "FLEET_WS",
      name: "Fleet & Workshop",
      shortName: "Fleet & Workshop",
      description: "Heavy plant machinery, fleet repairs, preventive overhauls, equipment mobilization and hydraulic services.",
      color: "#0891b2",
      icon: "Wrench",
    },
    {
      code: "RDY_MIX",
      name: "Ready-Mix Manufacturing",
      shortName: "Ready-Mix",
      description: "Certified ready-mix concrete batching, high-performance mixes, stationary and boom pumping logistics.",
      color: "#ea580c",
      icon: "Package",
    },
    {
      code: "HR_WORKFORCE",
      name: "HR & Technical Workforce",
      shortName: "HR & Workforce",
      description: "Infrastructure manpower supply, civil labor deployment, certified equipment operators, and site technical supervision.",
      color: "#0d9488",
      icon: "HardHat",
    },
  ];

  const entities: Record<string, any> = {};
  for (const ent of entitiesData) {
    const record = await prisma.businessEntity.upsert({
      where: { code: ent.code },
      update: {
        name: ent.name,
        shortName: ent.shortName,
        description: ent.description,
        color: ent.color,
        icon: ent.icon,
      },
      create: {
        code: ent.code,
        name: ent.name,
        shortName: ent.shortName,
        description: ent.description,
        color: ent.color,
        icon: ent.icon,
        isActive: true,
      },
    });
    entities[ent.code] = record;
  }
  console.log(`✓ 7 Business entities seeded.`);

  // 2. Demo Users & Roles
  const usersData = [
    {
      email: "tariq.preparer@falaroad.ae",
      name: "Eng. Tariq Al-Nuaimi",
      role: "PREPARER",
      title: "Senior Tendering & Estimation Engineer",
    },
    {
      email: "saeed.gm@falaroad.ae",
      name: "H.E. Saeed Fala Al-Falasi",
      role: "GM",
      title: "General Manager & Executive Director",
    },
    {
      email: "sarah.pm@falaroad.ae",
      name: "Sarah Jenkins, PMP",
      role: "PROJECT_MANAGER",
      title: "Senior Infrastructure Project Manager",
    },
    {
      email: "mansoor.procurement@falaroad.ae",
      name: "Mansoor Khan",
      role: "PROCUREMENT_OFFICER",
      title: "Chief Procurement Officer",
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, title: u.title },
      create: u,
    });
  }
  console.log(`✓ Demo users seeded.`);

  // 3. Customers & Contacts
  const customersData = [
    {
      code: "CUST-GULF-01",
      name: "Gulf Infrastructure Demo LLC",
      type: "Semi-Government",
      email: "tenders@gulfinfra.ae",
      phone: "+971 4 382 9100",
      address: "Sheikh Zayed Road, Commercial Tower B, Suite 1402",
      city: "Dubai",
      country: "United Arab Emirates",
      primaryContact: "Eng. Rashid Al-Kaabi",
      status: "Active",
      contacts: [
        {
          name: "Eng. Rashid Al-Kaabi",
          designation: "Projects Director",
          email: "rashid.kaabi@gulfinfra.ae",
          phone: "+971 50 123 4567",
          notes: "Primary decision maker for road and drainage packages.",
        },
        {
          name: "Mariam Al-Hashemi",
          designation: "Procurement Specialist",
          email: "m.hashemi@gulfinfra.ae",
          phone: "+971 52 987 6543",
          notes: "Handles tender bond and commercial submissions.",
        },
      ],
    },
    {
      code: "CUST-EMAAR-02",
      name: "Emaar Development PJSC",
      type: "Corporate",
      email: "contracts@emaar.ae",
      phone: "+971 4 367 3333",
      address: "Downtown Dubai, Emaar Square Building 1",
      city: "Dubai",
      country: "United Arab Emirates",
      primaryContact: "Ziyad Mansour",
      status: "Active",
      contacts: [
        {
          name: "Ziyad Mansour",
          designation: "Head of Infrastructure Tenders",
          email: "z.mansour@emaar.ae",
          phone: "+971 55 456 7890",
          notes: "Focuses on master community road extensions.",
        },
      ],
    },
    {
      code: "CUST-RTA-03",
      name: "Dubai Roads & Transport Authority (RTA)",
      type: "Government",
      email: "contracting@rta.ae",
      phone: "+971 4 284 4444",
      address: "Marrakech Street, Umm Ramool",
      city: "Dubai",
      country: "United Arab Emirates",
      primaryContact: "Dr. Hamad Al-Suwaidi",
      status: "Active",
      contacts: [
        {
          name: "Dr. Hamad Al-Suwaidi",
          designation: "Director of Road Construction",
          email: "hamad.suwaidi@rta.ae",
          phone: "+971 50 889 9112",
          notes: "Requires strict adherence to RTA Specifications Vol. 2.",
        },
      ],
    },
    {
      code: "CUST-KSA-04",
      name: "Saudi Eastern Logistics Consortium",
      type: "Corporate",
      email: "procurement@saudilogistics.sa",
      phone: "+966 13 833 2200",
      address: "King Abdulaziz Road, Al Khobar",
      city: "Dammam",
      country: "Saudi Arabia",
      primaryContact: "Fahad Al-Dossary",
      status: "Active",
      contacts: [
        {
          name: "Fahad Al-Dossary",
          designation: "Import Director",
          email: "fahad@saudilogistics.sa",
          phone: "+966 50 234 5678",
          notes: "Buyer for precast culverts and structural girders.",
        },
      ],
    },
  ];

  const customers: Record<string, any> = {};
  for (const c of customersData) {
    const existing = await prisma.account.findUnique({ where: { code: c.code } });
    let record;
    if (existing) {
      record = await prisma.account.update({
        where: { code: c.code },
        data: {
          name: c.name,
          type: c.type,
          email: c.email,
          phone: c.phone,
          address: c.address,
          city: c.city,
          primaryContact: c.primaryContact,
        },
      });
    } else {
      record = await prisma.account.create({
        data: {
          code: c.code,
          name: c.name,
          type: c.type,
          email: c.email,
          phone: c.phone,
          address: c.address,
          city: c.city,
          country: c.country,
          primaryContact: c.primaryContact,
          status: c.status,
          contacts: {
            create: c.contacts,
          },
        },
      });
    }
    customers[c.code] = record;
  }
  console.log(`✓ Customers & Contacts seeded.`);

  // 4. CRM Leads & Opportunities
  const leadsData = [
    {
      name: "Khalfan Al-Mazrouei",
      company: "Sharjah Ports Authority",
      email: "k.mazrouei@sharjahports.gov.ae",
      phone: "+971 6 528 1111",
      source: "Tender Portal",
      businessEntityId: entities["ROAD_INFRA"].id,
      status: "Qualified",
      notes: "Express interest in feeder road resurfacing around Port Khalid.",
    },
    {
      name: "Tariq Al-Sabah",
      company: "Kuwait Industrial Development",
      email: "tariq@kuwaitind.kw",
      phone: "+965 2244 5566",
      source: "Expo",
      businessEntityId: entities["EXP_MFG"].id,
      status: "Contacted",
      notes: "Inquiry for 120 units precast box culverts.",
    },
    {
      name: "Fatima Al-Nuaimi",
      company: "Mediclinic Middle East",
      email: "fatima.nuaimi@mediclinic.ae",
      phone: "+971 4 435 9999",
      source: "Referral",
      businessEntityId: entities["MED"].id,
      status: "New",
      notes: "Hospital service road extension and clean ambulance bay.",
    },
  ];

  for (const l of leadsData) {
    const existing = await prisma.lead.findFirst({ where: { email: l.email } });
    if (!existing) {
      await prisma.lead.create({ data: l });
    }
  }

  const oppData = [
    {
      oppNumber: "OPP-2026-001",
      name: "Al Khail Road Expansion Package 4",
      customerId: customers["CUST-GULF-01"].id,
      businessEntityId: entities["ROAD_INFRA"].id,
      expectedValue: 12500000,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "Proposal",
    },
    {
      oppNumber: "OPP-2026-002",
      name: "Dammam Port Precast Girders Export Contract",
      customerId: customers["CUST-KSA-04"].id,
      businessEntityId: entities["EXP_MFG"].id,
      expectedValue: 3400000,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: "Negotiation",
    },
  ];

  for (const o of oppData) {
    await prisma.opportunity.upsert({
      where: { oppNumber: o.oppNumber },
      update: { expectedValue: o.expectedValue, status: o.status },
      create: o,
    });
  }
  console.log(`✓ CRM Leads and Opportunities seeded.`);

  // 5. Suppliers
  const suppliersData = [
    {
      code: "SUP-RAK-01",
      name: "RAK Aggregate Quarries PJSC",
      contactPerson: "Santosh Varma",
      email: "orders@rakquarries.ae",
      phone: "+971 7 244 8899",
      address: "Kadra Industrial Zone, Ras Al Khaimah",
      category: "Aggregates & Asphalt",
      status: "Active",
    },
    {
      code: "SUP-STEEL-02",
      name: "Emirates Rebar & Steel Industries",
      contactPerson: "Khalid Al-Marri",
      email: "sales@emiratessteel.ae",
      phone: "+971 2 550 1100",
      address: "ICAD 1, Musaffah, Abu Dhabi",
      category: "Structural Steel",
      status: "Active",
    },
    {
      code: "SUP-CAT-03",
      name: "Al-Bahar Heavy Machinery (CAT UAE)",
      contactPerson: "David Miller",
      email: "heavyrentals@albahar.com",
      phone: "+971 4 437 2600",
      address: "Dubai Investments Park, Dubai",
      category: "Equipment Rental",
      status: "Active",
    },
  ];

  const suppliers: Record<string, any> = {};
  for (const s of suppliersData) {
    const record = await prisma.supplier.upsert({
      where: { code: s.code },
      update: { name: s.name, contactPerson: s.contactPerson },
      create: s,
    });
    suppliers[s.code] = record;
  }
  console.log(`✓ Suppliers seeded.`);

  // 6. PRIMARY DEMONSTRATION WORKFLOW: Road & Infrastructure Tender
  const primaryTenderNumber = "TND-2026-0001";
  const primaryTender = await prisma.tender.upsert({
    where: { tenderNumber: primaryTenderNumber },
    update: {
      title: "Road Improvement and Drainage Works — Demo Project",
      status: "Awarded", // Kept connected across workflow
      estimatedValue: 4850000,
    },
    create: {
      tenderNumber: primaryTenderNumber,
      title: "Road Improvement and Drainage Works — Demo Project",
      businessEntityId: entities["ROAD_INFRA"].id,
      customerId: customers["CUST-GULF-01"].id,
      branch: "Dubai Main Operations",
      recordType: "Tender",
      contactPerson: "Eng. Rashid Al-Kaabi",
      contactEmail: "rashid.kaabi@gulfinfra.ae",
      contactPhone: "+971 50 123 4567",
      clientReference: "GI-RFP-2026-98",
      issueDate: new Date("2026-03-01"),
      submissionDeadline: new Date("2026-04-15"),
      expectedClosingDate: new Date("2026-05-01"),
      ownerName: "Eng. Tariq Al-Nuaimi",
      location: "Al Khail Road Junction 4 to Jebel Ali Access, Dubai",
      currency: "AED",
      description: "Dual 3-lane asphalt carriageway widening, 1200mm stormwater drainage installation, streetlighting ducts, and thermoplastic road markings.",
      scopeOfWork: "Excavation 35,000 m3, granular sub-base 12,500 m3, dense bitumen macadam base 9,200 tons, wearing course 7,400 tons, concrete kerbs 8,400 m, reinforced drainage lines 2,400 m.",
      supportingDocs: "RTA-Design-Approval-Rev3.pdf, Geotechnical-Soil-Report-2026.pdf, Bill-of-Quantities-Volume-2.xlsx",
      internalNotes: "High profile RTA monitored route. Heavy traffic management plan required.",
      status: "Awarded",
      estimatedValue: 4850000,
      specificFieldsJson: JSON.stringify({
        projectCategory: "Highway Construction",
        siteLocation: "Al Khail Road Junction 4, Dubai",
        roadLengthKm: 6.8,
        roadWidthM: 14.5,
        workAreaSqm: 98600,
        excavationVolumeM3: 35000,
        pavementLayers: "Standard 60mm Wearing + 80mm Binder + 150mm Wet Mix",
        estimatedDurationDays: 180,
        siteConditions: "Live traffic corridor, active utility diversions (DEWA 132kV corridor safe buffer required)",
        equipmentRequirements: "2x CAT Asphalt Pavers, 4x Dynapac Rollers, 3x CAT Graders, 12x 32-ton Tipper Trucks",
      }),
    },
  });

  // Secondary Tenders for multi-status demonstration
  const tender2Number = "TND-2026-0002";
  await prisma.tender.upsert({
    where: { tenderNumber: tender2Number },
    update: { status: "Pending GM Approval" },
    create: {
      tenderNumber: tender2Number,
      title: "King Abdulaziz Port Precast Culvert Elements Supply",
      businessEntityId: entities["EXP_MFG"].id,
      customerId: customers["CUST-KSA-04"].id,
      branch: "Export & Precast Yard",
      recordType: "Direct Opportunity",
      contactPerson: "Fahad Al-Dossary",
      contactEmail: "fahad@saudilogistics.sa",
      contactPhone: "+966 50 234 5678",
      clientReference: "KSA-EXP-2026-44",
      issueDate: new Date("2026-03-10"),
      submissionDeadline: new Date("2026-04-20"),
      ownerName: "Eng. Tariq Al-Nuaimi",
      location: "Dammam Port, KSA (FOB Jebel Ali)",
      currency: "AED",
      description: "Manufacture and export of 350 units high-durability reinforced precast culverts.",
      scopeOfWork: "C50/60 concrete casting, steam curing, seaworthy lashing, testing certificates.",
      status: "Pending GM Approval",
      estimatedValue: 1850000,
      specificFieldsJson: JSON.stringify({
        productName: "Reinforced Precast Box Culverts (3.0m x 2.5m)",
        productCode: "HS-6810.91",
        orderQuantity: 350,
        exportDestination: "King Abdulaziz Port, Dammam, KSA",
        incoterms: "FOB Jebel Ali",
        unitProductionCost: 3200,
        leadTimeWeeks: 6,
        packagingSpec: "Heavy duty seaworthy steel lashing with moisture desiccants",
      }),
    },
  });

  const tender3Number = "TND-2026-0003";
  await prisma.tender.upsert({
    where: { tenderNumber: tender3Number },
    update: { status: "Under Estimation" },
    create: {
      tenderNumber: tender3Number,
      title: "Dubai Hills Estate Sub-base & Quarry Materials Package",
      businessEntityId: entities["BLD_MAT"].id,
      customerId: customers["CUST-EMAAR-02"].id,
      branch: "Quarry & Materials Logistics",
      recordType: "Tender",
      contactPerson: "Ziyad Mansour",
      contactEmail: "z.mansour@emaar.ae",
      contactPhone: "+971 55 456 7890",
      clientReference: "EMAAR-INFRA-902",
      issueDate: new Date("2026-03-15"),
      submissionDeadline: new Date("2026-04-30"),
      ownerName: "Eng. Tariq Al-Nuaimi",
      location: "Dubai Hills Estate Phase 3, Dubai",
      currency: "AED",
      description: "Supply and haulage of 45,000 tons certified crushed road base and 20mm aggregates.",
      scopeOfWork: "Supply, haulage with covered tipper fleet, testing certificates.",
      status: "Under Estimation",
      estimatedValue: 1710000,
      specificFieldsJson: JSON.stringify({
        materialCategory: "Road Base Class A",
        materialGrade: "RTA Heavy Traffic Spec 150mm CBR > 80%",
        orderQuantityTons: 45000,
        unitCost: 28.5,
        sellingRate: 38.0,
        deliveryLocation: "Dubai Hills Estate Phase 3",
        transportationCostPerTon: 9.5,
      }),
    },
  });

  const tender4Number = "TND-2026-0004";
  await prisma.tender.upsert({
    where: { tenderNumber: tender4Number },
    update: { status: "Draft" },
    create: {
      tenderNumber: tender4Number,
      title: "Ready-Mix Concrete Supply for Dubai South Logistics Bays",
      businessEntityId: entities["RDY_MIX"].id,
      customerId: customers["CUST-GULF-01"].id,
      branch: "Batching Plant 1 - Jebel Ali",
      recordType: "Direct Opportunity",
      contactPerson: "Eng. Rashid Al-Kaabi",
      contactEmail: "rashid.kaabi@gulfinfra.ae",
      contactPhone: "+971 50 123 4567",
      clientReference: "DS-CONC-881",
      issueDate: new Date("2026-03-20"),
      submissionDeadline: new Date("2026-05-15"),
      ownerName: "Eng. Tariq Al-Nuaimi",
      location: "Dubai South, Plot 102",
      currency: "AED",
      description: "Supply of 12,000 m3 C40/50 ready-mix concrete with 56m boom pump placement.",
      scopeOfWork: "Batching, transit mixer fleet delivery, pumping and slump sampling.",
      status: "Draft",
      estimatedValue: 2940000,
      specificFieldsJson: JSON.stringify({
        concreteGrade: "C40/50 (Bridge Deck & Columns)",
        mixSpecification: "OPC + 35% GGBS Slag replacement",
        volumeM3: 12000,
        unitSellingPrice: 245,
        pumpingRequirement: "56m Mobile Boom Pump",
        numberOfMixerLoads: 1334,
        batchingPlantLocation: "Plant 1 - Jebel Ali Industrial",
        testingRequirements: "7 & 28-day compressive cube testing",
      }),
    },
  });
  console.log(`✓ Tenders seeded.`);

  // 7. Estimations
  const estNumber1 = "EST-2026-0001";
  const existingEst = await prisma.estimation.findUnique({ where: { estimationNumber: estNumber1 } });
  let est1;
  const est1Lines = [
    { costCategory: "Materials", description: "Granular Sub-base Class A (12,500 m3)", quantity: 12500, unit: "m3", unitRate: 48, lineTotal: 600000 },
    { costCategory: "Materials", description: "Dense Bitumen Macadam (9,200 tons)", quantity: 9200, unit: "ton", unitRate: 145, lineTotal: 1334000 },
    { costCategory: "Materials", description: "Asphalt Wearing Course PMB (7,400 tons)", quantity: 7400, unit: "ton", unitRate: 175, lineTotal: 1295000 },
    { costCategory: "Materials", description: "Reinforced Stormwater Pipes 1200mm Dia", quantity: 2400, unit: "lm", unitRate: 220, lineTotal: 528000 },
    { costCategory: "Labour", description: "Paving & Compaction Skilled Crew (180 days)", quantity: 180, unit: "days", unitRate: 1200, lineTotal: 216000 },
    { costCategory: "Equipment", description: "CAT Asphalt Pavers & Pneumatic Rollers Spread", quantity: 6, unit: "months", unitRate: 28000, lineTotal: 168000 },
    { costCategory: "Transportation", description: "Asphalt insulated tipper haulage from batching plant", quantity: 16600, unit: "ton", unitRate: 12, lineTotal: 199200 },
  ];

  const totalDirectCost1 = 4340200;
  const overheads1 = 120000;
  const contingency1 = 80000;
  const totalCost1 = 4540200;
  const targetMargin1 = 15.0; // 15%
  // Selling Price = Total Cost / (1 - 0.15) = 4540200 / 0.85 = 5341411.76
  const sellingPrice1 = 5341411.76;
  const taxAmount1 = Math.round(sellingPrice1 * 0.05 * 100) / 100; // 267070.59
  const finalPrice1 = sellingPrice1 + taxAmount1; // 5608482.35
  const estProfit1 = sellingPrice1 - totalCost1; // 801211.76

  if (existingEst) {
    est1 = existingEst;
  } else {
    est1 = await prisma.estimation.create({
      data: {
        estimationNumber: estNumber1,
        tenderId: primaryTender.id,
        businessEntityId: entities["ROAD_INFRA"].id,
        customerId: customers["CUST-GULF-01"].id,
        version: 1,
        preparedBy: "Eng. Tariq Al-Nuaimi",
        date: new Date("2026-03-25"),
        targetMargin: targetMargin1,
        totalDirectCost: totalDirectCost1,
        overheads: overheads1,
        contingency: contingency1,
        totalCost: totalCost1,
        sellingPriceBeforeTax: sellingPrice1,
        taxRate: 5.0,
        taxAmount: taxAmount1,
        finalPrice: finalPrice1,
        estimatedProfit: estProfit1,
        profitMargin: 15.0,
        status: "Completed",
        notes: "Detailed rate analysis verified against current aggregate quarry and bitumen refinery gate prices.",
        lineItems: {
          create: est1Lines,
        },
      },
    });
  }
  console.log(`✓ Estimation seeded.`);

  // 8. Quotations: Primary Approved Quotation, a Rejected Quotation, and a Pending GM Approval Quotation
  const qtNumber1 = "QT-2026-0001";
  const existingQt = await prisma.quotation.findUnique({ where: { quotationNumber: qtNumber1 } });
  let qt1;
  const qt1Lines = [
    { description: "Site Clearance, Earthworks & Excavation 35,000 m3", quantity: 35000, unit: "m3", unitRate: 18.5, lineTotal: 647500 },
    { description: "Granular Sub-base Class A 150mm Thickness", quantity: 12500, unit: "m3", unitRate: 65, lineTotal: 812500 },
    { description: "Dense Bitumen Macadam Base Course 80mm", quantity: 9200, unit: "ton", unitRate: 185, lineTotal: 1702000 },
    { description: "Polymer Modified Asphalt Wearing Course 60mm", quantity: 7400, unit: "ton", unitRate: 215, lineTotal: 1591000 },
    { description: "Class C Stormwater Reinforced Pipe 1200mm Dia & Catch Basins", quantity: 2400, unit: "lm", unitRate: 245, lineTotal: 588411.76 },
  ];

  if (existingQt) {
    qt1 = existingQt;
  } else {
    qt1 = await prisma.quotation.create({
      data: {
        quotationNumber: qtNumber1,
        tenderId: primaryTender.id,
        estimationId: est1.id,
        businessEntityId: entities["ROAD_INFRA"].id,
        customerId: customers["CUST-GULF-01"].id,
        version: 1,
        subtotal: sellingPrice1,
        discount: 0,
        tax: taxAmount1,
        totalAmount: finalPrice1,
        paymentTerms: "10% Advance against Bank Guarantee, 30-day IPC Progress Invoices, 5% Retention for 12 months",
        deliveryTerms: "Delivered & Executed on site, Al Khail Road Corridor",
        validityDays: 60,
        assumptions: "Client shall arrange unrestricted site access NOC from RTA and utility corridors.",
        exclusions: "Permanent street lighting substation energization fees payable directly to DEWA.",
        status: "Accepted",
        clientDecision: "Accepted",
        clientDecisionDate: new Date("2026-04-05"),
        clientComments: "Technical and commercial offer accepted in full. Approved as per Tender Board resolution TB-2026-44.",
        clientPoNumber: "PO-GULF-INFRA-8831",
        submittedToClientAt: new Date("2026-03-30"),
        submissionMethod: "Official Portal Submission & Hard Copy Dossier",
        lineItems: {
          create: qt1Lines,
        },
        versions: {
          create: [
            {
              versionNumber: 1,
              snapshotJson: JSON.stringify({
                subtotal: sellingPrice1,
                tax: taxAmount1,
                totalAmount: finalPrice1,
                lineItems: qt1Lines,
              }),
            },
          ],
        },
        approvalRequests: {
          create: [
            {
              requesterName: "Eng. Tariq Al-Nuaimi",
              approverName: "H.E. Saeed Fala Al-Falasi",
              status: "APPROVED",
              submittedAt: new Date("2026-03-27"),
              decidedAt: new Date("2026-03-28"),
              decisionReason: "Approved with full 15% target margin intact. Excellent commercial package.",
            },
          ],
        },
        approvalHistory: {
          create: [
            {
              action: "SUBMITTED",
              actorName: "Eng. Tariq Al-Nuaimi",
              actorRole: "PREPARER",
              comment: "Quotation prepared and submitted for GM review with 15% profit margin.",
              previousStatus: "Draft",
              newStatus: "Pending GM Approval",
              timestamp: new Date("2026-03-27T09:30:00Z"),
            },
            {
              action: "APPROVED",
              actorName: "H.E. Saeed Fala Al-Falasi",
              actorRole: "GM",
              comment: "Commercial and execution terms approved. Proceed to client submission.",
              previousStatus: "Pending GM Approval",
              newStatus: "Approved",
              timestamp: new Date("2026-03-28T14:15:00Z"),
            },
          ],
        },
      },
    });
  }

  // Seed another Quotation that is REJECTED (to satisfy requirement of at least one rejected quotation)
  const qtNumberRejected = "QT-2026-0002";
  const existingQtRejected = await prisma.quotation.findUnique({ where: { quotationNumber: qtNumberRejected } });
  if (!existingQtRejected) {
    await prisma.quotation.create({
      data: {
        quotationNumber: qtNumberRejected,
        tenderId: primaryTender.id,
        businessEntityId: entities["ROAD_INFRA"].id,
        customerId: customers["CUST-GULF-01"].id,
        version: 1,
        subtotal: 1200000,
        discount: 50000,
        tax: 57500,
        totalAmount: 1207500,
        paymentTerms: "90 Days Credit without Advance",
        deliveryTerms: "Site Delivery",
        validityDays: 15,
        status: "Rejected",
        lineItems: {
          create: [
            { description: "Site Earthworks Preliminary Trenching", quantity: 10000, unit: "m3", unitRate: 20, lineTotal: 200000 },
            { description: "Auxiliary Aggregate Delivery", quantity: 20000, unit: "ton", unitRate: 50, lineTotal: 1000000 },
          ],
        },
        approvalRequests: {
          create: [
            {
              requesterName: "Eng. Tariq Al-Nuaimi",
              approverName: "H.E. Saeed Fala Al-Falasi",
              status: "REJECTED",
              submittedAt: new Date("2026-03-15"),
              decidedAt: new Date("2026-03-16"),
              decisionReason: "Rejected due to unacceptable payment terms (90 days credit without advance) and low margin of 7%. Re-negotiate payment terms.",
            },
          ],
        },
        approvalHistory: {
          create: [
            {
              action: "SUBMITTED",
              actorName: "Eng. Tariq Al-Nuaimi",
              actorRole: "PREPARER",
              comment: "Preliminary offer draft submitted.",
              previousStatus: "Draft",
              newStatus: "Pending GM Approval",
              timestamp: new Date("2026-03-15T11:00:00Z"),
            },
            {
              action: "REJECTED",
              actorName: "H.E. Saeed Fala Al-Falasi",
              actorRole: "GM",
              comment: "Rejected due to unacceptable payment terms (90 days credit without advance) and low margin of 7%.",
              previousStatus: "Pending GM Approval",
              newStatus: "Rejected",
              timestamp: new Date("2026-03-16T10:20:00Z"),
            },
          ],
        },
      },
    });
  }

  // Seed another Quotation that is PENDING GM APPROVAL (for live GM decision testing)
  const qtNumberPending = "QT-2026-0003";
  const existingQtPending = await prisma.quotation.findUnique({ where: { quotationNumber: qtNumberPending } });
  if (!existingQtPending) {
    const culvertTender = await prisma.tender.findUnique({ where: { tenderNumber: tender2Number } });
    if (culvertTender) {
      await prisma.quotation.create({
        data: {
          quotationNumber: qtNumberPending,
          tenderId: culvertTender.id,
          businessEntityId: entities["EXP_MFG"].id,
          customerId: customers["CUST-KSA-04"].id,
          version: 1,
          subtotal: 1850000,
          discount: 0,
          tax: 92500,
          totalAmount: 1942500,
          paymentTerms: "30% Advance with Letter of Credit (LC) at Sight for remaining 70%",
          deliveryTerms: "FOB Jebel Ali Port, Dubai",
          validityDays: 45,
          status: "Pending GM Approval",
          lineItems: {
            create: [
              { description: "Precast Box Culvert 3.0m x 2.5m C50/60 Concrete", quantity: 350, unit: "units", unitRate: 5000, lineTotal: 1750000 },
              { description: "Seaworthy Heavy Duty Lashing & Protective Coating", quantity: 350, unit: "units", unitRate: 285.71, lineTotal: 100000 },
            ],
          },
          approvalRequests: {
            create: [
              {
                requesterName: "Eng. Tariq Al-Nuaimi",
                status: "PENDING",
                submittedAt: new Date("2026-04-01"),
                comments: "High value export package. Client has accepted LC terms. Awaiting GM final signoff.",
              },
            ],
          },
          approvalHistory: {
            create: [
              {
                action: "SUBMITTED",
                actorName: "Eng. Tariq Al-Nuaimi",
                actorRole: "PREPARER",
                comment: "Submitted for GM executive review and approval.",
                previousStatus: "Draft",
                newStatus: "Pending GM Approval",
                timestamp: new Date("2026-04-01T08:00:00Z"),
              },
            ],
          },
        },
      });
    }
  }
  console.log(`✓ Quotations with Approval history seeded.`);

  // 9. Contract
  const contractNumber1 = "CON-2026-0001";
  const existingCon = await prisma.contract.findUnique({ where: { contractNumber: contractNumber1 } });
  let con1;
  if (existingCon) {
    con1 = existingCon;
  } else {
    con1 = await prisma.contract.create({
      data: {
        contractNumber: contractNumber1,
        tenderId: primaryTender.id,
        quotationId: qt1.id,
        customerId: customers["CUST-GULF-01"].id,
        businessEntityId: entities["ROAD_INFRA"].id,
        contractValue: finalPrice1,
        agreedScope: "Turnkey execution of Al Khail Road Improvement and 1200mm Drainage Works as per tender specifications.",
        startDate: new Date("2026-04-15"),
        completionDate: new Date("2026-10-15"),
        paymentTerms: "10% Advance against Bank Guarantee, monthly IPC verified within 30 days, 5% retention for 365 days DLP.",
        clientPoNumber: "PO-GULF-INFRA-8831",
        clientPoDocRef: "DOC-GULF-CONTR-2026-SIGNED.pdf",
        status: "Active",
      },
    });
  }
  console.log(`✓ Contract seeded.`);

  // 10. Project & Milestones
  const projNumber1 = "PRJ-2026-0001";
  const existingProj = await prisma.project.findUnique({ where: { projectNumber: projNumber1 } });
  let proj1;
  if (existingProj) {
    proj1 = existingProj;
  } else {
    proj1 = await prisma.project.create({
      data: {
        projectNumber: projNumber1,
        name: "Al Khail Road Expansion & Drainage Works",
        contractId: con1.id,
        customerId: customers["CUST-GULF-01"].id,
        businessEntityId: entities["ROAD_INFRA"].id,
        projectManager: "Sarah Jenkins, PMP",
        location: "Al Khail Road Corridor, Chainage 12+500, Dubai",
        contractValue: finalPrice1,
        approvedBudget: totalCost1,
        plannedStartDate: new Date("2026-04-15"),
        plannedEndDate: new Date("2026-10-15"),
        actualStartDate: new Date("2026-04-20"),
        status: "Active",
        progress: 35,
        scope: "Dual 3-lane road expansion, earthworks, sub-base, asphalt pavement, drainage pipes and utility crossings.",
        notes: "Work progressing on schedule. Earthworks completed. Drainage trench excavation currently in progress.",
        milestones: {
          create: [
            {
              name: "Site Mobilization & Traffic Diversions",
              description: "Site offices, safety barriers, RTA traffic diversion approval and implementation.",
              owner: "Eng. Rashid (Site Engineer)",
              plannedStart: new Date("2026-04-15"),
              plannedFinish: new Date("2026-05-05"),
              actualFinish: new Date("2026-05-02"),
              status: "Completed",
              progressPercentage: 100,
            },
            {
              name: "Earthworks & Subgrade Compaction",
              description: "35,000 m3 cut-and-fill, subgrade density testing at 98% MDD.",
              owner: "Sarah Jenkins, PMP",
              plannedStart: new Date("2026-05-05"),
              plannedFinish: new Date("2026-06-15"),
              actualFinish: new Date("2026-06-12"),
              status: "Completed",
              progressPercentage: 100,
            },
            {
              name: "1200mm Stormwater Drainage Laying",
              description: "Trench excavation, shoring, pipe laying and catch basin construction.",
              owner: "Sarah Jenkins, PMP",
              plannedStart: new Date("2026-06-15"),
              plannedFinish: new Date("2026-07-30"),
              status: "In Progress",
              progressPercentage: 65,
            },
            {
              name: "Granular Sub-base & Bitumen Macadam Base",
              description: "150mm sub-base placement, prime coat, 80mm DBM laying.",
              owner: "Asphalt Foreman",
              plannedStart: new Date("2026-08-01"),
              plannedFinish: new Date("2026-09-15"),
              status: "Pending",
              progressPercentage: 0,
            },
            {
              name: "Polymer Wearing Course & Handover",
              description: "60mm PMB wearing course, thermoplastic markings, street signs and RTA final inspection.",
              owner: "Sarah Jenkins, PMP",
              plannedStart: new Date("2026-09-16"),
              plannedFinish: new Date("2026-10-15"),
              status: "Pending",
              progressPercentage: 0,
            },
          ],
        },
      },
    });
  }
  console.log(`✓ Project & Milestones seeded.`);

  // 11. Procurement: Purchase Request -> Purchase Order -> Goods Receipt
  const prNumber1 = "PR-2026-0001";
  const existingPR = await prisma.purchaseRequest.findUnique({ where: { prNumber: prNumber1 } });
  let pr1;
  if (existingPR) {
    pr1 = existingPR;
  } else {
    pr1 = await prisma.purchaseRequest.create({
      data: {
        prNumber: prNumber1,
        businessEntityId: entities["ROAD_INFRA"].id,
        projectId: proj1.id,
        department: "Road Operations",
        requester: "Sarah Jenkins, PMP",
        requiredDate: new Date("2026-06-25"),
        description: "Procurement of 1200mm Class C Reinforced Concrete Drainage Pipes and Rubber Gaskets.",
        supplierPreference: "RAK Aggregate Quarries PJSC",
        reason: "Required for Milestone 3 (Stormwater Drainage Installation).",
        status: "Converted",
        totalAmount: 528000,
        lineItems: {
          create: [
            {
              description: "1200mm Dia RC Drainage Pipes Class C (2.5m lengths)",
              quantity: 960,
              unit: "pipes",
              estimatedPrice: 500,
              lineTotal: 480000,
            },
            {
              description: "EPDM Heavy Duty Rubber Joint Gaskets 1200mm",
              quantity: 960,
              unit: "rings",
              estimatedPrice: 50,
              lineTotal: 48000,
            },
          ],
        },
      },
    });
  }

  const poNumber1 = "PO-2026-0001";
  const existingPO = await prisma.purchaseOrder.findUnique({ where: { poNumber: poNumber1 } });
  let po1;
  if (existingPO) {
    po1 = existingPO;
  } else {
    po1 = await prisma.purchaseOrder.create({
      data: {
        poNumber: poNumber1,
        supplierId: suppliers["SUP-RAK-01"].id,
        businessEntityId: entities["ROAD_INFRA"].id,
        projectId: proj1.id,
        purchaseRequestId: pr1.id,
        subtotal: 528000,
        tax: 26400,
        totalAmount: 554400,
        deliveryTerms: "Delivered to Project Site Yard, Al Khail Corridor",
        paymentTerms: "30 Days from Delivery and Technical Inspection",
        expectedDeliveryDate: new Date("2026-06-25"),
        status: "Received",
        lineItems: {
          create: [
            {
              description: "1200mm Dia RC Drainage Pipes Class C (2.5m lengths)",
              quantity: 960,
              unit: "pipes",
              unitRate: 500,
              lineTotal: 480000,
            },
            {
              description: "EPDM Heavy Duty Rubber Joint Gaskets 1200mm",
              quantity: 960,
              unit: "rings",
              unitRate: 50,
              lineTotal: 48000,
            },
          ],
        },
      },
    });
  }

  const grnNumber1 = "GRN-2026-0001";
  const existingGRN = await prisma.goodsReceipt.findUnique({ where: { receiptNumber: grnNumber1 } });
  if (!existingGRN) {
    const poLines = await prisma.purchaseOrderLineItem.findMany({ where: { purchaseOrderId: po1.id } });
    if (poLines.length >= 2) {
      await prisma.goodsReceipt.create({
        data: {
          receiptNumber: grnNumber1,
          purchaseOrderId: po1.id,
          receivedDate: new Date("2026-06-24"),
          receivedBy: "Mansoor Khan (Procurement Storekeeper)",
          notes: "All pipes inspected on arrival. Concrete surfaces sound, no spalling, rubber gaskets count verified 100%.",
          status: "Accepted",
          lineItems: {
            create: [
              {
                poLineItemId: poLines[0].id,
                description: poLines[0].description,
                orderedQuantity: 960,
                receivedQuantity: 960,
                acceptedQuantity: 960,
              },
              {
                poLineItemId: poLines[1].id,
                description: poLines[1].description,
                orderedQuantity: 960,
                receivedQuantity: 960,
                acceptedQuantity: 960,
              },
            ],
          },
        },
      });
    }
  }
  console.log(`✓ Procurement workflow (PR -> PO -> GRN) seeded.`);

  console.log("✅ Idempotent seed complete! All 7 business entities and complete enterprise workflow are live.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
