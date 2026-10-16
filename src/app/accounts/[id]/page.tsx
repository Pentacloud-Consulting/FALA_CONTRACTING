import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AccountDetailsClient from "@/components/accounts/AccountDetailsClient";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const accountId = resolved.id;

  const [account, businessEntities] = await Promise.all([
    prisma.account.findUnique({
      where: { id: accountId },
      include: {
        contacts: true,
        opportunities: {
          include: {
            businessEntity: true,
          },
        },
        tenders: true,
        contracts: true,
      },
    }),
    prisma.businessEntity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!account) {
    notFound();
  }

  return (
    <AccountDetailsClient
      account={account}
      entityList={businessEntities}
    />
  );
}
