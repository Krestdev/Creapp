"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { signatairQ } from "@/queries/signatair";
import { payTypeQ } from "@/queries/payType";
import { TransactionProps, transactionQ } from "@/queries/transaction";
import { Bank, PaymentRequest, Signatair, User, PayType } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import React, { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  // date: z.string({ message: "Veuillez définir une date" }).refine(
  //   (val) => {
  //     const d = new Date(val);
  //     return !isNaN(d.getTime());
  //   },
  //   { message: "Date invalide" }
  // ),
  fromBankId: z.coerce.number().int().positive(),

  to: z.object({
    label: z.string().min(2, "Libellé trop court"),
    accountNumber: z.string().optional(),
    phoneNum: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

function ShareExpense({ ticket, open, onOpenChange, banks }: Props) {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [openDate, setOpenDate] = React.useState<boolean>(false);

  // Récupérer la liste des signataires
  const getSignataires = useFetchQuery(["SignatairList"], signatairQ.getAll, 30000);

  // Récupérer les types de paiement
  const payTypesQuery = useFetchQuery(["payTypes"], payTypeQ.getAll, 30000);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: ticket.title,
      // date: format(new Date(), "yyyy-MM-dd"),
      fromBankId: undefined,
      to: { label: "" },
    },
  });

  // Observer la valeur de la banque sélectionnée
  const selectedBankId = useWatch({
    control: form.control,
    name: "fromBankId"
  });

  // Obtenir le type de paiement du ticket
  const paymentMethod = useMemo(() => {
    if (!payTypesQuery.data?.data || !ticket.methodId) {
      return null;
    }
    return payTypesQuery.data.data.find(
      (payType: PayType) => payType.id === ticket.methodId
    );
  }, [payTypesQuery.data?.data, ticket.methodId]);

  // Filtrer les comptes en fonction du type de paiement
  const filteredBanks = useMemo(() => {
    if (!paymentMethod?.type) {
      return banks.filter(x => x.type !== null && x.Status === true);
    }

    const paymentType = paymentMethod.type.toLowerCase();

    switch (paymentType) {
      case 'cash': // Espèces
        // Pour les espèces : caisses + Orange Money
        return banks.filter(bank =>
          (
            bank.type === 'CASH' ||
            bank.type === 'CASH_REGISTER' ||
            bank.type === 'MOBILE_WALLET'
          ) &&
          bank.Status === true
        );

      case 'ov': // Ordre de virement
      case 'chq': // Chèque
        // Pour les virements et chèques : banques uniquement
        return banks.filter(bank =>
          bank.type === 'BANK' &&
          bank.Status === true
        );

      default:
        // Par défaut, afficher tous les comptes actifs
        return banks.filter(x => x.type !== null && x.Status === true);
    }
  }, [banks, paymentMethod?.type]);

  // Déterminer les comptes autorisés pour le type de paiement
  const getAccountTypeLabel = () => {
    if (!paymentMethod?.type) return "comptes";

    const paymentType = paymentMethod.type.toLowerCase();

    switch (paymentType) {
      case 'cash':
        return "caisses et portefeuilles mobiles";
      case 'ov':
        return "banques (ordre de virement)";
      case 'chq':
        return "banques (chèque)";
      default:
        return "comptes actifs";
    }
  };

  // Récupérer la configuration de signature correspondant au methodId du ticket
  const relevantSignataireConfig = useMemo(() => {
    if (!getSignataires.data?.data || !selectedBankId || !ticket.methodId) {
      return null;
    }

    // Trouver la configuration pour cette banque et ce type de paiement
    const config = getSignataires.data.data.find(
      (signataire: Signatair) =>
        signataire.bankId === selectedBankId &&
        signataire.payTypeId === ticket.methodId
    );

    return config || null;
  }, [getSignataires.data?.data, selectedBankId, ticket.methodId]);

  // Formater la liste des signataires pour l'affichage
  const signatairesList = useMemo(() => {
    if (!relevantSignataireConfig?.user || relevantSignataireConfig.user.length === 0) {
      return "Aucun signataire défini pour cette combinaison banque/méthode";
    }

    return relevantSignataireConfig.user
      .map(user => `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email)
      .join(", ");
  }, [relevantSignataireConfig]);

  // Formater le mode de signature en texte lisible
  const formatMode = (mode: string): string => {
    switch (mode) {
      case 'ONE':
        return 'Au moins une signature requise';
      case 'ALL':
      case 'BOTH':
        return 'Toutes les signatures requises';
      default:
        return mode;
    }
  };

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
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    const { to, fromBankId, ...rest } = values;
    const payload: TransactionProps = {
      ...rest,
      Type: "DEBIT",
      date: new Date(),
      amount: ticket.price,
      userId: user?.id ?? 0,
      paymentId: ticket.id,
      to,
      fromBankId,
    };
    pay.mutate(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="uppercase">{`Soumettre - ${ticket.title}`}</DialogTitle>
          <DialogDescription>{`Soumission du ticket ${ticket.reference}`}</DialogDescription>
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
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
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
              /> */}

              {/* Information sur la méthode de paiement */}
              <div className="@min-[640px]:col-span-2 p-3 rounded-sm border bg-blue-50/30">
                <h3 className="font-medium text-sm mb-2">Information de paiement</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Méthode :</span>
                    <p className="font-semibold">{paymentMethod?.label || `Type ${ticket.methodId}`}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Montant :</span>
                    <p className="font-semibold">{ticket.price.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>

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
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={`Sélectionner un compte source`} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredBanks.map((bank) => (
                              <SelectItem key={bank.id} value={String(bank.id)}>
                                <div className="flex flex-col">
                                  <span>{bank.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {bank.type === 'BANK' && `Banque - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                    {bank.type === 'CASH' && `Caisse - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                    {bank.type === 'CASH_REGISTER' && `Caisse principale - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                    {bank.type === 'MOBILE_WALLET' && `Portefeuille mobile (${bank.label}) - ${bank.phoneNum || 'N/A'}`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      {/* Affichage de la configuration de signature correspondante */}
                      {selectedBankId && relevantSignataireConfig && (
                        <div className="mt-3 space-y-2 p-3 bg-muted/30 rounded-md">
                          <p className="text-sm font-medium">Configuration de signature :</p>
                          <div className="text-sm">
                            <div className="ml-2 mt-1">
                              <p className="text-xs">
                                <span className="font-medium">Mode :</span>{' '}
                                <span className={relevantSignataireConfig.mode === 'ONE' ? 'text-green-600' : 'text-amber-600'}>
                                  {formatMode(relevantSignataireConfig.mode)}
                                </span>
                              </p>
                              <p className="text-xs mt-1">
                                <span className="font-medium">Signataires :</span>{' '}
                                {signatairesList}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message si aucune configuration trouvée */}
                      {selectedBankId && !relevantSignataireConfig && (
                        <div className="mt-3 p-3 bg-muted/20 rounded-md border border-muted">
                          <p className="text-sm text-muted-foreground">
                            ⚠️ Aucune configuration de signature trouvée pour la combinaison :
                          </p>
                          <ul className="text-xs text-muted-foreground mt-1 ml-4 list-disc">
                            <li>Compte source : {banks.find(b => b.id === selectedBankId)?.label || `#${selectedBankId}`}</li>
                            <li>Méthode de paiement : {paymentMethod?.label || `Type ${ticket.methodId}`}</li>
                          </ul>
                        </div>
                      )}

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
            </form>
          </Form>
        </div>
        <div className="shrink-0 flex gap-3 p-6 pt-0 ml-auto">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            variant={"primary"}
            disabled={pay.isPending || filteredBanks.length === 0}
            isLoading={pay.isPending}
          >
            {"Soumettre"}
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

export default ShareExpense;