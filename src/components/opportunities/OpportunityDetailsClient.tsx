"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { OPPORTUNITY_STAGES, OpportunityStage } from "@/lib/types";
import {
  updateOpportunityStage,
  initiateTenderFromOpportunity,
  updateOpportunityDynamicFields,
  updateOpportunityProfile,
} from "@/actions/opportunityActions";
import {
  submitQuotationForGMApproval,
  gmDecideQuotation,
  submitQuotationToClient,
  recordClientDecision,
  convertQuotationToContract,
  createQuotationFromEstimation,
  createQuotationRevisionWithDiscount,
} from "@/actions/quotationActions";
import { formatAED, round2 } from "@/lib/calculations";
import { DEMO_USERS } from "@/lib/types";
import DynamicEntityFields from "@/components/crm/DynamicEntityFields";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Send,
  FileCheck2,
  FileSpreadsheet,
  FileSignature,
  FileText,
  Calculator,
  Lock,
  AlertCircle,
  XCircle,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  UserCheck,
  Save,
  Pencil,
  ChevronDown,
  Plus,
  User,
  Briefcase,
  Tag,
  Layers,
  Percent,
} from "lucide-react";

interface OpportunityDetailsClientProps {
  opp: any;
}

export default function OpportunityDetailsClient({ opp }: OpportunityDetailsClientProps) {
  const router = useRouter();
  const { showToast, currentUser, setCurrentUser } = useApp();

  const [loadingAction, setLoadingAction] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [comments, setComments] = useState("");

  // Quotation Revision with Discount State
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountVal, setDiscountVal] = useState<number>(5);
  const [discountComments, setDiscountComments] = useState("Client requested 5% additional commercial discount");
  const [selectedBaseQuoteId, setSelectedBaseQuoteId] = useState<string>("");
  const [creatingRevision, setCreatingRevision] = useState(false);

  let initialDynamicValues: Record<string, any> = {};
  if (opp.specificFieldsJson) {
    try {
      initialDynamicValues =
        typeof opp.specificFieldsJson === "string"
          ? JSON.parse(opp.specificFieldsJson)
          : opp.specificFieldsJson;
    } catch {
      initialDynamicValues = {};
    }
  }

  const [dynamicSpecs, setDynamicSpecs] = useState<Record<string, any>>(initialDynamicValues);
  const [savingSpecs, setSavingSpecs] = useState(false);
  const [specsSaved, setSpecsSaved] = useState(false);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);

  const handleStartEditSpecs = () => {
    setIsEditingSpecs(true);
  };

  const handleCancelEditSpecs = () => {
    setDynamicSpecs(initialDynamicValues);
    setIsEditingSpecs(false);
  };

  const handleDynamicChange = (key: string, value: any) => {
    setDynamicSpecs((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSpecsSaved(false);
  };

  const handleSaveSpecs = async () => {
    setSavingSpecs(true);
    const res = await updateOpportunityDynamicFields(opp.id, JSON.stringify(dynamicSpecs));
    setSavingSpecs(false);
    if (res.success) {
      setSpecsSaved(true);
      setIsEditingSpecs(false);
      showToast("Technical specifications saved to Opportunity!", "success");
      setTimeout(() => setSpecsSaved(false), 3000);
      router.refresh();
    } else {
      showToast(res.error || "Failed to save technical specifications", "error");
    }
  };

  // Section 1: Prospective Client & Contact Details State
  const [companyName, setCompanyName] = useState(
    opp.account?.name || opp.lead?.company || opp.name || ""
  );
  const [contactPerson, setContactPerson] = useState(
    opp.contact?.name || opp.lead?.name || opp.account?.primaryContact || ""
  );
  const [contactEmail, setContactEmail] = useState(
    opp.contact?.email || opp.lead?.email || opp.account?.email || ""
  );
  const [contactPhone, setContactPhone] = useState(
    opp.contact?.phone || opp.lead?.phone || opp.account?.phone || ""
  );
  const [contactJobTitle, setContactJobTitle] = useState(
    opp.contact?.designation || opp.lead?.jobTitle || "Procurement Director"
  );
  const [leadSource, setLeadSource] = useState(
    opp.lead?.source || "Direct"
  );

  // Section 2: Commercial Parameters & Project Scope State
  let initialStartDate = "";
  if (initialDynamicValues?.startDate) {
    initialStartDate = initialDynamicValues.startDate;
  } else if (opp.lead?.specificFieldsJson) {
    try {
      const parsedLeadSpecs = JSON.parse(opp.lead.specificFieldsJson);
      if (parsedLeadSpecs?.startDate) initialStartDate = parsedLeadSpecs.startDate;
    } catch {}
  }
  const [startDate, setStartDate] = useState(initialStartDate);

  let initialEndDate = "";
  if (opp.expectedCloseDate) {
    try {
      initialEndDate = new Date(opp.expectedCloseDate).toISOString().split("T")[0];
    } catch {}
  } else if (initialDynamicValues?.endDate) {
    initialEndDate = initialDynamicValues.endDate;
  }
  const [endDate, setEndDate] = useState(initialEndDate);

  const [oppLocation, setOppLocation] = useState(opp.location || opp.account?.city || "Dubai, UAE");
  const [scopeOverview, setScopeOverview] = useState(
    opp.scopeOfWork || opp.lead?.requirement || "Commercial Scope defined during lead qualification."
  );

  const [savingCommercialProfile, setSavingCommercialProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Salesforce Inline Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);
  const [specsSectionOpen, setSpecsSectionOpen] = useState(true);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCompanyName(opp.account?.name || opp.lead?.company || opp.name || "");
    setContactPerson(opp.contact?.name || opp.lead?.name || opp.account?.primaryContact || "");
    setContactEmail(opp.contact?.email || opp.lead?.email || opp.account?.email || "");
    setContactPhone(opp.contact?.phone || opp.lead?.phone || opp.account?.phone || "");
    setContactJobTitle(opp.contact?.designation || opp.lead?.jobTitle || "Procurement Director");
    setLeadSource(opp.lead?.source || "Direct");
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setOppLocation(opp.location || opp.account?.city || "Dubai, UAE");
    setScopeOverview(opp.scopeOfWork || opp.lead?.requirement || "Commercial Scope defined during lead qualification.");
    setIsEditing(false);
  };

  const handleSaveCommercialProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingCommercialProfile(true);
    const res = await updateOpportunityProfile(opp.id, {
      companyName,
      contactPerson,
      contactEmail,
      contactPhone,
      contactJobTitle,
      leadSource,
      startDate,
      endDate,
      location: oppLocation,
      scopeOfWork: scopeOverview,
    });
    setSavingCommercialProfile(false);
    if (res.success) {
      setProfileSaved(true);
      setIsEditing(false);
      showToast("Opportunity details updated successfully!", "success");
      setTimeout(() => setProfileSaved(false), 3000);
      router.refresh();
    } else {
      showToast(res.error || "Failed to update details", "error");
    }
  };

  // Linked Assets
  const tender = opp.tender;
  const latestEstimation =
    tender?.estimations && tender.estimations.length > 0
      ? tender.estimations[0]
      : null;
  const latestQuotation =
    opp.quotations && opp.quotations.length > 0
      ? opp.quotations[0]
      : tender?.quotations && tender.quotations.length > 0
      ? tender.quotations[0]
      : null;

  const latestContract =
    opp.contracts && opp.contracts.length > 0
      ? opp.contracts[0]
      : tender?.contracts && tender.contracts.length > 0
      ? tender.contracts[0]
      : null;

  // Aggregate all estimations & quotations (de-duped by id)
  const allEstimations: any[] = [];
  const estIds = new Set<string>();
  for (const e of (tender?.estimations || [])) {
    if (!estIds.has(e.id)) { estIds.add(e.id); allEstimations.push(e); }
  }

  const allQuotations: any[] = [];
  const qtIds = new Set<string>();
  for (const q of (opp.quotations || [])) {
    if (!qtIds.has(q.id)) { qtIds.add(q.id); allQuotations.push(q); }
  }
  for (const q of (tender?.quotations || [])) {
    if (!qtIds.has(q.id)) { qtIds.add(q.id); allQuotations.push(q); }
  }
  allQuotations.sort((a: any, b: any) => (a.version || 1) - (b.version || 1));

  const [relEstOpen, setRelEstOpen] = useState(true);
  const [relQtOpen, setRelQtOpen] = useState(true);

  const currentStage = opp.status as OpportunityStage;
  const currentStageIndex = OPPORTUNITY_STAGES.indexOf(currentStage);

  const isGM = currentUser?.role === "GM";

  // Switch demo actor between GM and Preparer
  const toggleDemoRole = () => {
    if (isGM) {
      setCurrentUser(DEMO_USERS[0]); // Eng. Tariq Al-Nuaimi (PREPARER)
      showToast("Demo actor switched to: Preparer (Senior Tendering Engineer)", "info");
    } else {
      setCurrentUser(DEMO_USERS[1]); // H.E. Saeed Fala Al-Falasi (GM)
      showToast("Demo actor switched to: General Manager (GM - Authorized Approver)", "success");
    }
  };

  // 1. INITIATE TENDER & ESTIMATION
  const handleInitiateTender = async () => {
    setLoadingAction(true);
    const res = await initiateTenderFromOpportunity(opp.id);
    setLoadingAction(false);

    if (res.success) {
      showToast(
        res.alreadyExisted
          ? "Tender already exists for this deal. Navigating..."
          : "Tender initiated! Technical specifications transferred.",
        "success"
      );
      router.refresh();
    } else {
      showToast(res.error || "Failed to initiate tender", "error");
    }
  };

  // 1b. GENERATE QUOTATION FROM ESTIMATION & ADVANCE TO STAGE 3
  const handleCreateQuotation = async () => {
    if (!tender) return;
    setLoadingAction(true);
    const estId = tender.estimations?.[0]?.id || tender.id;
    const res = await createQuotationFromEstimation(estId, tender.id);
    setLoadingAction(false);

    if (res.success) {
      showToast(
        "Commercial Quotation generated! Opportunity advanced to Stage 3: Quotation Preparation.",
        "success"
      );
      router.refresh();
    } else {
      showToast(res.error || "Failed to generate quotation", "error");
    }
  };

  // Re-open opportunity if lost
  const handleReopen = async () => {
    setLoadingAction(true);
    const res = await updateOpportunityStage(opp.id, "Qualification");
    setLoadingAction(false);
    if (res.success) {
      showToast("Opportunity re-opened to Qualification stage.", "info");
      router.refresh();
    } else {
      showToast(res.error || "Failed to re-open opportunity", "error");
    }
  };

  // 2. SUBMIT QUOTATION FOR GM APPROVAL
  const handleSubmitForGM = async () => {
    if (!latestQuotation) return;
    setLoadingAction(true);
    const res = await submitQuotationForGMApproval(
      latestQuotation.id,
      currentUser?.name || "Tendering Engineer"
    );
    setLoadingAction(false);

    if (res.success) {
      showToast("Quotation submitted for mandatory GM approval!", "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed to submit for GM approval", "error");
    }
  };

  // 3. SERVER-ENFORCED GM APPROVAL / DECISION
  const handleGMDecision = async (decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => {
    if (!latestQuotation) return;
    if (!isGM) {
      showToast("Access Denied: Only General Manager (GM) profile has permission to approve or decide quotations.", "error");
      return;
    }
    setLoadingAction(true);
    const res = await gmDecideQuotation({
      quotationId: latestQuotation.id,
      actorRole: currentUser?.role || "PREPARER", // Strict server check
      actorName: currentUser?.name || "User",
      decision,
      reason: comments || (decision === "APPROVE" ? "Approved for client submission." : "Revision needed."),
    });
    setLoadingAction(false);

    if (res.success) {
      showToast(`Quotation ${decision === "APPROVE" ? "Approved" : "Returned"} by GM!`, "success");
      setShowRejectModal(false);
      setShowRevisionModal(false);
      setComments("");
      router.refresh();
    } else {
      showToast(res.error || "Access Denied: Only GM can approve.", "error");
    }
  };

  // 4. SUBMIT TO CLIENT (Transitions stage to "Submitted to Client")
  const handleSubmitToClient = async () => {
    if (!latestQuotation) return;
    setLoadingAction(true);
    const res = await submitQuotationToClient(latestQuotation.id, "Client Tender Portal & Email");
    setLoadingAction(false);

    if (res.success) {
      showToast("Quotation submitted to Client! Opportunity stage: Submitted to Client.", "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed to submit to client", "error");
    }
  };

  // 5. RECORD CLIENT DECISION
  const handleClientDecision = async (decision: "Accepted" | "Rejected" | "Revision Requested") => {
    if (!latestQuotation) return;
    setLoadingAction(true);
    const res = await recordClientDecision({
      quotationId: latestQuotation.id,
      decision,
      comments: comments || undefined,
      clientPoNumber: decision === "Accepted" ? `PO-CLIENT-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    });
    setLoadingAction(false);

    if (res.success) {
      showToast(
        decision === "Accepted"
          ? "Client ACCEPTED! Opportunity advanced to Closed Won."
          : decision === "Revision Requested"
          ? "Revision requested! Version snapshot preserved."
          : "Client Rejected. Opportunity moved to Closed Lost.",
        decision === "Accepted" ? "success" : "info"
      );
      setShowRevisionModal(false);
      setShowRejectModal(false);
      setComments("");
      router.refresh();
    } else {
      showToast(res.error || "Failed to record client decision", "error");
    }
  };

  // 6. CONVERT ACCEPTED QUOTATION TO CONTRACT
  const handleAwardContract = async () => {
    if (!latestQuotation) return;
    setLoadingAction(true);
    const startDate = new Date().toISOString();
    const completionDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

    const res = await convertQuotationToContract({
      quotationId: latestQuotation.id,
      startDate,
      completionDate,
      agreedScope: opp.scopeOfWork || "Agreed scope per approved quotation.",
    });
    setLoadingAction(false);

    if (res.success) {
      showToast(`Contract generated: ${res.contract?.contractNumber}! Deal Won.`, "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed to create contract", "error");
    }
  };

  // 7. CREATE NEW QUOTATION VERSION WITH DISCOUNT
  const handleCreateDiscountRevision = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const baseId = selectedBaseQuoteId || latestQuotation?.id || (allQuotations.length > 0 ? allQuotations[allQuotations.length - 1].id : undefined);
    if (!baseId) {
      showToast("No active quotation available to revise.", "error");
      return;
    }
    setCreatingRevision(true);
    const res = await createQuotationRevisionWithDiscount({
      baseQuotationId: baseId,
      discountType,
      discountValue: Number(discountVal),
      comments: discountComments,
      requesterName: currentUser?.name || "Tendering Engineer",
    });
    setCreatingRevision(false);

    if (res.success) {
      showToast(
        `Quotation ${res.quotation?.quotationNumber} (Version ${res.quotation?.version}) created with discount! Opportunity updated.`,
        "success"
      );
      setShowDiscountModal(false);
      router.refresh();
    } else {
      showToast(res.error || "Failed to create quotation revision", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/opportunities"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {opp.oppNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {opp.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Account: <strong>{opp.account?.name}</strong> • Division:{" "}
              <strong>{opp.businessEntity?.shortName}</strong> • Close Target:{" "}
              {new Date(opp.expectedCloseDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Demo Role Switcher Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Simulation Role
            </div>
            <div className="text-xs font-bold text-slate-800">
              {currentUser?.name || "Tariq"} ({currentUser?.role})
            </div>
          </div>
          <button
            type="button"
            onClick={toggleDemoRole}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              isGM
                ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Switch to {isGM ? "Engineer Role" : "GM Role"}</span>
          </button>
        </div>
      </div>

      {/* 8-STAGE VISUAL PIPELINE STEPPER (MUST SHOW ALL 8 INCLUDING CLOSED WON AND CLOSED LOST) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Commercial Opportunity Pipeline (All 8 Stages)
          </span>
          <span className="text-xs font-semibold text-slate-800">
            Active Stage:{" "}
            <strong className="text-white px-2.5 py-0.5 rounded bg-[#0176d3] font-bold shadow-2xs">
              {opp.status}
            </strong>
          </span>
        </div>

        {/* 8 Stages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {OPPORTUNITY_STAGES.map((stage, idx) => {
            const isStageActive = opp.status === stage;
            const isLost = opp.status === "Closed Lost";
            const isWon = opp.status === "Closed Won";

            // Determine if past stage
            let isPast = false;
            if (!isLost && !isWon) {
              isPast = currentStageIndex > idx;
            } else if (isWon) {
              isPast = idx < 6; // Won is stage index 6
            }

            // Styling for stage boxes
            let boxClass = "bg-slate-100/90 border-slate-300 hover:bg-slate-200/80 hover:border-slate-400";
            let textClass = "text-slate-900 font-bold";

            if (isStageActive) {
              boxClass = "bg-[#0176d3] border-[#015ba5] text-white shadow-md ring-2 ring-blue-500/25";
              textClass = "text-white font-extrabold";
            } else if (isPast) {
              boxClass = "bg-blue-50/90 border-blue-300 shadow-2xs";
              textClass = "text-slate-900 font-bold";
            }

            return (
              <div
                key={stage}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col justify-between min-h-[76px] shadow-2xs ${boxClass}`}
              >
                <div className="flex items-center justify-center gap-1">
                  {isStageActive ? (
                    <span className="w-5 h-5 rounded-full bg-white text-[#0176d3] text-[11px] font-black flex items-center justify-center shadow-2xs">
                      {idx + 1}
                    </span>
                  ) : isPast ? (
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0176d3] text-[11px] font-bold flex items-center justify-center border border-blue-300">
                      <Check className="w-3.5 h-3.5 text-[#0176d3] stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center justify-center border border-slate-300 shadow-2xs">
                      {idx + 1}
                    </span>
                  )}
                </div>
                <div className={`text-xs leading-tight mt-1.5 ${textClass}`}>
                  {stage}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMMERCIAL LIFECYCLE ACTION BANNER */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Commercial Workflow & Step-by-Step Governance</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-300">
                Active Step: {currentStage}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Guided progression: Qualification ➔ Tender / Estimation ➔ Quotation Preparation ➔ GM Approval ➔ Client Response ➔ Contract
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-800">
            Expected Value: {formatAED(opp.expectedValue)}
          </span>
        </div>

        {/* GUIDED ACTIVE STEP CONTROLLER */}
        {/* Step 1: Qualification */}
        {currentStage === "Qualification" && !tender && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                  Step 1
                </span>
                <span className="font-bold text-blue-900 text-sm">
                  Qualification Complete — Ready for Tender Initiation
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Initiate the commercial tender and transfer technical specifications to BOQ cost engineering.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInitiateTender}
              disabled={loadingAction}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Initiate Tender & Cost Estimation →</span>
            </button>
          </div>
        )}

        {/* Step 2: Tender / Estimation */}
        {currentStage === "Tender / Estimation" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0176d3] text-white">
                    Step 2
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {latestEstimation && latestEstimation.finalPrice > 0
                      ? "BOQ Cost Estimation Finalized!"
                      : "Cost Estimation & BOQ Pricing In Progress"}
                  </span>
                  {latestEstimation && latestEstimation.finalPrice > 0 && (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      ✓ Ready for Quotation
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {latestEstimation && latestEstimation.finalPrice > 0
                    ? `Calculated Final Price: ${formatAED(latestEstimation.finalPrice)} (Target Margin: ${latestEstimation.targetMargin || 15}%). Ready to generate official commercial proposal.`
                    : `Tender ${tender?.tenderNumber || ""} created. Open the Cost Estimation workspace to calculate BOQ direct costs and markups.`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Link
                  href={
                    latestEstimation
                      ? `/estimation/${latestEstimation.id}`
                      : tender
                      ? `/tenders/${tender.id}`
                      : "/estimation"
                  }
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open Estimation Workspace</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>

                {latestEstimation && latestEstimation.finalPrice > 0 && (
                  <button
                    type="button"
                    onClick={handleCreateQuotation}
                    disabled={loadingAction}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Generate Quotation & Advance to Stage 3</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Quotation Preparation */}
        {currentStage === "Quotation Preparation" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                    Step 3
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {latestQuotation
                      ? `Commercial Quotation: ${latestQuotation.quotationNumber} (${latestQuotation.status})`
                      : "Quotation Generation Required"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {latestQuotation
                    ? `Proposal Total: ${formatAED(latestQuotation.totalAmount)}. Review payment milestones and terms in the Quotation workspace, or submit directly for GM Approval.`
                    : "Finalize quotation proposal terms before requesting GM approval."}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {latestQuotation ? (
                  <>
                    <Link
                      href={`/quotations/${latestQuotation.id}`}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Review in Quotation Workspace</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleSubmitForGM}
                      disabled={loadingAction}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Submit for GM Approval (Stage 4)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateQuotation}
                    disabled={loadingAction}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Generate Quotation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: GM Approval */}
        {currentStage === "GM Approval" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                  Step 4
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#0176d3]" />
                  <span>Mandatory GM Governance Approval Gate</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  Quotation Status: {latestQuotation?.status || "Pending GM Approval"}
                </span>
                <button
                  type="button"
                  onClick={toggleDemoRole}
                  className="text-[11px] px-2 py-0.5 rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 transition cursor-pointer font-medium"
                >
                  Actor: {currentUser?.name} ({currentUser?.role}) ⇄
                </button>
              </div>
            </div>

            {latestQuotation?.status === "Approved" ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#0176d3]" />
                    <span>GM Approval Secured! Official Offer Authorized</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Quotation {latestQuotation.quotationNumber} ({formatAED(latestQuotation.totalAmount)}) is signed off. Dispatch offer to client to advance to Stage 5.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/quotations/${latestQuotation.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Quotation</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleSubmitToClient}
                    disabled={loadingAction}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Client (Advance to Stage 5)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : isGM ? (
              /* GM PROFILE ACTIVE: Full authority to Approve / Request Changes / Reject */
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                  <div className="flex items-center gap-2 text-blue-950 font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#0176d3] shrink-0" />
                    <span>Executive Authority Active: {currentUser?.name} (General Manager)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    Sign-off Authorized
                  </span>
                </div>

                <p className="text-slate-700 text-xs">
                  Reviewing commercial offer for <strong>{opp.name}</strong> ({formatAED(latestQuotation?.totalAmount || opp.expectedValue)}).
                  You are authorized to execute GM sign-off for client submission.
                </p>

                <div className="flex items-center justify-end gap-2 flex-wrap">
                  {latestQuotation && (
                    <Link
                      href={`/quotations/${latestQuotation.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition flex items-center gap-1 mr-auto cursor-pointer"
                    >
                      <span>Review Quotation Details</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={loadingAction}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                  >
                    Reject Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRevisionModal(true)}
                    disabled={loadingAction}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGMDecision("APPROVE")}
                    disabled={loadingAction}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve Quotation (GM Sign-off)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL PROFILE ACTIVE (PREPARER / ENGINEER): Strict Read-Only Lock */
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-200 text-slate-700 shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>GM Authorization Required — Action Locked</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                          Current: {currentUser?.role || "Normal Profile"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Only users with the <strong>General Manager (GM)</strong> profile have permission to approve, request changes, or reject this quotation. Normal profiles cannot sign off.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDemoRole}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0176d3]" />
                    <span>Switch to GM Profile to Sign Off</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                  {latestQuotation && (
                    <Link
                      href={`/quotations/${latestQuotation.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review Quotation Details</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Approval locked (GM profile required)</span>
                    </span>
                    <button
                      type="button"
                      disabled
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed flex items-center gap-1.5 opacity-60"
                      title="Only General Manager (GM) profile has permission to sign off"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Approve Quotation (GM Sign-off)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Submitted to Client */}
        {currentStage === "Submitted to Client" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                  Step 5
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#0176d3]" />
                  <span>Quotation Submitted to Client — Awaiting Official Decision</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  Quotation: {latestQuotation?.quotationNumber || "Sent"} {latestQuotation?.version ? `(V${latestQuotation.version})` : ""}
                </span>
                {(latestQuotation?.discount || 0) > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Discount Applied: -{formatAED(latestQuotation.discount)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-slate-600 text-xs">
              Offer delivered to employer. If the client requests commercial discount or negotiation terms, click <strong className="text-slate-900">Client Requested Negotiation / Discount (Create V2)</strong> to open the revision form, enter the requested discount, and generate Quotation V2.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
              {latestQuotation && (
                <Link
                  href={`/quotations/${latestQuotation.id}`}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition flex items-center gap-1 mr-auto cursor-pointer"
                >
                  <span>View Quotation</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={loadingAction}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
              >
                Client Rejected (Closed Lost)
              </button>

              {/* REQUEST NEGOTIATION / DISCOUNT: OPENS V2 CREATE FORM! */}
              <button
                type="button"
                onClick={() => {
                  setSelectedBaseQuoteId(latestQuotation?.id || allQuotations[allQuotations.length - 1]?.id || allQuotations[0]?.id || "");
                  setDiscountType("PERCENT");
                  setDiscountVal(10);
                  setDiscountComments("Client requested 10% commercial discount on submitted proposal.");
                  setShowDiscountModal(true);
                }}
                disabled={loadingAction || !latestQuotation}
                className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>Client Requested Negotiation / Discount (Create V2)</span>
              </button>

              <button
                type="button"
                onClick={() => handleClientDecision("Accepted")}
                disabled={loadingAction}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Client Accepted Offer (Advance to Closed Won)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Negotiation / Revision */}
        {currentStage === "Negotiation / Revision" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                  Step 6
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#0176d3]" />
                  <span>Commercial Negotiation &amp; Proposal Revision</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  Active Revision: {latestQuotation?.quotationNumber} (V{latestQuotation?.version || 2})
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Total: {formatAED(latestQuotation?.totalAmount || opp.expectedValue)}
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-xs">
              {latestQuotation?.version && latestQuotation.version > 1 ? (
                <>
                  Revised Quotation <strong>{latestQuotation.quotationNumber}</strong> has been generated with client-negotiated discount
                  {latestQuotation.discount > 0 && ` (-${formatAED(latestQuotation.discount)})`}. Dispatch the revised offer to client for acceptance, or record client decision:
                </>
              ) : (
                <>
                  Client requested modifications to the proposal. Create a discounted revision (V2) or adjust scope in quotation workspace:
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
              {latestQuotation && (
                <Link
                  href={`/quotations/${latestQuotation.id}`}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5 mr-auto cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open {latestQuotation.quotationNumber} Workspace</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              )}

              {/* If no V2 created yet, offer button to open modal */}
              {(!latestQuotation || latestQuotation.version <= 1) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBaseQuoteId(latestQuotation?.id || allQuotations[0]?.id || "");
                    setDiscountType("PERCENT");
                    setDiscountVal(10);
                    setDiscountComments("Client requested 10% discount on quotation proposal.");
                    setShowDiscountModal(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Percent className="w-3.5 h-3.5 text-amber-600" />
                  <span>Create Quotation V2 (Apply Discount)</span>
                </button>
              )}

              {/* Action: Send Revised Quotation (V2) to Client */}
              {latestQuotation && (
                <button
                  type="button"
                  onClick={handleSubmitToClient}
                  disabled={loadingAction}
                  className="px-4 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#0176d3]" />
                  <span>Send Revised Quotation ({latestQuotation.quotationNumber}) to Client →</span>
                </button>
              )}

              {/* Action: Client Accepted Revised Offer */}
              <button
                type="button"
                onClick={() => handleClientDecision("Accepted")}
                disabled={loadingAction}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Client Accepted Revised Offer (Advance to Closed Won)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Closed Won */}
        {currentStage === "Closed Won" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                    Step 7
                  </span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0176d3]" />
                    <span>Commercial Deal WON!</span>
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-1">
                  {latestContract
                    ? `Contract Executed: ${latestContract.contractNumber} (${formatAED(latestContract.contractValue)}). Project mobilization authorized.`
                    : `Offer accepted by client. Ready to generate legally binding EPC Contract and proceed to operations.`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {latestContract ? (
                  <Link
                    href={`/contracts/${latestContract.id}`}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    <span>Open Contract Workspace ({latestContract.contractNumber})</span>
                    <ExternalLink className="w-3 h-3 text-blue-200" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleAwardContract}
                    disabled={loadingAction}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Generate Contract & Handover to Operations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Closed Lost */}
        {currentStage === "Closed Lost" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-600 text-white">
                  Step 8
                </span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span>Commercial Opportunity Closed Lost</span>
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-1">
                Opportunity was declined by client or rejected during commercial evaluation.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReopen}
              disabled={loadingAction}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-open to Qualification ↺</span>
            </button>
          </div>
        )}

        {/* 4 COMMERCIAL LIFECYCLE SUMMARY CARDS (UNIFIED SALESFORCE BLUE) */}
        {tender && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t border-slate-100">
            {/* 1. Tender Management */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#0176d3]" />
                  <span>Tender Management</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {tender.tenderNumber}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {tender.title}
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">Status: {tender.status}</span>
                <Link
                  href={`/tenders/${tender.id}`}
                  className="text-[#0176d3] hover:underline flex items-center gap-0.5 text-[11px] font-bold"
                >
                  <span>Open Tender</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 2. Cost Estimation */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#0176d3]" />
                  <span>Cost Estimation</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {tender.estimations?.length || 0} BOQ
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {latestEstimation
                  ? `Final: ${formatAED(latestEstimation.finalPrice)}`
                  : "BOQ in progress"}
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">
                  Margin: {latestEstimation?.targetMargin ? `${latestEstimation.targetMargin}%` : "15%"}
                </span>
                <Link
                  href={
                    latestEstimation
                      ? `/estimation/${latestEstimation.id}`
                      : `/tenders/${tender.id}`
                  }
                  className="text-[#0176d3] hover:underline flex items-center gap-0.5 text-[11px] font-bold"
                >
                  <span>Open Estimation</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 3. Quotations & Offers */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#0176d3]" />
                  <span>Quotations &amp; Offers</span>
                </span>
                {latestQuotation ? (
                  <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {latestQuotation.quotationNumber}
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded text-slate-400 bg-slate-50 border border-slate-200">Pending</span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {latestQuotation
                  ? `${formatAED(latestQuotation.totalAmount)}`
                  : "Requires BOQ estimation"}
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">
                  {latestQuotation ? `Status: ${latestQuotation.status}` : "Stage 3"}
                </span>
                {latestQuotation ? (
                  <Link
                    href={`/quotations/${latestQuotation.id}`}
                    className="text-[#0176d3] hover:underline flex items-center gap-0.5 text-[11px] font-bold"
                  >
                    <span>Open Quotation</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateQuotation}
                    disabled={loadingAction || !latestEstimation}
                    className="text-[#0176d3] hover:underline flex items-center gap-0.5 text-[11px] font-bold cursor-pointer disabled:opacity-40"
                  >
                    <span>Generate →</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4. GM Approvals */}
            <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#0176d3]" />
                  <span>GM Approvals</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {latestQuotation?.status === "Approved"
                    ? "Authorized"
                    : latestQuotation?.status === "Pending GM Approval"
                    ? "Pending Sign-off"
                    : "Gate"}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {latestQuotation?.status === "Approved"
                  ? "GM Sign-off Secured"
                  : latestQuotation?.status === "Pending GM Approval"
                  ? "Awaiting Executive Sign-off"
                  : "Mandatory Executive Sign-off"}
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">
                  {isGM ? "Role: GM (Active)" : "Sign-off Required"}
                </span>
                <Link
                  href={latestQuotation ? `/quotations/${latestQuotation.id}` : "/approvals"}
                  className="text-[#0176d3] hover:underline flex items-center gap-0.5 text-[11px] font-bold"
                >
                  <span>Open GM Approvals</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. OPPORTUNITY INFORMATION CONTAINER (EXACT MATCH TO 2ND DESIGN) */}
      <form
        onSubmit={handleSaveCommercialProfile}
        className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden"
      >
        {/* Collapsible Section Header (exact match to Contact Information in 2nd Design) */}
        <div
          onClick={() => setSectionOpen(!sectionOpen)}
          className="bg-slate-100/75 hover:bg-slate-100/90 transition px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                sectionOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Opportunity Information
            </span>
            <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
              {opp.oppNumber}
            </span>
            {opp.account && (
              <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.2 rounded border border-slate-200">
                {opp.account.code}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Primary corporate client, commercial parameters, schedule dates, and project scope
          </span>
        </div>

        {sectionOpen && (
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
              {/* LEFT COLUMN: 7 BALANCED ROWS */}
              <div className="divide-y divide-slate-100">
                {/* 1. Opportunity ID */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Opportunity ID
                  </span>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {opp.oppNumber}
                    </span>
                    {opp.lead && (
                      <Link
                        href={`/leads/${opp.lead.id}`}
                        className="text-[10px] font-mono text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Lead #{opp.lead.id.slice(-6)}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* 2. Company / Organization Name */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Company Name</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Pentahouse"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs font-bold"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {companyName || "--"}
                          </span>
                          {opp.account && (
                            <Link
                              href={`/accounts/${opp.account.id}`}
                              className="font-mono text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 shrink-0 hover:bg-blue-100 transition"
                              title="Open Account Workspace"
                            >
                              {opp.account.code}
                            </Link>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Primary Contact Person */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Primary Contact</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Arshad"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs font-bold"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {contactPerson || "--"}
                          </span>
                          {opp.contact && (
                            <Link
                              href={`/contacts/${opp.contact.id}`}
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 shrink-0"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Designation / Role */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Designation / Role
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={contactJobTitle}
                        onChange={(e) => setContactJobTitle(e.target.value)}
                        placeholder="e.g. Procurement Director"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {contactJobTitle || "Procurement Director"}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 5. Operating Division */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Operating Division
                  </span>
                  <div className="w-7/12 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0176d3]" />
                      {opp.businessEntity?.name || "General"}
                    </span>
                  </div>
                </div>

                {/* 6. Target Project Start Date */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Target Start Date
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs text-slate-900 font-medium px-2 py-1 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-800">
                          {startDate || "Immediate / TBD"}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 7. Project Requirement / Scope */}
                <div className="flex items-start min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 pt-1">
                    Project Requirement / Scope
                  </label>
                  <div className="w-7/12 flex items-start justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={scopeOverview}
                        onChange={(e) => setScopeOverview(e.target.value)}
                        placeholder="Describe the operational scope, chainage, work requirements, or deliverables..."
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs resize-none"
                      />
                    ) : (
                      <>
                        <span className="text-xs text-slate-700 leading-relaxed py-0.5" title={scopeOverview}>
                          {scopeOverview || "--"}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 mt-0.5 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: 7 BALANCED ROWS */}
              <div className="divide-y divide-slate-100">
                {/* 1. Commercial Stage */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Commercial Stage
                  </span>
                  <div className="w-7/12 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                      {opp.status}
                    </span>
                  </div>
                </div>

                {/* 2. Phone / Mobile */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Phone / Mobile</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+971 4 284 4444"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs font-mono"
                      />
                    ) : (
                      <>
                        <span className="font-mono text-xs font-semibold text-slate-800 truncate">
                          {contactPhone || "--"}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Official Email */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0 flex items-center">
                    {isEditing && <span className="text-rose-500 font-bold mr-1">*</span>}
                    <span>Official Email</span>
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="arshad@penta.com"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-xs font-medium text-[#0176d3] hover:underline truncate"
                        >
                          {contactEmail || "--"}
                        </a>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Location / Emirate */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Location / Emirate
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={oppLocation}
                        onChange={(e) => setOppLocation(e.target.value)}
                        placeholder="Dubai, UAE"
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] focus:ring-1 focus:ring-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-800">
                          {oppLocation || "Dubai, UAE"}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 5. Acquisition Source */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Acquisition Source
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <select
                        value={leadSource}
                        onChange={(e) => setLeadSource(e.target.value)}
                        className="w-full text-xs text-slate-900 font-medium px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] shadow-2xs cursor-pointer"
                      >
                        <option value="Direct">Direct Client Inquiry</option>
                        <option value="RTA Portal">RTA / Gov Tender Portal</option>
                        <option value="Referral">Executive Referral</option>
                        <option value="Expo">Industry Expo / Exhibition</option>
                        <option value="Website">Digital Website Form</option>
                      </select>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-800">
                          {leadSource || "Direct Client Inquiry"}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 6. Target Close / Completion */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition group">
                  <label className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Target Close / Completion
                  </label>
                  <div className="w-7/12 flex items-center justify-between gap-1.5 min-w-0">
                    {isEditing ? (
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs text-slate-900 font-medium px-2 py-1 rounded border border-slate-300 bg-white focus:outline-hidden focus:border-[#0176d3] shadow-2xs"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-800">
                          {endDate || (opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : "TBD")}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                          title="Click to edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 7. Expected Commercial Value */}
                <div className="flex items-center min-h-[38px] px-4 py-1.5 hover:bg-slate-50/70 transition">
                  <span className="w-5/12 text-xs text-slate-500 font-medium shrink-0">
                    Expected Value
                  </span>
                  <div className="w-7/12">
                    <span className="font-mono text-xs font-black text-slate-900">
                      {opp.expectedValue ? formatAED(opp.expectedValue) : "AED 0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer inside Container (exact match to 2nd Design) */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/opportunities"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            <span>← Back to Opportunities</span>
          </Link>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Opportunity Details</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCommercialProfile}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingCommercialProfile ? "Saving..." : "Save"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* 4. SALESFORCE EDIT MODE STICKY BOTTOM DOCK (CANCEL / SAVE) */}
      {(isEditing || isEditingSpecs) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 shadow-2xl flex items-center justify-center gap-3 animate-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={() => {
              if (isEditing) handleCancelEdit();
              if (isEditingSpecs) handleCancelEditSpecs();
            }}
            className="px-5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100 shadow-2xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              if (isEditing) await handleSaveCommercialProfile();
              if (isEditingSpecs) await handleSaveSpecs();
            }}
            disabled={savingCommercialProfile || savingSpecs}
            className="px-6 py-1.5 text-xs font-semibold text-white bg-[#0176d3] hover:bg-[#014486] active:bg-[#00396b] rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {(savingCommercialProfile || savingSpecs) ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      )}

      {/* 5. DIVISION-SPECIFIC TECHNICAL SPECIFICATIONS (MATCHING IMAGE 2 EXACT DESIGN) */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        {/* Collapsible Section Header (exact match to Opportunity Information & Image 2) */}
        <div
          onClick={() => setSpecsSectionOpen(!specsSectionOpen)}
          className="bg-slate-100/75 hover:bg-slate-100/90 transition px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                specsSectionOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Division-Specific Technical Specifications
            </span>
            {opp.businessEntity && (
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                {opp.businessEntity.name || opp.businessEntity.shortName}
              </span>
            )}
            {opp.businessEntity?.code && (
              <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.2 rounded border border-slate-200">
                {opp.businessEntity.code}
              </span>
            )}
            <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
              Configured in OPP
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Configure technical parameters for {opp.businessEntity?.name || "this division"}. Automatically transfers to Tender and BOQ Cost Estimation.
          </span>
        </div>

        {specsSectionOpen && (
          <div className="divide-y divide-slate-100">
            <DynamicEntityFields
              entityCode={opp.businessEntity?.code || ""}
              values={dynamicSpecs}
              onChange={handleDynamicChange}
              readOnly={!isEditingSpecs}
              onEdit={handleStartEditSpecs}
            />

            {(opp.scopeOfWork || scopeOverview) && (
              <div className="flex items-center min-h-[38px] px-4 py-2 border-t border-slate-200/80 hover:bg-slate-50/70 transition group">
                <span className="w-48 sm:w-56 text-xs text-slate-500 font-medium shrink-0">
                  Scope of Work Summary
                </span>
                <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate" title={opp.scopeOfWork || scopeOverview}>
                    {opp.scopeOfWork || scopeOverview}
                  </span>
                  {!isEditingSpecs && (
                    <button
                      type="button"
                      onClick={handleStartEditSpecs}
                      className="p-1 rounded text-slate-400 hover:text-[#0176d3] transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                      title="Click to edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Footer inside Container (exact match to Image 2) */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="font-bold text-slate-700">{opp.businessEntity?.name || "Technical Parameters"}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Automatically transfers to Tender & BOQ Cost Estimation
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingSpecs ? (
              <button
                type="button"
                onClick={handleStartEditSpecs}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Specifications</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEditSpecs}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSpecs}
                  disabled={savingSpecs}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingSpecs ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. RELATED OBJECTS: ESTIMATIONS (Salesforce Tabular & Card Design) */}
      {allEstimations.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div
            onClick={() => setRelEstOpen(!relEstOpen)}
            className="bg-slate-100/75 hover:bg-slate-100/90 transition px-5 py-3 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <ChevronDown
                className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                  relEstOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                Related Estimations (BOQ Pricing)
              </span>
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {allEstimations.length} {allEstimations.length === 1 ? "Record" : "Records"}
              </span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Link
                href={
                  latestEstimation
                    ? `/estimation/${latestEstimation.id}`
                    : tender
                    ? `/tenders/${tender.id}`
                    : "/estimation"
                }
                className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-2xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Open Estimation Workspace</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {relEstOpen && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Estimation #</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Version</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Prepared By</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Direct Cost</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Final Price</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Target Margin</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Status</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allEstimations.map((est: any) => (
                    <tr key={est.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {est.estimationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          V{est.version || 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-slate-700">{est.preparedBy || "--"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-mono font-bold text-slate-900">{formatAED(est.totalDirectCost)}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-mono font-black text-slate-900">{formatAED(est.finalPrice)}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {est.profitMargin || est.targetMargin || 15}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          est.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          est.status === "Draft" ? "bg-slate-100 text-slate-600 border-slate-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {est.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          href={`/estimation/${est.id}`}
                          className="text-[10px] font-bold text-[#0176d3] hover:underline flex items-center justify-end gap-0.5"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. RELATED OBJECTS: QUOTATIONS (Multiple Versions with Client Discount Revision) */}
      {allQuotations.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div
            onClick={() => setRelQtOpen(!relQtOpen)}
            className="bg-slate-100/75 hover:bg-slate-100/90 transition px-5 py-3 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none flex-wrap gap-2"
          >
            <div className="flex items-center gap-2.5">
              <ChevronDown
                className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                  relQtOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                Related Commercial Quotations
              </span>
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {allQuotations.length} {allQuotations.length === 1 ? "Version" : "Versions"}
              </span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setSelectedBaseQuoteId(allQuotations[0]?.id || "");
                  setShowDiscountModal(true);
                }}
                className="px-3.5 py-1 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Quotation V2 (Discount Revision)</span>
              </button>
            </div>
          </div>

          {relQtOpen && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Quotation #</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Version</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Subtotal</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Discount Applied</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">UAE VAT (5%)</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Total Amount</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Status</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Client Decision</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allQuotations.map((qt: any) => {
                    const maxVer = Math.max(...allQuotations.map((q: any) => q.version || 1));
                    const isLatest = qt.version === maxVer;
                    const hasDiscount = (qt.discount || 0) > 0;
                    const discountPercent =
                      qt.subtotal > 0 && qt.discount > 0
                        ? Math.round((qt.discount / qt.subtotal) * 100)
                        : 0;

                    const statusColor =
                      qt.status === "Awarded" || qt.status === "Accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      qt.status === "Submitted to Client" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      qt.status === "Approved" ? "bg-sky-50 text-sky-700 border-sky-200" :
                      qt.status === "Rejected" ? "bg-rose-50 text-rose-600 border-rose-200" :
                      qt.status === "Revision Requested" || qt.status === "Changes Requested" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      qt.status === "Pending GM Approval" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-slate-100 text-slate-600 border-slate-200";

                    const decisionColor =
                      qt.clientDecision === "Accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      qt.clientDecision === "Rejected" ? "bg-rose-50 text-rose-600 border-rose-200" :
                      qt.clientDecision === "Revision Requested" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-slate-50 text-slate-500 border-slate-200";

                    return (
                      <tr key={qt.id} className={`hover:bg-slate-50/70 transition ${isLatest && allQuotations.length > 1 ? "bg-blue-50/25" : ""}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {qt.quotationNumber}
                            </span>
                            {isLatest && allQuotations.length > 1 && (
                              <span className="text-[9px] font-bold text-white bg-[#0176d3] px-1.5 py-0.5 rounded shadow-2xs">
                                LATEST
                              </span>
                            )}
                          </div>
                          {hasDiscount && (
                            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                              ✓ {discountPercent}% Client Discount Applied
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`font-bold px-2 py-0.5 rounded border ${
                            qt.version > 1 ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-slate-100 text-slate-800 border-slate-200"
                          }`}>
                            V{qt.version || 1}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-mono font-bold text-slate-900">{formatAED(qt.subtotal)}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {hasDiscount ? (
                            <div className="flex flex-col items-end">
                              <span className="font-mono font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded text-[11px]">
                                - {formatAED(qt.discount)}
                              </span>
                              <span className="text-[9px] text-rose-500 font-semibold mt-0.5">
                                (-{discountPercent}%)
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-400">0.00 (0%)</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-mono font-medium text-slate-600">{formatAED(qt.tax)}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`font-mono font-black ${hasDiscount ? "text-blue-700" : "text-slate-900"}`}>
                            {formatAED(qt.totalAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {qt.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${decisionColor}`}>
                            {qt.clientDecision || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Link
                            href={`/quotations/${qt.id}`}
                            className="text-[10px] font-bold text-[#0176d3] hover:underline flex items-center justify-end gap-0.5"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal for Client Discount Revision (Creating Version 2) */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Create Revised Quotation (Version 2 with Discount)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The client has requested an additional discount during commercial negotiations. A new official <strong>Version 2 Quotation</strong> will be generated while preserving Version 1 in the audit record.
            </p>

            {/* Base Quotation Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Base Quotation</label>
              <select
                value={selectedBaseQuoteId || latestQuotation?.id || (allQuotations[0]?.id || "")}
                onChange={(e) => setSelectedBaseQuoteId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-blue-500"
              >
                {allQuotations.map((q: any) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} (V{q.version || 1}) — {formatAED(q.totalAmount)}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount Type Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Discount Structure</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType("PERCENT")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                    discountType === "PERCENT"
                      ? "bg-blue-50 text-blue-700 border-blue-400 ring-1 ring-blue-400"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Percentage (%) Discount
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("FIXED")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                    discountType === "FIXED"
                      ? "bg-blue-50 text-blue-700 border-blue-400 ring-1 ring-blue-400"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Fixed Amount (AED)
                </button>
              </div>
            </div>

            {/* Discount Value Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {discountType === "PERCENT" ? "Discount Percentage (%)" : "Discount Amount (AED)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discountVal}
                  onChange={(e) => setDiscountVal(Number(e.target.value))}
                  placeholder={discountType === "PERCENT" ? "e.g. 5" : "e.g. 200000"}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                  {discountType === "PERCENT" ? "%" : "AED"}
                </span>
              </div>
            </div>

            {/* Live Calculation Card */}
            {(() => {
              const baseQ = allQuotations.find((q: any) => q.id === (selectedBaseQuoteId || latestQuotation?.id || allQuotations[0]?.id)) || latestQuotation || allQuotations[0];
              const subtotal = baseQ?.subtotal || 0;
              let disc = 0;
              if (discountType === "PERCENT") {
                disc = round2((subtotal * Number(discountVal || 0)) / 100);
              } else {
                disc = round2(Number(discountVal || 0));
              }
              if (disc > subtotal) disc = subtotal;
              const netTaxable = Math.max(0, round2(subtotal - disc));
              const tax = round2(netTaxable * 0.05);
              const totalAmount = round2(netTaxable + tax);

              return (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-medium text-slate-600">
                    <span>Base Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">{formatAED(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-rose-600">
                    <span>Client Requested Discount:</span>
                    <span className="font-mono">- {formatAED(disc)}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-slate-600">
                    <span>UAE VAT (5%):</span>
                    <span className="font-mono">{formatAED(tax)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-blue-700">
                    <span>New Version 2 Total:</span>
                    <span className="font-mono">{formatAED(totalAmount)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Negotiation Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Negotiation Notes &amp; Client Feedback</label>
              <textarea
                rows={2}
                value={discountComments}
                onChange={(e) => setDiscountComments(e.target.value)}
                placeholder="e.g. Client requested 5% discount for bulk project scope..."
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateDiscountRevision}
                disabled={creatingRevision}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0176d3] hover:bg-[#015ba5] rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {creatingRevision ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating V2...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Confirm &amp; Generate Quotation V2</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Reject Reason */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-rose-600">Rejection Reason</h3>
            <p className="text-xs text-slate-500">
              Please specify the reason for rejection before closing this record.
            </p>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Price exceeded client budget / competitor offered shorter schedule..."
              className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-rose-500 font-medium"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  latestQuotation?.status === "Pending GM Approval"
                    ? handleGMDecision("REJECT")
                    : handleClientDecision("Rejected")
                }
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Revision Request */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-amber-600">Request Commercial Revision</h3>
            <p className="text-xs text-slate-500">
              Previous version will be snapshotted in quotation history. Specify requested changes:
            </p>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Requesting 5% discount on line item 2; payment terms adjusted to 45 days..."
              className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500 font-medium"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  latestQuotation?.status === "Pending GM Approval"
                    ? handleGMDecision("REQUEST_CHANGES")
                    : handleClientDecision("Revision Requested")
                }
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
              >
                Save & Snapshot Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

