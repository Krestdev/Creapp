"use client";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
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
import { AddFileProps, purchaseQ } from "@/queries/purchase-order";
import { BonsCommande } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
}

export const formSchema = z.object({
  proof: z.array(
    z.instanceof(File, { message: "Doit être un fichier valide" }),
  ),
});

function AddSignedFile({ open, openChange, purchaseOrder }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, proof }: AddFileProps) =>
      purchaseQ.addFile({ id, proof }),
    onSuccess: () => {
      toast.success(
        "Votre bon de commande signé a été enregistré avec succès !",
      );
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const value = values.proof;
    if (value.length === 0)
      return form.setError("proof", {
        message: "Veuillez insérer le bon de commande signé !",
      });
    mutate({ id: purchaseOrder.id, proof: values.proof[0] });
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Compléter - ${
            purchaseOrder.devi.commandRequest.title
          }`}</DialogTitle>
          <DialogDescription>
            {"Insérez le bon de commande signé"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 @min-[560px]/dialog:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="proof"
              render={({ field }) => (
                <FormItem className="@min-[560px]:col-span-2">
                  <FormLabel isRequired>{"Bon de commande signé"}</FormLabel>
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
            <DialogFooter>
              <Button
                type="submit"
                variant={"primary"}
                disabled={isPending}
                isLoading={isPending}
              >
                {"Enregistrer"}
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  openChange(false);
                  form.reset({ proof: [] });
                }}
                variant={"outline"}
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

export default AddSignedFile;
