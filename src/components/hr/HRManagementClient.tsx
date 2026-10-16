"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  CreditCard,
  Receipt,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Building2,
  ShieldCheck,
  Palmtree,
  Printer,
  X,
  ChevronRight,
  TrendingDown,
  Briefcase,
  AlertTriangle,
  Award,
} from "lucide-react";
import {
  Employee,
  LeaveRequest,
  Payslip,
  SalaryAdvance,
  ExpenseClaim,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYSLIPS,
  INITIAL_SALARY_ADVANCES,
  INITIAL_EXPENSE_CLAIMS,
} from "@/lib/hrData";

type ActiveTab = "leaves" | "payslips" | "advances" | "expenses" | "directory";

export default function HRManagementClient() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("leaves");

  // State data (in-memory, interactive demo)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [payslips, setPayslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>(INITIAL_SALARY_ADVANCES);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>(INITIAL_EXPENSE_CLAIMS);

  // Filters: Start date & End date + Search + Department
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Sub-view toggle for leaves: "requests" vs "balances"
  const [leaveSubView, setLeaveSubView] = useState<"requests" | "balances">("requests");

  // Selected Payslip for viewing / printing
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Modals state
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);

  // New Leave Form State
  const [newLeaveEmployee, setNewLeaveEmployee] = useState<string>(INITIAL_EMPLOYEES[0]?.id || "");
  const [newLeaveType, setNewLeaveType] = useState<LeaveRequest["leaveType"]>("Annual Leave");
  const [newLeaveStart, setNewLeaveStart] = useState<string>("2026-10-20");
  const [newLeaveEnd, setNewLeaveEnd] = useState<string>("2026-10-25");
  const [newLeaveReason, setNewLeaveReason] = useState<string>("");
  const [newLeaveRelief, setNewLeaveRelief] = useState<string>("");

  // New Salary Advance Form State
  const [newAdvanceEmployee, setNewAdvanceEmployee] = useState<string>(INITIAL_EMPLOYEES[0]?.id || "");
  const [newAdvanceAmount, setNewAdvanceAmount] = useState<number>(5000);
  const [newAdvanceTenure, setNewAdvanceTenure] = useState<number>(5);
  const [newAdvanceReason, setNewAdvanceReason] = useState<string>("");

  // New Expense Claim Form State
  const [newExpenseEmployee, setNewExpenseEmployee] = useState<string>(INITIAL_EMPLOYEES[0]?.id || "");
  const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseClaim["category"]>("Site Fuel & Petrol");
  const [newExpenseProject, setNewExpenseProject] = useState<string>("RTA Highway D54 Expansion - Package 2");
  const [newExpenseReceipt, setNewExpenseReceipt] = useState<string>("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(850);
  const [newExpenseDesc, setNewExpenseDesc] = useState<string>("");

  // Quick Date Filter Presets
  const setQuickDate = (preset: "ALL" | "OCT" | "SEP" | "Q4") => {
    if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "OCT") {
      setStartDate("2026-10-01");
      setEndDate("2026-10-31");
    } else if (preset === "SEP") {
      setStartDate("2026-09-01");
      setEndDate("2026-09-30");
    } else if (preset === "Q4") {
      setStartDate("2026-10-01");
      setEndDate("2026-12-31");
    }
  };

  // Helper date checker
  const isDateInRange = (dateStr: string) => {
    if (!startDate && !endDate) return true;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  };

  // Filtered Leave Requests
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      const matchSearch =
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = departmentFilter === "ALL" || r.department === departmentFilter;
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchDate = isDateInRange(r.startDate) || isDateInRange(r.endDate);
      return matchSearch && matchDept && matchStatus && matchDate;
    });
  }, [leaveRequests, searchTerm, departmentFilter, statusFilter, startDate, endDate]);

  // Filtered Payslips
  const filteredPayslips = useMemo(() => {
    return payslips.filter((p) => {
      const matchSearch =
        p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = departmentFilter === "ALL" || p.department === departmentFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchDate = isDateInRange(p.periodStart) || isDateInRange(p.periodEnd);
      return matchSearch && matchDept && matchStatus && matchDate;
    });
  }, [payslips, searchTerm, departmentFilter, statusFilter, startDate, endDate]);

  // Filtered Salary Advances
  const filteredAdvances = useMemo(() => {
    return salaryAdvances.filter((a) => {
      const matchSearch =
        a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.advanceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = departmentFilter === "ALL" || a.department === departmentFilter;
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchDate = isDateInRange(a.requestDate);
      return matchSearch && matchDept && matchStatus && matchDate;
    });
  }, [salaryAdvances, searchTerm, departmentFilter, statusFilter, startDate, endDate]);

  // Filtered Expense Claims
  const filteredExpenses = useMemo(() => {
    return expenseClaims.filter((e) => {
      const matchSearch =
        e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.claimCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = departmentFilter === "ALL" || e.department === departmentFilter;
      const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
      const matchDate = isDateInRange(e.claimDate);
      return matchSearch && matchDept && matchStatus && matchDate;
    });
  }, [expenseClaims, searchTerm, departmentFilter, statusFilter, startDate, endDate]);

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = departmentFilter === "ALL" || emp.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, departmentFilter]);

  // Aggregate Stats
  const totalEmployeesCount = employees.length;
  const onLeaveCount = employees.filter((e) => e.status === "On Leave").length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status.includes("Pending") || l.status.includes("Review")).length;
  const totalOctoberNetPayroll = payslips
    .filter((p) => p.monthYear.includes("October"))
    .reduce((sum, p) => sum + p.netSalary, 0);
  const totalActiveAdvanceBalance = salaryAdvances
    .filter((a) => a.status.includes("Active"))
    .reduce((sum, a) => sum + a.remainingAmount, 0);
  const pendingExpenseAmount = expenseClaims
    .filter((e) => e.status === "Pending Review" || e.status === "Under Audit")
    .reduce((sum, e) => sum + e.amount, 0);

  // Handlers for Additions
  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === newLeaveEmployee) || employees[0];
    const sDate = new Date(newLeaveStart);
    const eDate = new Date(newLeaveEnd);
    const diffTime = Math.max(0, eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequest = {
      id: `LV-2026-${String(leaveRequests.length + 85).padStart(3, "0")}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveType: newLeaveType,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      days: diffDays > 0 ? diffDays : 1,
      reason: newLeaveReason || "Leave request submitted for personal commitments.",
      appliedDate: "2026-10-16",
      status: "Pending GM Approval",
      reliefStaff: newLeaveRelief || "Department Lead",
    };

    setLeaveRequests([newReq, ...leaveRequests]);

    // Update employee balance
    setEmployees((prev) =>
      prev.map((item) => {
        if (item.id === emp.id) {
          const used = item.leaveBalance.annualUsed + (newReq.days || 1);
          return {
            ...item,
            leaveBalance: {
              ...item.leaveBalance,
              annualUsed: used,
              annualBalance: Math.max(0, item.leaveBalance.annualTotal - used),
            },
          };
        }
        return item;
      })
    );

    setShowLeaveModal(false);
    setNewLeaveReason("");
    setNewLeaveRelief("");
  };

  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === newAdvanceEmployee) || employees[0];
    const monthly = Math.round(newAdvanceAmount / Math.max(1, newAdvanceTenure));

    const newAdv: SalaryAdvance = {
      id: `SA-2026-${String(salaryAdvances.length + 7).padStart(3, "0")}`,
      advanceCode: `SA-2026-${String(salaryAdvances.length + 7).padStart(3, "0")}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      requestDate: "2026-10-16",
      requestedAmount: Number(newAdvanceAmount),
      tenureMonths: Number(newAdvanceTenure),
      monthlyDeduction: monthly,
      reason: newAdvanceReason || "Short-term financial commitment / family contingency.",
      status: "Pending Approval",
      repaidAmount: 0,
      remainingAmount: Number(newAdvanceAmount),
    };

    setSalaryAdvances([newAdv, ...salaryAdvances]);
    setShowAdvanceModal(false);
    setNewAdvanceReason("");
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === newExpenseEmployee) || employees[0];

    const newExp: ExpenseClaim = {
      id: `EXP-2026-${String(expenseClaims.length + 116).padStart(3, "0")}`,
      claimCode: `EXP-2026-${String(expenseClaims.length + 116).padStart(3, "0")}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      claimDate: "2026-10-16",
      category: newExpenseCategory,
      project: newExpenseProject,
      receiptNumber: newExpenseReceipt || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: Number(newExpenseAmount),
      description: newExpenseDesc || "Project emergency operation expenses.",
      status: "Pending Review",
    };

    setExpenseClaims([newExp, ...expenseClaims]);
    setShowExpenseModal(false);
    setNewExpenseReceipt("");
    setNewExpenseDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Unified White and Blue Theme */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              <Users className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              HR Management & Workforce Operations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Human capital operations: Employee Leave Entitlements, WPS-compliant Payslips, Salary Advances & Site Expense Claims.
          </p>
        </div>

        {/* Action Buttons - Unified Brand Blue & Clean Outlines */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Apply for Leave</span>
          </button>
          <button
            onClick={() => setShowAdvanceModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
          >
            <DollarSign className="h-3.5 w-3.5 text-blue-600" />
            <span>Salary Advance</span>
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
          >
            <Receipt className="h-3.5 w-3.5 text-blue-600" />
            <span>Submit Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Clean Unified White & Blue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active Staff</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalEmployeesCount}</span>
            <span className="text-[11px] font-semibold text-blue-600">
              {totalEmployeesCount - onLeaveCount} on site
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{onLeaveCount} on Leave</span>
            <span className="text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-bold">100% GCC Visa</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leave Applications</span>
            <Palmtree className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{leaveRequests.length}</span>
            <span className="text-[11px] font-semibold text-blue-600">
              {pendingLeavesCount} awaiting approval
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Quota Balance Tracked</span>
            <span className="text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-bold">WPS Linked</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Oct 2026 Net Payroll</span>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              AED {totalOctoberNetPayroll.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>6 Employees Processed</span>
            <span className="text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-bold">Ready for WPS</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Advances & Site Claims</span>
            <Receipt className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              AED {(totalActiveAdvanceBalance + pendingExpenseAmount).toLocaleString()}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Adv: AED {totalActiveAdvanceBalance.toLocaleString()}</span>
            <span>Claims: AED {pendingExpenseAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Date Filter & Control Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Module Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setActiveTab("leaves")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                activeTab === "leaves"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Palmtree className="h-4 w-4" />
              <span>Leave Management</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "leaves" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {filteredLeaveRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("payslips")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                activeTab === "payslips"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>WPS Payslips & Payroll</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "payslips" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {filteredPayslips.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("advances")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                activeTab === "advances"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Salary Advance</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "advances" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {filteredAdvances.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                activeTab === "expenses"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>Expense Claims</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "expenses" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {filteredExpenses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("directory")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                activeTab === "directory"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Staff Directory</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "directory" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {filteredEmployees.length}
              </span>
            </button>
          </div>
        </div>

        {/* Date Filter & Search Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Start Date & End Date Inputs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-800 text-xs focus:outline-none"
              />
            </div>

            {/* Quick date presets */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuickDate("ALL")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  !startDate && !endDate
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setQuickDate("OCT")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  startDate === "2026-10-01" && endDate === "2026-10-31"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Oct 2026
              </button>
              <button
                onClick={() => setQuickDate("SEP")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  startDate === "2026-09-01" && endDate === "2026-09-30"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Sep 2026
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={() => setQuickDate("ALL")}
                  className="px-2 py-1 rounded text-[11px] text-blue-600 hover:bg-blue-50 font-medium"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* Search and Department Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, code, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Road Infrastructure Operations">Road Infrastructure</option>
              <option value="Tendering & Cost Engineering">Tendering & Cost</option>
              <option value="Procurement & Supply Chain">Procurement</option>
              <option value="Fleet Workshop & Machinery">Fleet & Workshop</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: LEAVE MANAGEMENT & BALANCES */}
      {activeTab === "leaves" && (
        <div className="space-y-6">
          {/* Sub-view switcher & Leave Balance Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setLeaveSubView("requests")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  leaveSubView === "requests"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Leave Requests Register ({filteredLeaveRequests.length})
              </button>
              <button
                onClick={() => setLeaveSubView("balances")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  leaveSubView === "balances"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Employee Leave Balances & Entitlements
              </button>
            </div>

            <button
              onClick={() => setShowLeaveModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Submit Leave Request</span>
            </button>
          </div>

          {/* Balance Cards Summary - Unified Clean White and Blue */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Annual Leave Entitlement (30 Days)</span>
                <Palmtree className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Mandatory UAE Labour Law 30 Calendar Days per annum.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Company Avg Balance:</span>
                <span className="font-extrabold text-blue-700">14.3 Days remaining</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Sick Leave Quota (15 Days Full Pay)</span>
                <ShieldCheck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                DHA / MOHAP Certified medical coverage.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Available Pool:</span>
                <span className="font-extrabold text-blue-700">12.5 Days average balance</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 transition">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Emergency & Compassionate (5 Days)</span>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Family emergencies and bereavement leave.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Requests This Month:</span>
                <span className="font-extrabold text-blue-700">1 Request Approved</span>
              </div>
            </div>
          </div>

          {/* Sub-view: Requests Table */}
          {leaveSubView === "requests" ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Leave Applications & Approvals</h3>
                  <p className="text-xs text-slate-500">Track and authorize staff absence with work relief assignment</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Showing {filteredLeaveRequests.length} records</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Leave Ref</th>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Dates & Duration</th>
                      <th className="py-3 px-4">Relief Officer</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No leave requests match your date or search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaveRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{req.id}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{req.employeeName}</span>
                            <span className="text-[10px] text-slate-400">{req.department}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                              <Palmtree className="h-3 w-3 text-blue-600" />
                              {req.leaveType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {req.startDate} → {req.endDate}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                              {req.days} {req.days === 1 ? "Day" : "Days"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{req.reliefStaff || "—"}</td>
                          <td className="py-3 px-4 max-w-xs text-slate-600 truncate" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 ${
                                req.status === "Approved"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : req.status.includes("Pending")
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {req.status === "Approved" && <CheckCircle2 className="h-3 w-3 text-blue-600" />}
                              {req.status.includes("Pending") && <Clock className="h-3 w-3 text-amber-600" />}
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {req.status.includes("Pending") || req.status.includes("Review") ? (
                              <button
                                onClick={() => {
                                  setLeaveRequests((prev) =>
                                    prev.map((r) => (r.id === req.id ? { ...r, status: "Approved", approvedBy: "GM / HR" } : r))
                                  );
                                }}
                                className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-[10px] hover:bg-blue-700 transition"
                              >
                                Approve
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Approved</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Sub-view: Employee Balances Grid */
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Employee Leave Balances & Quota Tracker</h3>
                <p className="text-xs text-slate-500">Breakdown of annual, sick, and emergency leave balances per personnel</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Annual Leave (30d)</th>
                      <th className="py-3 px-4">Sick Leave (15d)</th>
                      <th className="py-3 px-4">Emergency (5d)</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => {
                      const annualPct = Math.round((emp.leaveBalance.annualUsed / emp.leaveBalance.annualTotal) * 100);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{emp.name}</span>
                            <span className="font-mono text-[10px] text-slate-400">{emp.employeeCode}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <span>{emp.designation}</span>
                            <span className="text-[10px] text-slate-400 block">{emp.department}</span>
                          </td>
                          <td className="py-3 px-4 min-w-[180px]">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-blue-800">
                                {emp.leaveBalance.annualBalance} Days Left
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {emp.leaveBalance.annualUsed} / {emp.leaveBalance.annualTotal} used
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-blue-600"
                                style={{ width: `${annualPct}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">
                              {emp.leaveBalance.sickBalance} Days Avail.
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {emp.leaveBalance.sickUsed} days recorded
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">
                              {emp.leaveBalance.emergencyBalance} Days Avail.
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {emp.leaveBalance.emergencyUsed} days taken
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setNewLeaveEmployee(emp.id);
                                setShowLeaveModal(true);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 font-semibold text-[10px] transition"
                            >
                              + Apply Leave
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYSLIPS & WPS PAYROLL */}
      {activeTab === "payslips" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">WPS Compliant Payroll & Monthly Payslips</h3>
              <p className="text-xs text-slate-500">
                Official electronic salary transfers compliant with UAE Ministry of Human Resources & Emiratisation (MOHRE).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Central Bank SIF Generated</span>
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Payslip Ref</th>
                    <th className="py-3 px-4">Month / Period</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Basic Pay</th>
                    <th className="py-3 px-4">Allowances & OT</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Salary</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayslips.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No payslips match your date range or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPayslips.map((ps) => {
                      const totalAllowances = ps.housingAllowance + ps.transportAllowance + ps.overtimeAmount;
                      return (
                        <tr key={ps.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{ps.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {ps.monthYear}
                            <span className="text-[10px] text-slate-400 block">{ps.periodStart} → {ps.periodEnd}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{ps.employeeName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{ps.employeeCode}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">AED {ps.basicSalary.toLocaleString()}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            +AED {totalAllowances.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {ps.totalDeductions > 0 ? `-AED ${ps.totalDeductions.toLocaleString()}` : "AED 0"}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-900 text-sm">
                            AED {ps.netSalary.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                ps.status === "Paid"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {ps.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedPayslip(ps)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-[10px] hover:bg-blue-700 transition"
                            >
                              <FileText className="h-3 w-3" />
                              <span>View Payslip</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALARY ADVANCE */}
      {activeTab === "advances" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employee Salary Advance Register</h3>
              <p className="text-xs text-slate-500">
                Short-term interest-free corporate salary advances with automatic monthly payroll deduction schedules.
              </p>
            </div>
            <button
              onClick={() => setShowAdvanceModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Request Salary Advance</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Advance Ref</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Request Date</th>
                    <th className="py-3 px-4">Total Advance</th>
                    <th className="py-3 px-4">Monthly Deduction</th>
                    <th className="py-3 px-4">Repayment Progress</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdvances.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No salary advances match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAdvances.map((adv) => {
                      const pct = Math.round((adv.repaidAmount / adv.requestedAmount) * 100);
                      return (
                        <tr key={adv.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{adv.advanceCode}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{adv.employeeName}</span>
                            <span className="text-[10px] text-slate-400">{adv.department}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{adv.requestDate}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            AED {adv.requestedAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            AED {adv.monthlyDeduction.toLocaleString()} / mo
                            <span className="text-[10px] text-slate-400 block">{adv.tenureMonths} Months tenure</span>
                          </td>
                          <td className="py-3 px-4 min-w-[160px]">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-semibold text-blue-800">AED {adv.repaidAmount} Paid</span>
                              <span className="text-slate-500">AED {adv.remainingAmount} Bal</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs text-slate-600 truncate" title={adv.reason}>
                            {adv.reason}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                adv.status === "Fully Settled"
                                  ? "bg-slate-100 text-slate-800 border border-slate-200"
                                  : adv.status.includes("Active")
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {adv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {adv.status === "Pending Approval" ? (
                              <button
                                onClick={() => {
                                  setSalaryAdvances((prev) =>
                                    prev.map((a) =>
                                      a.id === adv.id
                                        ? {
                                            ...a,
                                            status: "Active / Repaying",
                                            disbursedDate: "2026-10-16",
                                            approvedBy: "H.E. Saeed Fala Al-Falasi (GM)",
                                          }
                                        : a
                                    )
                                  );
                                }}
                                className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-[10px] hover:bg-blue-700 transition"
                              >
                                Approve
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Authorized</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSE CLAIMS */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project & Site Operations Expense Claims</h3>
              <p className="text-xs text-slate-500">
                Staff out-of-pocket reimbursements for site materials, fuel, equipment spares, and client coordination.
              </p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Submit Expense Claim</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Claim Ref</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Claimant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Project / Cost Center</th>
                    <th className="py-3 px-4">Receipt Ref</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No expense claims found for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">{exp.claimCode}</td>
                        <td className="py-3 px-4 text-slate-600">{exp.claimDate}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{exp.employeeName}</span>
                          <span className="text-[10px] text-slate-400">{exp.department}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-700 font-medium truncate" title={exp.project}>
                          {exp.project}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{exp.receiptNumber}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          AED {exp.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              exp.status === "Approved & Paid"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : exp.status.includes("Pending")
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {exp.status !== "Approved & Paid" ? (
                            <button
                              onClick={() => {
                                setExpenseClaims((prev) =>
                                  prev.map((e) =>
                                    e.id === exp.id
                                      ? {
                                          ...e,
                                          status: "Approved & Paid",
                                          approvedBy: "Finance Director",
                                          settledDate: "2026-10-16",
                                        }
                                      : e
                                  )
                                );
                              }}
                              className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-[10px] hover:bg-blue-700 transition"
                            >
                              Reimburse
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STAFF DIRECTORY & VISA COMPLIANCE */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personnel Roster & GCC Visa Compliance</h3>
              <p className="text-xs text-slate-500">
                Key technical workforce, emergency contacts, compensation structures, and visa expiry tracking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-200 hover:shadow-xs transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold flex items-center justify-center text-sm">
                      {emp.name
                        .split(" ")
                        .map((x) => x[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                      <span className="font-mono text-[10px] text-slate-400 block">{emp.employeeCode}</span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      emp.status === "Active"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Designation:</span>
                    <span className="font-semibold text-slate-800">{emp.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-700">{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Package:</span>
                    <span className="font-mono font-bold text-slate-900">
                      AED {(emp.basicSalary + emp.housingAllowance + emp.transportAllowance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">UAE Visa Expiry:</span>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                        emp.visaStatus === "Expiring Soon"
                          ? "bg-amber-50 text-amber-700 border border-amber-200 font-bold"
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}
                    >
                      {emp.visaExpiry} ({emp.visaStatus})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">{emp.phone}</span>
                  <button
                    onClick={() => {
                      setNewLeaveEmployee(emp.id);
                      setShowLeaveModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                  >
                    Apply Leave &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: APPLY FOR LEAVE */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palmtree className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm">Submit Employee Leave Application</h3>
              </div>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Select Employee
                </label>
                <select
                  value={newLeaveEmployee}
                  onChange={(e) => setNewLeaveEmployee(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.designation} (Bal: {emp.leaveBalance.annualBalance} days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Leave Type
                </label>
                <select
                  value={newLeaveType}
                  onChange={(e) => setNewLeaveType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Annual Leave">Annual Leave (Full Pay)</option>
                  <option value="Sick Leave">Sick Leave (Medical Certificate)</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Pilgrimage / Hajj">Pilgrimage / Hajj Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newLeaveStart}
                    onChange={(e) => setNewLeaveStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newLeaveEnd}
                    onChange={(e) => setNewLeaveEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Relief Officer / Handover Colleague
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins / Site Deputy"
                  value={newLeaveRelief}
                  onChange={(e) => setNewLeaveRelief(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Reason & Contact Details while Away
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Reason for leave and overseas contact phone..."
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST SALARY ADVANCE */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm">Request Salary Advance</h3>
              </div>
              <button onClick={() => setShowAdvanceModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvance} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Select Employee
                </label>
                <select
                  value={newAdvanceEmployee}
                  onChange={(e) => setNewAdvanceEmployee(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — Basic: AED {emp.basicSalary.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Advance Amount (AED)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    max={30000}
                    step={500}
                    required
                    value={newAdvanceAmount}
                    onChange={(e) => setNewAdvanceAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Repayment Tenure (Months)
                  </label>
                  <select
                    value={newAdvanceTenure}
                    onChange={(e) => setNewAdvanceTenure(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months</option>
                    <option value={5}>5 Months</option>
                    <option value={6}>6 Months</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-blue-900 font-bold block">Monthly Payroll Deduction:</span>
                  <span className="text-[10px] text-blue-700">Auto-deducted on monthly WPS processing</span>
                </div>
                <span className="text-base font-extrabold text-blue-900 font-mono">
                  AED {Math.round(newAdvanceAmount / Math.max(1, newAdvanceTenure)).toLocaleString()} / mo
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Reason for Advance Request
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Annual house rent cheque, medical contingency, family tuition fees..."
                  value={newAdvanceReason}
                  onChange={(e) => setNewAdvanceReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs transition"
                >
                  Submit Advance Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUBMIT EXPENSE CLAIM */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm">Submit Project Expense Claim</h3>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Claimant (Employee)
                </label>
                <select
                  value={newExpenseEmployee}
                  onChange={(e) => setNewExpenseEmployee(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Expense Category
                  </label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Site Fuel & Petrol">Site Fuel & Petrol</option>
                    <option value="Emergency Materials / Tools">Emergency Materials / Tools</option>
                    <option value="Client Hospitality">Client Hospitality</option>
                    <option value="Safety & PPE Supplies">Safety & PPE Supplies</option>
                    <option value="Site Travel & Tolls">Site Travel & Tolls</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Claim Amount (AED)
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Project / Cost Center Allocation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RTA Highway D54 Expansion - Package 2"
                  value={newExpenseProject}
                  onChange={(e) => setNewExpenseProject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Receipt / Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ENOC-INV-77281"
                  value={newExpenseReceipt}
                  onChange={(e) => setNewExpenseReceipt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Expense Description & Business Justification
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Details of expense incurred on site..."
                  value={newExpenseDesc}
                  onChange={(e) => setNewExpenseDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs transition"
                >
                  Submit Expense Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAILED OFFICIAL PAYSLIP VOUCHER (PRINTABLE) */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Official Salary Voucher (WPS Payslip)</h3>
                  <span className="text-[10px] text-slate-400">Fala Road Contracting L.L.C. — Dubai, UAE</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs text-white font-medium transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* Company & Voucher Meta */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-blue-900">FALA ROAD CONTRACTING L.L.C.</h2>
                  <p className="text-[11px] text-slate-500">Infrastructure, Highway Engineering & Asphalt Contracting</p>
                  <p className="text-[10px] text-slate-400">P.O. Box 49200, Dubai, United Arab Emirates | TRN: 100293847200003</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-blue-800 block">{selectedPayslip.id}</span>
                  <span className="text-[11px] font-bold text-slate-900 block mt-1">Period: {selectedPayslip.monthYear}</span>
                  <span className="text-[10px] text-slate-500 block">WPS Ref: {selectedPayslip.wpsRef || "WPS-PENDING"}</span>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Employee Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPayslip.employeeName}</span>
                  <span className="text-[11px] text-slate-600 block mt-1">{selectedPayslip.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Employee ID / Code</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayslip.employeeCode}</span>
                  <span className="text-[11px] text-slate-600 block mt-1">{selectedPayslip.department}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Bank Name</span>
                  <span className="font-semibold text-slate-800">{selectedPayslip.bankName}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">IBAN Number</span>
                  <span className="font-mono text-slate-700">{selectedPayslip.iban}</span>
                </div>
              </div>

              {/* Breakdown Table: Earnings vs Deductions */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 p-2 px-3 font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                    Earnings (AED)
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary:</span>
                      <span className="font-mono font-semibold">AED {selectedPayslip.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Housing Allowance:</span>
                      <span className="font-mono font-semibold">AED {selectedPayslip.housingAllowance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transport Allowance:</span>
                      <span className="font-mono font-semibold">AED {selectedPayslip.transportAllowance.toLocaleString()}</span>
                    </div>
                    {selectedPayslip.overtimeAmount > 0 && (
                      <div className="flex justify-between text-blue-700">
                        <span>Overtime ({selectedPayslip.overtimeHours} hrs):</span>
                        <span className="font-mono font-semibold">+AED {selectedPayslip.overtimeAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Earnings:</span>
                      <span className="font-mono">AED {selectedPayslip.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 p-2 px-3 font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                    Deductions (AED)
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Salary Advance Deduction:</span>
                      <span className="font-mono text-slate-700">
                        {selectedPayslip.deductions.advanceRepayment > 0
                          ? `-AED ${selectedPayslip.deductions.advanceRepayment.toLocaleString()}`
                          : "AED 0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Unpaid Absence Days:</span>
                      <span className="font-mono text-slate-700">
                        {selectedPayslip.deductions.unpaidLeave > 0
                          ? `-AED ${selectedPayslip.deductions.unpaidLeave.toLocaleString()}`
                          : "AED 0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">GOSI Pension (if UAE National):</span>
                      <span className="font-mono text-slate-700">
                        {selectedPayslip.deductions.gosiPension > 0
                          ? `-AED ${selectedPayslip.deductions.gosiPension.toLocaleString()}`
                          : "AED 0"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Deductions:</span>
                      <span className="font-mono text-slate-700">
                        AED {selectedPayslip.totalDeductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-4 rounded-xl bg-blue-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                    Net Take-Home Remuneration
                  </span>
                  <span className="text-xs text-blue-300">WPS Electronic Bank Transfer</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono tracking-tight">
                    AED {selectedPayslip.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
                <div className="border-t border-slate-300 pt-2">
                  <span className="font-bold text-slate-800 block">Fatima Al-Zahra</span>
                  <span className="text-[10px]">Head of Payroll & Treasury</span>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <span className="font-bold text-slate-800 block">H.E. Saeed Fala Al-Falasi</span>
                  <span className="text-[10px]">General Manager & Managing Director</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Computer-generated payroll advice. Verified by Fala Corporate Finance.
              </span>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
