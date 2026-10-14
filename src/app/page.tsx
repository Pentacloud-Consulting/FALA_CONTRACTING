import React from "react";
import { getDashboardData } from "@/actions/dashboardActions";
import { getCRMOverview } from "@/actions/crmActions";
import HomeOrDashboard from "@/components/home/HomeOrDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const entityFilter = resolvedParams?.entity || "ALL";

  const [dashboardData, crmData] = await Promise.all([
    getDashboardData(entityFilter),
    getCRMOverview(entityFilter),
  ]);

  return (
    <HomeOrDashboard
      dashboardData={dashboardData}
      crmData={crmData}
      entityFilter={entityFilter}
      initialTab={resolvedParams?.tab}
    />
  );
}
