import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContactDetailsClient from "@/components/contacts/ContactDetailsClient";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const contactId = resolved.id;

  const [contact, accounts, businessEntities] = await Promise.all([
    prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        customer: true,
        opportunities: {
          include: {
            businessEntity: true,
          },
        },
      },
    }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.businessEntity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <ContactDetailsClient
      contact={contact}
      accountsList={accounts}
      entityList={businessEntities}
    />
  );
}
