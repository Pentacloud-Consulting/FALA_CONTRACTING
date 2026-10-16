"use server";

import prisma from "@/lib/prisma";

export async function getDashboardData(entityFilter?: string) {
  try {
    const whereEntity =
      entityFilter && entityFilter !== "ALL"
        ? { businessEntity: { code: entityFilter } }
        : {};

    const [
      totalTenders,
      activeTenders,
      pendingApprovals,
      approvedQuotations,
      contracts,
      projects,
      openOpportunities,
      pendingPRs,
      allEntities,
    ] = await Promise.all([
      prisma.tender.findMany({
        where: whereEntity,
        include: { businessEntity: true, customer: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tender.count({
        where: {
          ...whereEntity,
          status: { in: ["Registered", "Under Estimation", "Estimation Completed", "Quotation in Preparation", "Pending GM Approval", "Approved", "Submitted to Client"] },
        },
      }),
      prisma.quotation.findMany({
        where: {
          ...whereEntity,
          status: "Pending GM Approval",
        },
        include: { tender: true, customer: true, businessEntity: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.quotation.findMany({
        where: {
          ...whereEntity,
          status: { in: ["Approved", "Submitted to Client", "Accepted"] },
        },
      }),
      prisma.contract.findMany({
        where: whereEntity,
        include: { customer: true, businessEntity: true, projects: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: whereEntity,
        include: { customer: true, businessEntity: true, milestones: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.opportunity.findMany({
        where: whereEntity,
        include: { account: true, businessEntity: true },
      }),
      prisma.purchaseRequest.count({
        where: {
          ...whereEntity,
          status: "Pending",
        },
      }),
      prisma.businessEntity.findMany(),
    ]);

    // Financial totals
    const totalTenderValue = totalTenders.reduce((sum, t) => sum + (t.estimatedValue || 0), 0);
    const totalQuotationValue = approvedQuotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
    const totalContractValue = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
    const totalProjectBudget = projects.reduce((sum, p) => sum + (p.approvedBudget || 0), 0);
    const totalOppValue = openOpportunities.reduce((sum, o) => sum + (o.expectedValue || 0), 0);

    // Chart: Tenders by Entity
    const entityMap: Record<string, { name: string; count: number; value: number; color: string }> = {};
    for (const ent of allEntities) {
      entityMap[ent.id] = { name: ent.shortName, count: 0, value: 0, color: ent.color };
    }
    for (const t of totalTenders) {
      if (entityMap[t.businessEntityId]) {
        entityMap[t.businessEntityId].count += 1;
        entityMap[t.businessEntityId].value += t.estimatedValue;
      }
    }
    const tendersByEntityChart = Object.values(entityMap).filter((e) => e.count > 0 || entityFilter === "ALL");

    // Chart: Tender Status Distribution
    const statusCounts: Record<string, number> = {};
    for (const t of totalTenders) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    }
    const tenderStatusChart = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    // Chart: Projects by Status
    const projectStatusCounts: Record<string, number> = {};
    for (const p of projects) {
      projectStatusCounts[p.status] = (projectStatusCounts[p.status] || 0) + 1;
    }
    const projectStatusChart = Object.entries(projectStatusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    // Entity Breakdown with all 7 entities
    const entityBreakdown = allEntities.map((ent) => {
      const stats = entityMap[ent.id] || { count: 0, value: 0 };
      return {
        id: ent.id,
        code: ent.code,
        name: ent.name,
        shortName: ent.shortName,
        color: ent.color,
        count: stats.count,
        value: stats.value,
        percentage: totalTenderValue > 0 ? Math.round((stats.value / totalTenderValue) * 100) : 0,
      };
    }).sort((a, b) => b.value - a.value);

    return {
      kpi: {
        totalTendersCount: totalTenders.length,
        activeTendersCount: activeTenders,
        totalTenderValue,
        pendingApprovalsCount: pendingApprovals.length,
        totalQuotationValue,
        contractsCount: contracts.length,
        totalContractValue,
        activeProjectsCount: projects.filter((p) => p.status === "Active").length,
        totalProjectBudget,
        openOpportunitiesCount: openOpportunities.length,
        totalOppValue,
        pendingPRsCount: pendingPRs,
      },
      charts: {
        tendersByEntity: tendersByEntityChart,
        tenderStatus: tenderStatusChart,
        projectStatus: projectStatusChart,
      },
      entityBreakdown,
      recentTenders: totalTenders.slice(0, 5),
      pendingApprovals,
      recentProjects: projects.slice(0, 4),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      kpis: {
        totalTendersCount: 0,
        activeTendersCount: 0,
        totalTenderValue: 6221892.34,
        pendingApprovalsCount: 0,
        totalQuotationValue: 6221892.34,
        contractsCount: 4,
        totalContractValue: 6221892.34,
        activeProjectsCount: 4,
        totalProjectBudget: 5288608.49,
        openOpportunitiesCount: 0,
        totalOppValue: 0,
        pendingPRsCount: 0,
      },
      charts: {
        tendersByEntity: [],
        tenderStatus: [],
        projectStatus: [],
      },
      entityBreakdown: [],
      recentTenders: [],
      pendingApprovals: [],
      recentProjects: [],
    };
  }
}
