"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-4 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

/**
 * `line` (défaut) = onglets de filtre / d'état avec compteur (Figma · Tab),
 * rangée à bordure basse, espacement 24 px.
 * `segmented` = sélecteur compact (Figma · PeriodSelector).
 */
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        line: "w-full gap-6 border-b border-border-default",
        segmented: "gap-0.5 rounded-md bg-surface-muted p-[3px]",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  }
)

function TabsList({
  className,
  variant = "line",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  count,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  count?: React.ReactNode
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group/tab relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors outline-none focus-visible:shadow-focus-ring disabled:pointer-events-none disabled:text-text-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // line
        "group-data-[variant=line]/tabs-list:-mb-px group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:px-1 group-data-[variant=line]/tabs-list:py-2.5 group-data-[variant=line]/tabs-list:text-body-medium group-data-[variant=line]/tabs-list:text-text-secondary group-data-[variant=line]/tabs-list:hover:border-border-strong group-data-[variant=line]/tabs-list:hover:text-text-primary group-data-[variant=line]/tabs-list:data-active:border-brand group-data-[variant=line]/tabs-list:data-active:text-body-strong group-data-[variant=line]/tabs-list:data-active:text-brand",
        // segmented
        "group-data-[variant=segmented]/tabs-list:rounded-sm group-data-[variant=segmented]/tabs-list:px-3 group-data-[variant=segmented]/tabs-list:py-1.5 group-data-[variant=segmented]/tabs-list:text-body group-data-[variant=segmented]/tabs-list:text-text-secondary group-data-[variant=segmented]/tabs-list:hover:text-text-primary group-data-[variant=segmented]/tabs-list:data-active:bg-surface group-data-[variant=segmented]/tabs-list:data-active:text-body-strong group-data-[variant=segmented]/tabs-list:data-active:text-text-primary group-data-[variant=segmented]/tabs-list:data-active:shadow-[0_1px_2px_rgb(0_0_0/0.08)]",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-surface-muted px-1.5 text-overline leading-[18px] tracking-normal text-text-secondary group-data-active/tab:bg-brand group-data-active/tab:text-text-on-brand">
          {count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
