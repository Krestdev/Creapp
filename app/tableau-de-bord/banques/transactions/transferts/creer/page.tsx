"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
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
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { transactionQ, TransferProps } from "@/queries/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z
  .object({
    label: z.string().min(2, "Libellé trop court"),
    amount: z.coerce
      .number({ message: "Montant invalide" })
      .gt(0, "Montant > 0 requis"),
    fromBankId: z.coerce.number().int().positive(),
    toBankId: z.coerce.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.fromBankId === data.toBankId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toBankId"],
        message: "Vous ne pouvez pas transférer de fonds vers le même compte",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

function Page() {
  const { user } = useStore();
  const {
    data: banks,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useFetchQuery(["banks"], bankQ.getAll);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      amount: 5000,
      fromBankId: undefined,
      toBankId: undefined,
    },
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (payload: TransferProps) =>
      transactionQ.createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        refetchType: "active",
      });
      toast.success("Votre demande de transfert a été initiée avec succès !");
      router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    create.mutate({ ...values, Type: "TRANSFER", userId: user?.id ?? 0 });
  }

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Transfert"
          subtitle="Initier une demande de transfert de fonds"
          color="blue"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="@min-[640px]:col-span-2">
                  <FormLabel isRequired>
                    {"Libellé de la Transaction"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Intitulé de la transaction"
                    />
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
            <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
              <h3 className="@min-[640px]:col-span-2">{"Transférer depuis"}</h3>
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
                          {banks.data.map((bank) => (
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
            </div>
            <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
              <h3 className="@min-[640px]:col-span-2">{"Transférer vers"}</h3>
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
                          {banks.data.map((bank) => (
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
            </div>
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
      </div>
    );
}

export default Page;
