import { cn } from "@/lib/utils";
import { StatCard, type StatCardTone } from "@/components/ds/stat-card";
import { LucideIcon } from "lucide-react";
import React from "react";

interface Props {
  title: string;
  value: string;
  className: string;
  valColor: string;
}

const TitleValueCard = ({ title, value, className, valColor }: Props) => {
  return (
    <div
      className={`${className} w-full flex flex-col gap-2 p-5 shadow-[0px_8px_6px_-6px_rgba(0,0,0,0.1)] rounded-[12px] box-border min-h-0`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className={`${valColor} text-[32px] leading-[1.2]`}>{value}</p>{" "}
      {/* Ajouter leading */}
    </div>
  );
};

export default TitleValueCard;

/**
 * Anciennes variantes de couleur, toujours acceptées par les pages. Le design
 * V2 (Figma · StatCard) n’a que trois tons sémantiques : `destructive` devient
 * « alerte » (rouge), `success` devient « bon » (valeur verte), toutes les
 * autres variantes s’affichent en carte standard.
 */
type StatisticVariant =
  | "default"
  | "primary"
  | "secondary"
  | "dark"
  | "destructive"
  | "success"
  | "amber"
  | "blue"
  | null
  | undefined;

const toneByVariant: Record<NonNullable<StatisticVariant>, StatCardTone> = {
  default: "default",
  primary: "default",
  secondary: "default",
  dark: "default",
  amber: "default",
  blue: "default",
  destructive: "alert",
  success: "good",
};

export interface StatisticProps {
  title: string;
  value: string | number;
  variant: StatisticVariant;
  valueClassName?: string;
  className?: string;
  more?: {
    title: string;
    value: string | number;
  };
  hideMore?: boolean;
  /** Remplace l’icône du ton. */
  Icon?: LucideIcon;
  /** Rend la carte cliquable (ouvre la liste filtrée) : affiche le chevron. */
  href?: string;
  onClick?: () => void;
}

export const StatisticCard = ({
  title,
  value,
  more,
  className = "",
  variant,
  valueClassName = "",
  hideMore = false,
  Icon,
  href,
  onClick,
}: StatisticProps) => {
  return (
    <StatCard
      label={title}
      value={value}
      tone={toneByVariant[variant ?? "default"]}
      delta={more ? `${more.title} : ${more.value}` : undefined}
      deltaClassName={hideMore ? "hidden sm:flex" : undefined}
      icon={Icon}
      href={href}
      onClick={onClick}
      valueClassName={valueClassName}
      className={cn("h-full", className)}
    />
  );
};
