"use client";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/providers/datastore";
import { paymentQ, UpdatePayment } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { Invoice, PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
  invoices: Array<Invoice>;
}

const formSchema = z.object({
  deadline: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: "Date invalide" },
  ),
  isPartial: z.boolean(),
  price: z.number({ message: "Veuillez renseigner un montant" }),
  methodId: z.string().min(1, "Veuillez sélectionner un moyen de paiement"),
});

type FormValues = z.infer<typeof formSchema>;

function EditPaymentMethod({ open, openChange, payment, invoices }: Props) {
  const { user } = useStore();

  const [dueDate, setDueDate] = React.useState<boolean>(false);
  const today = new Date(); //On part sur 3 jours de delai de base :)
  today.setDate(today.getDate() + 3);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deadline: format(new Date(payment.deadline), "yyyy-MM-dd"),
      isPartial: payment.isPartial,
      price: payment.price,
      methodId: String(payment.methodId),
    },
  });

  const isPartial = form.watch("isPartial");

  const updatePayment = useMutation({
    mutationFn: async (data: Partial<UpdatePayment>) =>
      paymentQ.update(payment.id, data),
    onSuccess: () => {
      toast.success("Votre paiement a été modifié avec succès !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  function onSubmit(values: FormValues) {
    const invoice = invoices.find((p) => p.id === payment.invoiceId);

    const payload: Partial<UpdatePayment> = {
      methodId: Number(values.methodId),
      userId: user?.id ?? 0,
    };
    return updatePayment.mutate(payload);
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Modifier ${payment.title}`}</DialogTitle>
          <DialogDescription>{`Modifiez la méthode de paiement`}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
            {/* Date limite de soumission */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => {
                // Convertir la valeur string en Date pour le calendrier
                const selectedDate = field.value
                  ? new Date(field.value)
                  : undefined;

                return (
                  <FormItem>
                    <FormLabel isRequired>{"Delai de paiement"}</FormLabel>
                    <FormControl>
                      <Input
                        id={field.name}
                        value={field.value || ""}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setDueDate(true);
                          }
                        }}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* is Partial */}
            {/* Paiement partiel */}
            <FormField
              control={form.control}
              name="isPartial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Paiement partiel"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        id="isPartial"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled
                      />
                      <Label htmlFor="isPartial">
                        {"Le montant est-il partiel ? " +
                          (field.value ? "Oui" : "Non")}
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Montant */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Montant"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(Number(value));
                        }}
                        className="pr-12"
                        disabled
                      />
                      <p className="absolute right-2 top-1/2 -translate-y-1/2">
                        {"FCFA"}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Moyen de paiement */}
            <FormField
              control={form.control}
              name="methodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={
                        field.value ? String(field.value) : undefined
                      }
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="min-w-60 w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPaymentType.data?.data.map((method) => (
                          <SelectItem key={method.id} value={String(method.id)}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="w-full @min-[640px]:col-span-2">
              <Button
                type="submit"
                variant={"secondary"}
                disabled={updatePayment.isPending}
                isLoading={updatePayment.isPending}
              >
                {"Mettre à jour la demande"}
              </Button>
              <Button
                variant={"outline"}
                onClick={(e) => {
                  e.preventDefault();
                  openChange(false);
                  form.reset({
                    deadline: format(new Date(payment.deadline), "yyyy-MM-dd"),
                    isPartial: payment.isPartial,
                    price: payment.price,
                    methodId: String(payment.methodId),
                  });
                }}
              >
                {"Annuler"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditPaymentMethod;
