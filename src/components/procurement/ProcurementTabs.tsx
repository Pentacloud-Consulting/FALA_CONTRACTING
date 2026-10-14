"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatAED, round2 } from "@/lib/calculations";
import { useApp } from "@/context/AppContext";
import {
  createPurchaseRequest,
  convertPRtoPO,
  createGoodsReceipt,
} from "@/actions/procurementActions";
import {
  ShoppingCart,
  FileSpreadsheet,
  PackageCheck,
  Building2,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Loader2,
} from "lucide-react";

export default function ProcurementTabs({
  purchaseRequests,
  purchaseOrders,
  goodsReceipts,
  suppliers,
  entities,
}: {
  purchaseRequests: any[];
  purchaseOrders: any[];
  goodsReceipts: any[];
  suppliers: any[];
  entities: any[];
}) {
  const router = useRouter();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"PR" | "PO" | "GRN" | "SUPPLIERS">("PR");
  const [modalMode, setModalMode] = useState<"NEW_PR" | "CONVERT_PO" | "NEW_GRN" | null>(null);

  const [selectedPR, setSelectedPR] = useState<any>(null);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // New PR state
  const [prDesc, setPrDesc] = useState("Drainage Pipes and Aggregate Materials Supply");
  const [prReason, setPrReason] = useState("Required for road infrastructure milestone 3");
  const [prDept, setPrDept] = useState("Road Operations");
  const [prEntityId, setPrEntityId] = useState(entities[0]?.id || "");
  const [prDate, setPrDate] = useState(new Date().toISOString().split("T")[0]);
  const [prItems, setPrItems] = useState([
    { description: "Class C Stormwater Pipe 1200mm Dia", quantity: 450, unit: "pipes", estimatedPrice: 500 },
  ]);

  // Convert to PO state
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || "");
  const [poDeliveryTerms, setPoDeliveryTerms] = useState("Delivered to Project Site Yard");
  const [poDeliveryDate, setPoDeliveryDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Goods Receipt state
  const [grnReceivedBy, setGrnReceivedBy] = useState("Mansoor Khan (Storekeeper)");
  const [grnNotes, setGrnNotes] = useState("Materials inspected on delivery, verified compliance with technical submittal.");

  const [loading, setLoading] = useState(false);

  // Handle New PR
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createPurchaseRequest({
      businessEntityId: prEntityId,
      department: prDept,
      requester: "Sarah Jenkins, PMP",
      requiredDate: prDate,
      description: prDesc,
      reason: prReason,
      lineItems: prItems,
    });
    setLoading(false);
    setModalMode(null);

    if (res.success && res.pr) {
      showToast(`Purchase Request ${res.pr.prNumber} created!`, "success");
      router.refresh();
    } else {
      showToast(res.error || "Failed", "error");
    }
  };

  // Handle Convert to PO
  const handleConvertToPO = async () => {
    if (!selectedPR) return;
    setLoading(true);
    const res = await convertPRtoPO({
      purchaseRequestId: selectedPR.id,
      supplierId: poSupplierId,
      deliveryTerms: poDeliveryTerms,
      expectedDeliveryDate: poDeliveryDate,
    });
    setLoading(false);
    setModalMode(null);

    if (res.success && res.po) {
      showToast(`Purchase Order ${res.po.poNumber} issued!`, "success");
      setActiveTab("PO");
      router.refresh();
    } else {
      showToast(res.error || "Failed", "error");
    }
  };

  // Handle Record GRN
  const handleCreateGRN = async () => {
    if (!selectedPO) return;
    setLoading(true);
    const res = await createGoodsReceipt({
      purchaseOrderId: selectedPO.id,
      receivedBy: grnReceivedBy,
      notes: grnNotes,
      lineReceipts: selectedPO.lineItems.map((li: any) => ({
        poLineItemId: li.id,
        description: li.description,
        orderedQuantity: li.quantity,
        receivedQuantity: li.quantity,
        acceptedQuantity: li.quantity,
      })),
    });
    setLoading(false);
    setModalMode(null);

    if (res.success && res.grn) {
      showToast(`Goods Receipt ${res.grn.receiptNumber} recorded and accepted!`, "success");
      setActiveTab("GRN");
      router.refresh();
    } else {
      showToast(res.error || "Failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "PR", label: "Purchase Requests", count: purchaseRequests.length, icon: FileSpreadsheet },
            { id: "PO", label: "Purchase Orders", count: purchaseOrders.length, icon: ShoppingCart },
            { id: "GRN", label: "Goods Receipts (GRN)", count: goodsReceipts.length, icon: PackageCheck },
            { id: "SUPPLIERS", label: "Suppliers Directory", count: suppliers.length, icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "PR" && (
          <button
            onClick={() => setModalMode("NEW_PR")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Raise Purchase Request</span>
          </button>
        )}
      </div>

      {/* TAB 1: PURCHASE REQUESTS */}
      {activeTab === "PR" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">PR #</th>
                  <th className="py-3 px-4">Description & Project</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4 text-right">Total (AED)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No purchase requests registered yet. Click &quot;+ Raise New PR&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  purchaseRequests.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{pr.prNumber}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-1">{pr.description}</div>
                        <div className="text-[11px] text-slate-400">
                          {pr.project ? pr.project.name : "General Operational"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {pr.businessEntity.shortName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{pr.requester}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatAED(pr.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            pr.status === "Converted"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {pr.status !== "Converted" ? (
                          <button
                            onClick={() => {
                              setSelectedPR(pr);
                              setModalMode("CONVERT_PO");
                            }}
                            className="rounded bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition"
                          >
                            Convert to PO →
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">PO Issued</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS */}
      {activeTab === "PO" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">VAT</th>
                  <th className="py-3 px-4 text-right">Total (AED)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No purchase orders issued yet. Convert an approved PR to issue a PO.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{po.poNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{po.supplier.name}</div>
                        <div className="text-[11px] text-slate-400">{po.supplier.category}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{po.businessEntity.shortName}</td>
                      <td className="py-3.5 px-4 text-right">{formatAED(po.subtotal)}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500">{formatAED(po.tax)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatAED(po.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            po.status === "Received"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {po.status !== "Received" ? (
                          <button
                            onClick={() => {
                              setSelectedPO(po);
                              setModalMode("NEW_GRN");
                            }}
                            className="rounded bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                          >
                            Receive Goods (GRN) →
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold">✓ GRN Accepted</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GOODS RECEIPTS */}
      {activeTab === "GRN" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">GRN #</th>
                  <th className="py-3 px-4">Linked PO & Supplier</th>
                  <th className="py-3 px-4">Received Date</th>
                  <th className="py-3 px-4">Received By</th>
                  <th className="py-3 px-4">Notes / Inspection</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {goodsReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No goods receipt notes (GRN) recorded yet.
                    </td>
                  </tr>
                ) : (
                  goodsReceipts.map((grn) => (
                    <tr key={grn.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{grn.receiptNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {grn.purchaseOrder.poNumber} — {grn.purchaseOrder.supplier.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {grn.lineItems.length} lines verified
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(grn.receivedDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{grn.receivedBy}</td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px] truncate">
                        {grn.notes}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          {grn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPLIERS */}
      {activeTab === "SUPPLIERS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
              No registered suppliers found.
            </div>
          ) : (
            suppliers.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400">{s.code}</span>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    {s.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                <p className="text-slate-500 font-medium">{s.category}</p>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-600">
                  <div>Contact: <strong>{s.contactPerson}</strong></div>
                  <div>Phone: {s.phone}</div>
                  <div>Email: {s.email}</div>
                  <div className="text-slate-400 text-[11px]">{s.address}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: NEW PR */}
      {modalMode === "NEW_PR" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreatePR} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Raise New Purchase Request</h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Entity</label>
              <select
                value={prEntityId}
                onChange={(e) => setPrEntityId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              >
                {entities.map((ent: any) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description / Item Package</label>
              <input
                type="text"
                value={prDesc}
                onChange={(e) => setPrDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Operational Justification / Reason</label>
              <textarea
                rows={2}
                value={prReason}
                onChange={(e) => setPrReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Create Purchase Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CONVERT PR TO PO */}
      {modalMode === "CONVERT_PO" && selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Convert {selectedPR.prNumber} to Purchase Order
            </h3>
            <p className="text-slate-600">
              Issue an official PO for <strong>{selectedPR.description}</strong> ({formatAED(selectedPR.totalAmount)}).
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Supplier</label>
              <select
                value={poSupplierId}
                onChange={(e) => setPoSupplierId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              >
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Terms</label>
              <input
                type="text"
                value={poDeliveryTerms}
                onChange={(e) => setPoDeliveryTerms(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConvertToPO}
                className="rounded-lg bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700"
              >
                {loading ? "Generating..." : "Issue Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW GRN */}
      {modalMode === "NEW_GRN" && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Record Goods Receipt (GRN) for {selectedPO.poNumber}
            </h3>
            <p className="text-slate-600">
              Supplier: <strong>{selectedPO.supplier.name}</strong> • Amount:{" "}
              <strong>{formatAED(selectedPO.totalAmount)}</strong>
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Received & Inspected By</label>
              <input
                type="text"
                value={grnReceivedBy}
                onChange={(e) => setGrnReceivedBy(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quality Inspection Notes</label>
              <textarea
                rows={2}
                value={grnNotes}
                onChange={(e) => setGrnNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCreateGRN}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
              >
                {loading ? "Saving..." : "Accept & Record GRN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
