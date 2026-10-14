"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMilestoneProgress } from "@/actions/projectActions";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, Clock, Check, Loader2 } from "lucide-react";

export default function MilestoneManager({
  milestones,
  projectId,
}: {
  milestones: any[];
  projectId: string;
}) {
  const router = useRouter();
  const { showToast } = useApp();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdate = async (milestoneId: string, progress: number, status: string) => {
    setUpdatingId(milestoneId);
    const res = await updateMilestoneProgress(milestoneId, progress, status);
    setUpdatingId(null);

    if (res.success) {
      showToast("Milestone progress updated!", "success");
      router.refresh();
    } else {
      showToast(res.error || "Update failed", "error");
    }
  };

  return (
    <div className="space-y-3">
      {milestones.map((m, idx) => (
        <div
          key={m.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
              </div>
              {m.description && (
                <p className="text-xs text-slate-500 mt-0.5 ml-7">{m.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-7 sm:ml-0">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  m.status === "Completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : m.status === "In Progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {m.status}
              </span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {m.progressPercentage}%
              </span>
            </div>
          </div>

          {/* Progress Slider and Status Actions */}
          <div className="ml-7 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Progress:</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                defaultValue={m.progressPercentage}
                disabled={updatingId === m.id}
                onMouseUp={(e) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  const newStatus = val === 100 ? "Completed" : val > 0 ? "In Progress" : "Pending";
                  handleUpdate(m.id, val, newStatus);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {m.status !== "Completed" && (
                <button
                  type="button"
                  disabled={updatingId === m.id}
                  onClick={() => handleUpdate(m.id, 100, "Completed")}
                  className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <Check className="h-3 w-3" />
                  <span>Mark 100% Done</span>
                </button>
              )}
              {m.status === "Completed" && (
                <button
                  type="button"
                  disabled={updatingId === m.id}
                  onClick={() => handleUpdate(m.id, 50, "In Progress")}
                  className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
