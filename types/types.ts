import { LucideIcon, LucideProps } from "lucide-react";

export interface NavigationItemProps {
  icon: LucideIcon;
  href: string;
  title: string;
  badge?: Number;
  items?: {
    title: string;
    href: string;
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
  role?: Role[];
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
  createdAt: Date;
  updatedAt: Date;
  label: string;
  description: string | null;
};

// projects

export type ProjectT = {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  label: string;
  description: string | null;
  chiefId: number | null;
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
