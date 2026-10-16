"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureLatestDb, pushDbToMongo } from "@/lib/mongoSync";

export async function getCRMOverview(entityCode?: string) {
  try {
    await ensureLatestDb();
    const whereEntity =
      entityCode && entityCode !== "ALL"
        ? { businessEntity: { code: entityCode } }
        : {};

    const [leads, accounts, contacts, opportunities, entities] = await Promise.all([
      prisma.lead.findMany({
        where: whereEntity,
        include: { businessEntity: true, opportunity: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.account.findMany({
        include: { contacts: true, tenders: true, contracts: true, opportunities: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.opportunity.findMany({
        where: whereEntity,
        include: { account: true, contact: true, businessEntity: true, tender: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.businessEntity.findMany({ where: { isActive: true } }),
    ]);

    return { leads, accounts, customers: accounts, contacts, opportunities, entities };
  } catch (error) {
    console.error("Error loading CRM overview:", error);
    return { leads: [], accounts: [], customers: [], contacts: [], opportunities: [], entities: [] };
  }
}

export async function createAccount({
  name,
  code,
  type,
  email,
  phone,
  address,
  city,
  primaryContact,
  trn,
  industry,
}: {
  name: string;
  code?: string;
  type?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  primaryContact: string;
  trn?: string;
  industry?: string;
}) {
  try {
    await ensureLatestDb();
    const count = await prisma.account.count();
    const finalCode = code || `ACC-${String(count + 1).padStart(4, "0")}`;

    const account = await prisma.account.create({
      data: {
        code: finalCode,
        name,
        type: type || "Corporate",
        trn: trn || "100293847500003",
        industry: industry || "Infrastructure Contracting",
        email,
        phone,
        address,
        city: city || "Dubai",
        country: "United Arab Emirates",
        primaryContact,
        status: "Active",
      },
    });

    revalidatePath("/crm");
    revalidatePath("/accounts");
    await pushDbToMongo();
    return { success: true, account };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createContact({
  accountId,
  name,
  designation,
  email,
  phone,
  notes,
}: {
  accountId: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  notes?: string;
}) {
  try {
    await ensureLatestDb();
    const contact = await prisma.contact.create({
      data: {
        customerId: accountId,
        name,
        designation,
        email,
        phone,
        notes: notes || null,
      },
    });

    revalidatePath("/crm");
    revalidatePath("/contacts");
    revalidatePath(`/accounts/${accountId}`);
    await pushDbToMongo();
    return { success: true, contact };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Backward-compatible alias
export const createCustomer = createAccount;

export async function updateAccount(
  accountId: string,
  data: {
    name?: string;
    type?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    primaryContact?: string;
    trn?: string;
    industry?: string;
    status?: string;
  }
) {
  try {
    const updated = await prisma.account.update({
      where: { id: accountId },
      data,
    });
    revalidatePath("/accounts");
    revalidatePath("/crm");
    return { success: true, account: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(accountId: string, force: boolean = false) {
  try {
    const acc = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        opportunities: true,
        tenders: true,
        contracts: true,
        contacts: true,
        projects: true,
        quotations: true,
        estimations: true,
      },
    });
    if (!acc) throw new Error("Account not found");

    if (
      !force &&
      (acc.opportunities.length > 0 ||
        acc.tenders.length > 0 ||
        acc.contracts.length > 0 ||
        acc.projects.length > 0)
    ) {
      throw new Error(
        `Cannot delete account: It has ${acc.opportunities.length} opportunities, ${acc.tenders.length} tenders, and ${acc.contracts.length} contracts.`
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Clean up Projects for this customer
      const projects = await tx.project.findMany({ where: { customerId: accountId } });
      for (const p of projects) {
        await tx.purchaseOrder.updateMany({
          where: { projectId: p.id },
          data: { projectId: null },
        });
        await tx.purchaseRequest.updateMany({
          where: { projectId: p.id },
          data: { projectId: null },
        });
        await tx.projectMilestone.deleteMany({ where: { projectId: p.id } });
        await tx.project.delete({ where: { id: p.id } });
      }

      // 2. Clean up Contracts for this customer
      await tx.contract.deleteMany({ where: { customerId: accountId } });

      // 3. Clean up Quotations for this customer
      const quotations = await tx.quotation.findMany({ where: { customerId: accountId } });
      for (const q of quotations) {
        await tx.approvalRequest.deleteMany({ where: { quotationId: q.id } });
        await tx.approvalHistory.deleteMany({ where: { quotationId: q.id } });
        await tx.quotationVersion.deleteMany({ where: { quotationId: q.id } });
        await tx.quotationLineItem.deleteMany({ where: { quotationId: q.id } });
        await tx.quotation.delete({ where: { id: q.id } });
      }

      // 4. Clean up Estimations for this customer
      const estimations = await tx.estimation.findMany({ where: { customerId: accountId } });
      for (const est of estimations) {
        await tx.estimationLineItem.deleteMany({ where: { estimationId: est.id } });
        await tx.estimation.delete({ where: { id: est.id } });
      }

      // 5. Unlink Tenders from Opportunities before deleting either
      await tx.opportunity.updateMany({
        where: { customerId: accountId },
        data: { tenderId: null },
      });

      // 6. Delete Tenders for this customer
      await tx.tender.deleteMany({ where: { customerId: accountId } });

      // 7. Unlink Leads converted to this Account or to its Opportunities
      await tx.lead.updateMany({
        where: { convertedAccountId: accountId },
        data: { convertedAccountId: null, convertedOppId: null, status: "Qualified" },
      });

      const opportunities = await tx.opportunity.findMany({ where: { customerId: accountId } });
      for (const opp of opportunities) {
        if (opp.leadId) {
          await tx.lead.update({
            where: { id: opp.leadId },
            data: { convertedOppId: null, convertedAccountId: null, status: "Qualified" },
          });
        }
      }

      // 8. Delete Opportunities
      await tx.opportunity.deleteMany({ where: { customerId: accountId } });

      // 9. Delete Contacts for this customer
      await tx.contact.deleteMany({ where: { customerId: accountId } });

      // 10. Finally delete Account
      await tx.account.delete({ where: { id: accountId } });
    });

    revalidatePath("/accounts");
    revalidatePath("/crm");
    revalidatePath("/contacts");
    revalidatePath("/opportunities");
    revalidatePath("/leads");
    revalidatePath("/tenders");
    revalidatePath("/estimation");
    revalidatePath("/quotations");
    revalidatePath("/contracts");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { success: false, error: error.message };
  }
}

export async function updateContact(
  contactId: string,
  data: {
    name?: string;
    designation?: string;
    email?: string;
    phone?: string;
    notes?: string;
    customerId?: string;
  }
) {
  try {
    const updated = await prisma.contact.update({
      where: { id: contactId },
      data,
    });
    revalidatePath("/contacts");
    revalidatePath("/accounts");
    return { success: true, contact: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteContact(contactId: string, force: boolean = false) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { opportunities: true },
    });
    if (!contact) throw new Error("Contact not found");

    if (!force && contact.opportunities.length > 0) {
      throw new Error("Cannot delete contact linked to active opportunities.");
    }

    if (force && contact.opportunities.length > 0) {
      await prisma.opportunity.updateMany({
        where: { contactId },
        data: { contactId: null },
      });
    }

    await prisma.contact.delete({ where: { id: contactId } });
    revalidatePath("/contacts");
    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

