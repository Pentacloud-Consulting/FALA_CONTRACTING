import React from "react";
import prisma from "@/lib/prisma";
import ContactsListClient from "@/components/contacts/ContactsListClient";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [contacts, accounts] = await Promise.all([
    prisma.contact.findMany({
      include: {
        customer: true,
        opportunities: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.account.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Client Contacts Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key client representatives, engineers, procurement heads, and decision makers
          </p>
        </div>
      </div>

      <ContactsListClient initialContacts={contacts} accountsList={accounts} />
    </div>
  );
}
