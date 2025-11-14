import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const XAF = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
});
