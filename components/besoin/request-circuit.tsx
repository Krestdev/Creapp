"use client";

import { TimelineStep, type TimelineState } from "@/components/ds/process-timeline";
import { useRequestStepper } from "@/hooks/use-request-stepper";
import { cn } from "@/lib/utils";
import type {
  BonsCommande,
  PaymentRequest,
  Reception,
  RequestModelT,
  User,
} from "@/types/types";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

/**
 * Circuit du besoin (Figma · « Circuit du besoin ») : validation → bon de
 * commande → livraison, dérivé du besoin et des documents associés.
 */
export function RequestCircuit({
  request,
  ticket,
  bonCommandes,
  receptions,
}: {
  request: RequestModelT;
  ticket?: PaymentRequest;
  bonCommandes?: BonsCommande[];
  receptions?: Reception[];
}) {
  const { steps, currentStep } = useRequestStepper({
    request,
    ticket,
    bonCommandes,
    receptions,
  });
  if (!steps || steps.length === 0) return null;

  const stateOf = (index: number): TimelineState => {
    const step = steps[index];
    if (step.status === "error") return "rejected";
    if (step.status === "done" || index < currentStep) return "done";
    if (step.status === "cancelled") return "skipped";
    if (index === currentStep) return "current";
    return "upcoming";
  };

  return (
    <ol className="flex w-full items-start">
      {steps.map((step, index) => (
        <TimelineStep
          key={`${step.label}-${index}`}
          step={step.label}
          state={stateOf(index)}
          index={index + 1}
          showConnector={index < steps.length - 1}
        />
      ))}
    </ol>
  );
}

type Validator = RequestModelT["validators"][number];

/**
 * Circuit de validation (Figma · « Circuit de validation ») : un validateur par
 * ligne, coche verte (approuvé), croix rouge (rejeté, avec son commentaire) ou
 * rang (en attente).
 */
export function ValidationCircuit({
  validators,
  users,
}: {
  validators: Array<Validator>;
  users: Array<User>;
}) {
  const sorted = [...validators].sort((a, b) => a.rank - b.rank);
  return (
    <ol className="flex w-full flex-col">
      {sorted.map((v, index) => {
        const user = users.find((u) => u.id === v.userId);
        const name = user ? `${user.firstName} ${user.lastName}` : `Validateur ${v.rank}`;
        const rejected = !!v.decision && v.decision.includes("reject");
        const done = !!v.decision && !rejected;
        const isLast = index === sorted.length - 1;
        return (
          <li key={v.id ?? index} className="flex items-start gap-3">
            <div className="flex min-h-10 w-6 shrink-0 flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-label font-semibold",
                  done && "bg-status-success-fg text-text-on-brand",
                  rejected && "bg-status-danger-fg text-text-on-brand",
                  !v.decision &&
                    "border-[1.5px] border-border-strong bg-surface text-text-tertiary",
                )}
              >
                {done && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
                {rejected && <X aria-hidden className="size-3.5" strokeWidth={3} />}
                {!v.decision && v.rank}
              </span>
              {!isLast && (
                <span aria-hidden className="h-3 w-px bg-border-default" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-3">
              <p className="text-body-medium text-text-primary">{name}</p>
              {rejected && v.comment && (
                <p className="text-caption text-status-danger-fg">{v.comment}</p>
              )}
              <p className="text-caption text-text-tertiary">
                {v.decision
                  ? format(new Date(v.updatedAt), "dd/MM/yyyy · HH:mm")
                  : "Validateur"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
