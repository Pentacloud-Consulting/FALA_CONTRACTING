import { redirect } from "next/navigation";

export default async function CRMRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const entity = resolved?.entity;
  if (entity) {
    redirect(`/?tab=crm&entity=${encodeURIComponent(entity)}`);
  }
  redirect("/?tab=crm");
}
