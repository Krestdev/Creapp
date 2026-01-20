"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Form, FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bankQ } from "@/queries/bank";
import { userQ } from "@/queries/baseModule";
import { payTypeQ } from "@/queries/payType";
import { signatairQ } from "@/queries/signatair";
import { ResponseT, Signatair, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MultiSelectUser from "../base/multiSelectUsersComplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  bank: z.string().min(1, "Please select an item"),
  type: z.string().min(1, "Please select an item"),
  signatair: z
    .array(z.number(), { message: "Please select at least one item" })
    .min(1, "Please select at least one item")
    .optional(),
  mode: z.string(),
});

export default function CreateSignatairForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank: "",
      type: "",
      signatair: [],
      mode: "ONE",
    },
  });

  const [selectedUser, setSelectedUser] = useState<User[]>([]);

  const bankData = useQuery({
    queryKey: ["banks"],
    queryFn: () => bankQ.getAll(),
  });

  const paytypeData = useQuery({
    queryKey: ["payementType"],
    queryFn: () => payTypeQ.getAll(),
  });

  const queryClient = useQueryClient();

  const signatairMutation = useMutation({
    mutationFn: (data: Omit<Signatair, "id" | "createdAt" | "updatedAt">) =>
      signatairQ.create(data),
    onSuccess: () => {
      toast.success("Signataire créé avec succès.");
      form.reset({
        bank: "",
        type: "",
        signatair: [],
        mode: "ONE",
      });
      // queryClient.invalidateQueries({
      //   queryKey: ["SignatairList"],
      //   refetchType: "active",
      // });
      setSelectedUser([]);
    },
    onError: () => {
      toast.error(
        "Une erreur est survenue lors de la creation des Signataires.",
      );
    },
  });

  const userData = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data: Omit<Signatair, "id" | "createdAt" | "updatedAt"> = {
        bankId: Number(values.bank),
        payTypeId: Number(values.type),
        mode: values.mode as "ONE" | "BOTH",
        userIds: values.signatair ?? [],
      };
      signatairMutation.mutate(data);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la creation du Signataire.");
    }
  }

  return (
    !paytypeData.isLoading &&
    !bankData.isLoading &&
    !userData.isLoading &&
    paytypeData.data &&
    bankData.data &&
    userData.data && (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-3xl grid grid-cols-1 gap-6 @min-[640px]:grid-cols-2"
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
                  <FieldLabel htmlFor="bank">
                    {"Banque"} <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une banque" />
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
            name="mode"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="mode">
                    {"mode"} <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {["ONE", "BOTH"].map((option) => {
                        let message = "";
                        if (option == "ONE") {
                          message = "Un Signataire";
                        } else {
                          message = "Tout les Signataires";
                        }
                        return (
                          <SelectItem key={option} value={option}>
                            {message}
                          </SelectItem>
                        );
                      })}
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
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="bank">
                    {"Type de document"}{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un type de document" />
                    </SelectTrigger>
                    <SelectContent>
                      {paytypeData.data?.data.map((option) => (
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

          <div className="space-y-2 col-span-2">
            <FormLabel>
              {"Signataire"} <span className="text-destructive">*</span>
            </FormLabel>
            <MultiSelectUser
              display="user"
              users={userData?.data?.data || []}
              selected={selectedUser}
              showMail
              placeholder="Aucun signataire selectionné"
              onChange={(selected) => {
                setSelectedUser(selected);
                form.setValue(
                  "signatair",
                  selected.map((r) => r.id),
                );
              }}
            />
          </div>

          <Button
            variant={"primary"}
            type="submit"
            className="ml-auto @min-[640px]:col-span-2"
          >
            {"Enregistrer"}
          </Button>
        </form>
      </Form>
    )
  );
}
