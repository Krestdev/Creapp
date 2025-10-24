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
  id: number;
  email: string;
  name: string;
  phone: string;
  password: string;
  projectId: number | null;
  verificationOtp: null;
  verified: true;
  createdAt: string;
  updatedAt: string;
  role: [
    {
      id: number;
      label: string;
    }
  ];
};

export interface UserTest extends User {
  password: string;
}
