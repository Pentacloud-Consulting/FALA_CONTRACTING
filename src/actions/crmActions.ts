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

    const [leads, customers, contacts, opportunities, entities] = await Promise.all([
      prisma.lead.findMany({
        where: whereEntity,
        include: { businessEntity: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.findMany({
        include: { contacts: true, tenders: true, contracts: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.opportunity.findMany({
        where: whereEntity,
        include: { customer: true, businessEntity: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.businessEntity.findMany({ where: { isActive: true } }),
    ]);

    return { leads, customers, contacts, opportunities, entities };
  } catch (error) {
    console.error("Error loading CRM overview:", error);
    return { leads: [], customers: [], contacts: [], opportunities: [], entities: [] };
  }
}

export async function createLead({
  name,
  company,
  email,
  phone,
  source,
  businessEntityId,
  notes,
}: {
  name: string;
  company: string;
  email: string;
  phone: string;
  source?: string;
  businessEntityId: string;
  notes?: string;
}) {
  try {
    await ensureLatestDb();
    const lead = await prisma.lead.create({
      data: {
        name,
        company,
        email,
        phone,
        source: source || "Direct",
        businessEntityId,
        notes: notes || null,
        status: "New",
      },
    });
    revalidatePath("/crm");
    revalidatePath("/crm/leads");
    await pushDbToMongo();
    return { success: true, lead };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCustomer({
  name,
  code,
  type,
  email,
  phone,
  address,
  city,
  primaryContact,
}: {
  name: string;
  code: string;
  type?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  primaryContact: string;
}) {
  try {
    await ensureLatestDb();
    const customer = await prisma.customer.create({
      data: {
        code,
        name,
        type: type || "Corporate",
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
    revalidatePath("/crm/customers");
    await pushDbToMongo();
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
