import { BonsCommande, Provider, Role } from "@/types/types";
import { clsx, type ClassValue } from "clsx";
import { DateRange } from "react-day-picker";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const company = {
  name: "CREACONSULT",
  address: "BP 11735 Douala - Cameroun",
  phone: "233 42 63 05",
  email: "creaconsult@yahoo.fr",
};

export const XAF = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
});

export function formatXAF(value: number) {
  return `${value.toLocaleString("fr-FR").replace(/\s/g, " ")} FCFA`;
}

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
      return "Employé";
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
    case "VOLT_MANAGER":
      return "Donneur d'ordre de décaissement";
    case "RH":
      return "Ressources Humaines";
    default:
      return role;
  }
};

export function totalAmountPurchase(payload: BonsCommande): number {
  return payload.devi.element.reduce((total, el) => total + el.priceProposed * el.quantity, 0)
}

// Fonction pour calculer le pourcentage du payment d'un bon
export function paymentPercentage(payload: BonsCommande): number {
  return (payload.devi.element.reduce((total, el) => total + el.priceProposed * el.quantity, 0) / totalAmountPurchase(payload)) * 100
}

interface RoleCheck {
  roleList: Role[];
  role: "admin" | "achat" | "Donner d'ordre achat" | "trésorier" | "Donneur d'ordre décaissement" | "rh" | "comptable";
}
export function isRole({ roleList, role }: RoleCheck): boolean {
  if (roleList.some(r => r.label === "ADMIN")) {
    return true;
  }
  if (role === "achat" && roleList.some(r => r.label === "SALES" || r.label === "SALES_MANAGER")) {
    return true;
  }
  if (role === "Donner d'ordre achat" && roleList.some(r => r.label === "SALES_MANAGER")) {
    return true;
  }
  if (role === "trésorier" && roleList.some(r => r.label === "VOLT")) {
    return true;
  }
  if (role === "Donneur d'ordre décaissement" && roleList.some(r => r.label === "VOLT_MANAGER")) {
    return true;
  }
  if (role === "rh" && roleList.some(r => r.label === "RH")) {
    return true;
  }
  if (role === "comptable" && roleList.some(r => r.label === "ACCOUNTANT")) {
    return true;
  }
  return false;
}

export function getRandomColor(id?: number) {
  const colors = [
    "var(--primary-600)",
    "var(--secondary-600)",
    "#E4B363",
    "#8963BA",
    "#F85E00",
    "#31CB00",
    "#59C3C3",
    "#2E86AB",
    "#3A3335",
    "#5E2BFF",
    "#2A9D8F",
    "#37000A",
    "#806D40",
    "#E4FF1A",
    "#1BE7FF",
    "#218380",
    "#DBCBD8",
    "#F4D35E",
    "#372772"
  ];
  const value = !!id ? id % colors.length : Math.floor(Math.random() * colors.length);
  return colors[value]
}

export const getPeriodType = (
  range: DateRange | undefined
): "day" | "week" | "month" => {
  if (!range?.from || !range?.to) return "month";

  const diffDays = Math.floor(
    (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 7) return "day";
  if (diffDays <= 31) return "week";
  return "month";
};