import { badgeVariants } from "@/components/ui/badge";
import {
  Bank,
  BANK_TYPES,
  BonsCommande,
  Provider,
  QuotationElement,
  RequestModelT,
  RequestType,
  Role,
  Transaction,
  TRANSACTION_TYPES,
  User,
  PaymentRequest,
  PayType,
  Quotation,
  PRIORITIES,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { DateRange } from "react-day-picker";
import { twMerge } from "tailwind-merge";

interface typesProps {
  type: RequestModelT["type"];
  requestTypes: Array<RequestType>;
}

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
  fullName: string | undefined | null,
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
    case "SUPERADMIN":
      return "Super Administrateur";
    case "ADMIN":
      return "Administrateur";
    case "VOLT":
      return "Trésorier";
    case "VOLT_MANAGER":
      return "Donneur d'ordre de décaissement";
    case "RH":
      return "Ressources Humaines";
    case "ACCOUNTANT":
      return "Comptable";
    case "DRIVER":
      return "Conducteur";
    default:
      return role;
  }
};

export function totalAmountPurchase(payload: BonsCommande): number {
  return payload.devi.element.reduce(
    (total, el) => total + el.priceProposed * el.quantity,
    0,
  );
}

// Fonction pour calculer le pourcentage du payment d'un bon
export function paymentPercentage(payload: BonsCommande): number {
  return (
    (payload.devi.element.reduce(
      (total, el) => total + el.priceProposed * el.quantity,
      0,
    ) /
      totalAmountPurchase(payload)) *
    100
  );
}

interface RoleCheck {
  roleList: Role[];
  role:
    | "SUPERADMIN"
    | "admin"
    | "achat"
    | "Donner d'ordre achat"
    | "trésorier"
    | "Donneur d'ordre décaissement"
    | "rh"
    | "comptable"
    | "manager"
    | "conducteur";
}
export function isRole({ roleList, role }: RoleCheck): boolean {
  if (roleList.some((r) => r.label === "SUPERADMIN")) {
    return true;
  }
  if (roleList.some((r) => r.label === "ADMIN") && role === "admin") {
    return true;
  }
  if (role === "manager" && roleList.some((r) => r.label === "MANAGER")) {
    return true;
  }
  if (
    role === "achat" &&
    roleList.some((r) => r.label === "SALES" || r.label === "SALES_MANAGER")
  ) {
    return true;
  }
  if (
    role === "Donner d'ordre achat" &&
    roleList.some((r) => r.label === "SALES_MANAGER")
  ) {
    return true;
  }
  if (role === "trésorier" && roleList.some((r) => r.label === "VOLT")) {
    return true;
  }
  if (
    role === "Donneur d'ordre décaissement" &&
    roleList.some((r) => r.label === "VOLT_MANAGER")
  ) {
    return true;
  }
  if (role === "rh" && roleList.some((r) => r.label === "RH")) {
    return true;
  }
  if (role === "comptable" && roleList.some((r) => r.label === "ACCOUNTANT")) {
    return true;
  }
  if (role === "conducteur" && roleList.some((r) => r.label === "DRIVER")) {
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
    "#372772",
  ];
  const value = !!id
    ? id % colors.length
    : Math.floor(Math.random() * colors.length);
  return colors[value];
}

export const getPeriodType = (
  range: DateRange | undefined,
): "day" | "week" | "month" => {
  if (!range?.from || !range?.to) return "month";

  const diffDays = Math.floor(
    (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 7) return "day";
  if (diffDays <= 31) return "week";
  return "month";
};

export const getUserName = (
  users: Array<User>,
  userId?: number,
): string | undefined => {
  if (!userId) return undefined;
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return "Utilisateur introuvable";
  }
  return user.firstName.concat(" ", user.lastName);
};

export const getQuotationAmount = (devis: Quotation, providers: Provider[]) => {
  const isValue = (providerId: number): number => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return 0;
    if (!provider.regem) return 0;
    if (provider.regem === "Réel") return 0.022;
    return 0.055;
  };
  return devis.element.reduce((total, i) => {
    const isIr = !i.hasIs ? 0 : isValue(devis.providerId);
    const tva = i.tva / 100;
    const reduction = i.reduction / 100;
    return (
      total + i.priceProposed * i.quantity * (1 - reduction) * (1 - isIr + tva)
    );
  }, 0);
};

export function subText({
  text,
  length = 50,
}: {
  text: string;
  length?: number;
}) {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + "...";
}

export function getRequestTypeBadge({ type, requestTypes }: typesProps): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const typeData = requestTypes.find((t) => t.type === type);
  const label = typeData?.label ?? type;
  switch (type) {
    case "facilitation":
      return { label, variant: "lime" };
    case "achat":
      return { label, variant: "sky" };
    case "speciaux":
      return { label, variant: "purple" };
    case "ressource_humaine":
      return { label, variant: "blue" };
    case "gas":
      return { label, variant: "teal" };
    case "transport":
      return { label, variant: "primary" };
    case "others":
      return { label, variant: "dark" };
    default:
      return { label, variant: "outline" };
  }
}

export function getBankTypeBadge({ type }: { type: Bank["type"] }): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const typeData = BANK_TYPES.find((t) => t.value === type);
  const label = typeData?.name ?? "Inconnu";
  switch (type) {
    case "BANK":
      return { label, variant: "blue" };
    case "CASH_REGISTER":
      return { label, variant: "primary" };
    case "CASH":
      return { label, variant: "lime" };
    default:
      return { label: type, variant: "outline" };
  }
}

export function getTransactionTypeBadge(type: Transaction["Type"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const typeData = TRANSACTION_TYPES.find((t) => t.value === type);
  const label = typeData?.name ?? "Inconnu";

  switch (type) {
    case "CREDIT":
      return { label, variant: "success" };
    case "DEBIT":
      return { label, variant: "destructive" };
    case "TRANSFER":
      return { label, variant: "blue" };
    default:
      return { label: type, variant: "outline" };
  }
}

export function getPaymentTypeBadge({
  type,
  typeList,
}: {
  type: PaymentRequest["type"];
  typeList: RequestType[];
}): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const typeData = typeList.find((t) => t.type === type);
  const label = typeData?.label ?? type;
  switch (type) {
    case "facilitation":
      return { label, variant: "lime" };
    case "achat":
      return { label, variant: "sky" };
    case "speciaux":
      return { label, variant: "purple" };
    case "ressource_humaine":
      return { label, variant: "blue" };
    case "gas":
      return { label, variant: "teal" };
    case "transport":
      return { label, variant: "primary" };
    case "others":
      return { label, variant: "dark" };
    default:
      return { label, variant: "outline" };
  }
}

export function getPaymentPriorityBadge({
  priority,
}: {
  priority: PaymentRequest["priority"];
}): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const label = PRIORITIES.find((c) => c.value === priority)?.name ?? "Inconnu";
  switch (priority) {
    case "low":
      return {
        label,
        variant: "amber",
      };
    case "medium":
      return {
        label,
        variant: "success",
      };
    case "high":
      return {
        label,
        variant: "destructive",
      };
    case "urgent":
      return {
        label,
        variant: "primary",
      };
    default:
      return {
        label: "Inconnu",
        variant: "outline",
      };
  }
}

export const formatFCFA = (value?: number) => {
  if (typeof value !== "number") return "0 FCFA";

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
};

export const getModifiedProps = ({
  data,
}: {
  data: RequestModelT;
}): Array<{ key: string; userId: number }> => {
  //To-Do
  const oldReq = data.requestOlds;
  if (!oldReq || oldReq.length === 0) return [];
  //const oldValues = oldReq.
  return [];
};
