"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLeads(entityCode?: string, statusFilter?: string) {
  try {
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.lead.findMany({
      where,
      include: {
        businessEntity: true,
        opportunity: {
          include: {
            account: true,
            contact: true,
            tender: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads");
  }
}

export async function getLeadById(id: string) {
  try {
    return await prisma.lead.findUnique({
      where: { id },
      include: {
        businessEntity: true,
        opportunity: {
          include: {
            account: true,
            contact: true,
            tender: {
              include: {
                estimations: true,
                quotations: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return null;
  }
}

export async function createLead({
  name,
  company,
  email,
  phone,
  jobTitle,
  source = "Direct",
  businessEntityId,
  estimatedValue = 0,
  location = "Dubai, UAE",
  requirement,
  notes,
  expectedClosingDate,
  specificFieldsJson,
  ownerName = "Sales Team",
}: {
  name: string;
  company: string;
  email: string;
  phone: string;
  jobTitle?: string;
  source?: string;
  businessEntityId: string;
  estimatedValue?: number;
  location?: string;
  requirement?: string;
  notes?: string;
  expectedClosingDate?: string;
  specificFieldsJson?: string;
  ownerName?: string;
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        company,
        email,
        phone,
        jobTitle: jobTitle || null,
        source: source || "Direct",
        businessEntityId,
        estimatedValue: Number(estimatedValue) || 0,
        location: location || "Dubai, UAE",
        requirement: requirement || null,
        notes: notes || null,
        expectedClosingDate: expectedClosingDate ? new Date(expectedClosingDate) : null,
        specificFieldsJson: specificFieldsJson || null,
        ownerName: ownerName || "Sales Team",
        status: "New",
      },
    });

    revalidatePath("/leads");
    revalidatePath("/crm");
    return { success: true, lead };
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLeadStage(leadId: string, status: string) {
  try {
    const validStatuses = ["New", "Contacted", "Under Qualification", "Qualified", "Dropped", "Converted"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid lead status: ${status}`);
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");

    if (lead.status === "Converted") {
      throw new Error("Converted leads cannot change status.");
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
    revalidatePath("/crm");
    return { success: true, lead: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLeadDetails(
  leadId: string,
  data: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    source?: string;
    businessEntityId?: string;
    estimatedValue?: number;
    location?: string;
    requirement?: string;
    notes?: string;
    expectedClosingDate?: string;
    specificFieldsJson?: string;
  }
) {
  try {
    const updateData: any = { ...data };
    if (data.expectedClosingDate !== undefined) {
      updateData.expectedClosingDate = data.expectedClosingDate
        ? new Date(data.expectedClosingDate)
        : null;
    }
    if (data.businessEntityId) {
      const ent = await prisma.businessEntity.findFirst({
        where: { OR: [{ id: data.businessEntityId }, { code: data.businessEntityId }] },
      });
      if (ent) {
        updateData.businessEntityId = ent.id;
      }
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        businessEntity: true,
      },
    });

    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
    return { success: true, lead: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * ATOMIC TRANSACTIONAL CONVERSION WITH CONCURRENCY SAFE DUPLICATE CHECK
 * Converts a Qualified Lead into an Account, Contact, and Opportunity in 1 transaction.
 * Retries/duplicates will safely return the already converted records.
 */
export async function convertLeadAction({
  leadId,
  // Account options: existing account or create new
  existingAccountId,
  accountName,
  accountTrn,
  accountAddress,
  accountCity = "Dubai",
  accountIndustry,
  // Contact options: existing contact or create new
  existingContactId,
  contactName,
  contactDesignation,
  contactEmail,
  contactPhone,
  // Opportunity details
  opportunityName,
  expectedValue,
  expectedCloseDate,
  scopeOfWork,
}: {
  leadId: string;
  existingAccountId?: string;
  accountName?: string;
  accountTrn?: string;
  accountAddress?: string;
  accountCity?: string;
  accountIndustry?: string;
  existingContactId?: string;
  contactName?: string;
  contactDesignation?: string;
  contactEmail?: string;
  contactPhone?: string;
  opportunityName?: string;
  expectedValue?: number;
  expectedCloseDate?: string;
  scopeOfWork?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch lead and verify qualification
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
        include: { businessEntity: true },
      });
      if (!lead) throw new Error("Lead not found");

      // Concurrency check: If already converted, return existing records idempotently
      if (lead.status === "Converted" && lead.convertedOppId) {
        const opp = await tx.opportunity.findUnique({
          where: { id: lead.convertedOppId },
          include: { account: true, contact: true },
        });
        return {
          alreadyConverted: true,
          opportunity: opp,
          account: opp?.account,
          contact: opp?.contact,
        };
      }

      if (lead.status !== "Qualified") {
        throw new Error(
          `Lead must be in 'Qualified' status before conversion. Current status is '${lead.status}'.`
        );
      }

      // 2. Resolve Account (create or link existing)
      let resolvedAccountId = existingAccountId;
      let accountRecord: any = null;

      if (resolvedAccountId) {
        accountRecord = await tx.account.findUnique({ where: { id: resolvedAccountId } });
        if (!accountRecord) throw new Error("Selected existing Account not found");
      } else {
        const count = await tx.account.count();
        const code = `ACC-${String(count + 1).padStart(4, "0")}`;
        const nameToUse = accountName || lead.company;

        accountRecord = await tx.account.create({
          data: {
            code,
            name: nameToUse,
            type: "Corporate Client",
            trn: accountTrn || "100293847500003",
            industry: accountIndustry || lead.businessEntity?.name || "Infrastructure",
            email: lead.email,
            phone: lead.phone,
            address: accountAddress || lead.location || "Business Bay, Dubai",
            city: accountCity || "Dubai",
            country: "United Arab Emirates",
            primaryContact: contactName || lead.name,
            status: "Active",
          },
        });
        resolvedAccountId = accountRecord.id;
      }

      // 3. Resolve Contact (create or link existing)
      let resolvedContactId = existingContactId;
      let contactRecord: any = null;

      if (resolvedContactId) {
        contactRecord = await tx.contact.findUnique({ where: { id: resolvedContactId } });
        if (!contactRecord) throw new Error("Selected existing Contact not found");
      } else {
        contactRecord = await tx.contact.create({
          data: {
            customerId: resolvedAccountId!,
            name: contactName || lead.name,
            designation: contactDesignation || lead.jobTitle || "Procurement Director",
            email: contactEmail || lead.email,
            phone: contactPhone || lead.phone,
            notes: `Converted from Lead ${lead.name}`,
          },
        });
        resolvedContactId = contactRecord.id;
      }

      // 4. Resolve Opportunity close date & expected value
      const oppValue =
        expectedValue !== undefined && expectedValue !== null
          ? Number(expectedValue)
          : lead.estimatedValue || 0;

      // Safe date handling: if no date provided, default to 60 days from now
      let closeDateObj: Date;
      if (expectedCloseDate) {
        closeDateObj = new Date(expectedCloseDate);
      } else if (lead.expectedClosingDate) {
        closeDateObj = new Date(lead.expectedClosingDate);
      } else {
        closeDateObj = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      }

      const currentYear = new Date().getFullYear();
      const oppCount = await tx.opportunity.count();
      const oppNumber = `OPP-${currentYear}-${String(oppCount + 1).padStart(4, "0")}`;

      const oppName =
        opportunityName || `${lead.company} - ${lead.businessEntity?.shortName || "Commercial Contract"}`;

      // 5. Create Opportunity with inherited technical dynamic fields!
      const oppRecord = await tx.opportunity.create({
        data: {
          oppNumber,
          name: oppName,
          customerId: resolvedAccountId!,
          contactId: resolvedContactId,
          leadId: lead.id,
          businessEntityId: lead.businessEntityId,
          expectedValue: oppValue,
          expectedCloseDate: closeDateObj,
          ownerName: lead.ownerName || "Tender Dept",
          status: "Qualification", // Starting stage in 8-stage pipeline
          scopeOfWork: scopeOfWork || lead.requirement || "Scope defined during lead qualification.",
          location: lead.location || "Dubai, UAE",
          specificFieldsJson: lead.specificFieldsJson || null, // 100% dynamic field inheritance
        },
      });

      // 6. Mark Lead as Converted and link IDs
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: "Converted",
          convertedAccountId: resolvedAccountId,
          convertedContactId: resolvedContactId,
          convertedOppId: oppRecord.id,
        },
      });

      return {
        alreadyConverted: false,
        opportunity: oppRecord,
        account: accountRecord,
        contact: contactRecord,
      };
    });

    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
    revalidatePath("/opportunities");
    revalidatePath("/accounts");
    revalidatePath("/contacts");
    revalidatePath("/crm");
    return { success: true, ...result };
  } catch (error: any) {
    console.error("Error converting lead:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLead(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { opportunity: true },
    });
    if (!lead) throw new Error("Lead not found");

    // If linked to an opportunity, disconnect lead from opportunity first
    if (lead.opportunity) {
      await prisma.opportunity.update({
        where: { id: lead.opportunity.id },
        data: { leadId: null },
      });
    }

    await prisma.lead.delete({ where: { id: leadId } });

    revalidatePath("/leads");
    revalidatePath("/crm");
    revalidatePath("/opportunities");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    return { success: false, error: error.message };
  }
}

