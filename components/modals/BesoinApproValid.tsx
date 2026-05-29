"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { queryKeys } from "@/lib/query-keys";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  users: Array<User>;
  requestData?: RequestModelT;
}

const today = new Date();

const formSchema = z.object({
  amount: z.coerce.number({ message: "Veuillez renseigner un montant" }),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d >= today;
    },
    { message: "Date invalide" },
  ),
});

function BesoinLastApproVall({ open, setOpen, requestData }: Props) {
  const [dueDate, setDueDate] = React.useState<boolean>(false);

  const defaultDate = new Date();
  defaultDate.setDate(today.getDate() + 7);

  const getCategory = useQuery({
    queryKey: queryKeys.category(requestData?.categoryId!),
    queryFn: () => categoryQ.getCategory(requestData?.categoryId!),
    enabled: !!requestData?.categoryId,
  });

  const getProject = useQuery({
    queryKey: queryKeys.project(requestData?.projectId!),
    queryFn: () => projectQ.getOne(requestData?.projectId!),
    enabled: !!requestData?.projectId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: requestData?.amount || 100,
      dueDate: requestData?.dueDate
        ? format(new Date(requestData.dueDate), "yyyy-MM-dd")
        : format(defaultDate, "yyyy-MM-dd"),
    },
  });

  const validateRequest = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: number;
      request: Partial<RequestModelT>;
    }) => requestQ.validate({ id, request }),
    onSuccess: () => {
      toast.success("Besoin approuvé avec succès !");
      setOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!requestData?.id) {
      toast.error("ID de la demande manquant");
      return;
    }
    validateRequest.mutate({
      id: requestData.id,
      request: {
        amount: values.amount,
        dueDate: new Date(values.dueDate),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>{"Validation de l'approvisionnement"}</DialogTitle>
          <DialogDescription>
            {"Validez les informations de l'approvisionnement"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3"
            id="appro-approval-form"
          >
            {/* TITRE - static */}
            <div className="grid gap-2">
              <Label>{"Titre"}</Label>
              <Input value={requestData?.label || ""} disabled />
            </div>

            {/* CATÉGORIE - static */}
            <div className="grid gap-2">
              <Label>{"Catégorie"}</Label>
              <Input
                disabled
                value={
                  getCategory.isLoading
                    ? "..chargement"
                    : getCategory.data
                      ? getCategory.data.data.label
                      : "--"
                }
              />
            </div>

            {/* PROJET - static */}
            <div className="grid gap-2">
              <Label>{"Projet"}</Label>
              <Input
                disabled
                value={
                  getProject.isLoading
                    ? "..chargement"
                    : getProject.data
                      ? getProject.data.data.label
                      : "--"
                }
              />
            </div>

            {/* MOTIF - static */}
            <div className="grid gap-2">
              <Label>{"Motif"}</Label>
              <Input value={requestData?.description || ""} disabled />
            </div>

            {/* DATE LIMITE */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => {
                const selectedDate = field.value
                  ? new Date(field.value)
                  : undefined;
                return (
                  <FormItem>
                    <FormLabel isRequired>{"Date limite"}</FormLabel>
                    <FormControl>
                      <div className="relative flex gap-2">
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
                        />
                        <Popover open={dueDate} onOpenChange={setDueDate}>
                          <PopoverTrigger asChild>
                            <Button
                              id="date-picker"
                              type="button"
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
                              selected={selectedDate}
                              defaultMonth={selectedDate || today}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                if (!date) return;
                                const value = format(date, "yyyy-MM-dd");
                                field.onChange(value);
                                setDueDate(false);
                              }}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* MONTANT */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Montant"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex. 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* FOOTER */}
            <DialogFooter className="@min-[540px]/dialog:col-span-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  {"Annuler"}
                </Button>
              </DialogClose>
              <Button
                variant={"primary"}
                type="submit"
                disabled={validateRequest.isPending}
                isLoading={validateRequest.isPending}
                form="appro-approval-form"
              >
                {"Valider"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default BesoinLastApproVall;
