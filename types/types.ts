import { LucideIcon } from "lucide-react";
import React from "react";
import { DateRange } from "react-day-picker";

export interface NavigationItemProps {
  pageId: string;
  icon: LucideIcon;
  href: string;
  authorized: string[];
  title: string;
  badgeValue?: number;
  items?: {
    pageId: string;
    icon?: LucideIcon;
    title: string;
    href: string;
    authorized: string[];
    badgeValue?: number;
    items?: {
      pageId: string;
      icon?: LucideIcon;
      title: string;
      href: string;
      authorized: string[];
      badgeValue?: number;
    }[];
  }[];
}

export interface PageTitleProps {
  title: string;
  subtitle: string;
  color?: "red" | "blue" | "green" | "none";
  links?: Array<NavLink>;
}

export type UserRole = "admin" | "user";

// export type User = {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
// };
export const PAYMENT_TYPES = [
  { value: "facilitation", name: "Facilitation" },
  { value: "ressource_humaine", name: "Ressources Humaines" },
  { value: "speciaux", name: "Spécial" },
  { value: "achat", name: "Achat" },
  { value: "CURRENT", name: "Dépenses Courantes" },
] as const;

export const PAYMENT_METHOD = [
  { value: "checks", name: "Chèque" },
  { value: "bank-transfer", name: "Virement" },
  { value: "cash", name: "Espèces" },
] as const;

export const PAY_STATUS = [
  { value: "pending", name: "En attente" },
  { value: "accepted", name: "Accepté" },
  { value: "rejected", name: "Rejeté" },
  { value: "cancelled", name: "Annulé" },
  { value: "validated", name: "Approuvé" },
  { value: "ghost", name: "Fantome" },
  { value: "paid", name: "Payé" },
  { value: "pending_depense", name: "en attente" },
  { value: "unsigned", name: "En attente de signature" },
  { value: "simple_signed", name: "Paiement ouvert" },
  { value: "signed", name: "Signé" },
  { value: "simple_signed", name: "Ouvert" },
] as const;

export type PaymentRequest = {
  id: number;
  reference: string;
  proof?: File | string | undefined;
  signeDoc?: File | string | undefined;
  signed?: boolean;
  account?: string;
  justification?: (string | File)[];
  status: (typeof PAY_STATUS)[number]["value"];
  type: (typeof PAYMENT_TYPES)[number]["value"];
  deadline: Date;
  title: string;
  description?: string;
  beneficiary?: User;
  benefId?: number;
  driverId?: number;

  model?: Vehicle;
  km?: number;
  liters?: number;

  price: number;
  priority: (typeof PRIORITIES)[number]["value"];
  isPartial: boolean;
  reason?: string;
  userId: number;
  commandId?: number | null;
  requestId?: number | null;
  projectId?: number | null;
  createdAt: string;
  updatedAt: string;

  vehiclesId?: number | null;
  bankId?: number | null;
  transactionId?: number | null;
  methodId?: number | null;
  signer?: User[] | null;
};

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  post?: string;
  password?: string;
  projectId?: number | null;
  verificationOtp?: number | null;
  verified?: boolean;
  status: string;
  lastConnection: string;
  createdAt?: string;
  updatedAt?: string;
  role: Role[];
  members: Member[];
  validators?: { id?: number; userId: number; rank: number }[];
};

export type Role = {
  id: number;
  label: string;
  users?: User[];
};

export interface UserTest extends User {
  password: string;
}

// Departement

export type DepartmentT = {
  id: number;
  reference: string;
  label: string;
  description: string | null;
  members: Member[];
  status: string; // "actif" | "inactif" | "en-reorganisation"
  createdAt: string;
  updatedAt: string;
};
export type Member = {
  id: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  departmentId: number;
  department?: DepartmentT;
  validator: boolean;
  chief: boolean;
  finalValidator: boolean;
  user?: User;
};

// projects

export type ProjectT = {
  id?: number;
  reference: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
  label: string;
  description: string | null;
  chief: { id: number; firstName: string; lastName: string; post: string };
  status: string;
  budget: number;
};

// Request / Besoin
export const REQUEST_STATUS = [
  { value: "pending", name: "En attente" },
  { value: "in-review", name: "En révision" },
  { value: "validated", name: "Validé" },
  { value: "rejected", name: "Rejeté" },
  { value: "cancel", name: "Annulé" },
  { value: "store", name: "Déstocké" },
] as const;

export type RequestModelT = {
  id: number;
  ref: string;
  createdAt: Date;
  updatedAt: Date;
  label: string;
  userId: number;
  description: string | null;
  quantity: number;
  dueDate: Date;
  unit: string;
  beneficiary: string;
  benef?: number[] | null;
  period?: DateRange | undefined;
  beficiaryList?:
  | { id: number; firstName: string; lastName: string; email: string }[]
  | null;
  state: (typeof REQUEST_STATUS)[number]["value"];
  priority: "medium" | "high" | "low" | "urgent";
  projectId?: number | null;
  project?: ProjectT;
  categoryId?: number | null;
  category?: number | null;
  proof?: (string | File)[] | null | undefined;
  type?: "speciaux" | "ressource_humaine" | "facilitation" | "achat";
  amount?: number;
  benFac?: { list: { id: number; name: string; amount: number }[] } | null;
  requestOlds?: Array<{
    id: number;
    dueDate: Date;
    priority: "medium" | "high" | "low" | "urgent";
    quantity: number;
    unit: string;
    amount?: number;
    createdAt: Date;
    userId: number;
  }>;
  validators: Array<{
    id: number;
    validated: boolean;
    decision?: string;
    rank: number;
    userId: number;
    requestModelId: number;
  }>;
};

export type TableData = {
  id: string;
  reference: string;
  title: string;
  project?: string;
  category: string;
  status: "pending" | "validated" | "rejected" | "in-review";
  emeteur: string;
  beneficiaires: string;
  limiteDate: Date | undefined;
  priorite: "low" | "medium" | "high" | "urgent";
  quantite: number;
  unite: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Champs supplémentaires pour la modification
  projectId?: string;
  categoryId?: string;
  beneficiary?: "me" | "groupe";
  benef?: number[]; // IDs des utilisateurs bénéficiaires si groupe
  dueDate?: Date; // Alias pour limiteDate
  label?: string; // Alias pour title
  unit?: string; // Alias pour unite
  quantity?: number; // Alias pour quantite
  state?: "pending" | "validated" | "rejected" | "in-review"; // Alias pour status
  proprity?: "low" | "medium" | "high" | "urgent"; // Alias pour priorite
  userId?: string; // ID de l'utilisateur émetteur
};

export type Review = {
  decision: string;
  validatorId: number;
  requestId: number;
  updatedAt?: Date;
  createdAt?: Date;
};

export type Category = {
  id: number;
  label: string;
  description?: string;
  validators: { id?: number; userId: number; rank: number }[];
  createdAt: Date;
  updatedAt: Date;
};

export type CommandRequestT = {
  id: number;
  deliveryDate: Date;
  reference: string;
  updatedAt?: Date;
  createdAt: Date;
  userId: number;
  dueDate: Date;
  title: string;
  requests?: number[];
  besoins: RequestModelT[];
  name?: string;
  phone?: string;
};

// queries response

export type ResponseT<T> = {
  message: string;
  data: T;
};

export type storedUser = Omit<User, "password">;

export type LoginResponse = {
  user: storedUser;
  token: string;
};

export type RegisterResponse = {
  user: User;
};

export type ProjectCreateResponse = {
  project: ProjectT;
};

export type Provider = {
  RCCM?: string;
  NIU?: string;
  regem?: string;
  address?: string;
  email?: string;
  phone?: string;
  updatedAt?: string;
  createdAt: string;
  id: number;
  name: string;
  carte_contribuable?: string | File;
  acf?: string | File;
  plan_localisation?: string | File;
  commerce_registre?: string | File;
  banck_attestation?: string | File;
};

export const QUOTATION_STATUS = [
  { value: "SUBMITTED", name: "Soumis" },
  { value: "APPROVED", name: "Approuvé" },
  { value: "REJECTED", name: "Rejeté" },
  { value: "PENDING", name: "En attente" },
] as const;

export const QUOTATION_ELEMENT_STATUS = [
  { value: "SELECTED", name: "Sélectionné" },
  { value: "REJECTED", name: "Rejeté" },
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUS)[number]["value"];
export type QuotationElementStatus = (typeof QUOTATION_ELEMENT_STATUS)[number]["value"];

export type QuotationElement = {
  id: number;
  requestModelId: number;
  title: string;
  quantity: number;
  unit: string;
  priceProposed: number;
  deviId: number;
  status: QuotationElementStatus;
};

export type Quotation = {
  id: number;
  element: Array<QuotationElement>;
  ref: string;
  createdAt: string;
  updatedAt?: string;
  status: QuotationStatus;
  commandRequestId: number;
  providerId: number;
  proof: string | File;
  dueDate: string;
  userId: number;
  commandId?: undefined;
  isPartial?: boolean;
  amount?: number;
  paymentMethod?: string;
  priority?: string;
  commandRequest: CommandRequestT;
};

export type TicketsData = {
  id: string;
  reference: string;
  fournisseur: string;
  bonDeCommande: string;
  moyenPaiement: string;
  comptePayeur: string;
  montant: number;
  priorite: "low" | "medium" | "high" | "urgent";
  state: "gost " | "pending" | "paid" | "approved";
  createdAt: Date;
  updatedAt: Date;
};

export type QuotationGroupStatus =
  | "NOT_PROCESSED"
  | "IN_PROGRESS"
  | "PROCESSED";
export interface QuotationGroup {
  commandRequest: CommandRequestT;
  quotations: Array<Quotation>;
  providers: Array<Provider>;
  status: QuotationGroupStatus;
  createdAt: Date;
}
export type DepartmentUpdateInput = Partial<{
  label: string;
  description: string | null;
  status: string;
  members: MemberInput[];
}>;

export type SubmissionElement = {
  deviId: number;
  elements: Array<{
    name: string;
    elementIds: Array<number>;
  }>;
};

type MemberInput = {
  id?: number; // optional for new members
  label: string;
  userId: number;
  validator: boolean;
  chief: boolean;
  finalValidator: boolean;
};

export const PENALITY_MODE = [{ value: "day", name: "Forfaitaire" }];

export const PURCHASE_ORDER_STATUS = [
  { value: "APPROVED", name: "Approuvé" },
  { value: "PENDING", name: "En attente" },
  { value: "IN-REVIEW", name: "En révision" },
  { value: "REJECTED", name: "Rejeté" },
  { value: "PAID", name: "Payé" },
] as const;

export const PRIORITIES = [
  { value: "low", name: "Basse" },
  { value: "medium", name: "Normale" },
  { value: "high", name: "Élevée" },
  { value: "urgent", name: "Urgent" },
] as const;

export type BonsCommande = {
  id: number;
  reference: string;
  devi: Quotation;
  deviId: number;
  providerId: number;
  provider: Provider;
  amountBase: number;
  priority: (typeof PRIORITIES)[number]["value"];
  status: (typeof PURCHASE_ORDER_STATUS)[number]["value"];
  penaltyMode?: string;
  hasPenalties?: boolean;
  instalments: Array<{
    percentage: number;
    deadLine: string;
    status: boolean;
  }>;
  deliveryLocation?: string;
  paymentMethod: string;
  paymentTerms?: string;
  deliveryDelay: Date;
  motif?: string;
  createdAt: Date;
  updatedAt: Date;
  rabaisAmount: number; // réduction exceptionnelle
  remiseAmount: number; // réduction commerciale
  ristourneAmount: number; // réduction a posteriori
  escompteRate: number;
  keepTaxes: boolean;
  netToPay: number;
  commandConditions: Array<CommandCondition>;
};

export interface NavLink {
  title: string;
  href: string;
  disabled?: boolean;
  hide?: boolean;
}

export type DateFilter =
  | "today"
  | "week"
  | "month"
  | "year"
  | "custom"
  | undefined;

export const RECEPTION_STATUS = [
  { value: "PENDING", name: "En attente" },
  { value: "PARTIAL", name: "Partielle" },
  { value: "COMPLETED", name: "Complète" },
] as const;

export type Reception = {
  Reference: string;
  id: number;
  commandId: number;
  Proof: string;
  Deadline: Date;
  Status: (typeof RECEPTION_STATUS)[number]["value"];
  providerId: number;
  userId: number;
  createdAt: Date;
  updatedAt?: Date;
  Command: BonsCommande;
  Provider: Provider;
  Deliverables: Array<QuotationElement & { isDelivered: boolean }>;
};

type Item = {
  ref: string;
  designation: string;
  qty: number;
  puHt: number;
  tva: number; // percent
};

export type Notification = {
  id: number;
  title: string;
  type: string;
  message: string;
  userId: number;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export const notificationRoutes: Record<string, string> = {
  BESOIN_A_VALIDER: "/tableau-de-bord/besoins/validation",
  BESOIN_VALIDE: "/tableau-de-bord/besoins/mylist",

  DEVIS_A_VALIDER: "/tableau-de-bord/commande/devis/approbation",
  BON_COMMANDE_CREE: "/tableau-de-bord/commande/bon-de-commande",

  PAIEMENT_A_VALIDER: "/tableau-de-bord/ticket",
  PAIEMENT_VALIDE: "/tableau-de-bord/ticket",
  PAIEMENT_PAYE: "/tableau-de-bord/ticket",
};

export type NavigationLinkProps = {
  href: string;
  title: string;
  icon?: LucideIcon;
  badgeValue?: number;
};

export const BANK_TYPES = [
  { value: "BANK", name: "Banque" },
  { value: "CASH", name: "Sous-Caisse" },
  { value: "CASH_REGISTER", name: "Caisse Principale" },
  { value: "null", name: "Aucun" },
] as const;

export type Bank = {
  id: number;
  label: string;
  type: (typeof BANK_TYPES)[number]["value"];
  balance: number;
  Status: boolean;
  justification: string;
  accountNumber?: string;
  bankCode?: string;
  atmCode?: string;
  key?: string;
  phoneNum?: string;
  merchantNum?: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type TransactionSigners = {
  id: number;
  userId: number;
  user: User;
  transactionId: number;
  signed: boolean;
  signedAt: Date;
}

export const TRANSACTION_TYPES = [
  { value: "CREDIT", name: "Crédit" },
  { value: "DEBIT", name: "Débit" },
  { value: "TRANSFER", name: "Transfert" },
] as const;

export const TRANSACTION_STATUS = [
  { value: "APPROVED", name: "Complété" },
  { value: "PENDING", name: "En attente" },
  { value: "REJECTED", name: "Rejeté" },
  { value: "ACCEPTED", name: "Accepté" },
] as const;

export type TransactionBase = {
  id: number;
  label: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  status: (typeof TRANSACTION_STATUS)[number]["value"];
  Type: (typeof TRANSACTION_TYPES)[number]["value"];
  proof?: string;
  userId: number;
  reason?: string;
  validatorId?: number;
  docNumber?: string;
  methodId?: number;
  method?: PayType;
};

export type DebitTransaction = TransactionBase & {
  Type: "DEBIT";
  from: Bank;
  payement?: PaymentRequest | null;
  to: { id: number; label: string; accountNumber?: string; phoneNumber?: string };
};

export type CreditTransaction = TransactionBase & {
  Type: "CREDIT";
  from: { id: number; label: string; accountNumber?: string; phoneNumber?: string };
  to: Bank;
  payement?: PaymentRequest | null;
};

export type TransferTransaction = TransactionBase & {
  Type: "TRANSFER";
  from: Bank;
  to: Bank;
  payement?: PaymentRequest | null;
  isSigned: boolean;
  signers: Array<TransactionSigners>;
  signDoc?: string;
};

export type Transaction =
  | DebitTransaction
  | CreditTransaction
  | TransferTransaction;

export interface TableFilters {
  globalFilter: string;
  statusFilter: string;
  categoryFilter: string;
  projectFilter: string;
  userFilter: string;
  dateFilter?: "today" | "week" | "month" | "year" | "custom" | undefined;
  customDateRange?: { from: Date; to: Date } | undefined;
}

export type Vehicle = {
  id: number;
  label: string;
  mark: string;
  matricule: string;
  proof?: string | File;
  picture?: string | File;
  createdAt: string;
  updatedAt: string;
};

export type RequestType = {
  id: number;
  label: string;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt?: Date;
};

type SignMode = "ONE" | "BOTH";

export type Signatair = {
  id: number;
  userIds: number[];
  createdAt: Date;
  updatedAt: Date;
  bankId: number;
  mode: SignMode;
  payTypeId: number;
  user?: User[];
  payTypes?: PayType;
  Bank?: Bank;
};

export type PayType = {
  id: number;
  label: string | null;
  type?: string;
};

export type Driver = {
  id: number;
  firstName: string;
  lastName: string;
  licence?: string | File;
  idCard?: string | File;
};

export type CommandCondition = {
  id: number;
  title: string;
  content: string;
};
