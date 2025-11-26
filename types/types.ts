import { LucideIcon, LucideProps } from "lucide-react";

export interface NavigationItemProps {
  pageId: string;
  icon: LucideIcon;
  href: string;
  authorized: string[];
  title: string;
  badge?: Number;
  items?: {
    pageId: string;
    title: string;
    href: string;
    authorized: string[];
  }[];
}

export interface PageTitleProps {
  title: string;
  subtitle: string;
  color: "red" | "blue" | "green" | "none";
  links?: {
    title: string;
    href: string;
  }[];
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
  createdAt?: string;
  updatedAt?: string;
  role: Role[];
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
  label: string;
  description: string | null;
  members: Member[];
  createdAt: Date;
  updatedAt: Date;
};
export type Member = {
  id: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  departmentId: number;
  validator: boolean;
  chief: boolean;
  finalValidator: boolean;
};

// projects

export type ProjectT = {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  label: string;
  description: string | null;
  chiefId: number | null;
  budget: number | null;
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
  description: string | null;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CommandRequestT = {
  id?: number;
  providerId?: number | null;
  justification?: string;
  submitted?: boolean;
  deliveryDate?: Date;
  modality?: string;
  totalPrice?: number;
  reference?: string;
  updatedAt?: Date;
  createdAt?: Date;
  userId?: number;
  state?: string;
  dueDate: Date;
  title: string;
  requests?: number[];
  besoins?: RequestModelT[];
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
