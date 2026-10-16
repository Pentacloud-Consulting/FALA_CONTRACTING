import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLeadById } from "@/actions/leadActions";
import LeadDetailsClient from "@/components/leads/LeadDetailsClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const leadId = resolved.id;

  const [lead, accounts, businessEntities] = await Promise.all([
    getLeadById(leadId),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.businessEntity.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <LeadDetailsClient
      lead={lead}
      accountsList={accounts}
      entityList={businessEntities}
    />
  );
}
