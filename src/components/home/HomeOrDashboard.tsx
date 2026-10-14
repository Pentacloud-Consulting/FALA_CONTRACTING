"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import PublicHomePage from "./PublicHomePage";
import UnifiedExecutiveCRM from "@/components/dashboard/UnifiedExecutiveCRM";

export default function HomeOrDashboard({
  dashboardData,
  crmData,
  entityFilter,
  initialTab,
}: {
  dashboardData: any;
  crmData: any;
  entityFilter: string;
  initialTab?: string;
}) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <PublicHomePage />;
  }

  return (
    <UnifiedExecutiveCRM
      dashboardData={dashboardData}
      crmData={crmData}
      entityFilter={entityFilter}
      initialTab={initialTab}
    />
  );
}
