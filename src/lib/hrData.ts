export interface Employee {
  id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  status: "Active" | "On Leave" | "Probation";
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  visaStatus: "Valid" | "Expiring Soon" | "Renewed";
  visaExpiry: string;
  nationality: string;
  leaveBalance: {
    annualTotal: number;
    annualUsed: number;
    annualBalance: number;
    sickTotal: number;
    sickUsed: number;
    sickBalance: number;
    emergencyTotal: number;
    emergencyUsed: number;
    emergencyBalance: number;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: "Annual Leave" | "Sick Leave" | "Emergency Leave" | "Casual Leave" | "Pilgrimage / Hajj";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: "Approved" | "Pending GM Approval" | "Under HR Review" | "Rejected";
  approvedBy?: string;
  reliefStaff?: string;
}

export interface Payslip {
  id: string;
  monthYear: string; // e.g. "2026-10" or "October 2026"
  periodStart: string;
  periodEnd: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  bankName: string;
  iban: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  overtimeHours: number;
  overtimeAmount: number;
  grossSalary: number;
  deductions: {
    advanceRepayment: number;
    unpaidLeave: number;
    gosiPension: number;
    otherDeductions: number;
  };
  totalDeductions: number;
  netSalary: number;
  status: "Paid" | "Pending Disbursement" | "Processing";
  paymentDate?: string;
  wpsRef?: string;
}

export interface SalaryAdvance {
  id: string;
  advanceCode: string;
  employeeId: string;
  employeeName: string;
  department: string;
  requestDate: string;
  requestedAmount: number;
  tenureMonths: number;
  monthlyDeduction: number;
  reason: string;
  status: "Active / Repaying" | "Pending Approval" | "Fully Settled" | "Rejected";
  repaidAmount: number;
  remainingAmount: number;
  disbursedDate?: string;
  approvedBy?: string;
}

export interface ExpenseClaim {
  id: string;
  claimCode: string;
  employeeId: string;
  employeeName: string;
  department: string;
  claimDate: string;
  category: "Site Fuel & Petrol" | "Emergency Materials / Tools" | "Client Hospitality" | "Safety & PPE Supplies" | "Site Travel & Tolls";
  project: string;
  receiptNumber: string;
  amount: number;
  description: string;
  status: "Approved & Paid" | "Pending Review" | "Under Audit" | "Rejected";
  approvedBy?: string;
  settledDate?: string;
}

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "Eng. Tariq Al-Nuaimi",
    employeeCode: "FALA-ENG-101",
    designation: "Senior Tendering & Estimation Engineer",
    department: "Tendering & Cost Engineering",
    email: "tariq.preparer@falaroad.ae",
    phone: "+971 50 123 4567",
    joiningDate: "2021-03-15",
    status: "Active",
    basicSalary: 18000,
    housingAllowance: 6000,
    transportAllowance: 3000,
    visaStatus: "Valid",
    visaExpiry: "2027-04-10",
    nationality: "UAE National",
    leaveBalance: {
      annualTotal: 30,
      annualUsed: 14,
      annualBalance: 16,
      sickTotal: 15,
      sickUsed: 2,
      sickBalance: 13,
      emergencyTotal: 5,
      emergencyUsed: 1,
      emergencyBalance: 4,
    },
  },
  {
    id: "EMP-002",
    name: "Sarah Jenkins, PMP",
    employeeCode: "FALA-PM-204",
    designation: "Senior Infrastructure Project Manager",
    department: "Road Infrastructure Operations",
    email: "sarah.pm@falaroad.ae",
    phone: "+971 55 987 6543",
    joiningDate: "2022-01-10",
    status: "Active",
    basicSalary: 24000,
    housingAllowance: 8000,
    transportAllowance: 4000,
    visaStatus: "Valid",
    visaExpiry: "2027-01-20",
    nationality: "British",
    leaveBalance: {
      annualTotal: 30,
      annualUsed: 18,
      annualBalance: 12,
      sickTotal: 15,
      sickUsed: 0,
      sickBalance: 15,
      emergencyTotal: 5,
      emergencyUsed: 0,
      emergencyBalance: 5,
    },
  },
  {
    id: "EMP-003",
    name: "Mansoor Khan",
    employeeCode: "FALA-PROC-305",
    designation: "Chief Procurement Officer",
    department: "Procurement & Supply Chain",
    email: "mansoor.procurement@falaroad.ae",
    phone: "+971 52 345 6789",
    joiningDate: "2020-08-01",
    status: "Active",
    basicSalary: 16000,
    housingAllowance: 5000,
    transportAllowance: 2500,
    visaStatus: "Valid",
    visaExpiry: "2026-12-15",
    nationality: "Pakistani",
    leaveBalance: {
      annualTotal: 30,
      annualUsed: 20,
      annualBalance: 10,
      sickTotal: 15,
      sickUsed: 4,
      sickBalance: 11,
      emergencyTotal: 5,
      emergencyUsed: 2,
      emergencyBalance: 3,
    },
  },
  {
    id: "EMP-004",
    name: "Eng. Bilal Qasim",
    employeeCode: "FALA-SITE-412",
    designation: "Senior Highway Construction Engineer",
    department: "Road Infrastructure Operations",
    email: "bilal.qasim@falaroad.ae",
    phone: "+971 54 882 1928",
    joiningDate: "2023-05-12",
    status: "On Leave",
    basicSalary: 15000,
    housingAllowance: 4500,
    transportAllowance: 2500,
    visaStatus: "Valid",
    visaExpiry: "2028-05-11",
    nationality: "Jordanian",
    leaveBalance: {
      annualTotal: 30,
      annualUsed: 24,
      annualBalance: 6,
      sickTotal: 15,
      sickUsed: 1,
      sickBalance: 14,
      emergencyTotal: 5,
      emergencyUsed: 1,
      emergencyBalance: 4,
    },
  },
  {
    id: "EMP-005",
    name: "Vikram Patel",
    employeeCode: "FALA-FLT-509",
    designation: "Heavy Equipment Fleet & Workshop Manager",
    department: "Fleet Workshop & Machinery",
    email: "vikram.patel@falaroad.ae",
    phone: "+971 56 441 9920",
    joiningDate: "2019-11-20",
    status: "Active",
    basicSalary: 14000,
    housingAllowance: 4000,
    transportAllowance: 2500,
    visaStatus: "Expiring Soon",
    visaExpiry: "2026-11-18",
    nationality: "Indian",
    leaveBalance: {
      annualTotal: 30,
      annualUsed: 12,
      annualBalance: 18,
      sickTotal: 15,
      sickUsed: 3,
      sickBalance: 12,
      emergencyTotal: 5,
      emergencyUsed: 0,
      emergencyBalance: 5,
    },
  },
  {
    id: "EMP-006",
    name: "Fatima Al-Zahra",
    employeeCode: "FALA-FIN-602",
    designation: "Payroll & Treasury Accountant",
    department: "Finance & Accounts",
    email: "fatima.finance@falaroad.ae",
    phone: "+971 50 671 2288",
    joiningDate: "2024-02-01",
    status: "Active",
    basicSalary: 13500,
    housingAllowance: 4000,
    transportAllowance: 2000,
    visaStatus: "Valid",
    visaExpiry: "2027-02-14",
    nationality: "Egyptian",
    leaveBalance: {
      annualTotal: 30,
      annualUsed: 6,
      annualBalance: 24,
      sickTotal: 15,
      sickUsed: 0,
      sickBalance: 15,
      emergencyTotal: 5,
      emergencyUsed: 0,
      emergencyBalance: 5,
    },
  },
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "LV-2026-081",
    employeeId: "EMP-004",
    employeeName: "Eng. Bilal Qasim",
    department: "Road Infrastructure Operations",
    leaveType: "Annual Leave",
    startDate: "2026-10-12",
    endDate: "2026-10-24",
    days: 12,
    reason: "Annual vacation with family in Amman (Travel approved by Project Director).",
    appliedDate: "2026-09-28",
    status: "Approved",
    approvedBy: "H.E. Saeed Fala Al-Falasi (GM)",
    reliefStaff: "Sarah Jenkins, PMP",
  },
  {
    id: "LV-2026-082",
    employeeId: "EMP-001",
    employeeName: "Eng. Tariq Al-Nuaimi",
    department: "Tendering & Cost Engineering",
    leaveType: "Casual Leave",
    startDate: "2026-10-18",
    endDate: "2026-10-19",
    days: 2,
    reason: "Attending RTA Tendering Council Technical Committee Workshop in Dubai.",
    appliedDate: "2026-10-14",
    status: "Pending GM Approval",
    reliefStaff: "Bilal Qasim",
  },
  {
    id: "LV-2026-083",
    employeeId: "EMP-003",
    employeeName: "Mansoor Khan",
    department: "Procurement & Supply Chain",
    leaveType: "Emergency Leave",
    startDate: "2026-10-04",
    endDate: "2026-10-06",
    days: 3,
    reason: "Urgent medical checkup and family matter.",
    appliedDate: "2026-10-03",
    status: "Approved",
    approvedBy: "H.E. Saeed Fala Al-Falasi (GM)",
    reliefStaff: "Fatima Al-Zahra",
  },
  {
    id: "LV-2026-084",
    employeeId: "EMP-005",
    employeeName: "Vikram Patel",
    department: "Fleet Workshop & Machinery",
    leaveType: "Annual Leave",
    startDate: "2026-11-05",
    endDate: "2026-11-20",
    days: 15,
    reason: "Annual family visit and visa biometric appointment.",
    appliedDate: "2026-10-10",
    status: "Under HR Review",
    reliefStaff: "Rashid Mahmood (Master Mechanic)",
  },
  {
    id: "LV-2026-079",
    employeeId: "EMP-002",
    employeeName: "Sarah Jenkins, PMP",
    department: "Road Infrastructure Operations",
    leaveType: "Sick Leave",
    startDate: "2026-09-18",
    endDate: "2026-09-19",
    days: 2,
    reason: "Seasonal viral fever with approved Dubai Health Authority (DHA) medical certificate.",
    appliedDate: "2026-09-18",
    status: "Approved",
    approvedBy: "HR Director",
    reliefStaff: "Eng. Bilal Qasim",
  },
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: "PS-2026-10-001",
    monthYear: "October 2026",
    periodStart: "2026-10-01",
    periodEnd: "2026-10-31",
    employeeId: "EMP-001",
    employeeName: "Eng. Tariq Al-Nuaimi",
    employeeCode: "FALA-ENG-101",
    designation: "Senior Tendering & Estimation Engineer",
    department: "Tendering & Cost Engineering",
    bankName: "Emirates NBD",
    iban: "AE440260000012345678901",
    basicSalary: 18000,
    housingAllowance: 6000,
    transportAllowance: 3000,
    overtimeHours: 12,
    overtimeAmount: 1850,
    grossSalary: 28850,
    deductions: {
      advanceRepayment: 0,
      unpaidLeave: 0,
      gosiPension: 900,
      otherDeductions: 0,
    },
    totalDeductions: 900,
    netSalary: 27950,
    status: "Processing",
    paymentDate: "2026-10-30",
    wpsRef: "WPS-FALA-202610-01",
  },
  {
    id: "PS-2026-10-002",
    monthYear: "October 2026",
    periodStart: "2026-10-01",
    periodEnd: "2026-10-31",
    employeeId: "EMP-002",
    employeeName: "Sarah Jenkins, PMP",
    employeeCode: "FALA-PM-204",
    designation: "Senior Infrastructure Project Manager",
    department: "Road Infrastructure Operations",
    bankName: "First Abu Dhabi Bank (FAB)",
    iban: "AE120300000098765432109",
    basicSalary: 24000,
    housingAllowance: 8000,
    transportAllowance: 4000,
    overtimeHours: 0,
    overtimeAmount: 0,
    grossSalary: 36000,
    deductions: {
      advanceRepayment: 1500,
      unpaidLeave: 0,
      gosiPension: 0,
      otherDeductions: 0,
    },
    totalDeductions: 1500,
    netSalary: 34500,
    status: "Processing",
    paymentDate: "2026-10-30",
    wpsRef: "WPS-FALA-202610-02",
  },
  {
    id: "PS-2026-10-003",
    monthYear: "October 2026",
    periodStart: "2026-10-01",
    periodEnd: "2026-10-31",
    employeeId: "EMP-003",
    employeeName: "Mansoor Khan",
    employeeCode: "FALA-PROC-305",
    designation: "Chief Procurement Officer",
    department: "Procurement & Supply Chain",
    bankName: "Dubai Islamic Bank (DIB)",
    iban: "AE880240000045612378902",
    basicSalary: 16000,
    housingAllowance: 5000,
    transportAllowance: 2500,
    overtimeHours: 8,
    overtimeAmount: 1100,
    grossSalary: 24600,
    deductions: {
      advanceRepayment: 1000,
      unpaidLeave: 0,
      gosiPension: 0,
      otherDeductions: 0,
    },
    totalDeductions: 1000,
    netSalary: 23600,
    status: "Processing",
    paymentDate: "2026-10-30",
    wpsRef: "WPS-FALA-202610-03",
  },
  {
    id: "PS-2026-09-001",
    monthYear: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-001",
    employeeName: "Eng. Tariq Al-Nuaimi",
    employeeCode: "FALA-ENG-101",
    designation: "Senior Tendering & Estimation Engineer",
    department: "Tendering & Cost Engineering",
    bankName: "Emirates NBD",
    iban: "AE440260000012345678901",
    basicSalary: 18000,
    housingAllowance: 6000,
    transportAllowance: 3000,
    overtimeHours: 6,
    overtimeAmount: 925,
    grossSalary: 27925,
    deductions: {
      advanceRepayment: 0,
      unpaidLeave: 0,
      gosiPension: 900,
      otherDeductions: 0,
    },
    totalDeductions: 900,
    netSalary: 27025,
    status: "Paid",
    paymentDate: "2026-09-29",
    wpsRef: "WPS-FALA-202609-01",
  },
  {
    id: "PS-2026-09-002",
    monthYear: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-005",
    employeeName: "Vikram Patel",
    employeeCode: "FALA-FLT-509",
    designation: "Heavy Equipment Fleet & Workshop Manager",
    department: "Fleet Workshop & Machinery",
    bankName: "Mashreq Bank",
    iban: "AE330310000055443322110",
    basicSalary: 14000,
    housingAllowance: 4000,
    transportAllowance: 2500,
    overtimeHours: 18,
    overtimeAmount: 2200,
    grossSalary: 22700,
    deductions: {
      advanceRepayment: 1000,
      unpaidLeave: 0,
      gosiPension: 0,
      otherDeductions: 0,
    },
    totalDeductions: 1000,
    netSalary: 21700,
    status: "Paid",
    paymentDate: "2026-09-29",
    wpsRef: "WPS-FALA-202609-05",
  },
];

export const INITIAL_SALARY_ADVANCES: SalaryAdvance[] = [
  {
    id: "SA-2026-004",
    advanceCode: "SA-2026-004",
    employeeId: "EMP-002",
    employeeName: "Sarah Jenkins, PMP",
    department: "Road Infrastructure Operations",
    requestDate: "2026-09-10",
    requestedAmount: 9000,
    tenureMonths: 6,
    monthlyDeduction: 1500,
    reason: "Annual villa tenancy contract renewal and security deposit in Dubai Hills.",
    status: "Active / Repaying",
    repaidAmount: 1500,
    remainingAmount: 7500,
    disbursedDate: "2026-09-12",
    approvedBy: "H.E. Saeed Fala Al-Falasi (GM)",
  },
  {
    id: "SA-2026-005",
    advanceCode: "SA-2026-005",
    employeeId: "EMP-003",
    employeeName: "Mansoor Khan",
    department: "Procurement & Supply Chain",
    requestDate: "2026-10-02",
    requestedAmount: 6000,
    tenureMonths: 6,
    monthlyDeduction: 1000,
    reason: "Children academic annual tuition fee installment.",
    status: "Active / Repaying",
    repaidAmount: 0,
    remainingAmount: 6000,
    disbursedDate: "2026-10-05",
    approvedBy: "H.E. Saeed Fala Al-Falasi (GM)",
  },
  {
    id: "SA-2026-006",
    advanceCode: "SA-2026-006",
    employeeId: "EMP-005",
    employeeName: "Vikram Patel",
    department: "Fleet Workshop & Machinery",
    requestDate: "2026-10-14",
    requestedAmount: 5000,
    tenureMonths: 5,
    monthlyDeduction: 1000,
    reason: "Urgent vehicle maintenance and family air tickets booking.",
    status: "Pending Approval",
    repaidAmount: 0,
    remainingAmount: 5000,
  },
  {
    id: "SA-2026-002",
    advanceCode: "SA-2026-002",
    employeeId: "EMP-004",
    employeeName: "Eng. Bilal Qasim",
    department: "Road Infrastructure Operations",
    requestDate: "2026-07-01",
    requestedAmount: 4500,
    tenureMonths: 3,
    monthlyDeduction: 1500,
    reason: "Pre-vacation travel allowance advance.",
    status: "Fully Settled",
    repaidAmount: 4500,
    remainingAmount: 0,
    disbursedDate: "2026-07-04",
    approvedBy: "H.E. Saeed Fala Al-Falasi (GM)",
  },
];

export const INITIAL_EXPENSE_CLAIMS: ExpenseClaim[] = [
  {
    id: "EXP-2026-112",
    claimCode: "EXP-2026-112",
    employeeId: "EMP-004",
    employeeName: "Eng. Bilal Qasim",
    department: "Road Infrastructure Operations",
    claimDate: "2026-10-08",
    category: "Site Fuel & Petrol",
    project: "RTA Highway D54 Expansion - Package 2",
    receiptNumber: "ENOC-REC-88491",
    amount: 1420,
    description: "Diesel fuel top-up for site surveying pickups and emergency generator on Sector 4.",
    status: "Approved & Paid",
    approvedBy: "Sarah Jenkins, PMP",
    settledDate: "2026-10-10",
  },
  {
    id: "EMP-2026-113",
    claimCode: "EXP-2026-113",
    employeeId: "EMP-001",
    employeeName: "Eng. Tariq Al-Nuaimi",
    department: "Tendering & Cost Engineering",
    claimDate: "2026-10-11",
    category: "Client Hospitality",
    project: "Etihad Rail Link Freight Terminal Tender",
    receiptNumber: "MEYDAN-INV-3011",
    amount: 860,
    description: "Official pre-bid client coordination luncheon with Employer technical consultants.",
    status: "Approved & Paid",
    approvedBy: "H.E. Saeed Fala Al-Falasi (GM)",
    settledDate: "2026-10-13",
  },
  {
    id: "EXP-2026-114",
    claimCode: "EXP-2026-114",
    employeeId: "EMP-005",
    employeeName: "Vikram Patel",
    department: "Fleet Workshop & Machinery",
    claimDate: "2026-10-14",
    category: "Emergency Materials / Tools",
    project: "Central Workshop Al Quoz - Heavy Asphalt Pavers",
    receiptNumber: "AL-SHAMSI-HW-4921",
    amount: 2750,
    description: "Urgent hydraulic pressure hoses and high-torque fittings for CAT Asphalt Paver AP1055.",
    status: "Pending Review",
  },
  {
    id: "EXP-2026-115",
    claimCode: "EXP-2026-115",
    employeeId: "EMP-002",
    employeeName: "Sarah Jenkins, PMP",
    department: "Road Infrastructure Operations",
    claimDate: "2026-10-15",
    category: "Safety & PPE Supplies",
    project: "Dubai Silicon Oasis Dual Carriageway",
    receiptNumber: "3M-GULF-PPE-902",
    amount: 1980,
    description: "Reflective Class-3 high-visibility night vests and heat-resistant footwear for night paving crew.",
    status: "Under Audit",
  },
  {
    id: "EXP-2026-108",
    claimCode: "EXP-2026-108",
    employeeId: "EMP-003",
    employeeName: "Mansoor Khan",
    department: "Procurement & Supply Chain",
    claimDate: "2026-09-24",
    category: "Site Travel & Tolls",
    project: "Fujairah Quarry & Aggregate Haulage Route",
    receiptNumber: "SALIK-TAG-202609",
    amount: 640,
    description: "Salik gate charges and inter-emirate logistics inspection tolls for material dispatch.",
    status: "Approved & Paid",
    approvedBy: "Fatima Al-Zahra",
    settledDate: "2026-09-28",
  },
];
