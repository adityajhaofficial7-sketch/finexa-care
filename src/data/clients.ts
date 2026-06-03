export type ComplianceStatus = "OVERDUE" | "Due Soon" | "Upcoming" | "Filed";

export interface ComplianceRow {
  id: string;
  clientName: string;
  gstin: string;
  complianceType: string;
  dueDate: string; // display
  dueDateISO: string;
  daysLeft: number;
  status: ComplianceStatus;
}

export interface Client {
  id: string;
  name: string;
  gstin: string;
  phone: string;
  email: string;
  businessType: "Proprietorship" | "Partnership" | "Pvt Ltd" | "LLP";
  compliances: string[];
  status: "Active" | "Inactive";
}

export const initialCompliances: ComplianceRow[] = [
  { id: "c1", clientName: "Sharma Traders", gstin: "07AABCS1234R1ZX", complianceType: "GSTR-3B", dueDate: "20 Jun 2026", dueDateISO: "2026-06-20", daysLeft: 17, status: "Upcoming" },
  { id: "c2", clientName: "Krishna Enterprises", gstin: "29GGGGG1314R9Z6", complianceType: "GSTR-1", dueDate: "11 Jun 2026", dueDateISO: "2026-06-11", daysLeft: 8, status: "Due Soon" },
  { id: "c3", clientName: "Patel Pharma", gstin: "24AACP1234K1ZX", complianceType: "TDS Return Q4", dueDate: "31 May 2026", dueDateISO: "2026-05-31", daysLeft: -3, status: "OVERDUE" },
  { id: "c4", clientName: "Gupta Steel", gstin: "09AABCG5432R1ZX", complianceType: "GSTR-3B", dueDate: "20 Jun 2026", dueDateISO: "2026-06-20", daysLeft: 17, status: "Upcoming" },
  { id: "c5", clientName: "Anand Textiles", gstin: "27AABCA9876R1ZX", complianceType: "ITR Filing", dueDate: "31 Jul 2026", dueDateISO: "2026-07-31", daysLeft: 58, status: "Upcoming" },
  { id: "c6", clientName: "Ravi Logistics", gstin: "07AABCR7654R1ZX", complianceType: "GSTR-9 Annual", dueDate: "5 Jun 2026", dueDateISO: "2026-06-05", daysLeft: 2, status: "Due Soon" },
  { id: "c7", clientName: "Delhi Sweets", gstin: "07AABCD2345R1ZX", complianceType: "ROC Filing", dueDate: "30 May 2026", dueDateISO: "2026-05-30", daysLeft: -4, status: "OVERDUE" },
];

export const initialClients: Client[] = [
  { id: "1", name: "Sharma Traders", gstin: "07AABCS1234R1ZX", phone: "+91 98100 12345", email: "accounts@sharmatraders.in", businessType: "Proprietorship", compliances: ["GST Monthly", "TDS"], status: "Active" },
  { id: "2", name: "Krishna Enterprises", gstin: "29GGGGG1314R9Z6", phone: "+91 98450 67890", email: "finance@krishnaent.in", businessType: "Partnership", compliances: ["GST Monthly", "ITR"], status: "Active" },
  { id: "3", name: "Patel Pharma", gstin: "24AACP1234K1ZX", phone: "+91 99250 33445", email: "ap@patelpharma.in", businessType: "Pvt Ltd", compliances: ["TDS", "ROC", "GST Monthly"], status: "Active" },
  { id: "4", name: "Gupta Steel", gstin: "09AABCG5432R1ZX", phone: "+91 99100 22113", email: "finance@guptasteel.in", businessType: "Pvt Ltd", compliances: ["GST Monthly", "TDS", "ROC"], status: "Active" },
  { id: "5", name: "Anand Textiles", gstin: "27AABCA9876R1ZX", phone: "+91 98200 76543", email: "ca@anandtextiles.in", businessType: "LLP", compliances: ["ITR", "GST Annual"], status: "Active" },
  { id: "6", name: "Ravi Logistics", gstin: "07AABCR7654R1ZX", phone: "+91 98101 99887", email: "accounts@ravilogistics.in", businessType: "Proprietorship", compliances: ["GST Annual", "ITR"], status: "Active" },
  { id: "7", name: "Delhi Sweets", gstin: "07AABCD2345R1ZX", phone: "+91 98111 55667", email: "ca@delhisweets.in", businessType: "Pvt Ltd", compliances: ["ROC", "GST Monthly", "PF/ESI"], status: "Active" },
];

export const COMPLIANCE_OPTIONS = ["GST Monthly", "GST Annual", "TDS", "ITR", "ROC", "PF/ESI"] as const;
export const BUSINESS_TYPES = ["Proprietorship", "Partnership", "Pvt Ltd", "LLP"] as const;
