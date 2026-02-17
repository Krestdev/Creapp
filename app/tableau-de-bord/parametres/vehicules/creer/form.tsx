"use client";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { vehicleQ } from "@/queries/vehicule";
import { Vehicle } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}
export const formSchema = z.object({
  label: z.string({ message: "Ce champs est obligatoire" }),
  mark: z.string({ message: "Ce champs est obligatoire" }),
  matricule: z.string().optional(),
  image: z.array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ])
  ),
  serial: z.string(),
  purchaseDate: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d <= now;
      },
      { message: "Date invalide" },
    ),
});

type Schema = z.infer<typeof formSchema>;

export function VehicleForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      label: "",
      mark: "",
      matricule: "",
      image: [],
      serial: "",
      purchaseDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const [dueDate, setDueDate] = useState<boolean>(false);
  const today = new Date(); //On part sur 3 jours de delai de base :)

  const vehiculeData = useMutation({
    mutationFn: (data: Omit<Vehicle, "id" | "createdAt" | "updatedAt">) =>
      vehicleQ.create(data),
    onSuccess: () => {
      toast.success("Véhicule ajouté avec succès");
      form.reset({
        label: "",
        mark: "",
        matricule: "",
        image: undefined,
        serial: "",
        purchaseDate: format(new Date(), "yyyy-MM-dd")
      });
    },
  });

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    vehiculeData.mutate({
      label: data.label,
      mark: data.mark,
      matricule: data.matricule!,
      proof: data.image[0],
      serial: data.serial,
      purchaseDate: data.purchaseDate
    });
  });
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="form-3xl"
      >
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Modèle du véhicule"}</FormLabel>
                <FormControl>
                  <Input {...field} id="label" placeholder="Ex. Corolla" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mark"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Marque du véhicule"}</FormLabel>
                <FormControl>
                  <Input {...field} id="mark" placeholder="Ex. Toyota" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="matricule"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Matricule"}</FormLabel>
                <FormControl>
                  <Input {...field} id="matricule" placeholder="Ex. LT 550 A6" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>{"Numéro de série"}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="serial"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => {
              const selectedDate = field.value ? new Date(field.value) : undefined;
              return (
                <FormItem>
                  <FormLabel isRequired>{"Date d'Acquisition"}</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input
                        id={field.name}
                        value={field.value || ""}
                        placeholder="Sélectionner une date"
                        className="bg-background pr-10"
                        onChange={(e) => field.onChange(e.target.value)}
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
                            <span className="sr-only">{"Sélectionner une date"}</span>
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
                            disabled={(date) => date > new Date()}
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

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel isRequired>{"Photo du véhicule"}</FormLabel>
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
        <div className="w-full flex justify-end items-center @min-[640px]:col-span-full">
          <Button type="submit" variant={"primary"} disabled={vehiculeData.isPending} isLoading={vehiculeData.isPending}>
            {"Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
