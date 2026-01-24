"use client"
import MultiSelectUser from "@/components/base/multiSelectUsersComplete";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { Signatair, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const modeValues = ["unique", "any", "all"] as const;

export const modes = [
  { label: "Signataire unique", value: modeValues[0] },
  { label: "Un dans la liste", value: modeValues[1] },
  { label: "Toutes les signatures", value: modeValues[2] },
];

const formSchema = z.object({
  bank: z.string().min(1, "Veuillez sélectionner une banque"),
  type: z.coerce.number({ message: "Veuillez sélectionner un type" }),
  signatair: z
    .array(z.number())
    .min(1, "Veuillez sélectionner au moins un signataire"),
  mode: z.enum(modeValues),
}).superRefine((data, ctx) => {
  // Cas 1 : Mode "unique" -> strictement 1 signataire
  if (data.mode === "unique" && data.signatair.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pour le mode unique, vous devez choisir exactement 1 signataire",
      path: ["signatair"], // L'erreur s'affichera sous le champ signataire
    });
  }

  // Cas 2 : Autres modes -> au moins 2 signataires
  if ((data.mode === "any" || data.mode === "all") && data.signatair.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Le mode "${data.mode === "any" ? "Un dans la liste" : "Toutes les signatures"}" nécessite au moins 2 signataires`,
      path: ["signatair"],
    });
  }
});

const Page = () => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank: "",
      type: undefined,
      signatair: [],
      mode: undefined,
    },
  });

  const [selectedUser, setSelectedUser] = useState<User[]>([]);

  const banks = useQuery({
    queryKey: ["banks"],
    queryFn: () => bankQ.getAll(),
  });

  const paymentTypes = useQuery({
    queryKey: ["payementType"],
    queryFn: () => payTypeQ.getAll(),
  });

  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  const create = useMutation({
    mutationFn: (data: Omit<Signatair, "id" | "createdAt" | "updatedAt">) =>
      signatairQ.create(data),
    onSuccess: () => {
      toast.success("Signataire créé avec succès.");
      form.reset({
        bank: "",
        type: undefined,
        signatair: [],
        mode: undefined,
      });
      setSelectedUser([]);
    },
    onError: () => {
      toast.error(
        "Une erreur est survenue lors de la creation des Signataires.",
      );
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { bank, type, mode, signatair } = values;
    let modeValue: "ONE" | "BOTH";
    if (mode === "unique" || mode === "any") {
      modeValue = "ONE";
    } else {
      modeValue = "BOTH";
    }
    const data: Omit<Signatair, "id" | "createdAt" | "updatedAt"> = {
      bankId: Number(bank),
      payTypeId: type,
      mode: modeValue,
      userIds: signatair,
    };
    create.mutate(data);
  }

  if (banks.isLoading || paymentTypes.isLoading || users.isLoading) return <LoadingPage />
  if (banks.isError || paymentTypes.isError || users.isLoading) return <ErrorPage error={banks.error || paymentTypes.error || users.error || undefined} />
  if (banks.isSuccess && paymentTypes.isSuccess && users.isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Configurer les signataires"
          subtitle="Formulaire de configuration"
          color="blue"
        />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="form-3xl"
          >
            <FormField control={form.control} name="bank" render={({ field }) => (
              <FormItem>
                <FormLabel>{"Banque"}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une banque" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.data.data
                        .filter((bank) => bank.type == "BANK")
                        .map((option) => (
                          <SelectItem
                            key={option.id}
                            value={String(option.id)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                <FormDescription>{"Choisissez la banque concernée"}</FormDescription>
              </FormItem>
            )} />

            <FormField control={form.control} name="mode" render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Mode"}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        modes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Document"}</FormLabel>
                <FormControl>
                  <Select value={!!field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un type de document" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.data.data.filter(p => !p.label?.includes("esp")).map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="signatair" render={({ field }) => (
              <FormItem className="@min-[640px]:col-span-2">
                <FormLabel isRequired>{"Signataires"}</FormLabel>
                <FormControl>
                  <MultiSelectUser
                    display="user"
                    users={users.data.data}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button
              variant={"primary"}
              type="submit"
              className="ml-auto @min-[640px]:col-span-2"
            >
              {"Enregistrer"}
            </Button>
          </form>
        </Form>
      </div>
    );
  }
};

export default Page;
