/**
 * Clés de requête centralisées pour React Query.
 *
 * ⚠️ Toute nouvelle clé doit être ajoutée ici et utilisée via ce fichier.
 * Ne jamais écrire les clés en dur dans les composants/pages.
 */

export const queryKeys = {
  // ─── Payments ──────────────────────────────────────────────────────────────
  payments: (...args: any[]) => ["payments", ...args] as const,
  paymentsStats: (...args: any[]) => ["payments-stats", ...args] as const,
  voltPendingCount: ["volt-pending-count"] as const,
  pendingDepenseCount: ["pending-depense-count"] as const,
  paymentsToSignCount: ["payments-to-sign-count"] as const,
  payment: (id: number) => ["payment", id] as const,
  depenses: (...args: any[]) => ["depenses", ...args] as const,
  depensesStats: (...args: any[]) => ["depenses-stats", ...args] as const,
  tickets: (...args: any[]) => ["tickets", ...args] as const,
  ticketsStats: (...args: any[]) => ["tickets-stats", ...args] as const,
  signatureRequests: (...args: any[]) =>
    ["signatureRequests", ...args] as const,
  signatureRequestsStats: (...args: any[]) =>
    ["signatureRequests-stats", ...args] as const,
  dashboardPaidData: (...args: any[]) =>
    ["dashboardPaidData", ...args] as const,
  approvisionnement: (...args: any[]) =>
    ["approvisionnement", ...args] as const,

  // ─── Requests ──────────────────────────────────────────────────────────────
  requests: ["requests"] as const,
  requestsUser: (...args: any[]) => ["requests-user", ...args] as const,
  allRequests: (...args: any[]) => ["allRequests", ...args] as const,
  allRequestsStats: (...args: any[]) => ["allRequests-stats", ...args] as const,
  requestsForApproval: (...args: any[]) =>
    ["requests-for-approval", ...args] as const,
  requestsForApprovalStats: (...args: any[]) =>
    ["requests-for-approval-stats", ...args] as const,
  pendingRequestApprovalsCount: ["pending-request-approvals-count"] as const,
  serviceRequestsCount: ["service-requests-count"] as const,
  usableRequestsCount: ["usable-requests-count"] as const,
  requestType: ["requestType"] as const,
  request: (id: number) => ["request", id] as const,
  dashboardStats: (...args: any[]) => ["dashboardStats", ...args] as const,
  dashboardGraph: (...args: any[]) => ["dashboardGraph", ...args] as const,

  // ─── Request Types ──────────────────────────────────────────────────────────
  requestTypes: ["requestTypes"] as const,

  // ─── Transactions ──────────────────────────────────────────────────────────
  transactions: ["transactions"] as const,
  pendingApprovalsTransactionsCount: [
    "pending-approvals-transactions-count",
  ] as const,
  pendingToSignTransfersCount: ["pending-to-sign-transfers-count"] as const,
  pendingTransfersCount: ["pending-transfers-count"] as const,
  transaction: (id: number) => ["transaction", id] as const,

  // ─── Commands / Purchase Orders ────────────────────────────────────────────
  commands: ["commands"] as const,
  pendingCommandRequestsCount: ["pending-commandRequests-count"] as const,
  purchaseOrders: ["purchaseOrders"] as const,
  purchaseOrdersPendingCount: ["purchaseOrders-pending-count"] as const,
  purchaseOrder: (id: number) => ["purchaseOrder", id] as const,

  // ─── Quotations ────────────────────────────────────────────────────────────
  quotations: ["quotations"] as const,
  quotationToAssignCount: ["quotation-to-assign-count"] as const,

  // ─── Banks ─────────────────────────────────────────────────────────────────
  banks: ["banks"] as const,
  bank: (id: number) => ["bank", id] as const,

  // ─── Payment Types ─────────────────────────────────────────────────────────
  paymentTypes: ["paymentTypes"] as const,
  paymentType: (id: number) => ["paymentType", id] as const,

  // ─── Providers ─────────────────────────────────────────────────────────────
  providers: ["providers"] as const,
  provider: (id: number) => ["provider", id] as const,

  // ─── Projects ──────────────────────────────────────────────────────────────
  projects: ["projects"] as const,
  project: (id: number) => ["project", id] as const,

  // ─── Categories ────────────────────────────────────────────────────────────
  categories: ["categories"] as const,
  category: (id: number) => ["category", id] as const,

  // ─── Signataires ───────────────────────────────────────────────────────────
  signataires: ["signataires"] as const,
  signataire: (id: number) => ["signataire", id] as const,

  // ─── Receptions ────────────────────────────────────────────────────────────
  receptions: ["receptions"] as const,
  reception: (id: number) => ["reception", id] as const,

  // ─── Users ─────────────────────────────────────────────────────────────────
  users: ["users"] as const,
  user: (id: number) => ["user", id] as const,

  // ─── Roles ─────────────────────────────────────────────────────────────────
  roles: ["roles"] as const,

  // ─── Vehicles ──────────────────────────────────────────────────────────────
  vehicles: ["vehicles"] as const,
  vehicle: (id: number) => ["vehicle", id] as const,

  // ─── Drivers ───────────────────────────────────────────────────────────────
  drivers: ["drivers"] as const,

  // ─── Invoices ──────────────────────────────────────────────────────────────
  invoices: ["invoices"] as const,
  invoice: (id: number) => ["invoice", id] as const,

  // ─── Services ──────────────────────────────────────────────────────────────
  services: ["services"] as const,
  service: (id: number) => ["service", id] as const,

  // ─── Departments ───────────────────────────────────────────────────────────
  departmentList: ["departmentList"] as const,

  //Conditions
  conditions: ["conditions"] as const,

  // ─── Signature ─────────────────────────────────────────────────────────────
  signature: (userId: number) => ["signature", userId] as const,
} as const;
