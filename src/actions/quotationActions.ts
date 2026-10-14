"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { round2 } from "@/lib/calculations";
import { ensureLatestDb, pushDbToMongo } from "@/lib/mongoSync";

export async function getQuotations(entityCode?: string, statusFilter?: string) {
  try {
    await ensureLatestDb();
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.quotation.findMany({
      where,
      include: {
        tender: true,
        businessEntity: true,
        customer: true,
        lineItems: true,
        approvalRequests: true,
        contracts: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Failed to fetch quotations");
  }
}

export async function getQuotationById(id: string) {
  try {
    await ensureLatestDb();
    let q = await prisma.quotation.findUnique({
      where: { id },
      include: {
        tender: true,
        estimation: { include: { lineItems: true } },
        businessEntity: true,
        customer: { include: { contacts: true } },
        lineItems: true,
        versions: { orderBy: { versionNumber: "desc" } },
        approvalRequests: { orderBy: { submittedAt: "desc" } },
        approvalHistory: { orderBy: { timestamp: "desc" } },
        contracts: true,
      },
    });

    if (!q) {
      q = await prisma.quotation.findFirst({
        where: { quotationNumber: id },
        include: {
          tender: true,
          estimation: { include: { lineItems: true } },
          businessEntity: true,
          customer: { include: { contacts: true } },
          lineItems: true,
          versions: { orderBy: { versionNumber: "desc" } },
          approvalRequests: { orderBy: { submittedAt: "desc" } },
          approvalHistory: { orderBy: { timestamp: "desc" } },
          contracts: true,
        },
      });
    }

    return q;
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return null;
  }
}

export async function createQuotationFromEstimation(
  estimationId: string,
  tenderId?: string,
  fallbackData?: any
) {
  try {
    await ensureLatestDb();
    let est = await prisma.estimation.findUnique({
      where: { id: estimationId },
      include: {
        lineItems: true,
        tender: { include: { businessEntity: true, quotations: true } },
        businessEntity: true,
        quotations: true,
      },
    });

    // If quotation already exists for this estimation, return it
    if (est?.quotations && est.quotations.length > 0) {
      return { success: true, quotation: est.quotations[0] };
    }

    if (!est) {
      est = await prisma.estimation.findFirst({
        where: { estimationNumber: estimationId },
        include: {
          lineItems: true,
          tender: { include: { businessEntity: true, quotations: true } },
          businessEntity: true,
          quotations: true,
        },
      });
    }

    if (!est && tenderId) {
      const tender = await prisma.tender.findUnique({
        where: { id: tenderId },
        include: {
          businessEntity: true,
          estimations: {
            include: { lineItems: true, quotations: true },
            orderBy: { createdAt: "desc" },
          },
          quotations: true,
        },
      });

      if (tender) {
        if (tender.quotations && tender.quotations.length > 0) {
          return { success: true, quotation: tender.quotations[0] };
        }
        if (tender.estimations && tender.estimations.length > 0) {
          est = tender.estimations[0] as any;
        } else if (fallbackData) {
          const currentYear = new Date().getFullYear();
          const count = await prisma.estimation.count();
          est = (await prisma.estimation.create({
            data: {
              estimationNumber: `EST-${currentYear}-${String(count + 1).padStart(4, "0")}`,
              tenderId: tender.id,
              businessEntityId: tender.businessEntityId,
              customerId: tender.customerId,
              version: 1,
              preparedBy: fallbackData.preparedBy || "Eng. Tariq Al-Nuaimi",
              date: new Date(),
              targetMargin: fallbackData.targetMargin || 15,
              totalDirectCost: fallbackData.totalDirectCost || 0,
              overheads: fallbackData.overheads || 0,
              contingency: fallbackData.contingency || 0,
              totalCost: fallbackData.totalCost || 0,
              sellingPriceBeforeTax: fallbackData.sellingPriceBeforeTax || 0,
              taxRate: 5.0,
              taxAmount: fallbackData.taxAmount || 0,
              finalPrice: fallbackData.finalPrice || 0,
              estimatedProfit: fallbackData.estimatedProfit || 0,
              profitMargin: fallbackData.targetMargin || 15,
              status: "Completed",
              lineItems: {
                create: (fallbackData.lineItems || []).map((li: any) => ({
                  costCategory: li.costCategory || "Materials",
                  description: li.description || "BOQ Item",
                  quantity: Number(li.quantity) || 1,
                  unit: li.unit || "unit",
                  unitRate: Number(li.unitRate) || 0,
                  lineTotal: Number(li.lineTotal) || 0,
                })),
              },
            },
            include: {
              lineItems: true,
              tender: { include: { businessEntity: true, quotations: true } },
              businessEntity: true,
              quotations: true,
            },
          })) as any;
        }
      }
    }

    if (!est) {
      est = await prisma.estimation.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          lineItems: true,
          tender: { include: { businessEntity: true, quotations: true } },
          businessEntity: true,
          quotations: true,
        },
      });
    }

    if (!est) throw new Error("Estimation not found");

    const entityCode = est.tender?.businessEntity?.code || est.businessEntity?.code || "";
    let specific: Record<string, any> = {};
    if (est.tender?.specificFieldsJson) {
      try {
        specific =
          typeof est.tender.specificFieldsJson === "string"
            ? JSON.parse(est.tender.specificFieldsJson)
            : est.tender.specificFieldsJson;
      } catch {
        specific = {};
      }
    }

    // Dynamic commercial terms tailored to the division and technical specifications
    let paymentTerms = "10% Advance Payment, 30 Days Monthly IPC Invoicing";
    let deliveryTerms = "Delivered to Project Site Yard, Dubai";
    let assumptions = "Client shall arrange unrestricted site access and valid municipal permits.";
    let exclusions = "Authority connection fees payable directly to utility providers.";

    if (entityCode === "HR_WORKFORCE") {
      paymentTerms = "Monthly progress billing backed by verified attendance sheets, net 30 days.";
      deliveryTerms = specific.transportationScope
        ? `Site mobilization via: ${specific.transportationScope}`
        : "Mobilization via Fala Dedicated AC Bus Fleet to project sites.";
      assumptions = `Headcount deployment: ${specific.headcountRequired || 100} personnel. Fala maintains 100% MOHRE compliance, visas, and medical insurance (${specific.visaInsuranceStatus || "MOHRE Compliant"}). Housing provided at: ${specific.campAccommodation || "Fala Central Staff Camp"}.`;
      exclusions = "Client-bespoke non-standard PPE, unauthorized overtime hours, and special client induction gate pass fees.";
    } else if (entityCode === "EXP_MFG") {
      paymentTerms = "30% Advance with Purchase Order, 70% against Bill of Lading / Shipping Documents.";
      deliveryTerms = specific.incoterms
        ? `${specific.incoterms} to ${specific.exportDestination || "Designated Port"}`
        : "FOB Jebel Ali Port, Dubai.";
      assumptions = `Seaworthy export packaging (${specific.packagingSpec || "Heavy-duty strapping with moisture barrier"}) included for ${specific.productName || "manufactured precast units"}.`;
      exclusions = "Overseas customs clearance and destination port demurrage beyond standard free days.";
    } else if (entityCode === "BLD_MAT") {
      paymentTerms = "Bi-weekly certified weighbridge reconciliation, net 30 days.";
      deliveryTerms = specific.deliveryLocation
        ? `Delivered by tipper fleet to ${specific.deliveryLocation}`
        : "Delivered to Project Batching Plant.";
      assumptions = `Supply of ${specific.orderQuantityTons || 15000} Tons of ${specific.materialCategory || "Road Base"} (${specific.materialGrade || "ASTM C33"}). Turnaround time 30 mins per truck.`;
      exclusions = "Double-handling on site and specialized client third-party re-testing charges.";
    } else if (entityCode === "MED") {
      paymentTerms = "20% Mobilization Advance, 70% Milestone Progress, 10% on Statutory Sign-off.";
      deliveryTerms = specific.facilityName
        ? `Executed on-site at ${specific.facilityName}`
        : "Executed on-site at healthcare facility.";
      assumptions = `Civil & MEP fit-out executed under ${specific.complianceAuthority || "DHA / MOH guidelines"} with ${specific.specialHandling || "containment standards"}.`;
      exclusions = "Diagnostic medical equipment procurement and external health authority accreditation fees.";
    } else if (entityCode === "REAL_EST") {
      paymentTerms = "Milestone progress billing per approved construction master schedule.";
      deliveryTerms = specific.propertyName
        ? `Civil construction at ${specific.propertyName}`
        : "On-site industrial logistics development.";
      assumptions = `Turnkey structural execution for ${specific.builtUpArea || 35000} sq.ft (${specific.numberOfUnits || 4} Bays). Unrestricted site access provided by Employer.`;
      exclusions = "Authority utility connection infrastructure charges and bespoke tenant fit-outs.";
    } else if (entityCode === "FLEET_WS") {
      paymentTerms = "50% Advance on replacement parts procurement, balance on equipment QA release.";
      deliveryTerms = specific.workshopLocation || "Central Workshop - Al Quoz Yard.";
      assumptions = `Comprehensive overhaul using genuine OEM components for ${specific.equipmentType || "Heavy Plant"} (${specific.assetRegistrationNumber || "Fleet Equipment"}).`;
      exclusions = "Latent structural fatigue defects and towing transport beyond 50km radius.";
    } else if (entityCode === "RDY_MIX") {
      paymentTerms = "Monthly compressive cube strength reconciliation, net 30 days.";
      deliveryTerms = specific.pumpingRequirement
        ? `Transit mixer fleet delivery with ${specific.pumpingRequirement}`
        : "Transit mixer delivery with boom pump placement.";
      assumptions = `Supply of ${specific.volumeM3 || 5000} cu.m ${specific.concreteGrade || "C40/50"} concrete (${specific.mixSpecification || "OPC + Slag mix"}).`;
      exclusions = "Transit mixer waiting time exceeding 60 minutes per load and unauthorized water addition on site.";
    } else if (entityCode === "ROAD_INFRA") {
      paymentTerms = "10% Advance Payment, 30 Days Monthly IPC Invoicing.";
      deliveryTerms = "Executed on-site as per RTA / Dubai Municipality standard specifications.";
      assumptions = "Client shall arrange unrestricted site access, right of way corridor, and valid municipal permits.";
      exclusions = "Authority connection fees payable directly to utility providers and unchartered utility relocations.";
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.quotation.count();
    const quotationNumber = `QT-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        tenderId: est.tenderId,
        estimationId: est.id,
        businessEntityId: est.businessEntityId,
        customerId: est.customerId,
        version: 1,
        subtotal: est.sellingPriceBeforeTax,
        discount: 0,
        tax: est.taxAmount,
        totalAmount: est.finalPrice,
        paymentTerms,
        deliveryTerms,
        validityDays: 60,
        assumptions,
        exclusions,
        status: "Draft",
        lineItems: {
          create: est.lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unit: li.unit,
            unitRate: round2(li.unitRate * (1 + est.targetMargin / 100)),
            lineTotal: round2(li.lineTotal * (1 + est.targetMargin / 100)),
          })),
        },
      },
    });

    // Create initial version snapshot
    await prisma.quotationVersion.create({
      data: {
        quotationId: quotation.id,
        versionNumber: 1,
        snapshotJson: JSON.stringify({
          subtotal: est.sellingPriceBeforeTax,
          tax: est.taxAmount,
          totalAmount: est.finalPrice,
          items: est.lineItems,
        }),
      },
    });

    // Update tender status
    await prisma.tender.update({
      where: { id: est.tenderId },
      data: { status: "Quotation in Preparation" },
    });

    revalidatePath(`/quotations/${quotation.id}`);
    revalidatePath("/quotations");
    await pushDbToMongo();
    return { success: true, quotation };
  } catch (error: any) {
    console.error("Error creating quotation from estimation:", error);
    return { success: false, error: error.message };
  }
}

export async function submitQuotationForGMApproval(quotationId: string, requesterName: string) {
  try {
    await ensureLatestDb();
    const quote = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { tender: true },
    });
    if (!quote) throw new Error("Quotation not found");

    if (quote.status === "Approved") {
      throw new Error("Quotation is already approved.");
    }

    await prisma.$transaction([
      prisma.quotation.update({
        where: { id: quotationId },
        data: { status: "Pending GM Approval" },
      }),
      prisma.tender.update({
        where: { id: quote.tenderId },
        data: { status: "Pending GM Approval" },
      }),
      prisma.approvalRequest.create({
        data: {
          quotationId,
          requesterName: requesterName || "Tendering Engineer",
          status: "PENDING",
        },
      }),
      prisma.approvalHistory.create({
        data: {
          quotationId,
          action: "SUBMITTED",
          actorName: requesterName || "Tendering Engineer",
          actorRole: "PREPARER",
          comment: "Official commercial offer submitted for GM approval.",
          previousStatus: quote.status,
          newStatus: "Pending GM Approval",
        },
      }),
    ]);

    revalidatePath(`/quotations/${quotationId}`);
    revalidatePath("/approvals");
    revalidatePath("/tenders");
    revalidatePath("/");
    await pushDbToMongo();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * MANDATORY SERVER-ENFORCED GM APPROVAL ACTION
 * Strictly rejects any caller that does not have role === 'GM'
 */
export async function gmDecideQuotation({
  quotationId,
  actorRole,
  actorName,
  decision, // "APPROVE" | "REJECT" | "REQUEST_CHANGES"
  reason,
}: {
  quotationId: string;
  actorRole: string;
  actorName: string;
  decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  reason?: string;
}) {
  try {
    await ensureLatestDb();
    // 1. Strict Server Role Verification
    if (actorRole !== "GM") {
      throw new Error("Access Denied: Only users with the General Manager (GM) role can approve or reject quotations.");
    }

    if ((decision === "REJECT" || decision === "REQUEST_CHANGES") && (!reason || reason.trim().length === 0)) {
      throw new Error("A clear reason is required when rejecting or requesting changes to a quotation.");
    }

    const quote = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { tender: true, approvalRequests: { where: { status: "PENDING" } } },
    });
    if (!quote) throw new Error("Quotation not found");

    if (quote.status !== "Pending GM Approval") {
      throw new Error(`Quotation is in '${quote.status}' status and cannot be decided.`);
    }

    let newQuoteStatus = "Approved";
    let newTenderStatus = "Approved";
    let actionName = "APPROVED";
    let requestStatus = "APPROVED";

    if (decision === "REJECT") {
      newQuoteStatus = "Rejected";
      newTenderStatus = "Revision Requested";
      actionName = "REJECTED";
      requestStatus = "REJECTED";
    } else if (decision === "REQUEST_CHANGES") {
      newQuoteStatus = "Draft";
      newTenderStatus = "Revision Requested";
      actionName = "CHANGES_REQUESTED";
      requestStatus = "CHANGES_REQUESTED";
    }

    await prisma.$transaction([
      prisma.quotation.update({
        where: { id: quotationId },
        data: { status: newQuoteStatus },
      }),
      prisma.tender.update({
        where: { id: quote.tenderId },
        data: { status: newTenderStatus },
      }),
      prisma.approvalRequest.updateMany({
        where: { quotationId, status: "PENDING" },
        data: {
          status: requestStatus,
          approverName: actorName,
          decidedAt: new Date(),
          decisionReason: reason || null,
        },
      }),
      prisma.approvalHistory.create({
        data: {
          quotationId,
          action: actionName,
          actorName,
          actorRole: "GM",
          comment: reason || "Approved for client submission by General Manager.",
          previousStatus: quote.status,
          newStatus: newQuoteStatus,
        },
      }),
    ]);

    revalidatePath(`/quotations/${quotationId}`);
    revalidatePath("/approvals");
    revalidatePath("/tenders");
    revalidatePath("/");
    await pushDbToMongo();
    return { success: true, newStatus: newQuoteStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitQuotationToClient(quotationId: string, submissionMethod: string) {
  try {
    await ensureLatestDb();
    const quote = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { tender: true },
    });
    if (!quote) throw new Error("Quotation not found");

    // Only approved quotations may be submitted
    if (quote.status !== "Approved") {
      throw new Error("Only GM-Approved quotations may be submitted to the client as an official offer.");
    }

    await prisma.$transaction([
      prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: "Submitted to Client",
          submittedToClientAt: new Date(),
          submissionMethod: submissionMethod || "Client Portal Submission",
        },
      }),
      prisma.tender.update({
        where: { id: quote.tenderId },
        data: { status: "Submitted to Client" },
      }),
      prisma.approvalHistory.create({
        data: {
          quotationId,
          action: "SUBMITTED_TO_CLIENT",
          actorName: "Sales / Tender Team",
          actorRole: "PREPARER",
          comment: `Submitted to client via ${submissionMethod || "Client Portal"}`,
          previousStatus: quote.status,
          newStatus: "Submitted to Client",
        },
      }),
    ]);

    revalidatePath(`/quotations/${quotationId}`);
    revalidatePath("/tenders");
    await pushDbToMongo();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordClientDecision({
  quotationId,
  decision, // "Accepted" | "Rejected" | "Revision Requested"
  comments,
  clientPoNumber,
}: {
  quotationId: string;
  decision: string;
  comments?: string;
  clientPoNumber?: string;
}) {
  try {
    await ensureLatestDb();
    let quote = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { tender: true },
    });
    if (!quote) {
      quote = await prisma.quotation.findFirst({
        where: { quotationNumber: quotationId },
        include: { tender: true },
      });
    }
    if (!quote) throw new Error("Quotation not found");

    const newStatus = decision === "Accepted" ? "Accepted" : decision === "Rejected" ? "Rejected" : "Revision Requested";

    await prisma.quotation.update({
      where: { id: quote.id },
      data: {
        clientDecision: decision,
        clientDecisionDate: new Date(),
        clientComments: comments || null,
        clientPoNumber: clientPoNumber || null,
        status: newStatus,
      },
    });

    if (decision === "Revision Requested") {
      await prisma.tender.update({
        where: { id: quote.tenderId },
        data: { status: "Revision Requested" },
      });
    }

    revalidatePath(`/quotations/${quote.id}`);
    revalidatePath("/quotations");
    revalidatePath("/tenders");
    await pushDbToMongo();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Convert Accepted Quotation to Contract (Duplicate protected)
 */
export async function convertQuotationToContract({
  quotationId,
  startDate,
  completionDate,
  agreedScope,
}: {
  quotationId: string;
  startDate: string;
  completionDate: string;
  agreedScope?: string;
}) {
  try {
    await ensureLatestDb();
    let quote = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { tender: true, customer: true, contracts: true },
    });
    if (!quote) {
      quote = await prisma.quotation.findFirst({
        where: { quotationNumber: quotationId },
        include: { tender: true, customer: true, contracts: true },
      });
    }
    if (!quote) throw new Error("Quotation not found");

    if (quote.status !== "Accepted" && quote.clientDecision !== "Accepted") {
      throw new Error("Only client-accepted quotations can be converted into awarded contracts.");
    }

    // Duplicate check
    if (quote.contracts && quote.contracts.length > 0) {
      throw new Error(`A contract (${quote.contracts[0].contractNumber}) has already been generated for this quotation.`);
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.contract.count();
    const contractNumber = `CON-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const [contract] = await prisma.$transaction([
      prisma.contract.create({
        data: {
          contractNumber,
          tenderId: quote.tenderId,
          quotationId: quote.id,
          customerId: quote.customerId,
          businessEntityId: quote.businessEntityId,
          contractValue: quote.totalAmount,
          agreedScope: agreedScope || quote.tender.scopeOfWork,
          startDate: new Date(startDate),
          completionDate: new Date(completionDate),
          paymentTerms: quote.paymentTerms,
          clientPoNumber: quote.clientPoNumber || null,
          status: "Active",
        },
      }),
      prisma.tender.update({
        where: { id: quote.tenderId },
        data: { status: "Awarded" },
      }),
      prisma.quotation.update({
        where: { id: quote.id },
        data: { status: "Awarded" },
      }),
    ]);

    revalidatePath(`/quotations/${quotationId}`);
    revalidatePath("/contracts");
    revalidatePath("/tenders");
    revalidatePath("/");
    await pushDbToMongo();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
