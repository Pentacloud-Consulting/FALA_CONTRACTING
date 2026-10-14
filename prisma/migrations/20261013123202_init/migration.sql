-- CreateTable
CREATE TABLE "BusinessEntity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#1e3a8a',
    "icon" TEXT NOT NULL DEFAULT 'Building',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PREPARER',
    "title" TEXT,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Corporate',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Dubai',
    "country" TEXT NOT NULL DEFAULT 'United Arab Emirates',
    "primaryContact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Direct',
    "businessEntityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "ownerName" TEXT NOT NULL DEFAULT 'Sales Team',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oppNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "expectedValue" REAL NOT NULL DEFAULT 0,
    "expectedCloseDate" DATETIME NOT NULL,
    "ownerName" TEXT NOT NULL DEFAULT 'Tender Dept',
    "status" TEXT NOT NULL DEFAULT 'Proposal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Opportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Opportunity_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenderNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "branch" TEXT DEFAULT 'Dubai HQ',
    "recordType" TEXT NOT NULL DEFAULT 'Tender',
    "contactPerson" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "clientReference" TEXT,
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionDeadline" DATETIME NOT NULL,
    "expectedClosingDate" DATETIME,
    "ownerName" TEXT NOT NULL DEFAULT 'Senior Estimator',
    "location" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "description" TEXT NOT NULL,
    "scopeOfWork" TEXT NOT NULL,
    "supportingDocs" TEXT,
    "internalNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "estimatedValue" REAL NOT NULL DEFAULT 0,
    "specificFieldsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tender_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tender_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Estimation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimationNumber" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "preparedBy" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetMargin" REAL NOT NULL DEFAULT 15.0,
    "totalDirectCost" REAL NOT NULL DEFAULT 0,
    "overheads" REAL NOT NULL DEFAULT 0,
    "contingency" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "sellingPriceBeforeTax" REAL NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 5.0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "finalPrice" REAL NOT NULL DEFAULT 0,
    "estimatedProfit" REAL NOT NULL DEFAULT 0,
    "profitMargin" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Estimation_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Estimation_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Estimation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EstimationLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimationId" TEXT NOT NULL,
    "costCategory" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" REAL NOT NULL,
    "lineTotal" REAL NOT NULL,
    CONSTRAINT "EstimationLineItem_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "Estimation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationNumber" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "estimationId" TEXT,
    "businessEntityId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "paymentTerms" TEXT NOT NULL DEFAULT '30 Days from Invoice Date',
    "deliveryTerms" TEXT NOT NULL DEFAULT 'Site Delivery, Dubai',
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "assumptions" TEXT,
    "exclusions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "clientDecision" TEXT NOT NULL DEFAULT 'Pending',
    "clientDecisionDate" DATETIME,
    "clientComments" TEXT,
    "clientPoNumber" TEXT,
    "submittedToClientAt" DATETIME,
    "submissionMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quotation_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Quotation_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "Estimation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quotation_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quotation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuotationLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" REAL NOT NULL,
    "lineTotal" REAL NOT NULL,
    CONSTRAINT "QuotationLineItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuotationVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshotJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuotationVersion_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "approverName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" DATETIME,
    "decisionReason" TEXT,
    "comments" TEXT,
    CONSTRAINT "ApprovalRequest_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "comment" TEXT,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApprovalHistory_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractNumber" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "contractValue" REAL NOT NULL,
    "agreedScope" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "completionDate" DATETIME NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "clientPoNumber" TEXT,
    "clientPoDocRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "projectManager" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contractValue" REAL NOT NULL,
    "approvedBudget" REAL NOT NULL,
    "plannedStartDate" DATETIME NOT NULL,
    "plannedEndDate" DATETIME NOT NULL,
    "actualStartDate" DATETIME,
    "actualEndDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "scope" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT NOT NULL,
    "plannedStart" DATETIME NOT NULL,
    "plannedFinish" DATETIME NOT NULL,
    "actualFinish" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Aggregates & Asphalt',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prNumber" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "projectId" TEXT,
    "department" TEXT NOT NULL DEFAULT 'Operations',
    "requester" TEXT NOT NULL,
    "requiredDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "supplierPreference" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseRequest_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseRequestLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseRequestId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "estimatedPrice" REAL NOT NULL,
    "lineTotal" REAL NOT NULL,
    CONSTRAINT "PurchaseRequestLineItem_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "projectId" TEXT,
    "purchaseRequestId" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "deliveryTerms" TEXT NOT NULL DEFAULT 'Delivered to Site, Jebel Ali',
    "paymentTerms" TEXT NOT NULL DEFAULT '45 Days Credit',
    "expectedDeliveryDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Issued',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "BusinessEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrderLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" REAL NOT NULL,
    "lineTotal" REAL NOT NULL,
    CONSTRAINT "PurchaseOrderLineItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoodsReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "receivedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedBy" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Accepted',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GoodsReceipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoodsReceiptLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goodsReceiptId" TEXT NOT NULL,
    "poLineItemId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderedQuantity" REAL NOT NULL,
    "receivedQuantity" REAL NOT NULL,
    "acceptedQuantity" REAL NOT NULL,
    CONSTRAINT "GoodsReceiptLineItem_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GoodsReceiptLineItem_poLineItemId_fkey" FOREIGN KEY ("poLineItemId") REFERENCES "PurchaseOrderLineItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessEntity_name_key" ON "BusinessEntity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessEntity_code_key" ON "BusinessEntity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_oppNumber_key" ON "Opportunity"("oppNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Tender_tenderNumber_key" ON "Tender"("tenderNumber");

-- CreateIndex
CREATE INDEX "Tender_businessEntityId_idx" ON "Tender"("businessEntityId");

-- CreateIndex
CREATE INDEX "Tender_status_idx" ON "Tender"("status");

-- CreateIndex
CREATE INDEX "Tender_customerId_idx" ON "Tender"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimation_estimationNumber_key" ON "Estimation"("estimationNumber");

-- CreateIndex
CREATE INDEX "Estimation_tenderId_idx" ON "Estimation"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");

-- CreateIndex
CREATE INDEX "Quotation_tenderId_idx" ON "Quotation"("tenderId");

-- CreateIndex
CREATE INDEX "Quotation_status_idx" ON "Quotation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_tenderId_idx" ON "Contract"("tenderId");

-- CreateIndex
CREATE INDEX "Contract_customerId_idx" ON "Contract"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectNumber_key" ON "Project"("projectNumber");

-- CreateIndex
CREATE INDEX "Project_contractId_idx" ON "Project"("contractId");

-- CreateIndex
CREATE INDEX "Project_businessEntityId_idx" ON "Project"("businessEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequest_prNumber_key" ON "PurchaseRequest"("prNumber");

-- CreateIndex
CREATE INDEX "PurchaseRequest_projectId_idx" ON "PurchaseRequest"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_purchaseRequestId_idx" ON "PurchaseOrder"("purchaseRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceipt_receiptNumber_key" ON "GoodsReceipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "GoodsReceipt_purchaseOrderId_idx" ON "GoodsReceipt"("purchaseOrderId");
