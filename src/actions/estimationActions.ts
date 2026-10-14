"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateEstimation, round2 } from "@/lib/calculations";

export async function getEstimations(entityCode?: string) {
  try {
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }
    return await prisma.estimation.findMany({
      where,
      include: {
        tender: true,
        businessEntity: true,
        customer: true,
        lineItems: true,
        quotations: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching estimations:", error);
    throw new Error("Failed to fetch estimations");
  }
}

export async function getEstimationById(id: string) {
  try {
    return await prisma.estimation.findUnique({
      where: { id },
      include: {
        tender: true,
        businessEntity: true,
        customer: true,
        lineItems: true,
        quotations: true,
      },
    });
  } catch (error) {
    console.error("Error fetching estimation:", error);
    throw new Error("Failed to fetch estimation");
  }
}

export interface CreateEstimationInput {
  tenderId: string;
  preparedBy: string;
  targetMargin: number;
  overheads: number;
  contingency: number;
  notes?: string;
  lineItems: {
    costCategory: string;
    description: string;
    quantity: number;
    unit: string;
    unitRate: number;
  }[];
}

export async function createEstimation(input: CreateEstimationInput) {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id: input.tenderId },
      include: { businessEntity: true, customer: true },
    });
    if (!tender) {
      throw new Error("Tender not found");
    }

    // Server-side authoritative calculation
    const calcResult = calculateEstimation({
      lineItems: input.lineItems,
      overheads: input.overheads,
      contingency: input.contingency,
      targetMarginPercent: input.targetMargin,
      taxRatePercent: 5.0,
    });

    const currentYear = new Date().getFullYear();
    const count = await prisma.estimation.count();
    const estimationNumber = `EST-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const newEstimation = await prisma.estimation.create({
      data: {
        estimationNumber,
        tenderId: tender.id,
        businessEntityId: tender.businessEntityId,
        customerId: tender.customerId,
        version: 1,
        preparedBy: input.preparedBy || "Eng. Tariq Al-Nuaimi",
        date: new Date(),
        targetMargin: input.targetMargin,
        totalDirectCost: calcResult.totalDirectCost,
        overheads: calcResult.overheads,
        contingency: calcResult.contingency,
        totalCost: calcResult.totalCost,
        sellingPriceBeforeTax: calcResult.sellingPriceBeforeTax,
        taxRate: 5.0,
        taxAmount: calcResult.taxAmount,
        finalPrice: calcResult.finalPrice,
        estimatedProfit: calcResult.estimatedProfit,
        profitMargin: calcResult.profitMarginPercent,
        status: "Completed",
        notes: input.notes || null,
        lineItems: {
          create: input.lineItems.map((item) => ({
            costCategory: item.costCategory,
            description: item.description,
            quantity: Number(item.quantity),
            unit: item.unit,
            unitRate: Number(item.unitRate),
            lineTotal: round2(Number(item.quantity) * Number(item.unitRate)),
          })),
        },
      },
    });

    // Update tender status and estimated value
    await prisma.tender.update({
      where: { id: tender.id },
      data: {
        status: "Estimation Completed",
        estimatedValue: calcResult.finalPrice,
      },
    });

    revalidatePath("/estimation");
    revalidatePath(`/tenders/${tender.id}`);
    revalidatePath("/tenders");
    return { success: true, estimation: newEstimation };
  } catch (error: any) {
    console.error("Error creating estimation:", error);
    return { success: false, error: error.message };
  }
}
