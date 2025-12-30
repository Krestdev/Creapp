import { LucideIcon } from "lucide-react";
import React from "react";

export interface NavigationItemProps {
  pageId: string;
  icon: LucideIcon;
  href: string;
  authorized: string[];
  title: string;
  badge?: number;
  items?: {
    pageId: string;
    title: string;
    href: string;
    authorized: string[];
    badge?: number;
  }[];
}

export interface PageTitleProps {
  title: string;
  subtitle: string;
  color?: "red" | "blue" | "green" | "none";
  children?: React.ReactNode;
}

export type UserRole = "admin" | "user";

// export type User = {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
// };
export const PAYMENT_TYPES = [
  { value: "FAC", name: "Facilitation" },
  { value: "RH", name: "Ressources Humaines" },
  { value: "SPECIAL", name: "Spécial" },
  { value: "PURCHASE", name: "Achat" },
] as const;

export type PaymentRequest = {
  id: number;
  reference: string;
  proof:string;
  status: string;
  type: (typeof PAYMENT_TYPES)[number]["value"];
  title: string;
  price: number;
  priority: (typeof PRIORITIES)[number]["value"];
  userId: number;
  commandId?: number | null;
  requestId?: number | null;
  projectId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
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
  createdAt?: Date;
  updatedAt?: Date;
  label: string;
  description: string | null;
  chief: { id: number; name: string };
  status: string;
  budget: number;
};

// Request / Besoin

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
  beficiaryList?: { id: number; name: string; email: string }[] | null;
  state: string;
  priority: "medium" | "high" | "low" | "urgent";
  projectId?: number | null;
  project?: ProjectT;
  categoryId?: number | null;
  category?: number | null;
  revieweeList?: Review[] | null;
  proof?: (string | File)[] | null | undefined;
  type?: "SPECIAL" | "RH" | "FAC";
  amount?: number;
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

export type LoginResponse = {
  user: User;
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

export type QuotationStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "PENDING";
export type QuotationElementStatus = "SELECTED" | "REJECTED";

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
  payementMethod?: string;
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
  deliveryLocation?: string;
  paymentMethod: string;
  paymentTerms: string;
  deliveryDelay: Date;
  motif?: string;
  createdAt: Date;
  updatedAt: Date;
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

export type Reception = {
  reference: string;
  id: number;
  commandId: number;
  proof: string;
  deliverables: string;
  deadline: Date;
  status: string;
  providerId: number;
  userId: number;
  createdAt: Date;
  updatedAt?: Date;
};

type Item = {
  ref: string;
  designation: string;
  qty: number;
  puHt: number;
  tva: number; // percent
};

export type BonDeCommande = {
  numero: string;
  dateCreation: string; // iso or readable
  imprimePar: string;
  imprimeLe: string;
  company: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  fournisseur: {
    nom: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    niu?: string;
    email?: string;
    telephone?: string;
  };
  client: {
    nom: string;
    adresse?: string;
    ville?: string;
    pays?: string;
  };
  items: Item[];
  totals: {
    totalHt: number;
    remise: number;
    tva: number;
    isirda: number;
    net: number;
  };
  amountInWords?: string;
  conditions?: string;
};
