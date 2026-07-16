"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BonsCommande,
  CommandCondition,
  PAYMENT_METHOD,
  PayType,
  PRIORITIES,
  Quotation,
} from "@/types/types";
import { InfoIcon } from "lucide-react";
import React from "react";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  conditions: Array<CommandCondition>;
  quotations: Array<Quotation>;
  paytypes: Array<PayType>;
}

const PO_PRIORITIES = PRIORITIES.map((s) => s.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];
// const PO_METHODS = PAYMENT_METHOD.map((s) => s.value) as [
//   (typeof PAYMENT_METHOD)[number]["value"],
//   ...(typeof PAYMENT_METHOD)[number]["value"][],
// ];

const paymentSchema = z.object({
  percentage: z.coerce
    .number({ message: "Valeur invalide" })
    .refine((val) => val <= 100 && val > 0, {
      message: "Doit être entre 0 et 100",
    }),
  deadLine: z
    .string()
    .refine(
      (val) => {
        const d = new Date(val);
        // const now = new Date();
        return !isNaN(d.getTime());
      },
      { message: "Date invalide" },
    )
    .optional(),
});

export const formSchema = z
  .object({
    deviId: z.coerce.number({ message: "Veuillez définir un devis" }),
    object: z
      .string()
      .max(300, { message: "Doit contenir au plus 300 caractères" })
      .optional(),
    deliveryDelay: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        // const now = new Date();
        return !isNaN(d.getTime());
      },
      { message: "Date invalide" },
    ),
    instalments: z.array(paymentSchema).refine(
      (data) => {
        const total = data.reduce(
          (sum, payment) => sum + payment.percentage,
          0,
        );
        return total === 100;
      },
      { message: "Le total des paiements doit être égal à 100%" },
    ),
    paymentTerms: z.string().optional(),
    paymentMethod: z.string(),
    priority: z.enum(PO_PRIORITIES),
    deliveryLocation: z.string().min(1, "Ce champ est requis"),

    hasPenalties: z.boolean(),
    amountBase: z.coerce.number().optional(),
    penaltyMode: z.string().optional(),
    escompteRate: z.coerce.number().min(0, "Le taux doit être positif"),
    keepTaxes: z.boolean(),
    hasPrecompt: z.boolean(),
    conditions: z
      .array(z.number())
      .min(1, "Veuillez sélectionner au moins une condition"),
  })
  .superRefine((data, ctx) => {
    if (data.hasPenalties) {
      if (data.amountBase == null || Number.isNaN(data.amountBase)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountBase"],
          message: "Veuillez renseigner le montant des pénalités",
        });
      } else if (data.amountBase <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountBase"],
          message: "Le montant des pénalités doit être supérieur à 0",
        });
      }
    }
  });

function CreateModification({
  open,
  openChange,
  purchaseOrder,
  // conditions,
  // quotations,
  // paytypes,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`[BC] - ${purchaseOrder.devi.commandRequest.title}`}</DialogTitle>
          <DialogDescription>
            {"Demande de modification du Bon de Commande"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 p-3 rounded bg-blue-100">
          <InfoIcon size={20} className="text-blue-600" />
          <p className="text-sm">
            {
              "Notez que ces modifications seront prises en compte uniquement après validation par un administrateur"
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateModification;
