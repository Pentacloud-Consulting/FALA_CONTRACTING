"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { OPPORTUNITY_STAGES, OpportunityStage } from "@/lib/types";

export async function getOpportunities(entityCode?: string, statusFilter?: string) {
  try {
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.opportunity.findMany({
      where,
      include: {
        account: true,
        contact: true,
        businessEntity: true,
        lead: true,
        tender: {
          include: {
            estimations: true,
            quotations: true,
            contracts: true,
          },
        },
        quotations: {
          orderBy: { createdAt: "desc" },
        },
        contracts: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    throw new Error("Failed to fetch opportunities");
  }
}

export async function createOpportunity(data: {
  name: string;
  customerId?: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactDesignation?: string;
  businessEntityId: string;
  expectedValue?: number;
  expectedCloseDate?: string;
  ownerName?: string;
  status?: string;
  scopeOfWork?: string;
  location?: string;
  specificFieldsJson?: string;
}) {
  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Opportunity title / name is required" };
    }

    const opp = await prisma.$transaction(async (tx) => {
      // 1. Resolve Business Entity
      let resolvedEntityId = data.businessEntityId;
      const foundEntity = await tx.businessEntity.findFirst({
        where: { OR: [{ id: resolvedEntityId }, { code: resolvedEntityId }] },
      });
      if (foundEntity) {
        resolvedEntityId = foundEntity.id;
      } else {
        const fallbackEntity = await tx.businessEntity.findFirst();
        if (!fallbackEntity) throw new Error("No business entity found in system");
        resolvedEntityId = fallbackEntity.id;
      }

      // 2. Resolve Account (Customer)
      let resolvedAccountId = data.customerId;
      if (!resolvedAccountId && data.accountName?.trim()) {
        const trimmedName = data.accountName.trim();
        let existingAccount = await tx.account.findFirst({
          where: { name: trimmedName },
        });
        if (!existingAccount) {
          const accCount = await tx.account.count();
          existingAccount = await tx.account.create({
            data: {
              code: `CUST-${String(accCount + 1).padStart(3, "0")}`,
              name: trimmedName,
              email: data.contactEmail || "info@client.ae",
              phone: data.contactPhone || "+971 4 000 0000",
              address: data.location || "Dubai, UAE",
              city: "Dubai",
              country: "United Arab Emirates",
              primaryContact: data.contactName || "Commercial Lead",
            },
          });
        }
        resolvedAccountId = existingAccount.id;
      }

      if (!resolvedAccountId) {
        // Fallback to first existing account if none provided
        const anyAccount = await tx.account.findFirst();
        if (!anyAccount) {
          throw new Error("Please select or specify an Account / Customer");
        }
        resolvedAccountId = anyAccount.id;
      }

      // 3. Resolve Contact
      let resolvedContactId = data.contactId || null;
      if (!resolvedContactId && data.contactName?.trim()) {
        const newContact = await tx.contact.create({
          data: {
            customerId: resolvedAccountId,
            name: data.contactName.trim(),
            email: data.contactEmail || "contact@client.ae",
            phone: data.contactPhone || "+971 4 000 0000",
            designation: data.contactDesignation || "Project Representative",
          },
        });
        resolvedContactId = newContact.id;
      }

      // 4. Generate next OPP number
      const currentYear = new Date().getFullYear();
      const oppCount = await tx.opportunity.count();
      const oppNumber = `OPP-${currentYear}-${String(oppCount + 1).padStart(4, "0")}`;

      const closeDate = data.expectedCloseDate
        ? new Date(data.expectedCloseDate)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      // 5. Create Opportunity
      return await tx.opportunity.create({
        data: {
          oppNumber,
          name: data.name.trim(),
          customerId: resolvedAccountId,
          contactId: resolvedContactId,
          businessEntityId: resolvedEntityId,
          expectedValue: Number(data.expectedValue) || 0,
          expectedCloseDate: closeDate,
          ownerName: data.ownerName || "Tender Dept",
          status: data.status || "Qualification",
          scopeOfWork: data.scopeOfWork || null,
          location: data.location || "Dubai, UAE",
          specificFieldsJson: data.specificFieldsJson || null,
        },
        include: {
          account: true,
          contact: true,
          businessEntity: true,
        },
      });
    });

    revalidatePath("/opportunities");
    revalidatePath("/dashboard");
    return { success: true, opportunity: opp };
  } catch (error: any) {
    console.error("Error creating opportunity:", error);
    return { success: false, error: error.message || "Failed to create opportunity" };
  }
}

export async function getOpportunityById(id: string) {
  try {
    let opp = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        account: {
          include: {
            contacts: true,
          },
        },
        contact: true,
        businessEntity: true,
        lead: true,
        tender: {
          include: {
            estimations: {
              include: {
                lineItems: true,
              },
              orderBy: { createdAt: "desc" },
            },
            quotations: {
              include: {
                lineItems: true,
                versions: { orderBy: { versionNumber: "desc" } },
                approvalRequests: { orderBy: { submittedAt: "desc" } },
                approvalHistory: { orderBy: { timestamp: "desc" } },
              },
              orderBy: { createdAt: "desc" },
            },
            contracts: true,
          },
        },
        quotations: {
          include: {
            lineItems: true,
            versions: { orderBy: { versionNumber: "desc" } },
            approvalRequests: { orderBy: { submittedAt: "desc" } },
          },
          orderBy: { createdAt: "desc" },
        },
        contracts: true,
      },
    });

    if (!opp) {
      opp = await prisma.opportunity.findFirst({
        where: { oppNumber: id },
        include: {
          account: {
            include: {
              contacts: true,
            },
          },
          contact: true,
          businessEntity: true,
          lead: true,
          tender: {
            include: {
              estimations: {
                include: {
                  lineItems: true,
                },
                orderBy: { createdAt: "desc" },
              },
              quotations: {
                include: {
                  lineItems: true,
                  versions: { orderBy: { versionNumber: "desc" } },
                  approvalRequests: { orderBy: { submittedAt: "desc" } },
                  approvalHistory: { orderBy: { timestamp: "desc" } },
                },
                orderBy: { createdAt: "desc" },
              },
              contracts: true,
            },
          },
          quotations: {
            include: {
              lineItems: true,
              versions: { orderBy: { versionNumber: "desc" } },
              approvalRequests: { orderBy: { submittedAt: "desc" } },
            },
            orderBy: { createdAt: "desc" },
          },
          contracts: true,
        },
      });
    }

    return opp;
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return null;
  }
}

export async function updateOpportunityStage(oppId: string, stage: string) {
  try {
    if (!OPPORTUNITY_STAGES.includes(stage as any)) {
      throw new Error(`Invalid opportunity stage: ${stage}`);
    }

    const updated = await prisma.opportunity.update({
      where: { id: oppId },
      data: { status: stage },
    });

    revalidatePath(`/opportunities/${oppId}`);
    revalidatePath("/opportunities");
    return { success: true, opportunity: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOpportunityDynamicFields(
  oppId: string,
  specificFieldsJson: string
) {
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { id: oppId },
      include: { tender: true },
    });
    if (!opp) throw new Error("Opportunity not found");

    const txOps: any[] = [
      prisma.opportunity.update({
        where: { id: oppId },
        data: { specificFieldsJson },
      }),
    ];

    if (opp.tenderId) {
      txOps.push(
        prisma.tender.update({
          where: { id: opp.tenderId },
          data: { specificFieldsJson },
        })
      );
    }

    await prisma.$transaction(txOps);

    revalidatePath(`/opportunities/${oppId}`);
    if (opp.tenderId) {
      revalidatePath(`/tenders/${opp.tenderId}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * IDEMPOTENT TENDER INITIATION FROM OPPORTUNITY
 * Transfers customer, contact, business unit, scope, and technical specifications into Tender.
 * If tender already exists, safely returns existing Tender.
 */
export async function initiateTenderFromOpportunity(opportunityId: string) {
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        tender: true,
        account: true,
        contact: true,
        businessEntity: true,
      },
    });

    if (!opp) throw new Error("Opportunity not found");

    // Idempotency check: if Tender already created, return it
    if (opp.tender) {
      return { success: true, tender: opp.tender, alreadyExisted: true };
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.tender.count();
    const tenderNumber = `TND-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const tender = await prisma.$transaction(async (tx) => {
      const newTender = await tx.tender.create({
        data: {
          tenderNumber,
          title: opp.name,
          businessEntityId: opp.businessEntityId,
          customerId: opp.customerId,
          contactPerson: opp.contact?.name || opp.account?.primaryContact || "Client Representative",
          contactEmail: opp.contact?.email || opp.account?.email || "info@client.ae",
          contactPhone: opp.contact?.phone || opp.account?.phone || "+971 4 000 0000",
          location: opp.location || "Dubai, UAE",
          description: opp.name,
          submissionDeadline: opp.expectedCloseDate,
          scopeOfWork: opp.scopeOfWork || "Commercial Scope of Work",
          clientReference: `From ${opp.oppNumber}`,
          estimatedValue: opp.expectedValue,
          specificFieldsJson: opp.specificFieldsJson || null, // 100% dynamic technical inheritance
          status: "Draft",
        },
      });

      // Link back to Opportunity and update status to Stage 2: Tender / Estimation
      await tx.opportunity.update({
        where: { id: opp.id },
        data: {
          tenderId: newTender.id,
          status: "Tender / Estimation",
        },
      });

      return newTender;
    });

    revalidatePath(`/opportunities/${opportunityId}`);
    revalidatePath("/opportunities");
    revalidatePath("/tenders");
    return { success: true, tender, alreadyExisted: false };
  } catch (error: any) {
    console.error("Error initiating tender from opportunity:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOpportunity(
  oppId: string,
  data: {
    name?: string;
    expectedValue?: number;
    expectedCloseDate?: string;
    scopeOfWork?: string;
    location?: string;
    status?: string;
    customerId?: string;
    contactId?: string;
    businessEntityId?: string;
  }
) {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.expectedValue !== undefined) updateData.expectedValue = Number(data.expectedValue);
    if (data.expectedCloseDate) updateData.expectedCloseDate = new Date(data.expectedCloseDate);
    if (data.scopeOfWork !== undefined) updateData.scopeOfWork = data.scopeOfWork;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.customerId) updateData.customerId = data.customerId;
    if (data.contactId !== undefined) updateData.contactId = data.contactId || null;
    if (data.businessEntityId) updateData.businessEntityId = data.businessEntityId;

    const updated = await prisma.opportunity.update({
      where: { id: oppId },
      data: updateData,
    });

    revalidatePath(`/opportunities/${oppId}`);
    revalidatePath("/opportunities");
    return { success: true, opportunity: updated };
  } catch (error: any) {
    console.error("Error updating opportunity:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteOpportunity(oppId: string, force: boolean = false) {
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { id: oppId },
      include: { tender: true, quotations: true, contracts: true },
    });
    if (!opp) throw new Error("Opportunity not found");

    if (!force && (opp.tender || opp.quotations.length > 0 || opp.contracts.length > 0)) {
      throw new Error("Cannot delete opportunity with linked tender, quotations, or contracts.");
    }

    // Safely disconnect linked records
    if (opp.tenderId) {
      await prisma.opportunity.update({
        where: { id: oppId },
        data: { tenderId: null },
      });
    }
    for (const q of opp.quotations) {
      await prisma.quotation.update({
        where: { id: q.id },
        data: { opportunityId: null },
      });
    }
    for (const c of opp.contracts) {
      await prisma.contract.update({
        where: { id: c.id },
        data: { opportunityId: null },
      });
    }

    // Unlink lead if present
    if (opp.leadId) {
      await prisma.lead.update({
        where: { id: opp.leadId },
        data: { convertedOppId: null, status: "Qualified" },
      });
    }

    await prisma.opportunity.delete({ where: { id: oppId } });

    revalidatePath("/opportunities");
    revalidatePath("/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting opportunity:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOpportunityProfile(
  oppId: string,
  data: {
    companyName?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactJobTitle?: string;
    leadSource?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    scopeOfWork?: string;
  }
) {
  try {
    const opp = await prisma.opportunity.findUnique({
      where: { id: oppId },
      include: { account: true, contact: true, lead: true },
    });
    if (!opp) throw new Error("Opportunity not found");

    await prisma.$transaction(async (tx) => {
      // 1. Update Opportunity core fields
      const oppUpdate: any = {};
      if (data.location !== undefined) oppUpdate.location = data.location;
      if (data.scopeOfWork !== undefined) oppUpdate.scopeOfWork = data.scopeOfWork;
      if (data.endDate) {
        oppUpdate.expectedCloseDate = new Date(data.endDate);
      }

      // Merge startDate and endDate into specificFieldsJson
      let currentSpecs: Record<string, any> = {};
      if (opp.specificFieldsJson) {
        try {
          currentSpecs = JSON.parse(opp.specificFieldsJson);
        } catch {}
      }
      if (data.startDate !== undefined) currentSpecs.startDate = data.startDate;
      if (data.endDate !== undefined) currentSpecs.endDate = data.endDate;
      oppUpdate.specificFieldsJson = JSON.stringify(currentSpecs);

      await tx.opportunity.update({
        where: { id: oppId },
        data: oppUpdate,
      });

      // 2. If tender exists, sync location, scope, and specificFieldsJson
      if (opp.tenderId) {
        await tx.tender.update({
          where: { id: opp.tenderId },
          data: {
            location: data.location || opp.location || "Dubai, UAE",
            scopeOfWork: data.scopeOfWork || opp.scopeOfWork || "Commercial Scope of Work",
            submissionDeadline: data.endDate ? new Date(data.endDate) : undefined,
            specificFieldsJson: JSON.stringify(currentSpecs),
          },
        });
      }

      // 3. Update Contact if exists or create/link if needed
      if (opp.contactId) {
        await tx.contact.update({
          where: { id: opp.contactId },
          data: {
            name: data.contactPerson || undefined,
            email: data.contactEmail || undefined,
            phone: data.contactPhone || undefined,
            designation: data.contactJobTitle || undefined,
          },
        });
      }

      // 4. Update Account name & primaryContact if changed
      if (opp.customerId && data.companyName) {
        await tx.account.update({
          where: { id: opp.customerId },
          data: {
            name: data.companyName,
            primaryContact: data.contactPerson || undefined,
          },
        });
      }

      // 5. Update Lead if linked
      if (opp.leadId) {
        await tx.lead.update({
          where: { id: opp.leadId },
          data: {
            company: data.companyName || undefined,
            name: data.contactPerson || undefined,
            email: data.contactEmail || undefined,
            phone: data.contactPhone || undefined,
            jobTitle: data.contactJobTitle || undefined,
            source: data.leadSource || undefined,
            location: data.location || undefined,
            requirement: data.scopeOfWork || undefined,
            expectedClosingDate: data.endDate ? new Date(data.endDate) : undefined,
          },
        });
      }
    });

    revalidatePath(`/opportunities/${oppId}`);
    revalidatePath("/opportunities");
    if (opp.customerId) revalidatePath(`/accounts/${opp.customerId}`);
    if (opp.contactId) revalidatePath(`/contacts/${opp.contactId}`);
    if (opp.leadId) revalidatePath(`/leads/${opp.leadId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating opportunity profile:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}


