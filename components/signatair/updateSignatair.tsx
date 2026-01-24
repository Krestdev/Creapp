"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userQ } from "@/queries/baseModule";
import { Signatair, User } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signatairQ } from "@/queries/signatair";
import { Field, FieldError, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { bankQ } from "@/queries/bank";
import { payTypeQ } from "@/queries/payType";
import MultiSelectUsers from "../base/multiSelectUsersComplete";

/* =========================
   TYPES ET CONSTANTES
========================= */
const modeValues = ["ONE", "BOTH"] as const;
const frontendModes = ["unique", "any", "all"] as const;

export const modes = [
  { label: "Signataire unique", value: "unique" },
  { label: "Un dans la liste", value: "any" },
  { label: "Toutes les signatures", value: "all" },
];

/* =========================
   SCHEMA ZOD AVEC VALIDATIONS CROISÉES
========================= */
const formSchema = z.object({
  bank: z.string().min(1, "Veuillez sélectionner une banque"),
  type: z.string().min(1, "Veuillez sélectionner un type de paiement"),
  mode: z.enum(["unique", "any", "all"], {
    message: "Veuillez sélectionner un mode de signature",
  }),
  signatair: z.array(z.number(), {
    required_error: "Veuillez sélectionner au moins un signataire",
  }),
}).superRefine((data, ctx) => {
  // Validation croisée selon le mode sélectionné
  if (data.mode === "unique" && data.signatair.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pour le mode unique, vous devez choisir exactement 1 signataire",
      path: ["signatair"],
    });
  }

  if ((data.mode === "any" || data.mode === "all") && data.signatair.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Le mode "${data.mode === "any" ? "Un dans la liste" : "Toutes les signatures"}" nécessite au moins 2 signataires`,
      path: ["signatair"],
    });
  }
});

/* =========================
   UTILITAIRES
========================= */
// Convertir le mode backend vers frontend
const backendToFrontendMode = (mode: "ONE" | "BOTH" | string): "unique" | "any" | "all" => {
  switch (mode) {
    case "ONE":
      return "unique";
    case "BOTH":
      return "all";
    default:
      return "unique";
  }
};

// Convertir le mode frontend vers backend
const frontendToBackendMode = (mode: "unique" | "any" | "all"): "ONE" | "BOTH" => {
  if (mode === "unique" || mode === "any") {
    return "ONE";
  }
  return "BOTH";
};

interface UpdateSignatairProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  signatair: Signatair | null;
  onSuccess?: () => void;
}

export default function EditSignatairForm({
  open,
  setOpen,
  signatair,
  onSuccess,
}: UpdateSignatairProps) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank: "",
      type: "",
      mode: "unique",
      signatair: [],
    },
  });

  /* =========================
     REQUETES
  ========================= */
  const bankData = useQuery({
    queryKey: ["banks"],
    queryFn: () => bankQ.getAll(),
  });

  const paytypeData = useQuery({
    queryKey: ["paymentTypes"],
    queryFn: () => payTypeQ.getAll(),
  });

  const userData = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  /* =========================
     INIT FORM
  ========================= */
  useEffect(() => {
    if (signatair && open && userData.data) {
      const users = signatair.user || [];
      setSelectedUser(users);

      // Convertir le mode backend en mode frontend
      const frontendMode = backendToFrontendMode(signatair.mode);

      form.reset({
        bank: signatair.bankId?.toString() || "",
        type: signatair.payTypeId?.toString() || "",
        mode: frontendMode,
        signatair: signatair.user?.map((usr) => usr.id) || [],
      });
    }
  }, [signatair, open, userData.data, form]);

  /* =========================
     MUTATION
  ========================= */
  const signatairMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Signatair> }) =>
      signatairQ.update(id, data),

    onSuccess: () => {
      toast.success("Signataire modifié avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["signatair"],
        refetchType: "active",
      });
      setOpen(false);
      onSuccess?.();
    },

    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la modification");
    },
  });

  /* =========================
     SUBMIT
  ========================= */
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!signatair?.id) return;

    const backendMode = frontendToBackendMode(values.mode);

    const payload: Partial<Signatair> = {
      bankId: Number(values.bank),
      payTypeId: Number(values.type),
      mode: backendMode,
      userIds: values.signatair,
    };

    signatairMutation.mutate({ id: signatair.id, data: payload });
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[840px] p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold uppercase">
            {`Modifier le signataire - ${signatair?.Bank?.label} - ${signatair?.payTypes?.label}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Modifier les informations du signataire
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-3xl grid grid-cols-1 gap-6 @min-[640px]:grid-cols-2"
              id="update-signatair-form"
            >
              {/* Banque */}
              <Controller
                name="bank"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <FieldLabel htmlFor="bank">
                        Banque <span className="text-destructive">*</span>
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner une banque" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankData.data?.data
                            .filter((bank) => bank.type === "BANK")
                            .map((option) => (
                              <SelectItem
                                key={option.id}
                                value={option.id.toString()}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* Type de paiement */}
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <FieldLabel htmlFor="type">
                        Type de paiement{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un type de paiement" />
                        </SelectTrigger>
                        <SelectContent>
                          {paytypeData.data?.data
                            .filter((p) => !p.label?.includes("esp"))
                            .map((option) => (
                              <SelectItem
                                key={option.id}
                                value={option.id.toString()}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* Mode de signature */}
              <Controller
                name="mode"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <FieldLabel htmlFor="mode">
                        Mode de signature{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {modes.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* Signataires */}
              <div className="space-y-2 col-span-2">
                <FormLabel>
                  Signataires <span className="text-destructive">*</span>
                </FormLabel>
                <Controller
                  name="signatair"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <MultiSelectUsers
                        showMail
                        display="user"
                        users={userData?.data?.data || []}
                        selected={selectedUser}
                        placeholder="Sélectionner des signataires"
                        onChange={(selected) => {
                          setSelectedUser(selected);
                          field.onChange(selected.map((r) => r.id));
                        }}
                      />
                      {fieldState.error && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0 border-t ml-auto">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={signatairMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            variant={"primary"}
            type="submit"
            form="update-signatair-form"
            disabled={signatairMutation.isPending}
            isLoading={signatairMutation.isPending}
          >
            {signatairMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}