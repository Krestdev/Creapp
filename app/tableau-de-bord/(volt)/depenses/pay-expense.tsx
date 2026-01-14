"use client";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useStore } from "@/providers/datastore";
import { TransactionProps, transactionQ } from "@/queries/transaction";
import { Bank, PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banks: Array<Bank>;
}

const formSchema = z.object({
  label: z.string().min(2, "Libellé trop court"),
  date: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: "Date invalide" }
  ),
  fromBankId: z.coerce.number().int().positive(),

  to: z.object({
    label: z.string().min(2, "Libellé trop court"),
    accountNumber: z.string().optional(),
    phoneNum: z.string().optional(),
  }),

  proof: z
    .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
    .min(0),
});

type FormValues = z.infer<typeof formSchema>;

function PayExpense({ ticket, open, onOpenChange, banks }: Props) {
  const { user } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openDate, setOpenDate] = React.useState<boolean>(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      date: format(new Date(), "yyyy-MM-dd"),
      to: { label: "" },
      proof: [],
    },
  });

  const pay = useMutation({
    mutationFn: async (payload: TransactionProps) =>
      transactionQ.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["banks", "transactions"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
      toast.success("Votre transaction a été enregistrée avec succès !");
      onOpenChange(false);
      // router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    const { to, fromBankId, date, proof, ...rest } = values;
    const payload: TransactionProps = {
      ...rest,
      Type: "DEBIT",
      date: new Date(date),
      amount: ticket.price,
      userId: user?.id ?? 0,
      paymentId: ticket.id,
      to,
      fromBankId,
      proof,
    };
    pay.mutate(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="uppercase">{`Payer - ${ticket.title}`}</DialogTitle>
          <DialogDescription>{`Paiement du ticket ${ticket.reference}`}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
                <h3 className="@min-[640px]:col-span-2">{"Source"}</h3>
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
                            {banks.filter(x => x.type !== null).map((bank) => (
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
                <h3 className="@min-[640px]:col-span-2">{"Destinataire"}</h3>
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
                  name="to.phoneNum"
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
            </form>
          </Form>
        </div>
        <div className="shrink-0 flex gap-3 p-6 pt-0 ml-auto">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            variant={"primary"}
            disabled={pay.isPending}
            isLoading={pay.isPending}
          >
            {"Payer"}
          </Button>
          <Button
            variant={"outline"}
            disabled={pay.isPending}
            onClick={(e) => {
              e.preventDefault();
              form.reset();
              onOpenChange(false);
            }}
          >
            {"Annuler"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PayExpense;
