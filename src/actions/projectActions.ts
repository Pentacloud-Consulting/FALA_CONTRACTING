"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureLatestDb, pushDbToMongo } from "@/lib/mongoSync";

export async function getProjects(entityCode?: string) {
  try {
    await ensureLatestDb();
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }
    return await prisma.project.findMany({
      where,
      include: {
        customer: true,
        businessEntity: true,
        contract: true,
        milestones: true,
        purchaseRequests: true,
        purchaseOrders: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }
}

export async function getProjectById(id: string) {
  try {
    await ensureLatestDb();
    return await prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        businessEntity: true,
        contract: {
          include: {
            quotation: true,
            tender: true,
          },
        },
        milestones: {
          orderBy: { plannedStart: "asc" },
        },
        purchaseRequests: {
          include: { lineItems: true },
          orderBy: { createdAt: "desc" },
        },
        purchaseOrders: {
          include: { supplier: true, lineItems: true, goodsReceipts: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw new Error("Failed to fetch project details");
  }
}

export async function updateMilestoneProgress(
  milestoneId: string,
  progressPercentage: number,
  status: string
) {
  try {
    await ensureLatestDb();
    const updated = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        progressPercentage: Number(progressPercentage),
        status,
        actualFinish: status === "Completed" ? new Date() : null,
      },
      include: { project: { include: { milestones: true } } },
    });

    // Recalculate overall project progress average
    const milestones = updated.project.milestones;
    const avgProgress = Math.round(
      milestones.reduce((sum, m) => sum + m.progressPercentage, 0) / milestones.length
    );

    await prisma.project.update({
      where: { id: updated.projectId },
      data: {
        progress: avgProgress,
        status: avgProgress === 100 ? "Completed" : "Active",
      },
    });

    revalidatePath(`/projects/${updated.projectId}`);
    revalidatePath("/projects");
    revalidatePath("/");
    await pushDbToMongo();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addProjectMilestone({
  projectId,
  name,
  description,
  owner,
  plannedStart,
  plannedFinish,
}: {
  projectId: string;
  name: string;
  description?: string;
  owner: string;
  plannedStart: string;
  plannedFinish: string;
}) {
  try {
    await ensureLatestDb();
    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId,
        name,
        description: description || null,
        owner,
        plannedStart: new Date(plannedStart),
        plannedFinish: new Date(plannedFinish),
        status: "Pending",
        progressPercentage: 0,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    await pushDbToMongo();
    return { success: true, milestone };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
