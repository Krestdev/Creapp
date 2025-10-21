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
  color: "red" | "blue" | "green";
  links?: {
    title: string;
    href: string;
  }[];
}

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export interface UserTest extends User {
  password: string;
}
