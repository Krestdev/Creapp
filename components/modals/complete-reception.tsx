"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Reception } from "@/app/tableau-de-bord/bdcommande/receptions/page";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import FilesUpload from "../comp-547";

const formSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .min(1, "Veuillez sélectionner au moins un item"),
  proof: z
    .array(
      z.union([
        z.instanceof(File, { message: "Doit être un fichier valide" }),
        z.string(),
      ])
    )
    .min(1, "Veuillez renseigner au moins 1 justificatif")
    .max(1, "Pas plus d'un justificatif"),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: Reception;
}

const CompleteReception = ({ open, onOpenChange, data }: Props) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // 👉 items déjà validés = cochés + désactivés
      items: data.items
        .filter((item) => item.status === true)
        .map((item) => ({ id: item.id })),
      proof: [],
    },
  });

  function onSubmit(values: FormData) {
    const alreadyValidatedIds = data.items
      .filter((item) => item.status === true)
      .map((item) => item.id);

    const newItems = values.items.filter(
      (item) => !alreadyValidatedIds.includes(item.id)
    );

    const payload = {
      ...values,
      items: newItems,
    };

    console.log("PAYLOAD FINAL :", payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]! max-h-[80vh] p-0 gap-0 overflow-hidden border-none flex flex-col">
        {/* Header */}
        <div className="shrink-0 sticky top-0 z-10">
          <DialogHeader className="bg-linear-to-r from-[#8B1538] to-[#700032] text-white p-6 m-4 rounded-lg pb-8">
            <DialogTitle className="text-xl font-semibold text-white">
              {`Compléter - ${data.bonDeCommande}`}
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">
              Enregistrez les éléments livrés associés au bon de commande
            </p>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 py-3"
            >
              {/* ITEMS */}
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Demande de cotation"}</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {data.items.map((item) => {
                          const isChecked =
                            item.status === true ||
                            field.value?.some(
                              (selected) => selected.id === item.id
                            );

                          return (
                            <div
                              key={item.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                disabled={item.status === true}
                                checked={isChecked}
                                onCheckedChange={(value) => {
                                  if (item.status === true) return;

                                  if (value === true) {
                                    field.onChange([
                                      ...(field.value ?? []),
                                      { id: item.id },
                                    ]);
                                  } else {
                                    field.onChange(
                                      field.value?.filter(
                                        (selected) => selected.id !== item.id
                                      )
                                    );
                                  }
                                }}
                              />
                              <Label>{item.name}</Label>
                            </div>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* JUSTIFICATIF */}
              <FormField
                control={form.control}
                name="proof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Justificatif"}</FormLabel>
                    <FormControl>
                      <FilesUpload
                        value={field.value}
                        onChange={field.onChange}
                        name={field.name}
                        acceptTypes="images"
                        multiple={false}
                        maxFiles={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button type="submit" hidden />
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="shrink-0 sticky bottom-0 z-10">
          <div className="flex justify-end gap-3 p-6">
            <Button variant="primary" onClick={form.handleSubmit(onSubmit)}>
              {"Enregistrer"}
            </Button>
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
            >
              {"Fermer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteReception;
