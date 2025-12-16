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
  color: "red" | "blue" | "green" | "none";
  children?: React.ReactNode;
}

export type UserRole = "admin" | "user";

// export type User = {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
// };

export type User = {
  id?: number;
  email: string;
  name: string;
  phone?: string;
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
  benef: number[] | null;
  beficiaryList?: { id: number; name: string; email: string }[] | null;
  state: string;
  proprity: "medium" | "high" | "low" | "urgent";
  projectId: number | null;
  categoryId: number | null;
  category?: number | null;
  revieweeList?: Review[] | null;
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
  isSpecial: boolean;
  description?: string;
  parentId: number;
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
  rating?: number;
  taxId?: string;
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

export type QuotationStatus = "SUBMITTED" | "APPROUVED" | "REJECTED" | "PENDING";
export type QuotationElementStatus = "SELECTED" | "NOT_SELECTED";

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
  state: "pending" | "paid" | "approved";
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
    elementIds: Array<number>
  }>
};

type MemberInput = {
  id?: number; // optional for new members
  label: string;
  userId: number;
  validator: boolean;
  chief: boolean;
  finalValidator: boolean;
};

export type BonsCommande = {
  id: number;
  deviId: number;
  providerId: number;
  amountBase: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "approved" | "pending" | "in-review" | "rejected";
  penaltyMode?: string;
  hasPenalties?: boolean;
  deliveryLocation?: string;
  paymentMethod: string;
  paymentTerms: string;
  deliveryDelay: Date;
  createdAt: Date;
  updatedAt: Date;
};
