import React from "react";
import prisma from "@/lib/prisma";
import { getProcurementOverview } from "@/actions/procurementActions";
import ProcurementTabs from "@/components/procurement/ProcurementTabs";


export default async function ProcurementPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity || "ALL";

  const { purchaseRequests, purchaseOrders, goodsReceipts, suppliers } =
    await getProcurementOverview(entity);

  const entities = await prisma.businessEntity.findMany({ where: { isActive: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Procurement & Supply Chain
        </h1>
        <p className="text-xs text-slate-500">
          Connected workflow: Project Requirement → Purchase Request (PR) → Purchase Order (PO) → Goods Receipt (GRN).
        </p>
      </div>

      <ProcurementTabs
        purchaseRequests={purchaseRequests}
        purchaseOrders={purchaseOrders}
        goodsReceipts={goodsReceipts}
        suppliers={suppliers}
        entities={entities}
      />
    </div>
  );
}
