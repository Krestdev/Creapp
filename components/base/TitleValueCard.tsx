import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'

interface Props {
  title: string
  value: string
  className: string
  valColor: string
}

const TitleValueCard = ({ title, value, className, valColor }: Props) => {
  return (
    <div className={`${className} w-full flex flex-col gap-2 p-5 shadow-[0px_8px_6px_-6px_rgba(0,0,0,0.1)] rounded-[12px] box-border min-h-0`}>
      <p className='text-sm font-medium'>{title}</p>
      <p className={`${valColor} text-[32px] leading-[1.2]`}>{value}</p> {/* Ajouter leading */}
    </div>
  )
}

export default TitleValueCard

const statisticVariants = cva(
  "w-full flex flex-col gap-2 p-5 shadow-[0px_8px_6px_-6px_rgba(0,0,0,0.1)] rounded-[12px] box-border min-h-0", // Retirer h-full, ajouter box-border et min-h-0
  {
    variants: {
      variant: {
        default: "bg-white border border-input text-foreground",
        primary: "bg-primary-600 border border-primary-200 text-white",
        secondary: "bg-secondary-600 border border-secondary-200 text-white",
        dark: "bg-gray-900 border border-input text-white",
        destructive: "bg-[#9E1315] border border-red-200 text-white",
        success: "bg-[#15803D] border border-green-200 text-white",
        amber: "bg-amber-600 border border-amber-200 text-white",
        blue: "bg-blue-600 border border-blue-200 text-white"
      },
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface StatisticProps {
  title: string;
  value: string | number;
  variant: VariantProps<typeof statisticVariants>["variant"];
  valueClassName?: string;
  className?: string;
  more?: {
    title: string;
    value: string | number;
  }
}

function getMoreClassName(variant: StatisticProps["variant"]): HTMLHRElement["className"] {
  switch (variant) {
    case "default":
      return "text-gray-400";
    default: return "text-gray-200";
  }
}

function getBorderClassName(variant: StatisticProps["variant"]): HTMLHRElement["className"] {
  switch (variant) {
    case "dark":
      return "border border-gray-600";
    case "primary":
      return "border border-primary-200";
    case "secondary":
      return "border border-secondary-200";
    case "destructive":
      return "border border-red-200";
    case "success":
      return "border border-green-200";
    default: return "border border-input";
  }
}

export const StatisticCard = ({ 
  title, 
  value, 
  more, 
  className = "", 
  variant, 
  valueClassName = "" 
}: StatisticProps) => {
  return (
    <div className={cn(
      statisticVariants({ variant: variant }), 
      className,
      "overflow-hidden" // Ajouter overflow-hidden
    )}>
      <h4 className={cn(
        "text-sm font-medium line-clamp-1", // Ajouter line-clamp-1
        variant === "default" ? "text-gray-600" : "text-gray-200"
      )}>
        {title}
      </h4>
      
      <span className={cn(
        "font-mono font-medium text-[32px] leading-[1.2] tracking-tight", // Changer leading
        valueClassName
      )}>
        {value}
      </span>
      
      {!!more && (
        <>
          <hr className={getBorderClassName(variant)} />
          <div className="flex items-center text-xs"> {/* Conteneur flex */}
            <span className={cn("font-mono", getMoreClassName(variant))}>
              {more.title}:
            </span>
            <span className={cn(
              "font-medium ml-1",
              variant === "default" ? "text-foreground" : "text-white"
            )}>
              {more.value}
            </span>
          </div>
        </>
      )}
    </div>
  )
}