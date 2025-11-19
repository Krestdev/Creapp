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
    finalValidator: boolean;
}

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
  createdAt: Date;
  updatedAt: Date;
  label: string;
  userId: number;
  description: string | null;
  quantity: number;
  dueDate: Date;
  unit: string;
  beneficiary: string;
  beficiaryList: number[] | null;
  state: string;
  proprity: string;
  projectId: number | null;
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
