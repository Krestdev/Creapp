"use client";

import FilesUpload from "@/components/comp-547";
import ViewDepense from "@/components/depense/viewDepense";
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
import { paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { signatairQ } from "@/queries/signatair";
import { TransactionProps, transactionQ } from "@/queries/transaction";
import {
  Bank,
  PaymentRequest,
  PayType,
  RequestModelT,
  Signatair,
  User,
} from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banks: Array<Bank>;
  request: RequestModelT[];
  users: Array<User>;
}

// Fonction pour vérifier si un moyen de paiement nécessite un numéro de pièce
const requiresDocNumber = (paymentMethod: PayType | null): boolean => {
  if (!paymentMethod) return false;

  // Vérifier si le type est "chq" ou "ov" (insensible à la casse)
  const type = paymentMethod.type?.toLowerCase();
  return type === "chq" || type === "ov";
};

type FormValues = {
  label: string;
  fromBankId: number | undefined;
  methodId?: number;
  to: {
    label: string;
    accountNumber?: string;
    phoneNum?: string;
  };
  docNumber?: string;
};

function ShareExpense({
  ticket,
  open,
  onOpenChange,
  banks,
  request,
  users,
}: Props) {
  const { user } = useStore();

  const [openDoc, setOpenDoc] = useState(false);
  const [paiement, setPaiement] = useState<PaymentRequest | null>(null);

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

  // Créer le schéma de validation conditionnel
  const formSchema = useMemo(() => {
    const baseSchema = z.object({
      label: z.string().min(2, "Libellé trop court"),
      fromBankId: z.coerce
        .number({
          required_error: "Veuillez sélectionner un compte source",
          invalid_type_error: "Veuillez sélectionner un compte source",
        })
        .int()
        .positive("Veuillez sélectionner un compte source"),
      ...(hasExistingMethodId
        ? {}
        : {
          methodId: z
            .number({
              required_error: "Veuillez sélectionner un moyen de paiement",
              invalid_type_error:
                "Veuillez sélectionner un moyen de paiement",
            })
            .int()
            .positive("Veuillez sélectionner un moyen de paiement"),
        }),
      to: z.object({
        label: z.string().min(2, "Libellé trop court"),
        accountNumber: z.string().optional(),
        phoneNum: z.string().optional(),
      }),
      docNumber: z.string().optional(),
    });

    return baseSchema;
  }, [hasExistingMethodId]);

  type FormValues = z.infer<typeof formSchema>;

  const isFacilitation = ticket.type?.toLowerCase() === "facilitation";
  const besoinFac = request.find((x) => x.id === ticket.requestId)
  const benef = users.find((x) => x.id === Number(besoinFac?.beneficiary));

  console.log(besoinFac);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: ticket.title,
      fromBankId: undefined,
      // Si le ticket n'a pas de methodId, laisser undefined
      ...(hasExistingMethodId ? {} : { methodId: undefined }),
      to: {
        label: isFacilitation ? benef?.firstName + " " + benef?.lastName : "",
        accountNumber: "",
        phoneNum: "",
      },
      docNumber: "",
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
    name: "methodId",
  });

  // Observer la valeur du numéro de document
  const docNumberValue = useWatch({
    control: form.control,
    name: "docNumber",
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

  // Vérifier si le moyen de paiement nécessite un numéro de pièce
  const requiresDocNumberField = useMemo(() => {
    return requiresDocNumber(paymentMethod!);
  }, [paymentMethod]);

  // Effectuer la validation conditionnelle pour docNumber
  const validateDocNumber = useMemo(() => {
    if (!requiresDocNumberField) return true;

    return docNumberValue && docNumberValue.trim().length > 0;
  }, [requiresDocNumberField, docNumberValue]);

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
              (bank.type === "CASH") &&
              bank.Status === true,
          );
        } else {
          // Pour cash normal : CASH_REGISTER 
          return banks.filter(
            (bank) =>
              (bank.type === "CASH_REGISTER") &&
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

  const getPaiement = useQuery({
    queryKey: ["paiement"],
    queryFn: paymentQ.getAll,
  });

  const share = useMutation({
    mutationFn: async (payload: TransactionProps) =>
      transactionQ.create(payload),
    onSuccess: (data) => {
      toast.success("Votre transaction a été enregistrée avec succès !");
      onOpenChange(false);
      if (data.data.payement) {
        setPaiement(data.data.payement);
        isCashPayment && setOpenDoc(true);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const trans = gettransaction.data?.data.find(
    (item) => item.id === ticket.transactionId,
  );

  function onSubmit(values: FormValues) {
    // Vérifier que fromBankId est défini
    if (!values.fromBankId) {
      toast.error("Veuillez sélectionner un compte source");
      return;
    }

    // Validation manuelle pour docNumber
    if (
      requiresDocNumberField &&
      (!values.docNumber || values.docNumber.trim().length === 0)
    ) {
      form.setError("docNumber", {
        type: "manual",
        message: "Le numéro de pièce est requis pour ce moyen de paiement",
      });
      toast.error("Veuillez renseigner le numéro de pièce");
      return;
    }

    const { to, fromBankId, methodId, docNumber, ...rest } = values;

    // Utiliser methodId du formulaire si présent, sinon celui du ticket
    const finalMethodId = Number(methodId) || ticket.methodId;

    if (!finalMethodId) {
      toast.error("Veuillez sélectionner un moyen de paiement");
      return;
    }

    const status = isCashPayment ? "simple_signed" : "unsigned";

    // Créer l'objet payload
    const payload: TransactionProps = {
      ...rest,
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
      // Inclure docNumber seulement s'il est fourni
      ...(docNumber && { docNumber: docNumber }),
    };
    share.mutate(payload);
  }

  const selectedBank = banks.find((bank) => bank.id === selectedBankId);

  return (
    <>
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >
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
                          Ce paiement n'a pas encore de moyen de paiement
                          défini. Veuillez en sélectionner un.
                        </FormDescription>
                        <FormControl>
                          <Select
                            value={
                              field.value ? String(field.value) : undefined
                            }
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

                {/* Champ numéro de pièce - Affiché uniquement pour chèque ou OV */}
                {requiresDocNumberField && (
                  <FormField
                    control={form.control}
                    name="docNumber"
                    render={({ field }) => (
                      <FormItem className="@min-[640px]:col-span-2">
                        <FormLabel isRequired>
                          {paymentMethod?.type?.toUpperCase() === "CHQ"
                            ? "Numéro de chèque"
                            : "Numéro d'ordre de virement"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              paymentMethod?.type?.toUpperCase() === "CHQ"
                                ? "Ex. CHQ-2024-001"
                                : "Ex. OV-2024-001"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            value={
                              field.value ? String(field.value) : undefined
                            }
                            onValueChange={(value) => {
                              field.onChange(Number(value));
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner un compte source" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredBanks.map((bank) => (
                                <SelectItem
                                  key={bank.id}
                                  value={String(bank.id)}
                                >
                                  <div className="flex flex-col items-start">
                                    <span>{bank.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {bank.type === "BANK" &&
                                        `Banque - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                      {bank.type === "CASH" &&
                                        `Caisse - Solde: ${bank.balance?.toLocaleString()} FCFA`}
                                      {bank.type === "CASH_REGISTER" &&
                                        `Caisse principale - Solde: ${bank.balance?.toLocaleString()} FCFA`}
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
                                      {formatMode(
                                        relevantSignataireConfig.mode,
                                      )}
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
                                ⚠️ Aucune configuration de signature trouvée
                                pour la combinaison :
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
                        {selectedBank &&
                          selectedBank.balance < ticket.price && (
                            <div className="mt-3 p-3 bg-red-500/20 rounded-md border border-red-500">
                              <p className="text-sm text-red-500">
                                ⚠️ Solde insuffisant. Disponible:{" "}
                                {selectedBank.balance.toLocaleString()} FCFA,
                                Montant requis: {ticket.price.toLocaleString()}{" "}
                                FCFA
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
                        <FormLabel isRequired>
                          {"Nom du destinataire"}
                        </FormLabel>
                        <FormControl>
                          <Input disabled={isFacilitation} {...field} placeholder="Ex. Krest Holding" />
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
                          <FormLabel>
                            {"Compte bancaire destinataire"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="Ex. 2350 0054"
                            />
                          </FormControl>
                          <FormDescription>
                            {
                              "Numéro de Compte Bancaire du client si applicable"
                            }
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
                </div>
              </form>
            </Form>
          </div>
          <div className="shrink-0 flex gap-3 p-6 pt-0 ml-auto">
            <Button
              onClick={() => {
                // Vérifier si le solde est suffisant
                if (selectedBank && selectedBank.balance < ticket.price) {
                  toast.error(
                    `Solde insuffisant. Disponible: ${selectedBank.balance.toLocaleString()} FCFA, Montant requis: ${ticket.price.toLocaleString()} FCFA`,
                  );
                  return;
                }

                // Validation pour docNumber si requis
                if (
                  requiresDocNumberField &&
                  (!docNumberValue || docNumberValue.trim().length === 0)
                ) {
                  form.setError("docNumber", {
                    type: "manual",
                    message:
                      "Le numéro de pièce est requis pour ce moyen de paiement",
                  });
                  toast.error("Veuillez renseigner le numéro de pièce");
                  return;
                }

                // Appeler la fonction retournée par handleSubmit
                form.handleSubmit(onSubmit)();
              }}
              variant={"primary"}
              disabled={
                share.isPending ||
                filteredBanks.length === 0 ||
                (!hasExistingMethodId && !selectedMethodId) ||
                (requiresDocNumberField && !validateDocNumber)
              }
              isLoading={share.isPending}
            >
              {isCashPayment
                ? "Initier le paiement"
                : "Soumettre au signataire"}
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
      {paiement && (
        <ViewDepense
          open={openDoc}
          openChange={setOpenDoc}
          paymentRequest={paiement}
        />
      )}
    </>
  );
}

export default ShareExpense;
