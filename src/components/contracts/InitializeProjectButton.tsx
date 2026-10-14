"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectFromContract } from "@/actions/contractActions";
import { useApp } from "@/context/AppContext";
import { FolderKanban, Loader2 } from "lucide-react";

export default function InitializeProjectButton({
  contractId,
  defaultProjectName,
  defaultBudget,
}: {
  contractId: string;
  defaultProjectName: string;
  defaultBudget: number;
}) {
  const router = useRouter();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);

  const handleInit = async () => {
    setLoading(true);
    const res = await createProjectFromContract({
      contractId,
      projectName: defaultProjectName,
      projectManager: "Sarah Jenkins, PMP",
      location: "Project Site, Dubai",
      approvedBudget: defaultBudget,
    });
    setLoading(false);

    if (res.success && res.project) {
      showToast(`Project ${res.project.projectNumber} initialized successfully!`, "success");
      router.push(`/projects/${res.project.id}`);
    } else {
      showToast(res.error || "Failed to initialize project", "error");
    }
  };

  return (
    <button
      onClick={handleInit}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-600/20"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initializing Project...</span>
        </>
      ) : (
        <>
          <FolderKanban className="h-4 w-4" />
          <span>Initialize Delivery Project →</span>
        </>
      )}
    </button>
  );
}
