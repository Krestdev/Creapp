"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { userQ } from "@/queries/baseModule";
import { Role, Signatair, User, User as UserT } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import MultiSelectRole from "../base/multiSelectRole";
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import MultiSelectUsers from "../base/multiSelectUsersComplete";

/* =========================
   SCHEMA ZOD
========================= */
const formSchema = z.object({
  bank: z.string().min(1, "Please select an item"),
  type: z.string().min(1, "Please select an item"),
  signatair: z
    .array(z.number(), { message: "Please select at least one item" })
    .min(1, "Please select at least one item")
    .optional(),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  signatair: Signatair | null;
  onSuccess?: () => void;
}

export default function UpdateUser({
  open,
  setOpen,
  signatair,
  onSuccess,
}: UpdateRequestProps) {
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank: "",
      type: "",
      signatair: [],
    },
  });

  /* =========================
     INIT FORM
  ========================= */
  useEffect(() => {
    if (signatair && open && userData.data) {
      const users = signatair.user || [];
      setSelectedUser(users);

      form.reset({
        bank: signatair.Bank?.id.toString(),
        type: signatair.payTypes?.id.toString(),
        signatair: signatair.user?.map((usr) => usr.id),
      });
    }
  }, [open, form]);

  /* =========================
     MUTATION
  ========================= */

  const signatairMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Signatair> }) =>
      signatairQ.update(id, data),

    onSuccess: () => {
      toast.success("Signatair modifié avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["SignatairList"],
        refetchType: "active",
      });
      setOpen(false);
      onSuccess?.();
    },

    onError: () => {
      toast.error("Erreur lors de la modification");
    },
  });

  const bankData = useQuery({
    queryKey: ["roles"],
    queryFn: () => bankQ.getAll(),
  });

  const paytypeData = useQuery({
    queryKey: ["payementType"],
    queryFn: () => payTypeQ.getAll(),
  });

  const signatairData = useQuery({
    queryKey: ["payementType"],
    queryFn: () => signatairQ.getAll(),
  });

  const userData = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  /* =========================
     SUBMIT
  ========================= */
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!signatair?.id) return;

    const payload: any = {
      bankId: Number(values.bank),
      payTypeId: Number(values.type),
      userIds: values.signatair,
    };

    signatairMutation.mutate({ id: signatair.id, data: payload });
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[840px] p-0 flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg">
          <DialogTitle className="text-xl font-semibold">
            {signatair?.Bank?.label + " - " + signatair?.payTypes?.label}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifier le signatait en indiquant les nouvelles informations."}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-3xl grid grid-cols-1 gap-6 @min-[640px]:grid-cols-2 p-6"
          >
            <Controller
              name="bank"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel htmlFor="bank">Bank *</FieldLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selectione une bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankData.data?.data
                          .filter((bank) => bank.type == "BANK")
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

            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 [&_p]:pb-2 col-span-full"
                  >
                    <FieldLabel htmlFor="type">Type de payement *</FieldLabel>

                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    >
                      {paytypeData.data?.data.map((pt) => (
                        <div key={pt.id} className="flex items-center gap-x-2">
                          <RadioGroupItem
                            value={pt.id.toString()}
                            id={pt.id.toString()}
                          />
                          <Label htmlFor={pt.id.toString()}>{pt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />

            <div className="space-y-2 col-span-2">
              <FormLabel>{"Signatair *"}</FormLabel>
              <MultiSelectUsers
                display="user"
                users={userData?.data?.data || []}
                selected={selectedUser}
                onChange={(selected) => {
                  setSelectedUser(selected);
                  form.setValue(
                    "signatair",
                    selected.map((r) => r.id)
                  );
                }}
              />
            </div>

            {/* <Button
              variant={"primary"}
              type="submit"
              className="ml-auto @min-[640px]:col-span-2"
            >
              {"Enregistrer"}
            </Button> */}
          </form>

          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              variant={"primary"}
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
              disabled={signatairMutation.isPending}
            >
              {signatairMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
