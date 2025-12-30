import { Provider } from "@/types/types";
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

export const formatToShortName = (
  fullName: string | undefined | null
): string => {
  if (!fullName) return "Undefined";

  const parts = fullName.trim().split(/\s+/); // Gère les doubles espaces

  if (parts.length <= 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const secondInitial = parts[1].charAt(0).toUpperCase();

  return `${firstName} ${secondInitial}.`;
};

export function isProviderValid(provider: Provider): boolean {
  if (
    !provider.NIU ||
    !provider.RCCM ||
    !provider.address ||
    !provider.email ||
    !provider.phone ||
    !provider.regem ||
    !provider.plan_localisation ||
    !provider.acf ||
    !provider.carte_contribuable ||
    !provider.banck_attestation
  )
    return false;
  return true;
}

export const TranslateRole = (role: string) => {
  switch (role) {
    case "USER":
      return "Emetteur";
    case "MANAGER":
      return "Validateur";
    case "SALES":
      return "Responsable d'achat";
    case "SALES_MANAGER":
      return "Donneur d'ordre d'achat";
    case "ADMIN":
      return "Administrateur";
    case "VOLT":
      return "Trésorier";
    case "VOLT-MANAGER":
      return "Donneur d'ordre de décaissement";
    default:
      return role;
  }
};
