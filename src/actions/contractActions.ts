"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getContracts(entityCode?: string) {
  try {
    const where: any = {};
    if (entityCode && entityCode !== "ALL") {
      where.businessEntity = { code: entityCode };
    }
    return await prisma.contract.findMany({
      where,
      include: {
        customer: true,
        businessEntity: true,
        tender: true,
        quotation: true,
        projects: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw new Error("Failed to fetch contracts");
  }
}

export async function getContractById(id: string) {
  try {
    return await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: { include: { contacts: true } },
        businessEntity: true,
        tender: true,
        quotation: { include: { lineItems: true } },
        projects: {
          include: {
            milestones: true,
            purchaseRequests: true,
            purchaseOrders: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw new Error("Failed to fetch contract details");
  }
}

export async function createProjectFromContract({
  contractId,
  projectName,
  projectManager,
  location,
  approvedBudget,
}: {
  contractId: string;
  projectName: string;
  projectManager: string;
  location: string;
  approvedBudget: number;
}) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { projects: true },
    });
    if (!contract) throw new Error("Contract not found");

    if (contract.projects && contract.projects.length > 0) {
      throw new Error(`A project (${contract.projects[0].projectNumber}) already exists for this contract.`);
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.project.count();
    const projectNumber = `PRJ-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    const project = await prisma.project.create({
      data: {
        projectNumber,
        name: projectName || `Project - ${contract.contractNumber}`,
        contractId: contract.id,
        customerId: contract.customerId,
        businessEntityId: contract.businessEntityId,
        projectManager: projectManager || "Sarah Jenkins, PMP",
        location: location || "Project Site, Dubai",
        contractValue: contract.contractValue,
        approvedBudget: Number(approvedBudget || contract.contractValue * 0.85),
        plannedStartDate: contract.startDate,
        plannedEndDate: contract.completionDate,
        status: "Active",
        progress: 10,
        scope: contract.agreedScope,
        milestones: {
          create: [
            {
              name: "Site Mobilization & Approvals",
              description: "Site setup, utility NOCs and initial engineering submittals.",
              owner: projectManager || "Project Manager",
              plannedStart: contract.startDate,
              plannedFinish: new Date(new Date(contract.startDate).getTime() + 14 * 24 * 60 * 60 * 1000),
              status: "In Progress",
              progressPercentage: 40,
            },
            {
              name: "Civil Works & Structural Execution",
              description: "Main contracted civil and infrastructure works.",
              owner: projectManager || "Project Manager",
              plannedStart: new Date(new Date(contract.startDate).getTime() + 15 * 24 * 60 * 60 * 1000),
              plannedFinish: new Date(new Date(contract.completionDate).getTime() - 20 * 24 * 60 * 60 * 1000),
              status: "Pending",
              progressPercentage: 0,
            },
            {
              name: "Final Inspection, As-Builts & Handover",
              description: "Final client testing, snags rectification, and completion certificate.",
              owner: projectManager || "Project Manager",
              plannedStart: new Date(new Date(contract.completionDate).getTime() - 19 * 24 * 60 * 60 * 1000),
              plannedFinish: contract.completionDate,
              status: "Pending",
              progressPercentage: 0,
            },
          ],
        },
      },
    });

    revalidatePath(`/contracts/${contractId}`);
    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true, project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
