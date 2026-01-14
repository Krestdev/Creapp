import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { transactionQ } from "@/queries/transaction";
import { TransferTransaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: TransferTransaction;
}

const formSchema = z.object({
  date: z
      .string()
      .refine(
        (val) => {
          const d = new Date(val);
          const now = new Date();
          return !isNaN(d.getTime()) && d >= now;
        },
        { message: "Date invalide" }
      ),
  proof: z
    .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
    .min(1, { message: "Veuillez ajouter un justificatif" }),
});

type FormValue = z.infer<typeof formSchema>;

function CompleteTransfer({ open, openChange, transaction }: Props) {
  const [selectDate, setSelectDate] = React.useState<boolean>(false);
  const queryClient = useQueryClient();
  const form = useForm<FormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
      date: format(new Date(), "yyyy-MM-dd")
    },
  });
  const complete = useMutation({
    mutationFn: async ({ id, proof, date }: { id: number; proof: File, date:Date }) =>
      transactionQ.complete({ id, proof, date }),
    onSuccess: () => {
      toast.success("Transfert mis à jour avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["transactions", "banks"],
        refetchType: "active",
      });
      openChange(false);
      form.reset({ proof: [] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const onSubmit = (value: FormValue): void => {
    complete.mutate({ id: transaction.id, proof: value.proof[0], date:new Date(value.date) });
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
          <DialogTitle>{transaction.label}</DialogTitle>
          <DialogDescription>{`Compléter le transfert - ${transaction.label}`}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Date du transfert"}</FormLabel>
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
                        setSelectDate(true);
                      }
                    }}
                  />
                  <Popover open={selectDate} onOpenChange={setSelectDate}>
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
                          setSelectDate(false);
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
                      multiple={true}
                      maxFiles={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit" variant={"primary"} disabled={complete.isPending} isLoading={complete.isPending}>{"Transférer"}</Button>
                <Button variant="outline" disabled={complete.isPending} onClick={(e)=>{e.preventDefault(); openChange(false); form.reset({proof: []});}}>{"Fermer"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteTransfer;
