"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { round2 } from "@/lib/calculations";
import { ensureLatestDb, pushDbToMongo } from "@/lib/mongoSync";

export async function getProcurementOverview(entityCode?: string) {
  try {
    await ensureLatestDb();
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }

    const [purchaseRequests, purchaseOrders, goodsReceipts, suppliers] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        include: { businessEntity: true, project: true, lineItems: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          businessEntity: true,
          project: true,
          lineItems: true,
          goodsReceipts: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.goodsReceipt.findMany({
        include: {
          purchaseOrder: {
            include: { supplier: true, businessEntity: true, project: true },
          },
          lineItems: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    ]);

    return { purchaseRequests, purchaseOrders, goodsReceipts, suppliers };
  } catch (error) {
    console.error("Error fetching procurement data:", error);
    throw new Error("Failed to fetch procurement data");
  }
}

export async function createPurchaseRequest({
  businessEntityId,
  projectId,
  department,
  requester,
  requiredDate,
  description,
  supplierPreference,
  reason,
  lineItems,
}: {
  businessEntityId: string;
  projectId?: string;
  department: string;
  requester: string;
  requiredDate: string;
  description: string;
  supplierPreference?: string;
  reason: string;
  lineItems: {
    description: string;
    quantity: number;
    unit: string;
    estimatedPrice: number;
  }[];
}) {
  try {
    await ensureLatestDb();
    const totalAmount = round2(
      lineItems.reduce((acc, item) => acc + Number(item.quantity) * Number(item.estimatedPrice), 0)
    );

    const currentYear = new Date().getFullYear();
    const count = await prisma.purchaseRequest.count();
    const prNumber = `PR-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const pr = await prisma.purchaseRequest.create({
      data: {
        prNumber,
        businessEntityId,
        projectId: projectId || null,
        department: department || "Operations",
        requester: requester || "Sarah Jenkins, PMP",
        requiredDate: new Date(requiredDate),
        description,
        supplierPreference: supplierPreference || null,
        reason,
        status: "Pending",
        totalAmount,
        lineItems: {
          create: lineItems.map((li) => ({
            description: li.description,
            quantity: Number(li.quantity),
            unit: li.unit,
            estimatedPrice: Number(li.estimatedPrice),
            lineTotal: round2(Number(li.quantity) * Number(li.estimatedPrice)),
          })),
        },
      },
    });

    revalidatePath("/procurement");
    revalidatePath("/procurement/requests");
    await pushDbToMongo();
    return { success: true, pr };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function convertPRtoPO({
  purchaseRequestId,
  supplierId,
  deliveryTerms,
  paymentTerms,
  expectedDeliveryDate,
}: {
  purchaseRequestId: string;
  supplierId: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  expectedDeliveryDate: string;
}) {
  try {
    await ensureLatestDb();
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
      include: { lineItems: true },
    });
    if (!pr) throw new Error("Purchase request not found");

    if (pr.status === "Converted") {
      throw new Error("This Purchase Request has already been converted into a Purchase Order.");
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const subtotal = pr.totalAmount;
    const tax = round2(subtotal * 0.05);
    const totalAmount = round2(subtotal + tax);

    const [po] = await prisma.$transaction([
      prisma.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          businessEntityId: pr.businessEntityId,
          projectId: pr.projectId,
          purchaseRequestId: pr.id,
          subtotal,
          tax,
          totalAmount,
          deliveryTerms: deliveryTerms || "Delivered to Project Site Yard",
          paymentTerms: paymentTerms || "30 Days Credit from Delivery",
          expectedDeliveryDate: new Date(expectedDeliveryDate),
          status: "Issued",
          lineItems: {
            create: pr.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitRate: item.estimatedPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
      }),
      prisma.purchaseRequest.update({
        where: { id: pr.id },
        data: { status: "Converted" },
      }),
    ]);

    revalidatePath("/procurement");
    revalidatePath("/procurement/orders");
    await pushDbToMongo();
    return { success: true, po };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createGoodsReceipt({
  purchaseOrderId,
  receivedBy,
  notes,
  lineReceipts,
}: {
  purchaseOrderId: string;
  receivedBy: string;
  notes?: string;
  lineReceipts: {
    poLineItemId: string;
    description: string;
    orderedQuantity: number;
    receivedQuantity: number;
    acceptedQuantity: number;
  }[];
}) {
  try {
    await ensureLatestDb();
    const currentYear = new Date().getFullYear();
    const count = await prisma.goodsReceipt.count();
    const receiptNumber = `GRN-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const [grn] = await prisma.$transaction([
      prisma.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId,
          receivedDate: new Date(),
          receivedBy: receivedBy || "Storekeeper",
          notes: notes || null,
          status: "Accepted",
          lineItems: {
            create: lineReceipts.map((lr) => ({
              poLineItemId: lr.poLineItemId,
              description: lr.description,
              orderedQuantity: Number(lr.orderedQuantity),
              receivedQuantity: Number(lr.receivedQuantity),
              acceptedQuantity: Number(lr.acceptedQuantity),
            })),
          },
        },
      }),
      prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: "Received" },
      }),
    ]);

    revalidatePath("/procurement");
    revalidatePath("/procurement/receipts");
    await pushDbToMongo();
    return { success: true, grn };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
