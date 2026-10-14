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
  const [entities, customers] = await Promise.all([
    prisma.businessEntity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { status: "Active" }, include: { contacts: true }, orderBy: { name: "asc" } }),
  ]);
  return { entities, customers };
}

export interface CreateTenderInput {
  businessEntityCode: string;
  customerId?: string;
  newCustomerName?: string;
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

    let customerId = input.customerId;
    if (!customerId || customerId === "NEW") {
      const customerName = input.newCustomerName?.trim() || "Client / Employer";
      const existing = await prisma.customer.findFirst({ where: { name: customerName } });
      if (existing) {
        customerId = existing.id;
      } else {
        const custCount = await prisma.customer.count();
        const code = `CUST-${String(custCount + 1).padStart(3, "0")}`;
        const newCust = await prisma.customer.create({
          data: {
            code,
            name: customerName,
            primaryContact: input.contactPerson || "Primary Contact",
            email: input.contactEmail || "contact@client.ae",
            phone: input.contactPhone || "+971 4 000 0000",
            address: input.location || "Dubai, UAE",
            status: "Active",
          },
        });
        customerId = newCust.id;
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
        customerId,
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

    revalidatePath("/tenders");
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
