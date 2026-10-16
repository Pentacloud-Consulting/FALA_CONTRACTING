"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTenders(entityCode?: string, status?: string) {
  try {
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    return await prisma.tender.findMany({
      where,
      include: {
        businessEntity: true,
        customer: true,
        opportunity: true,
        estimations: true,
        quotations: true,
        contracts: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching tenders:", error);
    throw new Error("Failed to fetch tenders");
  }
}

export async function getTenderById(id: string) {
  try {
    return await prisma.tender.findUnique({
      where: { id },
      include: {
        businessEntity: true,
        customer: {
          include: { contacts: true },
        },
        opportunity: true,
        estimations: {
          include: { lineItems: true },
        },
        quotations: {
          include: {
            lineItems: true,
            approvalRequests: true,
            approvalHistory: { orderBy: { timestamp: "desc" } },
            contracts: true,
          },
        },
        contracts: {
          include: { projects: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tender by id:", error);
    throw new Error("Failed to fetch tender details");
  }
}

export async function getTenderFormData() {
  const [entities, accounts] = await Promise.all([
    prisma.businessEntity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.account.findMany({ where: { status: "Active" }, include: { contacts: true }, orderBy: { name: "asc" } }),
  ]);
  return { entities, accounts, customers: accounts };
}

export interface CreateTenderInput {
  businessEntityCode: string;
  accountId?: string;
  customerId?: string;
  newAccountName?: string;
  newCustomerName?: string;
  opportunityId?: string;
  recordType?: string;
  branch?: string;
  title: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  clientReference?: string;
  submissionDeadline: string;
  expectedClosingDate?: string;
  ownerName?: string;
  location: string;
  currency?: string;
  description: string;
  scopeOfWork: string;
  estimatedValue: number;
  specificFields: Record<string, any>;
  supportingDocs?: string;
  internalNotes?: string;
}

export async function createTender(input: CreateTenderInput) {
  try {
    const businessEntity = await prisma.businessEntity.findUnique({
      where: { code: input.businessEntityCode },
    });
    if (!businessEntity) {
      throw new Error(`Business Entity not found: ${input.businessEntityCode}`);
    }

    let accountId = input.accountId || input.customerId;
    const accountNameInput = input.newAccountName || input.newCustomerName;
    if (!accountId || accountId === "NEW") {
      const accountName = accountNameInput?.trim() || "Client / Employer";
      const existing = await prisma.account.findFirst({ where: { name: accountName } });
      if (existing) {
        accountId = existing.id;
      } else {
        const accCount = await prisma.account.count();
        const code = `ACC-${String(accCount + 1).padStart(3, "0")}`;
        const newAcc = await prisma.account.create({
          data: {
            code,
            name: accountName,
            primaryContact: input.contactPerson || "Primary Contact",
            email: input.contactEmail || "contact@client.ae",
            phone: input.contactPhone || "+971 4 000 0000",
            address: input.location || "Dubai, UAE",
            status: "Active",
          },
        });
        accountId = newAcc.id;
      }
    }

    // Generate unique internal tender number on the server
    const currentYear = new Date().getFullYear();
    const count = await prisma.tender.count();
    const tenderNumber = `TND-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const newTender = await prisma.tender.create({
      data: {
        tenderNumber,
        title: input.title,
        businessEntityId: businessEntity.id,
        customerId: accountId,
        branch: input.branch || "Dubai HQ",
        recordType: input.recordType || "Tender",
        contactPerson: input.contactPerson,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        clientReference: input.clientReference || null,
        issueDate: new Date(),
        submissionDeadline: new Date(input.submissionDeadline),
        expectedClosingDate: input.expectedClosingDate ? new Date(input.expectedClosingDate) : null,
        ownerName: input.ownerName || "Senior Estimator",
        location: input.location,
        currency: input.currency || "AED",
        description: input.description,
        scopeOfWork: input.scopeOfWork,
        supportingDocs: input.supportingDocs || null,
        internalNotes: input.internalNotes || null,
        status: "Registered",
        estimatedValue: Number(input.estimatedValue || 0),
        specificFieldsJson: JSON.stringify(input.specificFields || {}),
      },
    });

    // If initiated from an opportunity, link back to Opportunity
    if (input.opportunityId) {
      await prisma.opportunity.update({
        where: { id: input.opportunityId },
        data: {
          tenderId: newTender.id,
          status: "Tender / Estimation",
        },
      });
    }

    revalidatePath("/tenders");
    revalidatePath("/opportunities");
    revalidatePath("/");
    return { success: true, tender: newTender };
  } catch (error: any) {
    console.error("Error creating tender:", error);
    return { success: false, error: error.message || "Failed to create tender" };
  }
}

export async function updateTenderStatus(id: string, status: string) {
  try {
    const updated = await prisma.tender.update({
      where: { id },
      data: { status },
    });
    revalidatePath(`/tenders/${id}`);
    revalidatePath("/tenders");
    revalidatePath("/");
    return { success: true, tender: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTender(
  id: string,
  data: {
    title?: string;
    description?: string;
    scopeOfWork?: string;
    location?: string;
    submissionDeadline?: string;
    estimatedValue?: number;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) {
  try {
    const updateData: any = { ...data };
    if (data.submissionDeadline) {
      updateData.submissionDeadline = new Date(data.submissionDeadline);
    }
    if (data.estimatedValue !== undefined) {
      updateData.estimatedValue = Number(data.estimatedValue);
    }

    const updated = await prisma.tender.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/tenders/${id}`);
    revalidatePath("/tenders");
    return { success: true, tender: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTender(id: string, force: boolean = false) {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id },
      include: { contracts: true, opportunity: true, estimations: true, quotations: true },
    });
    if (!tender) throw new Error("Tender not found");

    if (!force && tender.contracts.length > 0) {
      throw new Error("Cannot delete tender with active commercial contracts.");
    }

    // Unlink opportunity if linked
    if (tender.opportunity) {
      await prisma.opportunity.update({
        where: { id: tender.opportunity.id },
        data: { tenderId: null, status: "Qualification" },
      });
    }

    // Clean up dependent quotations
    for (const q of tender.quotations) {
      await prisma.approvalRequest.deleteMany({ where: { quotationId: q.id } });
      await prisma.approvalHistory.deleteMany({ where: { quotationId: q.id } });
      await prisma.quotationVersion.deleteMany({ where: { quotationId: q.id } });
      await prisma.quotationLineItem.deleteMany({ where: { quotationId: q.id } });
      await prisma.quotation.delete({ where: { id: q.id } });
    }

    // Clean up dependent estimations
    for (const est of tender.estimations) {
      await prisma.estimationLineItem.deleteMany({ where: { estimationId: est.id } });
      await prisma.estimation.delete({ where: { id: est.id } });
    }

    if (force && tender.contracts.length > 0) {
      for (const c of tender.contracts) {
        await prisma.contract.delete({ where: { id: c.id } });
      }
    }

    await prisma.tender.delete({ where: { id } });

    revalidatePath("/tenders");
    revalidatePath("/opportunities");
    revalidatePath("/estimation");
    revalidatePath("/quotations");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting tender:", error);
    return { success: false, error: error.message };
  }
}

