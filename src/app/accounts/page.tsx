import React from "react";
import prisma from "@/lib/prisma";
import AccountsListClient from "@/components/accounts/AccountsListClient";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    include: {
      contacts: true,
      tenders: true,
      contracts: true,
      opportunities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Accounts Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified employers, government entities, and corporate clients linked to commercial opportunities
          </p>
        </div>
      </div>

      <AccountsListClient initialAccounts={accounts} />
    </div>
  );
}
