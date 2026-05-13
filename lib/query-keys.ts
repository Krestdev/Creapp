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

  // ─── Requests ──────────────────────────────────────────────────────────────
  requests: ["requests"] as const,
  requestsUser: ["requests-user"] as const,
  requestsForApproval: ["requests-for-approval"] as const,
  pendingRequestApprovalsCount: ["pending-request-approvals-count"] as const,
  serviceRequestsCount: ["service-requests-count"] as const,
  usableRequestsCount: ["usable-requests-count"] as const,
  requestType: ["requestType"] as const,
  request: (id: number) => ["request", id] as const,

  // ─── Request Types ──────────────────────────────────────────────────────────
  requestTypes: ["requestTypes"] as const,

  // ─── Transactions ──────────────────────────────────────────────────────────
  transactions: ["transactions"] as const,
  pendingApprovalsTransactionsCount: [
    "pending-approvals-transactions-count",
  ] as const,
  pendingToSignTransfersCount: ["pending-to-sign-transfers-count"] as const,
  pendingTransfersCount: ["pending-transfers-count"] as const,

  // ─── Commands / Purchase Orders ────────────────────────────────────────────
  commands: ["commands"] as const,
  pendingCommandRequestsCount: ["pending-commandRequests-count"] as const,
  purchaseOrders: ["purchaseOrders"] as const,
  purchaseOrdersPendingCount: ["purchaseOrders-pending-count"] as const,

  // ─── Quotations ────────────────────────────────────────────────────────────
  quotations: ["quotations"] as const,
  quotationToAssignCount: ["quotation-to-assign-count"] as const,

  // ─── Banks ─────────────────────────────────────────────────────────────────
  banks: ["banks"] as const,

  // ─── Payment Types ─────────────────────────────────────────────────────────
  paymentTypes: ["paymentTypes"] as const,

  // ─── Providers ─────────────────────────────────────────────────────────────
  providers: ["providers"] as const,

  // ─── Projects ──────────────────────────────────────────────────────────────
  projects: ["projects"] as const,

  // ─── Categories ────────────────────────────────────────────────────────────
  categories: ["categories"] as const,

  // ─── Signataires ───────────────────────────────────────────────────────────
  signataires: ["signataires"] as const,

  // ─── Receptions ────────────────────────────────────────────────────────────
  receptions: ["receptions"] as const,

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

  // ─── Services ──────────────────────────────────────────────────────────────
  services: ["services"] as const,

  // ─── Departments ───────────────────────────────────────────────────────────
  departmentList: ["departmentList"] as const,

  // ─── Signature ─────────────────────────────────────────────────────────────
  signature: (userId: number) => ["signature", userId] as const,
} as const;
