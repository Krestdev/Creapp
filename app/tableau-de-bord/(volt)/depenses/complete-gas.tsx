"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PayloadGasCompletion, paymentQ } from "@/queries/payment";
import { Bank, PaymentRequest, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  users: Array<User>;
}

const formSchema = z.object({
  price: z.coerce.number({ message: "Veuillez définir le montant" }),
  km: z.coerce.number({
    message: "Veuillez définir le Kilométrage avant recharge",
  }),
  liters: z.coerce.number({
    message: "Veuillez définir le nombre de litres rechargés",
  }),
  driverId: z.coerce.number({ message: "Veuillez sélectionner le conducteur" }),
  deadline: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: "Date invalide" },
  ),
});

function CompleteGas({ ticket, open, onOpenChange, users }: Props) {
    const [dueDate, setDueDate] = React.useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: 10000,
      km: 180000,
      liters: 50,
      driverId: ticket.userId,
      deadline: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const payGas = useMutation({
    mutationFn: async(payload:PayloadGasCompletion)=>paymentQ.gasCompletion({payload}),
    onSuccess:()=>{
        toast.success("Paiement mis à jour avec succès !");
        onOpenChange(false);
    },
    onError: (error:Error)=>{
        toast.error(error.message ?? "Une erreur est survenue");
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>): void => {
    console.log(values);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
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
                        placeholder="Ex. 15 000 FCFA"
                        {...field}
                        className="pr-12"
                      />
                      <p className="absolute right-2 top-1/2 -translate-y-1/2">
                        {"FCFA"}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="liters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Litres"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ex. 20"
                        {...field}
                        className="pr-12"
                      />
                      <p className="absolute right-2 top-1/2 -translate-y-1/2">
                        {"Litres"}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Kilométrage"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ex. 165 256"
                        {...field}
                        className="pr-10"
                      />
                      <p className="absolute right-2 top-1/2 -translate-y-1/2">
                        {"KM"}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => {
                 const selectedDate = field.value
              ? new Date(field.value)
              : undefined;
                return(
                <FormItem>
                  <FormLabel isRequired>{"Date"}</FormLabel>
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
                          defaultMonth={selectedDate}
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
                  <FormMessage/>
                </FormItem>
              )}}
            />
            <FormField
              control={form.control}
              name="km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Conducteur"}</FormLabel>
                  <FormControl>
                    <Select value={field.value ? field.value.toString() : undefined} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={"Sélectionner un conducteur"} />
                        </SelectTrigger>
                        <SelectContent>
                            {users.filter(u=> u.role.some(r=>r.label === "DRIVER")).map(user=>(
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.firstName.concat(" ", user.lastName)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit" variant={"primary"}>{"Enregistrer"}</Button>
                <Button variant={"outline"} onClick={(e)=>{e.preventDefault(); onOpenChange(false)}}>{"Annuler"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteGas;
