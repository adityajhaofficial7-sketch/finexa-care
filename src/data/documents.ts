export type DocCategory =
  | "GST Notices"
  | "Client Onboarding"
  | "Audit & Compliance"
  | "Tax Documents"
  | "Client Communication";

export interface ExtraField {
  key: string;
  label: string;
  type: "text" | "date" | "number";
}

export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  category: DocCategory;
  savesMin: number;
  extraFields: ExtraField[];
}

export const CATEGORIES: DocCategory[] = [
  "GST Notices",
  "Client Onboarding",
  "Audit & Compliance",
  "Tax Documents",
  "Client Communication",
];

export const DOCUMENTS: DocTemplate[] = [
  {
    id: "asmt10",
    name: "Reply to ASMT-10 (Scrutiny Notice)",
    description: "Formal response to GST scrutiny of returns under Sec 61.",
    category: "GST Notices",
    savesMin: 60,
    extraFields: [
      { key: "noticeRef", label: "Notice Reference Number", type: "text" },
      { key: "noticeDate", label: "Notice Date", type: "date" },
      { key: "taxPeriod", label: "Tax Period", type: "text" },
      { key: "discrepancyAmount", label: "Discrepancy Amount (₹)", type: "number" },
    ],
  },
  {
    id: "drc01",
    name: "Reply to DRC-01 (Tax Demand)",
    description: "Reply to show-cause notice raising tax demand under GST.",
    category: "GST Notices",
    savesMin: 45,
    extraFields: [
      { key: "noticeRef", label: "DRC-01 Reference Number", type: "text" },
      { key: "noticeDate", label: "Notice Date", type: "date" },
      { key: "demandAmount", label: "Demand Amount (₹)", type: "number" },
      { key: "taxPeriod", label: "Tax Period", type: "text" },
    ],
  },
  {
    id: "reg03",
    name: "Reply to REG-03 (Registration Query)",
    description: "Response to clarifications sought during GST registration.",
    category: "GST Notices",
    savesMin: 30,
    extraFields: [
      { key: "arn", label: "ARN", type: "text" },
      { key: "queryDate", label: "Query Date", type: "date" },
      { key: "queryDetails", label: "Query Summary", type: "text" },
    ],
  },
  {
    id: "engagement",
    name: "CA Engagement Letter",
    description: "Defines scope, fees and responsibilities for a new client.",
    category: "Client Onboarding",
    savesMin: 40,
    extraFields: [
      { key: "engagementDate", label: "Engagement Date", type: "date" },
      { key: "scope", label: "Scope of Services", type: "text" },
      { key: "fees", label: "Annual Fee (₹)", type: "number" },
    ],
  },
  {
    id: "checklist",
    name: "Document Checklist Request",
    description: "List of documents required from a new client for onboarding.",
    category: "Client Onboarding",
    savesMin: 20,
    extraFields: [
      { key: "purpose", label: "Purpose (ITR/GST/Audit)", type: "text" },
      { key: "deadlineDate", label: "Submit By", type: "date" },
    ],
  },
  {
    id: "noc",
    name: "NOC Request from Previous CA",
    description: "Professional communication requesting NOC per ICAI ethics.",
    category: "Client Onboarding",
    savesMin: 30,
    extraFields: [
      { key: "previousCAName", label: "Previous CA Name", type: "text" },
      { key: "previousCAFirm", label: "Previous CA Firm", type: "text" },
    ],
  },
  {
    id: "mrl",
    name: "Management Representation Letter",
    description: "Standard MRL for statutory audit engagements.",
    category: "Audit & Compliance",
    savesMin: 90,
    extraFields: [
      { key: "financialYear", label: "Financial Year", type: "text" },
      { key: "auditDate", label: "Audit Report Date", type: "date" },
    ],
  },
  {
    id: "compcert",
    name: "Compliance Certificate",
    description: "Certifies statutory and regulatory compliance for a period.",
    category: "Audit & Compliance",
    savesMin: 30,
    extraFields: [
      { key: "period", label: "Period Covered", type: "text" },
      { key: "issueDate", label: "Issue Date", type: "date" },
    ],
  },
  {
    id: "itrcover",
    name: "ITR Covering Letter",
    description: "Cover letter accompanying filed Income Tax Return.",
    category: "Tax Documents",
    savesMin: 20,
    extraFields: [
      { key: "assessmentYear", label: "Assessment Year", type: "text" },
      { key: "ackNumber", label: "ITR Acknowledgement No.", type: "text" },
      { key: "filingDate", label: "Filing Date", type: "date" },
    ],
  },
  {
    id: "advtax",
    name: "Advance Tax Advisory Letter",
    description: "Quarterly advance tax computation and payment advisory.",
    category: "Tax Documents",
    savesMin: 45,
    extraFields: [
      { key: "quarter", label: "Quarter (Q1/Q2/Q3/Q4)", type: "text" },
      { key: "estimatedIncome", label: "Estimated Income (₹)", type: "number" },
      { key: "advanceTaxDue", label: "Advance Tax Due (₹)", type: "number" },
      { key: "dueDate", label: "Due Date", type: "date" },
    ],
  },
  {
    id: "pendingdocs",
    name: "Pending Documents Reminder",
    description: "Polite reminder for documents pending from the client.",
    category: "Client Communication",
    savesMin: 15,
    extraFields: [
      { key: "pendingItems", label: "Pending Items", type: "text" },
      { key: "neededBy", label: "Needed By", type: "date" },
    ],
  },
  {
    id: "feecover",
    name: "Fee Invoice Covering Letter",
    description: "Covering letter forwarding a professional fee invoice.",
    category: "Client Communication",
    savesMin: 15,
    extraFields: [
      { key: "invoiceNumber", label: "Invoice Number", type: "text" },
      { key: "invoiceDate", label: "Invoice Date", type: "date" },
      { key: "amount", label: "Amount (₹)", type: "number" },
    ],
  },
];
