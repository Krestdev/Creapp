import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const XAF = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
});

export const parseFrenchDate = (dateString: string): Date | undefined => {
  if (!dateString || dateString === "Non définie") return undefined;

  const cleanedDate = dateString.trim();
  const parts = cleanedDate.split("/");

  if (parts.length !== 3) return undefined;

  const [day, month, year] = parts.map((part) => parseInt(part, 10));

  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1000)
    return undefined;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};