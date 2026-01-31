"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { BANK_TYPES } from "@/types/types";

import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankPayload, bankQ } from "@/queries/bank";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const banks = BANK_TYPES.filter((t) => t.value !== "CASH_REGISTER");

const formSchema = z
  .object({
    label: z.string().min(2, "Intitulé trop court").max(120, "Trop long"),
    type: z.enum(
      banks.map((t) => t.value) as [
        (typeof banks)[number]["value"],
        ...(typeof banks)[number]["value"][],
      ],
    ),
    balance: z.coerce.number({ message: "Solde invalide" }),
    justification: z
      .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
      .min(0),

    // Champs spécifiques à BANK
    accountNumber: z.string().optional(),
    bankCode: z.string().optional(),
    key: z.string().optional(),
    atmCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validations conditionnelles pour BANK
    if (data.type === "BANK") {
      if (!data.accountNumber || data.accountNumber.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountNumber"],
          message: "Numéro de compte requis",
        });
      }
      if (data.justification.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["justification"],
          message: "Veuillez ajouter la pièce justificative",
        });
      }
      if (!data.bankCode || data.bankCode.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankCode"],
          message: "Code banque requis",
        });
      }
      if (!data.atmCode || data.atmCode.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["atmCode"],
          message: "Code guichet requis",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

function CreateBank() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      type: "BANK",
      balance: 0,
      justification: [],
      accountNumber: "",
      bankCode: "",
      key: "",
      atmCode: "",
    },
  });

  const type = form.watch("type");

  const router = useRouter();
  const createBankAccount = useMutation({
    mutationFn: async (payload: BankPayload) => bankQ.create(payload),
    onSuccess: () => {
      toast.success("Nouveau compte Banque créé avec succès !");
      router.push("../banques");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: FormValues) => {
    const {
      justification,
      atmCode,
      accountNumber,
      bankCode,
      key,
      ...rest
    } = values;

    if (type === "BANK") {
      const payload: BankPayload = {
        ...rest,
        Status: true,
        justification: justification[0] as File,
        atmCode,
        accountNumber,
        bankCode,
        key,
      };
      return createBankAccount.mutate(payload);
    }

    if (type === "CASH") {
      const payload: BankPayload = {
        ...rest,
        Status: true,
        justification: justification[0] as File,
      };
      return createBankAccount.mutate(payload);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        {/* Intitulé */}
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Intitulé du compte"}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: UBA Cameroun / Caisse Générale"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Type"}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Solde */}
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Solde initial rapproché"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="Ex: 100000"
                    className="pr-12"
                  />
                  <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                    {"FCFA"}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champs conditionnels pour BANK */}
        {type === "BANK" && (
          <>
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Numéro de compte"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 00123456789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Code banque"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: UBA-CM" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Clé (optionnel)"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="atmCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Code Guichet"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 06619" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Justification */}
        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired={type === "BANK"}>
                {"Justificatif"}
              </FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="all"
                  multiple={false}
                  maxFiles={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="@min-[640px]:col-span-2 w-full flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={createBankAccount.isPending}
            disabled={createBankAccount.isPending}
          >
            {"Créer le compte"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateBank;