import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getOpportunityById } from "@/actions/opportunityActions";
import OpportunityDetailsClient from "@/components/opportunities/OpportunityDetailsClient";

export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const oppId = resolved.id;

  const opp = await getOpportunityById(oppId);

  if (!opp) {
    notFound();
  }

  return <OpportunityDetailsClient opp={opp} />;
}
