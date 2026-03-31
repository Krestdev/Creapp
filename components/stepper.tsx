"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  BonsCommande,
  PaymentRequest,
  Reception,
  RequestModelT,
} from "@/types/types";
import { Check, X } from "lucide-react";
import { useRequestStepper, type StepDef } from "@/hooks/use-request-stepper";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StepItem {
  label: string;
  tooltip?: string;
}

export type StepState = "done" | "active" | "upcoming" | "error";

export interface StepperProps {
  steps: StepDef[];
  currentStep: number;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStepState(
  index: number,
  currentStep: number,
  step: StepDef,
): StepState {
  if (step.status === "error") return "error";
  if (step.status === "done" || index < currentStep) return "done";
  if (index === currentStep) return "active";
  return "upcoming";
}

const STATUS_LABEL: Record<StepState, string> = {
  done: "Terminée",
  active: "En cours",
  upcoming: "À venir",
  error: "Rejeté / Annulé",
};

// ─── Bubble ───────────────────────────────────────────────────────────────────

function StepBubble({ state, index }: { state: StepState; index: number }) {
  return (
    <div
      className={cn(
        "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border text-base font-medium transition-all duration-300",
        state === "done" &&
          "border-green-600 bg-green-600 text-primary-foreground",
        state === "active" &&
          "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
        state === "upcoming" && "border-border bg-muted text-muted-foreground",
        state === "error" && "border-destructive bg-destructive text-white",
      )}
    >
      {state === "done" && <Check className="size-5 stroke-[2.5]" />}
      {state === "error" && <X className="size-5 stroke-[2.5]" />}
      {(state === "active" || state === "upcoming") && <span>{index + 1}</span>}
    </div>
  );
}

// ─── Connector ────────────────────────────────────────────────────────────────

function StepConnector({ state }: { state: StepState }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute left-1/2 top-6 h-px w-full transition-colors duration-500",
        state === "done" && "bg-green-600/80",
        state === "error" && "bg-destructive/30",
        (state === "active" || state === "upcoming") && "bg-border",
      )}
    />
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

function StepLabel({ label, state }: { label: string; state: StepState }) {
  return (
    <span
      className={cn(
        "mt-2 max-w-[80px] text-center font-sans text-[11px] font-medium leading-tight transition-colors duration-300",
        state === "done" && "text-green-700",
        state === "active" && "text-primary",
        state === "upcoming" && "text-muted-foreground",
        state === "error" && "text-destructive",
      )}
    >
      {label}
    </span>
  );
}

// ─── Tooltip content ──────────────────────────────────────────────────────────

function StepTooltipContent({
  label,
  tooltip,
  state,
}: {
  label: string;
  tooltip?: string;
  state: StepState;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-xs font-semibold">{label}</p>
      {tooltip && (
        <p className="font-sans text-[11px] text-muted-foreground">{tooltip}</p>
      )}
      <span
        className={cn(
          "w-fit rounded-sm px-1.5 py-0.5 font-sans text-[10px] font-semibold",
          state === "done" && "bg-primary-100 text-primary-700",
          state === "active" && "bg-primary-100 text-primary",
          state === "upcoming" && "bg-muted text-muted-foreground",
          state === "error" && "bg-destructive/10 text-destructive",
        )}
      >
        {STATUS_LABEL[state]}
      </span>
    </div>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

export function Stepper({ steps, currentStep, className }: StepperProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <nav aria-label="Progression du besoin" className={cn("grid", className)}>
        <ol className="w-full flex items-start gap-5">
          {steps.map((step, index) => {
            const state = getStepState(index, currentStep, step);
            const isLast = index === steps.length - 1;

            return (
              <li
                key={index}
                aria-current={state === "active" ? "step" : undefined}
                className="relative flex flex-1 flex-col items-center"
              >
                {!isLast && <StepConnector state={state} />}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-default flex-col items-center focus:outline-none">
                      <StepBubble state={state} index={index} />
                      <StepLabel label={step.label} state={state} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[180px]">
                    <StepTooltipContent
                      label={step.label}
                      tooltip={step.tooltip}
                      state={state}
                    />
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ol>
      </nav>
    </TooltipProvider>
  );
}

// ─── RequestStepper (wrapper prêt à l'emploi) ────────────────────────────────

export interface RequestStepperProps {
  request: RequestModelT;
  tickets?: PaymentRequest[];
  bonCommandes?: BonsCommande[];
  receptions?: Reception[];
  className?: string;
}

/**
 * Wrapper tout-en-un : dérive automatiquement le circuit et l'état
 * depuis le besoin et les données associées.
 *
 * @example
 * <RequestStepper
 *   request={besoin}
 *   tickets={allTickets}
 *   bonCommandes={allBonCommandes}
 *   receptions={allReceptions}
 * />
 */
export function RequestStepper({
  request,
  tickets,
  bonCommandes,
  receptions,
  className,
}: RequestStepperProps) {
  const { steps, currentStep } = useRequestStepper({
    request,
    tickets,
    bonCommandes,
    receptions,
  });

  return (
    <Stepper steps={steps} currentStep={currentStep} className={className} />
  );
}

export default Stepper;
