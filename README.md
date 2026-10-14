# Fala Road Contracting — Unified CRM + ERP Demo Platform

A functional, modern enterprise CRM + ERP demonstration for **Fala Road Contracting L.L.C.** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and a local **SQLite** database.

This unified platform demonstrates operations across Fala's **7 commercial business entities**, covering the complete end-to-end lifecycle:

> **Business Selection → Tender Creation → Cost Estimation → Commercial Quotation → Mandatory GM Approval → Client Acceptance → Awarded Contract → Project Milestones → Procurement (PR → PO → GRN) → Management Dashboard.**

---

## 1. Quick Start & Local Setup

### Prerequisites
- Node.js v20+ or v24+
- npm v10+

### Database File Location
The SQLite database file is stored locally at:
```
prisma/dev.db
```
The database connection string in `.env` is:
```env
DATABASE_URL="file:./dev.db"
```

### Installation & Initialization Commands
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Run local Prisma migration (creates prisma/dev.db)
npm run db:migrate

# 3. Seed demo scenario (Idempotent: safe to run multiple times)
npm run db:seed

# 4. Start Next.js development server
npm run dev
```

The application will be live at: **[http://localhost:3000](http://localhost:3000)**

---

## 2. Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Start the local development server (preserves SQLite data) |
| `npm run build` | `next build` | Create an optimized production build |
| `npm run start` | `next start` | Run production build locally |
| `npm run lint` | `eslint` | Run ESLint checks |
| `npm run typecheck` | `tsc --noEmit` | Strict TypeScript type validation |
| `npm run db:migrate` | `prisma migrate dev` | Apply development schema migrations to `prisma/dev.db` |
| `npm run db:seed` | `tsx prisma/seed.ts` | Populate idempotent demo records across all 7 entities |
| `npm run db:studio` | `prisma studio` | Open Prisma Studio browser GUI at `localhost:5555` |
| `npm run db:reset` | `prisma migrate reset` | *(Destructive/Dev-only)* Drops and resets database |

> **Note on Data Preservation**: The normal `npm run dev` and `npm run build` commands **never** reset or overwrite the database. Existing records persist reliably across server restarts and browser refreshes.

---

## 3. Seven Business Entities Registry

The platform features a centralized, configurable business entity registry:

1. **Road & Infrastructure (`ROAD_INFRA`)**: Highways, carriageways, stormwater drainage, asphalt paving, road markings.
2. **Export Manufacturing (`EXP_MFG`)**: Seaworthy precast girders, box culverts, Incoterms (FOB/CIF), overseas logistics.
3. **Building Materials (`BLD_MAT`)**: Certified quarry aggregates, road base Class A, sub-base, crushing rates.
4. **Medical (`MED`)**: Hospital civil fit-out, clean rooms, DHA/MOHAP compliance, radiation shielding bunker walls.
5. **Real Estate (`REAL_EST`)**: Commercial warehousing, logistics yards, plot developments, built-up areas.
6. **Fleet & Workshop (`FLEET_WS`)**: Heavy plant machinery (CAT pavers, Dynapac rollers, Komatsu excavators), repairs, overhauls.
7. **Ready-Mix Manufacturing (`RDY_MIX`)**: Concrete mix grades (C20–C70), GGBS/Microsilica specs, 56m boom pumping logistics.

Selecting any entity in the **Create Tender** form or header dynamically adjusts technical fields, units, and equipment schedules.

---

## 4. Demo Roles & Role Switcher

A **Local Demo Role Switcher** is embedded in the top header. It allows seamless switching between key organizational personas to test governance gates:

| Demo User | Role | Organizational Responsibility |
| :--- | :--- | :--- |
| **Eng. Tariq Al-Nuaimi** | `PREPARER` | Senior Estimator: Creates tenders, enters BOQ items, calculates margins, submits for GM review. |
| **H.E. Saeed Fala Al-Falasi** | `GM` | **General Manager**: Holds exclusive authority to Approve, Reject (with reason), or Request Changes on commercial quotations. |
| **Sarah Jenkins, PMP** | `PROJECT_MANAGER` | Project Manager: Tracks milestones, manages project execution, issues Purchase Requests. |
| **Mansoor Khan** | `PROCUREMENT_OFFICER` | Procurement Head: Converts PRs into POs, inspects and records Goods Receipts (GRNs). |

---

## 5. Primary Demonstration Walkthrough

Follow these steps for a complete live demonstration:

1. **Open Executive Dashboard (`/`)**:
   - Inspect high-level KPIs calculated live from SQLite (Active Tenders, Quotation Value, Pending GM Approvals, Awarded Contracts, Projects).
   - Use the Business Unit filter in the header to switch between "All Businesses" and individual entities.

2. **Select Business & Create Tender (`/tenders/new`)**:
   - Step 1: Select **Road & Infrastructure** (or test switching to Export Manufacturing to observe dynamic field shifts).
   - Step 2: Enter tender title (e.g. *Al Khail Road Expansion Package 4*) and select *Gulf Infrastructure Demo LLC*.
   - Step 3: Fill division-specific fields (Pavement layers, road length, excavation volume, equipment spread).
   - Step 4: Review and submit. Observe unique internal reference `TND-2026-XXXX` generated on the server.

3. **Cost Estimation (`/estimation/new?tenderId=...`)**:
   - Add BOQ line items (Aggregates, Dense Bitumen Macadam, Wearing Course, Labour, Plant hire).
   - Direct Costs are calculated: `Quantity × Unit Rate`.
   - Set **Target Margin** (e.g. `15%`).
   - Observe authoritative server recalculation:
     - `Selling Price = Total Cost / (1 - Target Margin)`
     - `Gross Profit = Selling Price - Total Cost`
     - `Tax = 5% UAE VAT`
   - Save estimation.

4. **Generate Commercial Quotation (`/estimation/[id]` → `/quotations/[id]`)**:
   - Click **Generate Commercial Quotation**.
   - Review the professional commercial offer with payment and delivery terms.
   - Click **Submit for Mandatory GM Approval**. Status transitions to `Pending GM Approval`.

5. **Mandatory GM Approval Gate (`/approvals` or `/quotations/[id]`)**:
   - If currently `PREPARER`, observe that decision actions are locked.
   - In the top header role switcher, select **H.E. Saeed Fala Al-Falasi (GM)**.
   - Click **GM: Approve Offer**. Enter executive notes.
   - Quotation status transitions to `Approved` with an immutable governance audit log entry.
   - Switch back to `PREPARER` role.

6. **Print Document & Client Submission (`/quotations/[id]`)**:
   - Click **Print Offer Document** to review the print-ready CSS layout.
   - Click **Mark Submitted to Client**.
   - Click **Record Client Decision** → Select **Accepted** and enter Client PO # (e.g. `PO-GULF-INFRA-8831`).

7. **Award & Contract Conversion (`/contracts/[id]`)**:
   - Click **Convert into Awarded Contract**.
   - Tender status transitions to `Awarded` and contract `CON-2026-XXXX` is generated. Duplicate conversion is guarded.

8. **Initialize Project & Update Milestones (`/projects/[id]`)**:
   - Click **Initialize Delivery Project**.
   - Drag or click milestone progress sliders (e.g., Mark *Site Mobilization* 100% done).
   - Notice overall project completion updates automatically.

9. **Connected Procurement (`/procurement`)**:
   - Tab 1: Raise a Purchase Request (`PR-2026-XXXX`) linked to the project.
   - Click **Convert to PO** → Select supplier (*RAK Aggregate Quarries PJSC*).
   - Tab 2: On the issued PO, click **Receive Goods (GRN)**.
   - Tab 3: Inspect the accepted Goods Receipt record.

10. **Return to Dashboard & Reports (`/` & `/reports`)**:
    - Observe updated KPI figures, charts, and contract totals reflected live from SQLite.
    - Go to `/reports` and click **Export to CSV Spreadsheet** to download tabular data.

---

## 6. How to Inspect Data in Prisma Studio

To inspect SQLite tables and relationships using the official graphical browser:
```bash
npm run db:studio
```
Prisma Studio opens at: **[http://localhost:5555](http://localhost:5555)**

---

## 7. PostgreSQL Migration Plan (Future Enterprise Production)

The data access layer is cleanly decoupled to allow migrating from local SQLite to managed PostgreSQL (e.g. Supabase, AWS RDS Aurora, or Neon) with zero business logic changes:

1. **Schema Update (`prisma/schema.prisma`)**:
   Change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. **Decimal Support**:
   Switch financial `Float` fields to native PostgreSQL `Decimal(15, 2)` for multi-currency precision.
3. **Environment Configuration**:
   Update `DATABASE_URL` in `.env` to the PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/fala_erp?schema=public"
   ```
4. **Deploy Migrations**:
   Run `npx prisma migrate deploy` followed by `npm run db:seed`.
