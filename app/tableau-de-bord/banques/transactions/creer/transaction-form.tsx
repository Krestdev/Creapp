"use client";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionProps, transactionQ } from "@/queries/transaction";
import { Bank, TRANSACTION_TYPES } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  banks: Array<Bank>;
  userId: number;
}

const TX_TYPES = TRANSACTION_TYPES.filter((c) => c.value !== "TRANSFER").map(
  (t) => t.value,
) as [
  (typeof TRANSACTION_TYPES)[number]["value"],
  ...(typeof TRANSACTION_TYPES)[number]["value"][],
];

const sourceSchema = z.object({
  label: z.string().optional(),
  accountNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const formSchema = z
  .object({
    label: z.string().min(2, "Libellé trop court"),
    amount: z.coerce
      .number({ message: "Montant invalide" })
      .gt(0, "Montant > 0 requis"),

    // ⚠️ si tu veux autoriser une date passée, change la condition
    date: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: "Date invalide" },
    ),

    Type: z.enum(TX_TYPES),

    from: sourceSchema.optional(),
    fromBankId: z.coerce.number().int().positive().optional(),

    to: sourceSchema.optional(),
    toBankId: z.coerce.number().int().positive().optional(),

    proof: z
      .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
      .min(0),
  })
  .superRefine((data, ctx) => {
  if (data.Type === "DEBIT") {
    if (!data.fromBankId || isNaN(Number(data.fromBankId))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fromBankId"],
        message: "Source obligatoire pour un débit",
      });
    }

    if (!data.to?.label || data.to.label.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to", "label"],
        message: "Nom du destinataire obligatoire pour un débit",
      });
    }
  }

  if (data.Type === "CREDIT") {
    if (!data.toBankId || isNaN(Number(data.toBankId))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toBankId"],
        message: "Destination obligatoire pour un crédit",
      });
    }

    if (!data.from?.label || data.from.label.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["from", "label"],
        message: "Nom de la source obligatoire pour un crédit",
      });
    }
  }
});


type FormValues = z.infer<typeof formSchema>;

function TransactionForm({ banks, userId }: Props) {
  const [openDate, setOpenDate] = React.useState<boolean>(false);
  const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  shouldUnregister: true, // ✅ très important ici
  defaultValues: {
    label: "",
    amount: 5000,
    date: format(new Date(), "yyyy-MM-dd"),
    Type: "DEBIT",
    from: undefined,
    to: undefined,
    fromBankId: undefined,
    toBankId: undefined,
    proof: [],
  },
});



  const router = useRouter();

  const create = useMutation({
    mutationFn: async (payload: TransactionProps) =>
      transactionQ.create(payload),
    onSuccess: () => {
      toast.success("Votre transaction a été enregistrée avec succès !");
      router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const type = form.watch("Type");

  React.useEffect(() => {
  if (type === "CREDIT") {
    form.setValue("to", undefined);
    form.setValue("fromBankId", undefined);
  } else {
    form.setValue("from", undefined);
    form.setValue("toBankId", undefined);
  }
}, [type, form]);


  function onSubmit(values: FormValues) {
    const { Type, from, to, fromBankId, toBankId, date, ...rest } = values;
    if (Type === "CREDIT") {
      const payload: TransactionProps = {
        Type: values.Type,
        ...rest,
        date: new Date(date),
        from: {label: values.from?.label ?? "", accountNumber: values.from?.accountNumber, phoneNumber: values.from?.phoneNumber},
        toBankId: values.toBankId,
        userId,
      };
      return create.mutate(payload);
    } else {
      const balance = banks.find(b=> b.id === fromBankId)?.balance;
      const val = !balance ? false : balance - rest.amount > 0;
      if(!val) return form.setError("amount", { message: "Montant invalide" })
      const payload: TransactionProps = {
        Type: values.Type,
        ...rest,
        date: new Date(date),
        fromBankId: values.fromBankId,
        to: {label: values.to?.label ?? "", accountNumber: values.to?.accountNumber, phoneNumber: values.to?.phoneNumber},
        userId,
      };
      return create.mutate(payload);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Libellé de la Transaction"}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Intitulé de la transaction" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Montant"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex. 50 000"
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
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Date de la transaction"}</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={field.name}
                    value={field.value}
                    placeholder="Sélectionner une date"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpenDate(true);
                      }
                    }}
                  />
                  <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">
                          {"Sélectionner une date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                      alignOffset={-8}
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          const value = format(date, "yyyy-MM-dd");
                          field.onChange(value);
                          setOpenDate(false);
                        }}
                        disabled={(date)=> date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="Type"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Type"}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.filter(
                      (c) => c.value !== "TRANSFER",
                    ).map((t) => (
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
        <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
          <h3 className="@min-[640px]:col-span-2">{"Source"}</h3>
          {type === "DEBIT" ? (
            <FormField
              control={form.control}
              name="fromBankId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Compte source"}</FormLabel>
                  <FormControl>
                    <Select
                      value={!!field.value ? String(field.value) : undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.filter(b=> !!b.type && b.type !== "null").map((bank) => (
                          <SelectItem key={bank.id} value={String(bank.id)}>
                            {bank.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="from.label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Nom de la source"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex. Krest Holding" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="from.accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Compte bancaire source"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Ex. 2350 0054"
                      />
                    </FormControl>
                    <FormDescription>
                      {"Numéro de Compte Bancaire du client si applicable"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="from.phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Numéro de téléphone source"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Ex. 694 562 002"
                      />
                    </FormControl>
                    <FormDescription>
                      {"Numéro de téléphone du si applicable"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
          <h3 className="@min-[640px]:col-span-2">{"Destinataire"}</h3>
          {type === "CREDIT" ? (
            <FormField
              control={form.control}
              name="toBankId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Compte destinataire"}</FormLabel>
                  <FormControl>
                    <Select
                      value={!!field.value ? String(field.value) : undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.filter(b=> !!b.type && b.type !== "null" ).map((bank) => (
                          <SelectItem key={bank.id} value={String(bank.id)}>
                            {bank.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="to.label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Nom du destinataire"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex. Krest Holding" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to.accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Compte bancaire destinataire"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Ex. 2350 0054"
                      />
                    </FormControl>
                    <FormDescription>
                      {"Numéro de Compte Bancaire du client si applicable"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to.phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Numéro de téléphone destinataire"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Ex. 694 562 002"
                      />
                    </FormControl>
                    <FormDescription>
                      {"Numéro de téléphone si applicable"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name="proof"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Justificatif"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="images"
                  multiple={true}
                  maxFiles={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="@min-[640px]:col-span-2 w-full inline-flex justify-end">
          <Button
            type="submit"
            variant={"primary"}
            disabled={create.isPending}
            isLoading={create.isPending}
          >
            {"Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TransactionForm;
