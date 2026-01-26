"use client";

import FilesUpload from "@/components/comp-547";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { useStore } from "@/providers/datastore";
import { payTypeQ } from "@/queries/payType";
import { signatairQ } from "@/queries/signatair";
import { TransactionProps, transactionQ } from "@/queries/transaction";
import { Bank, PaymentRequest, PayType, Signatair } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banks: Array<Bank>;
}

// Schéma conditionnel : ajouter methodId seulement si le ticket n'en a pas
const createFormSchema = (hasMethodId: boolean) =>
  z.object({
    label: z.string().min(2, "Libellé trop court"),
    fromBankId: z.coerce.number().int().positive(),
    // Ajouter methodId seulement si le ticket n'a pas déjà de methodId
    ...(hasMethodId
      ? {}
      : {
          methodId: z
            .number()
            .int()
            .positive("Veuillez sélectionner un moyen de paiement"),
        }),
    to: z.object({
      label: z.string().min(2, "Libellé trop court"),
      accountNumber: z.string().optional(),
      phoneNum: z.string().optional(),
    }),
    proof: z
      .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
      .min(0),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

function ShareExpense({ ticket, open, onOpenChange, banks }: Props) {
  const { user } = useStore();

  // Récupérer la liste des signataires
  const getSignataires = useQuery({
    queryKey: ["SignatairList"],
    queryFn: signatairQ.getAll,
  });

  // Récupérer les types de paiement
  const payTypesQuery = useQuery({
    queryKey: ["payTypes"],
    queryFn: payTypeQ.getAll,
  });

  // Vérifier si le ticket a déjà un methodId
  const hasExistingMethodId = useMemo(() => {
    return !!ticket.methodId;
  }, [ticket.methodId]);

  // Créer le schéma conditionnel
  const formSchema = useMemo(
    () => createFormSchema(hasExistingMethodId),
    [hasExistingMethodId],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: ticket.title,
      fromBankId: undefined,
      proof: [],
      // Si le ticket n'a pas de methodId, laisser undefined
      ...(hasExistingMethodId ? {} : { methodId: undefined }),
      to: { label: "", accountNumber: "", phoneNum: "" },
    },
  });

  // Observer la valeur de la banque sélectionnée
  const selectedBankId = useWatch({
    control: form.control,
    name: "fromBankId",
  });

  // Observer la valeur de methodId (si présent dans le formulaire)
  const selectedMethodId = useWatch({
    control: form.control,
    name: "methodId" as any,
  });

  // Obtenir le type de paiement du ticket ou du formulaire
  const paymentMethod = useMemo(() => {
    // Priorité : methodId du formulaire (si présent) puis methodId du ticket
    const methodId = selectedMethodId || ticket.methodId;

    if (!payTypesQuery.data?.data || !methodId) {
      return null;
    }

    return payTypesQuery.data.data.find(
      (payType: PayType) => payType.id === methodId,
    );
  }, [payTypesQuery.data?.data, ticket.methodId, selectedMethodId]);

  // Vérifier si le mode de paiement est "espèces" en se basant aussi sur le select du formulaire
  const isCashPayment = useMemo(() => {
    return paymentMethod?.type?.toLowerCase() === "cash";
  }, [paymentMethod]);

  // Filtrer les comptes en fonction du type de paiement
  const filteredBanks = useMemo(() => {
    if (!paymentMethod?.type) {
      // Si pas de méthode de paiement définie, afficher tous les comptes actifs
      return banks.filter((x) => x.type !== null && x.Status === true);
    }

    const paymentType = paymentMethod.type.toLowerCase();
    const payTypeLabel = ticket.type?.toLowerCase() || "";

    switch (paymentType) {
      case "cash": // Espèces
        if (payTypeLabel === "current") {
          return banks.filter(
            (bank) =>
              (bank.type === "CASH" || bank.type === "MOBILE_WALLET") &&
              bank.Status === true,
          );
        } else {
          // Pour cash normal : CASH_REGISTER et MOBILE_WALLET
          return banks.filter(
            (bank) =>
              (bank.type === "CASH_REGISTER" || bank.type === "MOBILE_WALLET") &&
              bank.Status === true,
          );
        }

      case "ov": // Ordre de virement
      case "chq": // Chèque
        // Pour les virements et chèques : banques uniquement
        return banks.filter(
          (bank) => bank.type === "BANK" && bank.Status === true,
        );

      default:
        // Par défaut, afficher tous les comptes actifs
        return banks.filter((x) => x.type !== null && x.Status === true);
    }
  }, [banks, paymentMethod?.type, ticket.type]);

  // Récupérer la configuration de signature correspondante
  const relevantSignataireConfig = useMemo(() => {
    if (!getSignataires.data?.data || !selectedBankId || !paymentMethod?.id) {
      return null;
    }

    // Trouver la configuration pour cette banque et ce type de paiement
    const config = getSignataires.data.data.find(
      (signataire: Signatair) =>
        signataire.bankId === selectedBankId &&
        signataire.payTypeId === paymentMethod.id,
    );

    return config || null;
  }, [getSignataires.data?.data, selectedBankId, paymentMethod?.id]);

  // Formater la liste des signataires pour l'affichage
  const signatairesList = useMemo(() => {
    if (
      !relevantSignataireConfig?.user ||
      relevantSignataireConfig.user.length === 0
    ) {
      return "Aucun signataire défini pour cette combinaison banque/méthode";
    }

    return relevantSignataireConfig.user
      .map(
        (user) =>
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      )
      .join(", ");
  }, [relevantSignataireConfig]);

  // Formater le mode de signature en texte lisible
  const formatMode = (mode: string): string => {
    switch (mode) {
      case "ONE":
        return "Au moins une signature requise";
      case "BOTH":
        return "Toutes les signatures requises";
      default:
        return mode;
    }
  };

  const gettransaction = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionQ.getAll,
  });

  const share = useMutation({
    mutationFn: async (payload: TransactionProps) =>
      transactionQ.create(payload),
    onSuccess: () => {
      toast.success("Votre transaction a été enregistrée avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const trans = gettransaction.data?.data.find(
    (item) => item.id === ticket.transactionId,
  );

  function onSubmit(values: FormValues) {
    const { to, fromBankId, methodId, proof, ...rest } = values;

    // Utiliser methodId du formulaire si présent, sinon celui du ticket
    const finalMethodId = Number(methodId) || ticket.methodId;

    if (!finalMethodId) {
      toast.error("Veuillez sélectionner un moyen de paiement");
      return;
    }

    const status = isCashPayment ? "paid" : "unsigned";

    // Créer l'objet payload
    const payload: TransactionProps = {
      ...rest,
      ...(isCashPayment ? { proof } : {}),
      Type: trans?.Type!,
      date: new Date(),
      amount: ticket.price,
      userId: user?.id ?? 0,
      paymentId: ticket.id,
      label: ticket.title,
      to,
      fromBankId,
      status: status,
      // Inclure methodId dans le payload
      methodId: finalMethodId,
    };
    share.mutate(payload);
  }

  const selectedBank = banks.find((bank) => bank.id === selectedBankId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="uppercase">
            {isCashPayment
              ? `Payer - ${ticket.title}`
              : `Soumettre - ${ticket.title}`}
          </DialogTitle>
          <DialogDescription>
            {isCashPayment
              ? `Paiement du ticket ${ticket.reference} en espèces`
              : `Soumission du ticket ${ticket.reference}`}
          </DialogDescription>
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

              {/* Information sur la méthode de paiement */}
              <div className="@min-[640px]:col-span-2 p-3 rounded-sm border bg-blue-50/30">
                <h3 className="font-medium text-sm mb-2">
                  Information de paiement
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Montant :
                    </span>
                    <p className="font-semibold">
                      {ticket.price.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>

              {/* Champ moyen de paiement UNIQUEMENT si le ticket n'en a pas déjà */}
              {!hasExistingMethodId && (
                <FormField
                  control={form.control}
                  name="methodId"
                  render={({ field }) => (
                    <FormItem className="@min-[640px]:col-span-2">
                      <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                      <FormDescription className="text-amber-600">
                        Ce paiement n'a pas encore de moyen de paiement défini.
                        Veuillez en sélectionner un.
                      </FormDescription>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un moyen de paiement" />
                          </SelectTrigger>
                          <SelectContent>
                            {payTypesQuery.data?.data?.map((payType) => (
                              <SelectItem
                                key={payType.id}
                                value={String(payType.id)}
                              >
                                {payType.label ||
                                  `Moyen de paiement ${payType.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Afficher la méthode de paiement si elle existe déjà */}
              {hasExistingMethodId && paymentMethod && (
                <div className="@min-[640px]:col-span-2 p-3 rounded-sm border bg-green-50/30">
                  <h3 className="font-medium text-sm mb-1">
                    Moyen de paiement défini
                  </h3>
                  <p className="font-semibold text-green-700">
                    {paymentMethod.label || `Type ${ticket.methodId}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ce paiement a déjà un moyen de paiement configuré. Pour le
                    modifier, veuillez éditer le paiement directement.
                  </p>
                </div>
              )}

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
                            <SelectValue placeholder="Sélectionner un compte source" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredBanks.map((bank) => (
                              <SelectItem key={bank.id} value={String(bank.id)}>
                                <div className="flex flex-col">
                                  <span>{bank.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {bank.type === "BANK" &&
                                      `Banque - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                    {bank.type === "CASH" &&
                                      `Caisse - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                    {bank.type === "CASH_REGISTER" &&
                                      `Caisse principale - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                    {bank.type === "MOBILE_WALLET" &&
                                      `Portefeuille mobile (${bank.label}) - ${
                                        bank.phoneNum || "N/A"
                                      }`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      {/* Affichage de la configuration de signature correspondante */}
                      {!!selectedBankId &&
                        !!paymentMethod &&
                        !!relevantSignataireConfig && (
                          <div className="mt-3 space-y-2 p-3 bg-muted/30 rounded-md">
                            <p className="text-sm font-medium">
                              Configuration de signature :
                            </p>
                            <div className="text-sm">
                              <div className="ml-2 mt-1">
                                <p className="text-xs">
                                  <span className="font-medium">Mode :</span>{" "}
                                  <span
                                    className={
                                      relevantSignataireConfig.mode === "ONE"
                                        ? "text-green-600"
                                        : "text-amber-600"
                                    }
                                  >
                                    {formatMode(relevantSignataireConfig.mode)}
                                  </span>
                                </p>
                                <p className="text-xs mt-1">
                                  <span className="font-medium">
                                    Signataires :
                                  </span>{" "}
                                  {signatairesList}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Message si aucune configuration trouvée */}
                      {!isCashPayment &&
                        !!selectedBankId &&
                        !!paymentMethod &&
                        !relevantSignataireConfig && (
                          <div className="mt-3 p-3 bg-muted/20 rounded-md border border-muted">
                            <p className="text-sm text-muted-foreground">
                              ⚠️ Aucune configuration de signature trouvée pour
                              la combinaison :
                            </p>
                            <ul className="text-xs text-muted-foreground mt-1 ml-4 list-disc">
                              <li>
                                Compte source :{" "}
                                {banks.find((b) => b.id === selectedBankId)
                                  ?.label || `#${selectedBankId}`}
                              </li>
                              <li>
                                Méthode de paiement :{" "}
                                {paymentMethod?.label ||
                                  `Type ${paymentMethod?.id}`}
                              </li>
                            </ul>
                          </div>
                        )}

                      <FormMessage />
                      {selectedBank && selectedBank.balance < ticket.price && (
                        <div className="mt-3 p-3 bg-red-500/20 rounded-md border border-red-500">
                          <p className="text-sm text-red-500">
                            ⚠️ Solde insuffisant. Disponible: {selectedBank.balance.toLocaleString()} FCFA, Montant requis: {ticket.price.toLocaleString()} FCFA
                          </p>
                        </div>
                      )}
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
                {!isCashPayment && (
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
                )}

                <FormField
                  control={form.control}
                  name="to.phoneNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {"Numéro de téléphone destinataire"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="Ex. 694 562 002"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Afficher le champ proof seulement si c'est un paiement en espèces */}
                {isCashPayment && (
                  <FormField
                    control={form.control}
                    name="proof"
                    render={({ field }) => (
                      <FormItem className="@min-[640px]:col-span-2">
                        <FormLabel isRequired>{"Justificatif"}</FormLabel>
                        <FormDescription>
                          Justificatif obligatoire pour les paiements en espèces
                        </FormDescription>
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
                )}
              </div>
            </form>
          </Form>
        </div>
        <div className="shrink-0 flex gap-3 p-6 pt-0 ml-auto">
          <Button
            onClick={() => {
              // Vérifier si le solde est suffisant
              if (selectedBank && selectedBank.balance < ticket.price) {
                toast.error(`Solde insuffisant. Disponible: ${selectedBank.balance.toLocaleString()} FCFA, Montant requis: ${ticket.price.toLocaleString()} FCFA`);
                return;
              }
              // Appeler la fonction retournée par handleSubmit
              form.handleSubmit(onSubmit)();
            }}
            variant={"primary"}
            disabled={
              share.isPending ||
              filteredBanks.length === 0 ||
              (!hasExistingMethodId && !selectedMethodId)
            }
            isLoading={share.isPending}
          >
            {isCashPayment ? "Payer" : "Soumettre au signataire"}
          </Button>
          <Button
            variant={"outline"}
            disabled={share.isPending}
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
