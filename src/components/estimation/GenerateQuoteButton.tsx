"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuotationFromEstimation } from "@/actions/quotationActions";
import { useApp } from "@/context/AppContext";
import { FileCheck2, Loader2 } from "lucide-react";

export default function GenerateQuoteButton({
  estimationId,
  tenderId,
  fallbackData,
}: {
  estimationId: string;
  tenderId?: string;
  fallbackData?: any;
}) {
  const router = useRouter();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await createQuotationFromEstimation(estimationId, tenderId, fallbackData);
    setLoading(false);

    if (res.success && res.quotation) {
      showToast(`Quotation ${res.quotation.quotationNumber} generated successfully!`, "success");
      router.push(`/quotations/${res.quotation.id}`);
    } else {
      showToast(res.error || "Failed to generate quotation", "error");
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#015ba5] disabled:opacity-50 transition shadow-xs cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating Offer...</span>
        </>
      ) : (
        <>
          <FileCheck2 className="h-4 w-4" />
          <span>Generate Commercial Quotation →</span>
        </>
      )}
    </button>
  );
}
